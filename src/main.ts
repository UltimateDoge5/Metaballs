import "./styles/style.css";

import type { MessageData, FrameData } from "./types";
import GUI from "lil-gui";

const canvas = document.querySelector("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
const fps = document.querySelector("#fps") as HTMLSpanElement;
const frames: number[] = [];

const settings = {
	showFPS: true,
	showBalls: true,
	gridResolution: 10,
	enableLerp: true,
	showStates: false,
	collisions: false,
	fullscreen: async () => {
		if (canvas.requestFullscreen) {
			canvas.style.backgroundColor = "#fff";
			await canvas.requestFullscreen();
		}
	}
};
const gui = new GUI({ title: "Settings" });

gui.add(settings, "showFPS")
	.name("Show FPS")
	.onChange((v: boolean) => (fps.style.display = v ? "block" : "none"));

gui.add(settings, "showBalls").name("Show Balls");
gui.add(settings, "showStates").name("Show States");
gui.add(settings, "enableLerp").name("Enable Lerp");
gui.add(settings, "collisions")
	.name("Enable collisions")
	.onChange((v: boolean) => {
		workerInstance.postMessage({ event: "collisionUpdate", data: { collisions: v } });
	});

gui.add(settings, "gridResolution", 10, 100, 1)
	.name("Grid Resolution")
	.onChange((value: number) => {
		workerInstance.postMessage({ event: "resolutionUpdate", data: { cellSize: value } });
	});

gui.add(settings, "fullscreen").name("Go fullscreen");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const workerInstance = new Worker(new URL("./worker.ts", import.meta.url), {
	type: "module"
});

workerInstance.postMessage({ event: "init", data: { width: canvas.width, height: canvas.height, cellSize: settings.gridResolution } });

workerInstance.onmessage = (message: MessageEvent<MessageData>) => {
	const MessageData = message.data;

	switch (MessageData.event) {
		case "frameUpdate":
			const updateData: FrameData = JSON.parse(MessageData.data);
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			ctx.strokeStyle = "green";

			//Draw the cell states
			if (settings.showStates) {
				for (let x = 0; x < updateData.states.length; x++) {
					for (let y = 0; y < updateData.states[x].length; y++) {
						if (updateData.states[x][y] == 0) continue;

						ctx.strokeText(
							updateData.states[x][y].toString(),
							x * settings.gridResolution + settings.gridResolution / 2,
							y * settings.gridResolution + settings.gridResolution / 2
						);
					}
				}
			}

			//Render the isolines
			ctx.beginPath();
			if (settings.enableLerp) {
				renderIsolinesLerp(updateData.cells, updateData.states);
			} else {
				renderIsolines(updateData.states);
			}

			ctx.stroke();

			//Draw the balls
			ctx.strokeStyle = "red";
			if (settings.showBalls) {
				updateData.balls.forEach((ball) => {
					ctx.beginPath();
					ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
					ctx.stroke();
				});
			}

			//Calculate FPS
			while (frames.length > 0 && frames[0] <= updateData.calcBegin - 1000) {
				frames.shift();
			}

			frames.push(updateData.calcBegin);

			if (settings.showFPS) fps.textContent = `FPS: ${frames.length}`;

			requestAnimationFrame(() => workerInstance.postMessage({ event: "frameUpdate" }));
			break;
	}
};

//Render the isolines withouth lerp
const renderIsolines = (states: number[][]) => {
	for (let x = 0; x < states.length; x++) {
		for (let y = 0; y < states[x].length; y++) {
			const state = states[x][y];

			const top = [x * settings.gridResolution + settings.gridResolution / 2, y * settings.gridResolution];
			const right = [(x + 1) * settings.gridResolution, y * settings.gridResolution + settings.gridResolution / 2];
			const bottom = [x * settings.gridResolution + settings.gridResolution / 2, (y + 1) * settings.gridResolution];
			const left = [x * settings.gridResolution, y * settings.gridResolution + settings.gridResolution / 2];

			switch (state) {
				case 0:
				case 15:
					break;
				case 1:
				case 14:
					ctx.moveTo(left[0], left[1]);
					ctx.lineTo(bottom[0], bottom[1]);
					break;
				case 2:
				case 13:
					ctx.moveTo(bottom[0], bottom[1]);
					ctx.lineTo(right[0], right[1]);
					break;
				case 3:
				case 12:
					ctx.moveTo(left[0], left[1]);
					ctx.lineTo(right[0], right[1]);
					break;

				case 4:
				case 11:
					ctx.moveTo(top[0], top[1]);
					ctx.lineTo(right[0], right[1]);
					break;
				case 5:
					//Left to top
					ctx.moveTo(left[0], left[1]);
					ctx.moveTo(top[0], top[1]);

					//Bottom to right
					ctx.moveTo(bottom[0], bottom[1]);
					ctx.lineTo(right[0], right[1]);
					break;
				case 6:
				case 9:
					ctx.moveTo(top[0], top[1]);
					ctx.lineTo(bottom[0], bottom[1]);
					break;
				case 7:
				case 8:
					ctx.moveTo(left[0], left[1]);
					ctx.lineTo(top[0], top[1]);
					break;
				case 10:
					ctx.moveTo(top[0], top[1]);
					ctx.lineTo(right[0], right[1]);

					ctx.moveTo(left[0], left[1]);
					ctx.lineTo(bottom[0], bottom[1]);
					break;
			}
		}
	}
};

//Render the isolines with lerp
const renderIsolinesLerp = (cells: number[][], states: number[][]) => {
	for (let x = 0; x < states.length; x++) {
		for (let y = 0; y < states[x].length; y++) {
			const lerp = (x0: number, x1: number, y0: number, y1: number) => {
				return y0 + ((y1 - y0) * (1 - x0)) / (x1 - x0);
			};

			const state = states[x][y];

			const topLerp = lerp(cells[x][y], cells[x + 1][y], 0, 1);
			const rightLerp = lerp(cells[x + 1][y], cells[x + 1][y + 1], 0, 1);
			const bottomLerp = lerp(cells[x][y + 1], cells[x + 1][y + 1], 0, 1);
			const leftLerp = lerp(cells[x][y], cells[x][y + 1], 0, 1);

			const top = [(x + topLerp) * settings.gridResolution, y * settings.gridResolution];
			const right = [(x + 1) * settings.gridResolution, (y + rightLerp) * settings.gridResolution];
			const bottom = [(x + bottomLerp) * settings.gridResolution, (y + 1) * settings.gridResolution];
			const left = [x * settings.gridResolution, (y + leftLerp) * settings.gridResolution];

			switch (state) {
				case 0:
				case 15:
					break;
				case 1:
				case 14:
					ctx.moveTo(left[0], left[1]);
					ctx.lineTo(bottom[0], bottom[1]);
					break;
				case 2:
				case 13:
					ctx.moveTo(bottom[0], bottom[1]);
					ctx.lineTo(right[0], right[1]);
					break;
				case 3:
				case 12:
					ctx.moveTo(left[0], left[1]);
					ctx.lineTo(right[0], right[1]);
					break;

				case 4:
				case 11:
					ctx.moveTo(top[0], top[1]);
					ctx.lineTo(right[0], right[1]);
					break;
				case 5:
					//Left to top
					ctx.moveTo(left[0], left[1]);
					ctx.moveTo(top[0], top[1]);

					//Bottom to right
					ctx.moveTo(bottom[0], bottom[1]);
					ctx.lineTo(right[0], right[1]);
					break;
				case 6:
				case 9:
					ctx.moveTo(top[0], top[1]);
					ctx.lineTo(bottom[0], bottom[1]);
					break;
				case 7:
				case 8:
					ctx.moveTo(left[0], left[1]);
					ctx.lineTo(top[0], top[1]);
					break;
				case 10:
					ctx.moveTo(top[0], top[1]);
					ctx.lineTo(right[0], right[1]);

					ctx.moveTo(left[0], left[1]);
					ctx.lineTo(bottom[0], bottom[1]);
					break;
			}
		}
	}
};

requestAnimationFrame(() => {
	workerInstance.postMessage({ event: "frameUpdate" });
});

window.addEventListener("resize", () => {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	workerInstance.postMessage({ event: "resize", data: { width: canvas.width, height: canvas.height } });
});

window.addEventListener("keydown", (e) => {
	if (e.key === "r") {
		workerInstance.postMessage({ event: "reset" });
	}

	if (e.key === "f") {
		settings.fullscreen();
	}
});
