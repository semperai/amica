// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{
  api::process::{Command, CommandEvent},
  CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem,
};
use std::sync::Mutex;
use std::fs;

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
}

#[tauri::command]
async fn proxy_request(payload: ProxyRequestPayload) -> Result<serde_json::Value, String> {
    let client = reqwest::Client::new();
    // This port should be configurable in the future.
    let url = format!("http://127.0.0.1:5000/{}", payload.path);

    let res = client
        .post(&url)
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
    };

    tauri::Builder::default()
        .manage(app_state)
        .setup(|app| {
            let handle = app.handle();
            let app_state = handle.state::<AppState>();

            // Read settings
            let settings_path = "settings.json";
            let settings_str = fs::read_to_string(settings_path)
                .expect("Failed to read settings.json");
            let settings: Settings = serde_json::from_str(&settings_str)
                .expect("Failed to parse settings.json");

            if settings.text_generation_webui_path.is_empty() {
                // In a real app, you'd want to show a dialog to the user
                panic!("text_generation_webui_path is not set in settings.json");
            }

            // Launch the external process
            tauri::async_runtime::spawn(async move {
                let (mut rx, child) = Command::new(settings.text_generation_webui_path)
                    .spawn()
                    .expect("Failed to spawn external process");

                *app_state.child_process.lock().unwrap() = Some(child);

                while let Some(event) = rx.recv().await {
                    if let CommandEvent::Stdout(line) = event {
                        // Here you can log the output from the sidecar
                        // Or send it to the frontend
                        handle
                            .emit_all("sidecar-output", Payload { message: line.into() })
                            .unwrap();
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
                    let app_handle = app.app_handle();
                    let app_state = app_handle.state::<AppState>();
                    if let Some(child) = app_state.child_process.lock().unwrap().take() {
                        child.kill().expect("Failed to kill sidecar");
                    }
                    app_handle.exit(0);
                }
                "checkforupdates" => {
                    tauri::api::shell::open(
                        &app.shell_scope(),
                        "https://github.com/semperai/amica/releases/latest",
                        None,
                    )
                    .expect("failed to open url");
                }
                "help" => {
                    tauri::api::shell::open(
                        &app.shell_scope(),
                        "https://docs.heyamica.com",
                        None,
                    )
                    .expect("failed to open url");
                }
                _ => {}
            },
            _ => {}
        })
        .on_window_event(|event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event.event() {
                let app_handle = event.window().app_handle();
                let app_state = app_handle.state::<AppState>();
                if let Some(child) = app_state.child_process.lock().unwrap().take() {
                    child.kill().expect("Failed to kill sidecar");
                }
                app_handle.exit(0);
            }
        })
        .invoke_handler(tauri::generate_handler![
            close_splashscreen,
            proxy_request
        ])
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|app_handle, event| {
            if let tauri::RunEvent::ExitRequested { .. } = event {
                let app_state = app_handle.state::<AppState>();
                if let Some(child) = app_state.child_process.lock().unwrap().take() {
                    child.kill().expect("Failed to kill sidecar");
                }
            }
        });
}
