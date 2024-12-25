// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn move_mouse(x: i32, y: i32, abs: bool) -> Result<(), String> {
    use enigo::{
        Coordinate,
        Enigo, Mouse, Settings,
    };

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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![greet,move_mouse])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
