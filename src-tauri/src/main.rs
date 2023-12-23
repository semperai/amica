// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{
  CustomMenuItem,
  SystemTray,
  SystemTrayEvent,
  SystemTrayMenu,
  SystemTrayMenuItem,
  utils::config::AppUrl,
  window::WindowBuilder,
  WindowUrl,
};
use tauri::Manager;


fn main() {
  let port = portpicker::pick_unused_port().expect("failed to find unused port");

  let mut context = tauri::generate_context!();
  let url = format!("http://localhost:{}", port).parse().unwrap();
  let window_url = WindowUrl::External(url);
  // rewrite the config so the IPC is enabled on this URL
  context.config_mut().build.dist_dir = AppUrl::Url(window_url.clone());

  tauri::Builder::default()
    .plugin(tauri_plugin_localhost::Builder::new(port).build())
    .setup(move |app| {
      WindowBuilder::new(
        app,
        "main".to_string(),
        WindowUrl::External(format!("http://localhost:{}", port).parse().unwrap()),
      )
      .title("Amica")
      .inner_size(800.0, 600.0)
      .transparent(true)
      .fullscreen(false)
      .resizable(true)
      .build()?;
      Ok(())
    })
    .system_tray(SystemTray::new()
      .with_menu(SystemTrayMenu::new()
        .add_item(CustomMenuItem::new("checkforupdates".to_string(), "Check for updates"))
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(CustomMenuItem::new("help".to_string(), "Help"))
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(CustomMenuItem::new("quit".to_string(), "Quit"))
      )
    )
    .on_system_tray_event(|app, event| match event {
      SystemTrayEvent::MenuItemClick { id, .. } => {
        match id.as_str() {
          "quit" => {
            std::process::exit(0);
          }
          "checkforupdates" => {
            tauri::api::shell::open(&app.shell_scope(), "https://github.com/semperai/amica/releases/latest", None).expect("failed to open url");
          }
          "help" => {
            tauri::api::shell::open(&app.shell_scope(), "https://docs.heyamica.com", None).expect("failed to open url");
          }
          _ => {}
        }
      }
      _ => {}
    })
    .run(context)
    .expect("error while running tauri application");
}
