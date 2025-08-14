// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{
  api::process::{Command, CommandEvent},
  CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem,
};
use futures_util::StreamExt;
use std::collections::HashSet;
use std::fs;
use std::path::PathBuf;
use std::sync::{
    atomic::{AtomicBool, Ordering},
    Arc, Mutex,
};
use tauri::api::{dialog, path};

#[derive(serde::Deserialize, Clone)]
struct Settings {
    text_generation_webui_path: String,
}

// the payload type must implement `Serialize` and `Clone`.
#[derive(Clone, serde::Serialize)]
struct Payload {
  message: String,
}

struct AppState {
    child_process: Mutex<Option<tauri::api::process::Child>>,
    is_terminating: Arc<AtomicBool>,
}

fn show_error_and_exit(handle: &tauri::AppHandle, title: &str, message: &str) {
    dialog::message(handle.get_window("main").as_ref(), title, message);
    std::process::exit(1);
}

fn shutdown_sidecar(handle: &tauri::AppHandle) {
    let app_state = handle.state::<AppState>();

    // Use compare_exchange to ensure the shutdown logic runs only once.
    if app_state
        .is_terminating
        .compare_exchange(false, true, Ordering::SeqCst, Ordering::SeqCst)
        .is_ok()
    {
        if let Some(mut child) = app_state.child_process.lock().unwrap().take() {
            // First, try to see if the process has already exited.
            match child.try_wait() {
                Ok(Some(_)) => {
                    // Process already exited, nothing to do.
                }
                Ok(None) => {
                    // Process is still running, so kill it and wait for it to be reaped.
                    if let Err(e) = child.kill() {
                        eprintln!("Failed to kill sidecar process: {}", e);
                    }
                    if let Err(e) = child.wait() {
                        eprintln!("Failed to wait for sidecar process to exit: {}", e);
                    }
                }
                Err(e) => {
                    eprintln!("Error calling try_wait on sidecar process: {}", e);
                }
            }
        }
    }
}

fn validate_and_sanitize_path(path: &str) -> Result<String, String> {
    // Reject any input that contains "://" or starts with "http" or contains ".." or null bytes
    if path.contains("://") || path.contains("..") || path.contains('\0') || path.trim().to_lowercase().starts_with("http") {
        return Err(format!("Invalid path '{}': contains malicious patterns.", path));
    }

    // Normalize/removing leading slashes
    let sanitized_path = path.trim_start_matches('/').to_string();

    // Enforce an allowlist of known good endpoints
    let allowlist: HashSet<&str> = [
        "v1/chat/completions",
    ].iter().cloned().collect();

    if !allowlist.contains(sanitized_path.as_str()) {
        return Err(format!("Invalid path '{}': not in allowlist.", path));
    }

    Ok(sanitized_path)
}

#[tauri::command]
async fn quit_app(handle: tauri::AppHandle) {
    shutdown_sidecar(&handle);
    handle.exit(0);
}

#[tauri::command]
async fn close_splashscreen(window: tauri::Window) {
  // Close splashscreen
  if let Some(splashscreen) = window.get_window("splashscreen") {
    splashscreen.close().unwrap();
  }
  // Show main window
  window.get_window("main").unwrap().show().unwrap();
}

#[derive(serde::Deserialize)]
struct ProxyRequestPayload {
    path: String,
    body: serde_json::Value,
    authorization: Option<String>,
}

#[derive(Clone, serde::Serialize)]
struct StreamChunkPayload {
    chunk: String,
}

#[derive(Clone, serde::Serialize)]
struct StreamErrorPayload {
    error: String,
}

#[tauri::command]
async fn proxy_request_streaming(
    handle: tauri::AppHandle,
    payload: ProxyRequestPayload,
) -> Result<(), String> {
    let sanitized_path = validate_and_sanitize_path(&payload.path)?;
    let client = reqwest::Client::new();
    let url = format!("http://127.0.0.1:5000/{}", sanitized_path);

    let mut request_builder = client.post(&url);
    if let Some(auth) = payload.authorization {
        request_builder = request_builder.header("Authorization", format!("Bearer {}", auth));
    }

    let res = request_builder
        .json(&payload.body)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if !res.status().is_success() {
        let status = res.status();
        let text = res.text().await.map_err(|e| e.to_string())?;
        return Err(format!(
            "API request to {} failed with status {}: {}",
            url, status, text
        ));
    }

    let mut stream = res.bytes_stream();

    tauri::async_runtime::spawn(async move {
        while let Some(chunk_result) = stream.next().await {
            match chunk_result {
                Ok(chunk) => {
                    let s = String::from_utf8_lossy(&chunk).to_string();
                    if let Err(e) = handle.emit_all("stream-chunk", StreamChunkPayload { chunk: s }) {
                        eprintln!("Failed to emit stream chunk: {}", e);
                        break;
                    }
                }
                Err(e) => {
                    let error_message = format!("Error reading stream: {}", e);
                    let _ = handle.emit_all("stream-error", StreamErrorPayload { error: error_message });
                    break;
                }
            }
        }
        let _ = handle.emit_all("stream-end", ());
    });

    Ok(())
}

#[tauri::command]
async fn proxy_request_blocking(payload: ProxyRequestPayload) -> Result<serde_json::Value, String> {
    let sanitized_path = validate_and_sanitize_path(&payload.path)?;
    let client = reqwest::Client::new();
    // This port should be configurable in the future.
    let url = format!("http://127.0.0.1:5000/{}", sanitized_path);

    let mut request_builder = client.post(&url);
    if let Some(auth) = payload.authorization {
        request_builder = request_builder.header("Authorization", format!("Bearer {}", auth));
    }

    let res = request_builder
        .json(&payload.body)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if res.status().is_success() {
        res.json::<serde_json::Value>()
            .await
            .map_err(|e| e.to_string())
    } else {
        let status = res.status();
        let text = res.text().await.map_err(|e| e.to_string())?;
        Err(format!(
            "API request to {} failed with status {}: {}",
            url, status, text
        ))
    }
}

fn main() {
    let app_state = AppState {
        child_process: Mutex::new(None),
        is_terminating: Arc::new(AtomicBool::new(false)),
    };

    tauri::Builder::default()
        .manage(app_state)
        .setup(|app| {
            let handle = app.handle().clone();

            // Load settings
            let config_dir = match path::app_config_dir(&handle.config()) {
                Some(dir) => dir,
                None => {
                    show_error_and_exit(&handle, "Fatal Error", "Could not determine the application config directory.");
                    return Ok(()); // Unreachable but needed for type check
                }
            };

            let settings_path_in_config = config_dir.join("settings.json");

            let settings_str = if settings_path_in_config.exists() {
                match fs::read_to_string(&settings_path_in_config) {
                    Ok(s) => s,
                    Err(e) => {
                        let msg = format!("Failed to read settings.json from config directory ({}): {}", settings_path_in_config.display(), e);
                        show_error_and_exit(&handle, "Configuration Error", &msg);
                        return Ok(());
                    }
                }
            } else {
                let resource_path = match handle.path_resolver().resolve_resource("resources/settings.json") {
                    Some(path) => path,
                    None => {
                        show_error_and_exit(&handle, "Fatal Error", "Could not resolve bundled settings.json path.");
                        return Ok(());
                    }
                };
                match fs::read_to_string(resource_path) {
                    Ok(s) => s,
                    Err(e) => {
                        let msg = format!("Failed to read bundled settings.json: {}", e);
                        show_error_and_exit(&handle, "Fatal Error", &msg);
                        return Ok(());
                    }
                }
            };

            let settings: Settings = match serde_json::from_str(&settings_str) {
                Ok(s) => s,
                Err(e) => {
                    let msg = format!("Failed to parse settings.json: {}. Please check for syntax errors.", e);
                    show_error_and_exit(&handle, "Configuration Error", &msg);
                    return Ok(());
                }
            };

            // Validate path
            let executable_path = PathBuf::from(&settings.text_generation_webui_path);
            if settings.text_generation_webui_path.is_empty() || !executable_path.is_file() {
                let msg = format!("The path specified in settings.json is either empty or does not point to a valid file: '{}'", settings.text_generation_webui_path);
                show_error_and_exit(&handle, "Configuration Error", &msg);
                return Ok(());
            }

            // Launch the external process
            tauri::async_runtime::spawn(async move {
                let (mut rx, child) = match Command::new(&settings.text_generation_webui_path).spawn() {
                    Ok(c) => c,
                    Err(e) => {
                        let msg = format!(
                            "Failed to spawn the external process at '{}': {}",
                            settings.text_generation_webui_path, e
                        );
                        // Show a user-facing dialog.
                        dialog::message(handle.get_window("main").as_ref(), "Process Error", &msg);
                        // And gracefully exit the app.
                        handle.exit(1);
                        return;
                    }
                };

                // Reacquire state inside the async task to prevent lifetime issues
                let app_state = handle.state::<AppState>();
                *app_state.child_process.lock().unwrap() = Some(child);

                while let Some(event) = rx.recv().await {
                    if let CommandEvent::Stdout(line) = event {
                        if let Err(e) = handle.emit_all("sidecar-output", Payload { message: line.into() }) {
                            eprintln!("Failed to emit sidecar output: {}", e);
                            break;
                        }
                    }
                }
            });

            Ok(())
        })
        .system_tray(
            SystemTray::new().with_menu(
                SystemTrayMenu::new()
                    .add_item(CustomMenuItem::new("checkforupdates".to_string(), "Check for updates"))
                    .add_native_item(SystemTrayMenuItem::Separator)
                    .add_item(CustomMenuItem::new("help".to_string(), "Help"))
                    .add_native_item(SystemTrayMenuItem::Separator)
                    .add_item(CustomMenuItem::new("quit".to_string(), "Quit")),
            ),
        )
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
                "quit" => {
                    app.app_handle().emit_all("confirm-close", ()).unwrap();
                }
                "checkforupdates" => {
                    app.shell()
                        .open("https://github.com/semperai/amica/releases/latest", None)
                        .expect("failed to open url");
                }
                "help" => {
                    app.shell()
                        .open("https://docs.heyamica.com", None)
                        .expect("failed to open url");
                }
                _ => {}
            },
            _ => {}
        })
        .on_window_event(|event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event.event() {
                api.prevent_close();
                event.window().emit("confirm-close", ()).unwrap();
            }
        })
        .invoke_handler(tauri::generate_handler![
            close_splashscreen,
            proxy_request_blocking,
            proxy_request_streaming,
            quit_app
        ])
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|app_handle, event| {
            if let tauri::RunEvent::ExitRequested { .. } = event {
                shutdown_sidecar(app_handle);
            }
        });
}
