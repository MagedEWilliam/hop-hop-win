// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

use tauri_plugin_autostart::MacosLauncher;

#[tauri::command]
fn move_mouse(x: i32, y: i32, abs: bool) -> Result<(), String> {
    use enigo::{Coordinate, Enigo, Mouse, Settings};

    let mut enigo = Enigo::new(&Settings::default())
        .map_err(|e| format!("Failed to initialize Enigo: {:?}", e))?;

    if abs {
        enigo
            .move_mouse(x, y, Coordinate::Abs)
            .map_err(|e| format!("Failed to move mouse to ({}, {}): {:?}", x, y, e))?;
    } else {
        enigo
            .move_mouse(x, y, Coordinate::Rel)
            .map_err(|e| format!("Failed to move mouse by ({}, {}): {:?}", x, y, e))?;
    }

    Ok(())
}

#[tauri::command]
fn mouse_click() -> Result<(), String> {
    use enigo::{Button, Direction::Click, Enigo, Mouse, Settings};

    // Initialize Enigo
    let mut enigo = Enigo::new(&Settings::default())
        .map_err(|e| format!("Failed to initialize Enigo: {:?}", e))?;

    // Perform the mouse click
    enigo
        .button(Button::Left, Click)
        .map_err(|e| format!("Failed to perform mouse click: {:?}", e))?;

    Ok(())
}

#[tauri::command]
fn hide_window(window: tauri::Window) {
    if let Err(e) = window.hide() {
        eprintln!("Failed to hide window: {:?}", e);
    }
}

#[tauri::command]
fn show_window(window: tauri::Window) {
    if let Err(e) = window.show() {
        eprintln!("Failed to show window: {:?}", e);
    }
    if let Err(e) = window.set_focus() {
        eprintln!("Failed to focus window: {:?}", e);
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_autostart::init(MacosLauncher::LaunchAgent, Some(vec!["--flag1", "--flag2"]) /* arbitrary number of args to pass to your app */))
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            show_window,
            hide_window,
            move_mouse,
            mouse_click
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
