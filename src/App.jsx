import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
	currentMonitor,
	getCurrentWindow,
	LogicalPosition,
	LogicalSize,
} from "@tauri-apps/api/window";
import { register, unregister } from "@tauri-apps/plugin-global-shortcut";
import "./App.css";

function Cell({ index, cell }) {
	return (
		<div
			key={index}
			style={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				border: "1px solid #ccc",
				fontSize: "12px",
				boxSizing: "border-box",
			}}
		>
			<p>{cell}</p>
		</div>
	);
}

function Cells() {
	const gridSize = 26; // 28x28 grid
	const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

	const letterPairs = [];
	// Generate pairs of letters for each cell
	for (let i = 0; i < gridSize; i++) {
		for (let j = 0; j < gridSize; j++) {
			const pair = alphabet.charAt(i) + alphabet.charAt(j);
			letterPairs.push(pair);
		}
	}

	return (
		<div className="grid-container">
			{letterPairs.map((pair, index) => (
				<div key={index} className="grid-item">
					<div className="cordinates">
						<p className="left">{pair[0]}</p>
						<p className="right">{pair[1]}</p>
					</div>
				</div>
			))}
		</div>
	);
}

function App() {
	const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });

	async function move_mouse(x = 0, y = 0, abs = false) {
		try {
			setGreetMsg(await invoke("move_mouse", { x, y, abs }));
		} catch (e) {
			console.log(e);
		}
	}

	async function hideWindow() {
		try {
			await invoke("hide_window");
		} catch (e) {
			console.log(e);
		}
	}

	useEffect(() => {
		async function getWindow() {
			const monitor = currentMonitor();
			const theWindow = await monitor;
			await getCurrentWindow().setSize(
				new LogicalSize(theWindow.size.width, theWindow.size.height),
			);
			await getCurrentWindow().setPosition(
				new LogicalPosition(theWindow.position.x, theWindow.position.y),
			);
			await getCurrentWindow().setFullscreen(true);
			console.log(await getCurrentWindow(), theWindow.size);
			setScreenSize(theWindow.size);
		}
		getWindow();

		async function registerShortcuts() {
			await register("CommandOrControl+Shift+Alt+Tab", async () => {
				console.log("Shortcut triggered");
				await invoke("show_window");
			});
		}

		function unregisterAll() {
			unregister("CommandOrControl+Shift+Alt+Tab");
		}

		// registerShortcuts();

		return () => {
			unregisterAll();
		};
	}, []);

	return (
		<div className="container">
			<Cells monitorSize={screenSize} />
		</div>
	);
}

export default App;
