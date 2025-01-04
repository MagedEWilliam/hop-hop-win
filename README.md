# Experimental Project: Hop-Hop Win

> [!Note]
> This project is currently in an experimental stage. I do not recommend using it just yet. In the meantime, check out these alternatives:
> - [warpd](https://github.com/rvaiya/warpd)
> - [mouseless](https://mouseless.click/)

## What is this?
Switching between the keyboard and mouse disrupts workflow. While exploring solutions, I found two main approaches:
- Hardware-based: Devices like trackballs, trackpoints, and trackpads.
- Software-based: Solutions like this project aim to address the problem programmatically.
This project belongs to the second camp—a software-focused approach to minimizing interruptions.

## How to Use
1. Trigger the interface
Press `Command` + `Control` + `Alt` + `Tab` (or assign this combination to a single key). This is a limitation of the [tauri-plugin-global-shortcut](https://github.com/tauri-apps/tauri-plugin-global-shortcut), but I plan to request a feature for single-modifier triggers.

2. Select a row
Type any letter from "A" to "Z" to choose a row.

3. Select a cell
Type another letter (again, "A" to "Z") to choose a cell within the selected row.

4. Take an action
   * **Backspace**: Go back to selecting a row.
   * **Enter/Space**: Click the center of the selected cell.
   * **Tab**: Hover over the center of the cell.
   * **ESC/Mouse Left Click**: Dismiss the interface.
  
6. Refine with subcells
If precision is needed, choose a subcell from a 4x3 grid. Each subcell is labeled with a letter. After selecting a subcell, the same actions as above are available.

## Motivation
I use a split keyboard with a built-in mouse emulator, so this project differs slightly from tools like mouseless or warpd. Some functionality—such as mouse movement—is already integrated into my keyboard setup.

## Roadmap
Here’s a plan for the project’s future development:

- Implement a system tray.
- Add a settings page.
- Expand or customize cell grids beyond the current 3x4 layout.
- Mirror subcell mapping for consistency.
- Support for double/triple clicks (within 300ms).
- Enable arrow navigation for one-handed use.
- Add automated tests to ensure reliability.
- ~~Add a right-click option~~ (or pass through the action).
- ~~Consider click-drag-release~~ (likely to skip).
- ~~Refactor code using a finite state machine (FSM).~~
