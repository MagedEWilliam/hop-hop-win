import { invoke } from "@tauri-apps/api/core";
import type { ElementWithBoundingRect } from "./types/commonType";

async function mouse_click() {
	try {
		await invoke("mouse_click");
	} catch (e) {
		console.log(e);
	}
}

const move_mouse = async (x = 0, y = 0, abs = true) => {
	try {
		await invoke("move_mouse", { x, y, abs });
	} catch (e) {
		console.log(e);
	}
};

/**
 * Moves the cursor to the center of the specified cell element
 * @param activeCell - The cell element to move the cursor to
 * @param callback - Optional callback function to execute after cursor movement
 */
const moveCursorToCellCenter = (
	activeCell: ElementWithBoundingRect,
	callback: (() => void) | null = null,
) => {
	const scaleFactor: number = window.devicePixelRatio;
	const activeCellBoundry: DOMRect = activeCell.getBoundingClientRect();
	const activeCellCenterX: number =
		(activeCellBoundry.left + activeCellBoundry.width / 2) * scaleFactor;
	const activeCellCenterY: number =
		(activeCellBoundry.top + activeCellBoundry.height / 2) * scaleFactor;

	move_mouse(Number(activeCellCenterX), Number(activeCellCenterY));
	if (callback) {
		setTimeout(() => {
			callback();
		}, 100);
	}
};

export { mouse_click, move_mouse, moveCursorToCellCenter };
