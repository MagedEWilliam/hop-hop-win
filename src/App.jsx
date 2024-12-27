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

async function move_mouse(x = 0, y = 0, abs = false) {
	try {
		await invoke("move_mouse", { x, y, abs });
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
		// Reset highlights when the user clicks anywhere
		const activeCell = document.querySelector(".active");
		if (activeCell) {
			const activeCellBoundry = activeCell.getBoundingClientRect();
			const activeCellCenterX =
				activeCellBoundry.left + activeCellBoundry.width / 2;
			const activeCellCenterY =
				activeCellBoundry.top + activeCellBoundry.height / 2;
			move_mouse(
				parseInt(activeCellCenterX),
				parseInt(activeCellCenterY),
				true,
			);
		}
		move_mouse();
		setFirstLetter(null);
		setSecondLetter(null);
	};

	const handleKeyDown = (event) => {
		const key = event.key.toUpperCase();
		console.log(key);

		if (key === "BACKSPACE") {
			if (secondLetter) {
				setSecondLetter(null); // Clear the second letter
			} else if (firstLetter) {
				setFirstLetter(null); // Clear the first letter
			}
		} else if (alphabet.includes(key)) {
			if (!firstLetter) {
				setFirstLetter(key); // Set the first letter
			} else if (!secondLetter) {
				setSecondLetter(key); // Set the second letter
				setTimeout(resetHighlight, 300); // Reset highlights after a timeout
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
						className={`grid-item ${isCellHighlighted ? "active" : isRowHighlighted ? "highlighted" : ""}`}
					>
						<div className="cordinates">
							<p>{pair[0]}</p>
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
