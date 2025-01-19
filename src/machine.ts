import { createMachine } from "xstate";
import { invoke } from "@tauri-apps/api/core";
import { mouse_click, moveCursorToCellCenter } from "./functions";
import type { ElementWithBoundingRect } from "./types/commonType";

export const machine = createMachine(
	{
		id: "hop-hop-winV1_0",
		initial: "Hidden",
		context: {
			firstLetter: null,
			secondLetter: null,
			subCell: null,
		},
		states: {
			Hidden: {
				always: {
					target: "Ready",
					actions: [
						{
							type: "resetMachine",
						},
					],
				},
			},
			Ready: {
				on: {
					"shortcut triggered": [
						{
							target: "init",
							actions: [
								{
									type: "showWindow",
								},
							],
						},
					],
				},
			},
			init: {
				on: {
					"[A-Z] pressed": [
						{
							target: "rowSelected",
							actions: [
								{
									type: "setFirstLetter",
								},
							],
						},
					],
					"ESC/shortcut triggered": [
						{
							target: "Reset",
							actions: [],
						},
					],
				},
			},
			rowSelected: {
				on: {
					"[A-Z] pressed": [
						{
							target: "ColumnSelected",
							actions: [
								{
									type: "setSecondLetter",
								},
							],
						},
					],
					"ESC/shortcut triggered": [
						{
							target: "Reset",
							actions: [],
						},
					],
					"backspace pressed": [
						{
							target: "init",
							actions: [
								{
									type: "clearFirstLetter",
								},
							],
						},
					],
				},
			},
			Reset: {
				always: {
					target: "Hidden",
					actions: [
						{
							type: "resetMachine",
						},
					],
				},
			},
			ColumnSelected: {
				on: {
					"[wfpsrtxcd] pressed": [
						{
							target: "subCellSelected",
							actions: [
								{
									type: "setSubCell",
								},
							],
						},
					],
					"enter/space pressed": [
						{
							target: "moveAndClickMouse",
							actions: [
								{
									type: "clickCell",
								},
							],
						},
					],
					"ESC/shortcut triggered": [
						{
							target: "Reset",
							actions: [],
						},
					],
					"Tab pressed": [
						{
							target: "moveMouse",
							actions: [
								{
									type: "moveToCell",
								},
							],
						},
					],
					"backspace pressed": [
						{
							target: "rowSelected",
							actions: [
								{
									type: "clearSecondLetter",
								},
							],
						},
					],
				},
			},
			transite: {
				always: {
					target: "subCellSelected",
					actions: [],
				},
			},
			subCellSelected: {
				on: {
					"[wfpsrtxcd] pressed": [
						{
							target: "transite",
							actions: [
								{
									type: "setSubCell",
								},
							],
						},
					],
					"enter/space pressed": [
						{
							target: "moveAndClickMouse",
							actions: [
								{
									type: "clickSubCell",
								},
							],
						},
					],
					"Tab pressed": [
						{
							target: "moveMouse",
							actions: [
								{
									type: "moveToCell",
								},
							],
						},
					],
					"ESC/shortcut triggered": [
						{
							target: "Reset",
							actions: [],
						},
					],
					"backspace pressed": [
						{
							target: "ColumnSelected",
							actions: [
								{
									type: "clearSubCell",
								},
							],
						},
					],
				},
			},
			moveAndClickMouse: {
				always: {
					target: "Hidden",
					actions: [
						{
							type: "moveAndClickMouseAction",
						},
					],
				},
			},
			moveMouse: {
				always: {
					target: "Hidden",
					actions: [
						{
							type: "moveMouseAction",
						},
					],
				},
			},
		},
	},
	{
		actions: {
			showWindow: async () => {
				await invoke("show_window");
				mouse_click();
				window.focus();
			},
			setFirstLetter: ({ context, event }) => {
				context.firstLetter = event.value;
			},
			clearFirstLetter: ({ context }) => {
				context.firstLetter = null;
			},
			setSecondLetter: ({ context, event }) => {
				context.secondLetter = event.value;
				setTimeout(() => {
					const activeCell = document.querySelector(".active");
					if (!activeCell) return;
					moveCursorToCellCenter(activeCell);
				}, 1);
			},
			clearSecondLetter: ({ context }) => {
				context.secondLetter = null;
			},
			setSubCell: ({ context, event }) => {
				context.subCell = event.value;
				setTimeout(() => {
					const activeSubCell = document.querySelector(
						".active .active-subcell",
					);
					if (!activeSubCell) return;
					moveCursorToCellCenter(activeSubCell);
				}, 1);
			},
			clearSubCell: ({ context }) => {
				context.subCell = null;
				setTimeout(() => {
					const activeCell = document.querySelector(".active");
					if (!activeCell) return;
					moveCursorToCellCenter(activeCell);
				}, 1);
			},
			resetMachine: async ({ context }) => {
				context.firstLetter = null;
				context.secondLetter = null;
				context.subCell = null;
				await invoke("hide_window");
			},
			moveToCell: ({ context, event }) => {
				console.log("moveToCell", context, event);
			},
			clickCell: ({ context, event }) => {
				console.log("clickCell", context, event);
				mouse_click();
			},
			clickSubCell: ({ context, event }) => {
				console.log("clickSubCell", context, event);
				mouse_click();
			},
			moveAndClickMouseAction: ({ context, event }) => {
				if (context.secondLetter && !context.subCell) {
					const activeCell: ElementWithBoundingRect | null =
						document.querySelector(".active");
					if (!activeCell) return;
					moveCursorToCellCenter(activeCell, mouse_click);
				} else if (context.subCell) {
					const activeSubCell: ElementWithBoundingRect | null =
						document.querySelector(".active .active-subcell");
					if (!activeSubCell) return;
					moveCursorToCellCenter(activeSubCell, mouse_click);
				}
				console.log("moveAndClickMouseAction", context, event);
			},
			moveMouseAction: ({ context, event }) => {
				const activeCell: ElementWithBoundingRect | null =
					document.querySelector(".active");
				const activeSubCell: ElementWithBoundingRect | null =
					document.querySelector(".active .active-subcell");
				if (context.secondLetter && !context.subCell && activeCell) {
					moveCursorToCellCenter(activeCell);
				} else if (context.subCell && activeSubCell) {
					moveCursorToCellCenter(activeSubCell);
				}
				console.log("moveMouseAction", context, event);
			},
		},
		actors: {},
		guards: {},
		delays: {},
	},
);
