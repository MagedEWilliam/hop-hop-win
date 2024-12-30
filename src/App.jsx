import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import {
	currentMonitor,
	getCurrentWindow,
	LogicalPosition,
	LogicalSize,
} from "@tauri-apps/api/window";
import { register, unregister } from "@tauri-apps/plugin-global-shortcut";
import { enable, isEnabled } from "@tauri-apps/plugin-autostart";
import "./App.css";

async function checkAutostart() {
	if (import.meta.env.PROD) {
		if ((await isEnabled()) === false) {
			// Enable autostart
			await enable();
		}
		// Check enable state
		console.log(`registered for autostart? ${await isEnabled()}`);
	}
}

// checkAutostart();

async function mouse_click() {
	try {
		await invoke("mouse_click");
	} catch (e) {
		console.log(e);
	}
}

async function move_mouse(x = 0, y = 0, abs = true) {
	try {
		await invoke("move_mouse", { x, y, abs });
	} catch (e) {
		console.log(e);
	}
}

async function hideWindow() {
	try {
		return await invoke("hide_window");
	} catch (e) {
		console.log(e);
	}
	// return;
}

function Cells() {
	const gridSize = 26; // 26x26 grid
	const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

	const [firstLetter, setFirstLetter] = useState(null);
	const [secondLetter, setSecondLetter] = useState(null);
	const [selectedSubcell, setSelectedSubcell] = useState(null);

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
		setSelectedSubcell(null);
		hideWindow(); // Hides the app
	};

	const PerformCallbackOnCellOrSubcell = (
		activeCell,
		scaleFactor,
		callback,
	) => {
		const activeCellBoundry = activeCell.getBoundingClientRect();
		const activeCellCenterX =
			(activeCellBoundry.left + activeCellBoundry.width / 2) * scaleFactor;
		const activeCellCenterY =
			(activeCellBoundry.top + activeCellBoundry.height / 2) * scaleFactor;

		move_mouse(
			Number.parseInt(activeCellCenterX),
			Number.parseInt(activeCellCenterY),
		);
		resetHighlight(); // Reset highlights
		hideWindow(); // Hide the app
		setTimeout(() => {
			callback();
		}, 100);
	};

	const highlightedCellOrSubcell = (selectedSubcell, scaleFactor, callback) => {
		const activeCell = document.querySelector(".active");
		if (activeCell && !selectedSubcell) {
			PerformCallbackOnCellOrSubcell(activeCell, scaleFactor, callback);
		} else if (activeCell && selectedSubcell) {
			const activeSubCell = document.querySelector(".active .active-subcell");
			PerformCallbackOnCellOrSubcell(activeSubCell, scaleFactor, callback);
		}
	};
	const handleKeyDown = async (event) => {
		const key = event.key.toUpperCase();
		console.log(key);
		const scaleFactor = window.devicePixelRatio;

		if (key === "BACKSPACE") {
			// If the key is backspace, step back one letter
			if (firstLetter && !secondLetter && !selectedSubcell) {
				setFirstLetter(null); // Clear the first letter
			} else if (firstLetter && secondLetter && !selectedSubcell) {
				setSecondLetter(null); // Clear the second letter
			} else if (firstLetter && secondLetter && selectedSubcell) {
				setSelectedSubcell(null); // Clear the selected subcell
			} else if (
				firstLetter === null &&
				secondLetter === null &&
				selectedSubcell === null
			) {
				resetHighlight(); // Reset highlights
				hideWindow(); // Hide the app if no letters are set
			}
		} else if (key === " " || key === "ENTER") {
			// Perform the click action if the key is space or enter
			highlightedCellOrSubcell(selectedSubcell, scaleFactor, mouse_click);
			// Perform the click action
		} else if (key === "ESCAPE") {
			await hideWindow();
			resetHighlight(); // Reset highlights
		} else if (key === "TAB") {
			highlightedCellOrSubcell(selectedSubcell, scaleFactor, resetHighlight);
		} else if (alphabet.includes(key)) {
			// If the key is a letter
			if (!firstLetter) {
				setFirstLetter(key); // Set the first letter
			} else if (!secondLetter) {
				setSecondLetter(key); // Set the second letter
			} else if (!selectedSubcell) {
				setSelectedSubcell(key); // Set the selected subcell
			}
		}
	};

	useEffect(() => {
		window.addEventListener("keydown", handleKeyDown);
		console.log(firstLetter, secondLetter, selectedSubcell);

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [firstLetter, secondLetter, selectedSubcell]);

	const RenderSubgrid = ({ isCellHighlighted }) => (
		<div className="subgrid">
			{"qwfpasrtzxcd".split("").map((_, idx) => (
				<div
					key={idx}
					className={`subcell ${selectedSubcell === _.toUpperCase() ? "active-subcell" : ""}`}
				>
					<div className={`${isCellHighlighted ? "" : "hidden"}`}>
						{_.toUpperCase()}
					</div>
				</div>
			))}
		</div>
	);

	return (
		<div className="grid-container">
			{letterPairs.map((pair, index) => {
				const isRowHighlighted = firstLetter === pair[0];
				const isCellHighlighted =
					firstLetter === pair[0] && secondLetter === pair[1];
				const isUnfocused = firstLetter && !isRowHighlighted; // Unfocused if the cell's row is not highlighted

				return (
					<div
						key={pair}
						className={`grid-item ${
							isCellHighlighted
								? "active"
								: isRowHighlighted
									? "highlighted"
									: isUnfocused
										? "unfocused"
										: ""
						}`}
					>
						<div className="cordinates">
							<>
								<RenderSubgrid isCellHighlighted={isCellHighlighted} />
								{!isCellHighlighted ? (
									<>
										<p>{pair[0]}</p>
										<p>{pair[1]}</p>
									</>
								) : null}
							</>
						</div>
					</div>
				);
			})}
		</div>
	);
}

function App() {
	const [screenSize, setScreenSize] = useState({ width: 0, height: 0 });

	const setTrueViewportDimensions = () => {
		const root = document.documentElement;

		// Get the screen's real size in CSS pixels
		const trueViewportWidth = window.screen.width;
		const trueViewportHeight = window.screen.height;

		console.log(trueViewportWidth, trueViewportHeight);
		// Update the CSS variables
		root.style.setProperty("--true-viewport-width", `${trueViewportWidth}px`);
		root.style.setProperty("--true-viewport-height", `${trueViewportHeight}px`);
	};

	useEffect(() => {
		setTrueViewportDimensions();
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
			await register("Command+Control+Alt+Tab", async () => {
				console.log("Shortcut triggered", await invoke("is_window_hidden"));
				if (await invoke("is_window_hidden")) {
					await invoke("show_window");
					mouse_click();
					window.focus();
				} else {
					await hideWindow();
				}
			});
		}

		function unregisterAll() {
			unregister("Command+Control+Alt+Tab");
		}

		registerShortcuts();

		let ctrlTimeout;
		let isCtrlHeld = false;

		function _handleKeyDown(event) {
			if (event.key === "Command+Control+Alt+Tab") {
				isCtrlHeld = true;

				// Start a timer to detect if it's a tap or a hold
				ctrlTimeout = setTimeout(() => {
					// If Ctrl is still held after 300ms, ignore it
					isCtrlHeld = false;
				}, 200);
			}
		}

		function handleKeyUp(event) {
			if (event.key === "Command+Control+Alt+Tab") {
				clearTimeout(ctrlTimeout); // Cancel the hold detection timer

				if (isCtrlHeld) {
					// If released within the tap window, show the app
					isCtrlHeld = false;
					showWindow(); // show the app
				}
			}
		}

		// Attach the event listeners
		window.addEventListener("keydown", _handleKeyDown);
		window.addEventListener("keyup", handleKeyUp);

		async function showWindow() {
			console.log("App triggered by Alt tap!");
			// Add your logic to bring the app to focus
			if (await invoke("is_window_hidden")) {
				await invoke("show_window");
			} else {
				await hideWindow();
			}
		}

		return () => {
			unregisterAll();
			window.removeEventListener("keydown", _handleKeyDown);
			window.removeEventListener("keyup", handleKeyUp);
		};
	}, []);

	return (
		<div
			className="container"
			// onClick={() => {
			// 	hideWindow();
			// }}
		>
			<Cells monitorSize={screenSize} />
		</div>
	);
}

export default App;
