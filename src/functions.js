import { invoke } from "@tauri-apps/api/core";

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

const PerformCallbackOnCellOrSubcell = (activeCell, callback = null) => {
	const scaleFactor = window.devicePixelRatio;
	const activeCellBoundry = activeCell.getBoundingClientRect();
	const activeCellCenterX =
		(activeCellBoundry.left + activeCellBoundry.width / 2) * scaleFactor;
	const activeCellCenterY =
		(activeCellBoundry.top + activeCellBoundry.height / 2) * scaleFactor;

	move_mouse(
		Number.parseInt(activeCellCenterX),
		Number.parseInt(activeCellCenterY),
	);
	if (callback) {
		setTimeout(() => {
			callback();
		}, 100);
	}
};

export { mouse_click, move_mouse, PerformCallbackOnCellOrSubcell };
