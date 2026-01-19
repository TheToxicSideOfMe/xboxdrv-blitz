use std::process::{Command, Stdio};
use tauri::Manager;
use tauri::menu::{Menu, MenuItem};
use tauri::tray::{TrayIconBuilder, TrayIconEvent};
use evdev::{Device, InputEventKind};
use std::time::Duration;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::collections::HashMap;

// Structs for config management
#[derive(Serialize, Deserialize, Clone, Debug)]
struct ButtonMapping {
    xbox_button: String,
    physical_button: String,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
struct AxisMapping {
    xbox_axis: String,
    physical_axis: String,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
struct ControllerConfig {
    name: String,
    button_mappings: Vec<ButtonMapping>,
    axis_mappings: Vec<AxisMapping>,
}

#[derive(Serialize, Deserialize)]
struct ConfigsFile {
    configs: HashMap<String, ControllerConfig>,
}

// Helper function to get config file path
fn get_configs_file_path() -> PathBuf {
    let home = std::env::var("HOME").unwrap_or_else(|_| ".".to_string());
    PathBuf::from(home).join(".config/blitz/controller-configs.json")
}

// Get controller name from event device
fn get_controller_name(event_path: &str) -> Result<String, String> {
    let event_name = event_path.trim_start_matches("/dev/input/");
    let sys_path = format!("/sys/class/input/{}/device/name", event_name);
    
    fs::read_to_string(&sys_path)
        .map(|name| name.trim().to_string())
        .map_err(|e| format!("Failed to read controller name: {}", e))
}

#[tauri::command]
fn discover_controllers() -> Result<String, String> {
    let output = Command::new("sh")
        .arg("-c")
        .arg(r#"for i in /dev/input/event*; do name=$(cat /sys/class/input/$(basename $i)/device/name 2>/dev/null); if echo "$name" | grep -qiE 'joystick|gamepad|controller|xbox|playstation|dualshock'; then echo "$i: $name"; fi; done"#)
        .output()
        .map_err(|e| e.to_string())?;
    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}

#[tauri::command]
fn save_controller_config(
    controller_event: String,
    button_mappings: Vec<ButtonMapping>,
    axis_mappings: Vec<AxisMapping>,
) -> Result<String, String> {
    // Get controller name
    let controller_name = get_controller_name(&format!("/dev/input/{}", controller_event))?;
    
    let file_path = get_configs_file_path();
    
    // Create directory if it doesn't exist
    if let Some(parent) = file_path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    
    // Load existing configs or create new
    let mut configs_file = if file_path.exists() {
        let content = fs::read_to_string(&file_path).map_err(|e| e.to_string())?;
        serde_json::from_str(&content).unwrap_or(ConfigsFile {
            configs: HashMap::new(),
        })
    } else {
        ConfigsFile {
            configs: HashMap::new(),
        }
    };
    
    // Add/update the config for this controller
    configs_file.configs.insert(
        controller_name.clone(),
        ControllerConfig {
            name: controller_name.clone(),
            button_mappings,
            axis_mappings,
        },
    );
    
    // Save to file
    let json = serde_json::to_string_pretty(&configs_file).map_err(|e| e.to_string())?;
    fs::write(&file_path, json).map_err(|e| e.to_string())?;
    
    Ok(format!("Saved config for {}", controller_name))
}

#[tauri::command]
fn load_controller_config(controller_event: String) -> Result<Option<ControllerConfig>, String> {
    // Get controller name
    let controller_name = get_controller_name(&format!("/dev/input/{}", controller_event))?;
    
    let file_path = get_configs_file_path();
    
    if !file_path.exists() {
        return Ok(None);
    }
    
    let content = fs::read_to_string(&file_path).map_err(|e| e.to_string())?;
    let configs_file: ConfigsFile = serde_json::from_str(&content).map_err(|e| e.to_string())?;
    
    Ok(configs_file.configs.get(&controller_name).cloned())
}

#[tauri::command]
fn get_all_configs() -> Result<Vec<ControllerConfig>, String> {
    let file_path = get_configs_file_path();
    
    if !file_path.exists() {
        return Ok(Vec::new());
    }
    
    let content = fs::read_to_string(&file_path).map_err(|e| e.to_string())?;
    let configs_file: ConfigsFile = serde_json::from_str(&content).map_err(|e| e.to_string())?;
    
    Ok(configs_file.configs.values().cloned().collect())
}

#[tauri::command]
fn check_controller_has_config(controller_event: String) -> Result<bool, String> {
    let config = load_controller_config(controller_event)?;
    Ok(config.is_some())
}

#[tauri::command]
fn start_xboxdrv(controller_event: &str) -> Result<String, String> {
    // Try to load saved config
    let config = load_controller_config(controller_event.to_string())?;
    
    let cmd = if let Some(config) = config {
        // Build command from saved config
        let button_map = config
            .button_mappings
            .iter()
            .map(|m| format!("{}={}", m.physical_button, m.xbox_button))
            .collect::<Vec<_>>()
            .join(",");
        
        let axis_map = config
            .axis_mappings
            .iter()
            .map(|m| format!("{}={}", m.physical_axis, m.xbox_axis))
            .collect::<Vec<_>>()
            .join(",");
        
        format!(
            r#"pkexec xboxdrv --evdev /dev/input/{} \
            --evdev-absmap {},ABS_HAT0X=dpad_x,ABS_HAT0Y=dpad_y \
            --axismap -Y1=Y1,-Y2=Y2 \
            --evdev-keymap {} \
            --mimic-xpad --silent &"#,
            controller_event, axis_map, button_map
        )
    } else {
        // No config found - return error so frontend knows to redirect to mapping
        return Err("No configuration found for this controller. Please create one first.".to_string());
    };

    println!("Executing command: {}", cmd);

    Command::new("sh")
        .arg("-c")
        .arg(&cmd)
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()
        .map_err(|e| e.to_string())?;

    Ok(format!("Started xboxdrv for {}", controller_event))
}

#[tauri::command]
fn stop_xboxdrv(controller_event: &str) -> Result<String, String> {
    let cmd = format!(
        "pkexec pkill -f 'xboxdrv.*{}'",
        controller_event
    );
    
    Command::new("sh")
        .arg("-c")
        .arg(&cmd)
        .spawn()
        .map_err(|e| e.to_string())?;
    
    Ok(format!("Stopped xboxdrv for {}", controller_event))
}

#[tauri::command]
async fn listen_for_button(event_path: String) -> Result<String, String> {
    let mut device = Device::open(&event_path)
        .map_err(|e| format!("Failed to open device: {}", e))?;
    
    let timeout = Duration::from_secs(30);
    let start = std::time::Instant::now();
    
    // Track HAT axis states to detect D-pad presses
    let mut hat0x_value = 0;
    let mut hat0y_value = 0;
    
    loop {
        if start.elapsed() > timeout {
            return Err("Timeout: No button pressed within 30 seconds".to_string());
        }
        
        match device.fetch_events() {
            Ok(events) => {
                for event in events {
                    // Handle regular button presses
                    if let InputEventKind::Key(key) = event.kind() {
                        if event.value() == 1 {
                            return Ok(format!("{:?}", key));
                        }
                    }
                    
                    // Handle D-pad (HAT) buttons as axis events
                    if let InputEventKind::AbsAxis(axis) = event.kind() {
                        let axis_code = axis.0;
                        let value = event.value();
                        
                        // ABS_HAT0X (code 16) - Left/Right D-pad
                        if axis_code == 16 {
                            if value != 0 && value != hat0x_value {
                                hat0x_value = value;
                                if value == -1 {
                                    return Ok("BTN_DPAD_LEFT".to_string());
                                } else if value == 1 {
                                    return Ok("BTN_DPAD_RIGHT".to_string());
                                }
                            } else if value == 0 {
                                hat0x_value = 0;
                            }
                        }
                        
                        // ABS_HAT0Y (code 17) - Up/Down D-pad
                        if axis_code == 17 {
                            if value != 0 && value != hat0y_value {
                                hat0y_value = value;
                                if value == -1 {
                                    return Ok("BTN_DPAD_UP".to_string());
                                } else if value == 1 {
                                    return Ok("BTN_DPAD_DOWN".to_string());
                                }
                            } else if value == 0 {
                                hat0y_value = 0;
                            }
                        }
                    }
                }
            }
            Err(_) => {
                tokio::time::sleep(Duration::from_millis(50)).await;
            }
        }
    }
}

#[tauri::command]
async fn listen_for_axis(event_path: String) -> Result<String, String> {
    let mut device = Device::open(&event_path)
        .map_err(|e| format!("Failed to open device: {}", e))?;
    
    let timeout = Duration::from_secs(30);
    let start = std::time::Instant::now();
    
    // Store initial axis values to detect changes
    let mut baseline_values: std::collections::HashMap<u16, i32> = std::collections::HashMap::new();
    
    // First, capture baseline values (current stick positions)
    let baseline_duration = Duration::from_millis(500);
    let baseline_start = std::time::Instant::now();
    
    while baseline_start.elapsed() < baseline_duration {
        if let Ok(events) = device.fetch_events() {
            for event in events {
                if let InputEventKind::AbsAxis(axis) = event.kind() {
                    let axis_code = axis.0;
                    // Skip HAT axes (D-pad) - codes 16 and 17
                    if axis_code != 16 && axis_code != 17 {
                        baseline_values.insert(axis_code, event.value());
                    }
                }
            }
        }
        tokio::time::sleep(Duration::from_millis(50)).await;
    }
    
    println!("Baseline values captured: {:?}", baseline_values);
    
    loop {
        if start.elapsed() > timeout {
            return Err("Timeout: No axis moved within 30 seconds".to_string());
        }
        
        match device.fetch_events() {
            Ok(events) => {
                for event in events {
                    // Look for absolute axis events (analog sticks, triggers)
                    if let InputEventKind::AbsAxis(axis) = event.kind() {
                        let axis_code = axis.0;
                        
                        // Skip HAT axes (D-pad) - codes 16 and 17
                        if axis_code == 16 || axis_code == 17 {
                            continue;
                        }
                        
                        let current_value = event.value();
                        
                        // Get baseline value (or 128 if we don't have it - center position)
                        let baseline = baseline_values.get(&axis_code).unwrap_or(&128);
                        
                        // Threshold for 8-bit values (0-255 range)
                        // Use 60 which is roughly 25% of full range
                        let threshold = 60;
                        let diff = (current_value - baseline).abs();
                        
                        if diff > threshold {
                            // Significant movement detected! Return immediately
                            println!("Detected axis movement: {:?}, baseline: {}, current: {}, diff: {}", 
                                    axis, baseline, current_value, diff);
                            return Ok(format!("{:?}", axis));
                        }
                    }
                }
            }
            Err(_) => {
                tokio::time::sleep(Duration::from_millis(50)).await;
            }
        }
    }
}

#[tauri::command]
fn delete_controller_config(controller_name: String) -> Result<String, String> {
    let file_path = get_configs_file_path();

    if !file_path.exists() {
        return Ok(format!("No config file found, nothing to delete for {}", controller_name));
    }

    let content = fs::read_to_string(&file_path).map_err(|e| e.to_string())?;
    let mut configs_file: ConfigsFile = serde_json::from_str(&content).map_err(|e| e.to_string())?;

    if configs_file.configs.remove(&controller_name).is_some() {
        let json = serde_json::to_string_pretty(&configs_file).map_err(|e| e.to_string())?;
        fs::write(&file_path, json).map_err(|e| e.to_string())?;
        Ok(format!("Deleted config for {}", controller_name))
    } else {
        Ok(format!("Config for {} not found, nothing to delete", controller_name))
    }
}

// Cleanup function to kill all xboxdrv processes
fn cleanup_xboxdrv() {
    println!("Cleaning up xboxdrv processes...");
    let result = std::process::Command::new("pkexec")
        .arg("killall")
        .arg("xboxdrv")
        .output();
    println!("Cleanup result: {:?}", result);
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            discover_controllers,
            start_xboxdrv,
            stop_xboxdrv,
            listen_for_button,
            listen_for_axis,
            save_controller_config,
            load_controller_config,
            get_all_configs,
            check_controller_has_config,
            delete_controller_config
        ])
        .setup(|app| {
            // Set window icon programmatically
            if let Some(window) = app.get_webview_window("main") {
                let icon_path = std::path::PathBuf::from("icons/128x128.png");
                
                if icon_path.exists() {
                    if let Ok(icon_bytes) = std::fs::read(&icon_path) {
                        if let Ok(img) = image::load_from_memory(&icon_bytes) {
                            let rgba = img.to_rgba8();
                            let (width, height) = rgba.dimensions();
                            let icon = tauri::image::Image::new_owned(rgba.into_raw(), width, height);
                            let _ = window.set_icon(icon);
                        }
                    }
                }
            }
            
            // Build tray menu
            let show_item = MenuItem::with_id(app, "show", "Show Blitz", true, None::<&str>)?;
            let quit_item = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show_item, &quit_item])?;
            
            // Build tray icon
            let _tray = TrayIconBuilder::new()
                .menu(&menu)
                .on_menu_event(move |app, event| match event.id.as_ref() {
                    "show" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    "quit" => {
                        cleanup_xboxdrv();
                        std::process::exit(0);
                    }
                    _ => {}
                })
                .on_tray_icon_event(|tray, event| {
                    if let TrayIconEvent::Click { .. } = event {
                        let app = tray.app_handle();
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                })
                .build(app)?;
            
            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                // Prevent default close behavior
                api.prevent_close();
                
                // Hide the window instead of closing
                let _ = window.hide();
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}