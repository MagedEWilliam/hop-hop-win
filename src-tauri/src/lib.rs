// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

use tauri_plugin_autostart::MacosLauncher;
use tauri::State;
use std::sync::Mutex;
struct WindowState {
    is_visible: Mutex<bool>,
}

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
        .button(Button::Right, Click)
        .map_err(|e| format!("Failed to perform mouse click: {:?}", e))?;

    Ok(())
}

#[tauri::command]
fn show_window(window: tauri::Window, state: State<WindowState>) -> Result<(), String> {
    let mut is_visible = state.is_visible.lock().unwrap();
    if !*is_visible {
        if let Err(e) = window.show() {
            return Err(format!("Failed to show window: {:?}", e));
        }
        if let Err(e) = window.set_focus() {
            eprintln!("Failed to focus window: {:?}", e);
        }
        *is_visible = true;
    }
    Ok(())
}

#[tauri::command]
fn hide_window(window: tauri::Window, state: State<WindowState>) -> Result<(), String> {
    let mut is_visible = state.is_visible.lock().unwrap();
    if *is_visible {
        if let Err(e) = window.hide() {
            return Err(format!("Failed to hide window: {:?}", e));
        }
        *is_visible = false;
    }
    Ok(())
}

#[tauri::command]
fn is_window_hidden(state: State<WindowState>) -> bool {
    !*state.is_visible.lock().unwrap()
}

#[tauri::command]
fn toggle_click_through(window: tauri::Window, enable: bool) {
    window.set_ignore_cursor_events(enable).unwrap();
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_autostart::init(MacosLauncher::LaunchAgent, Some(vec!["--flag1", "--flag2"]) /* arbitrary number of args to pass to your app */))
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .manage(WindowState {
            is_visible: Mutex::new(true), // Assume the window starts as visible.
        })
        .invoke_handler(tauri::generate_handler![
            toggle_click_through,
            show_window,
            hide_window,
            is_window_hidden,
            move_mouse,
            mouse_click
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
