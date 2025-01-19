import { useMachine } from "@xstate/react";
import { machine } from "./machine";
import { useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { register, unregister } from "@tauri-apps/plugin-global-shortcut";
import Cells from "./Cells";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";

async function setFullscreen() {
	await getCurrentWindow().setFullscreen(true);
	// invoke("toggle_click_through", { enable: true });
	console.log("setFullscreen");
}

setFullscreen();

type MachineEvents =
	| { type: "shortcut triggered" }
	| { type: "ESC/shortcut triggered" };

async function registerShortcuts(send: (event: MachineEvents) => void) {
	await register("Command+Alt+c", async () => {
		if (await invoke("is_window_hidden")) {
			send({ type: "shortcut triggered" });
		} else {
			send({ type: "ESC/shortcut triggered" });
		}
	}).catch((e) => console.log(e));
}

function unregisterAll() {
	unregister("Command+Alt+c");
}

function App() {
	const [state, send] = useMachine(machine);

	useEffect(() => {
		console.log(state.value, state.context);
	}, [state]);

	// Separate useEffect for keyboard event listener
	useEffect(() => {
		const handleKeyDown = async (event: KeyboardEvent) => {
			const key = event.key.toUpperCase();
			console.log(key);
			if (key === "ESCAPE") {
				send({ type: "ESC/shortcut triggered" });
			} else if (key === "BACKSPACE") {
				if (
					!state.context.firstLetter &&
					!state.context.secondLetter &&
					!state.context.subCell
				) {
					send({ type: "ESC/shortcut triggered" });
				} else {
					send({ type: "backspace pressed" });
				}
			} else if (key === "ENTER" || key === "SPACE") {
				send({ type: "enter/space pressed", value: key });
			} else if (key === "TAB") {
				send({ type: "Tab pressed" });
			} else if ("ABCDEFGHIJKLMNOPQRSTUVWXYZ".includes(key)) {
				if (
					!state.context.firstLetter &&
					!state.context.secondLetter &&
					!state.context.subCell
				) {
					send({ type: "[A-Z] pressed", value: key });
				} else if (
					state.context.firstLetter &&
					!state.context.secondLetter &&
					!state.context.subCell
				) {
					send({ type: "[A-Z] pressed", value: key });
				} else if (state.context.firstLetter && state.context.secondLetter) {
					if ("qwfpasrtzxcd".toUpperCase().includes(key)) {
						send({ type: "[wfpsrtxcd] pressed", value: key });
					}
				}
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		registerShortcuts(send);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
			unregisterAll();
		};
	}, [state, send]);

	return (
		<>
			<Cells
				firstLetter={state.context.firstLetter}
				secondLetter={state.context.secondLetter}
				subCell={state.context.subCell}
			/>
		</>
	);
}
export default App;
