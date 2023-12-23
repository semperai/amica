// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{
  CustomMenuItem,
  SystemTray,
  SystemTrayEvent,
  SystemTrayMenu,
  SystemTrayMenuItem,
};
use tauri::Manager;


fn main() {
  tauri::Builder::default()
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
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
