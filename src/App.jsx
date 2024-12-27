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

function Cells() {
	const gridSize = 26; // 26x26 grid
	const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

	const [firstLetter, setFirstLetter] = useState(null);
	const [secondLetter, setSecondLetter] = useState(null);

	const letterPairs = [];
	for (let i = 0; i < gridSize; i++) {
		for (let j = 0; j < gridSize; j++) {
			const pair = alphabet.charAt(i) + alphabet.charAt(j);
			letterPairs.push(pair);
		}
	}

	const resetHighlight = () => {
		setFirstLetter(null);
		setSecondLetter(null);
	};

	const handleKeyDown = (event) => {
		const key = event.key.toUpperCase();
		console.log(key);
		if (alphabet.includes(key)) {
			if (!firstLetter) {
				setFirstLetter(key);
			} else if (!secondLetter) {
				setSecondLetter(key);
				setTimeout(resetHighlight, 300); // Reset highlights after 1 second
			}
		}
	};

	useEffect(() => {
		window.addEventListener("keydown", handleKeyDown);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [firstLetter, secondLetter]);

	return (
		<div
			className="grid-container"
			onClick={resetHighlight} // Clicking anywhere resets highlights
		>
			{letterPairs.map((pair, index) => {
				const isRowHighlighted = firstLetter === pair[0];
				const isCellHighlighted =
					firstLetter === pair[0] && secondLetter === pair[1];

				return (
					<div
						key={index}
						className={`grid-item ${isCellHighlighted ? "active" : ""}`}
					>
						<div className="cordinates">
							<p
								className={`${secondLetter === null && isRowHighlighted ? "highlighted" : ""}`}
							>
								{pair[0]}
							</p>
							<p>{pair[1]}</p>
						</div>
					</div>
				);
			})}
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
