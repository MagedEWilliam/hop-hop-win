import { useMachine } from "@xstate/react";
import { machine } from "./machine";
import { useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { register, unregister } from "@tauri-apps/plugin-global-shortcut";
import "./App.css";
import Cells from "./Cells";
import { invoke } from "@tauri-apps/api/core";

async function setFullscreen() {
	await getCurrentWindow().setFullscreen(true);
	// invoke("toggle_click_through", { enable: true });
	console.log("setFullscreen");
}

setFullscreen();

async function registerShortcuts(send) {
	await register("Command+Control+Alt+Tab", async () => {
		if (await invoke("is_window_hidden")) {
			send({ type: "shortcut triggered" });
		} else {
			send({ type: "ESC/shortcut triggered" });
		}
	}).catch((e) => console.log(e));
}

function unregisterAll() {
	unregister("Command+Control+Alt+Tab");
}

function App() {
	const [state, send] = useMachine(machine);

	const handleKeyDown = async (event) => {
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

	useEffect(() => {
		console.log(state.value, state.context);
	}, [state]);

	useEffect(() => {
		registerShortcuts(send);

		window.addEventListener("keydown", handleKeyDown);

		return () => {
			unregisterAll();
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, []);

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
