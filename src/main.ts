import "./styles/style.css";
import "./styles/slider.css";
import { FrameData, MessageData } from "./vite-env";
import gridWorker from "./worker?worker";

const canvas = document.querySelector("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
const frames: number[] = [];

const settings = { showWindow: false, showFPS: true, showGrid: false, showBalls: true, gridResolution: 10, enableLerp: true, showStates: false };
const settingsPanel = document.querySelector("#settings") as HTMLDivElement;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const workerInstance = new gridWorker();

workerInstance.postMessage({ event: "init", data: { width: canvas.width, height: canvas.height, cellSize: settings.gridResolution } });

workerInstance.onmessage = (message: MessageEvent<MessageData>) => {
	const MessageData = message.data;

	switch (MessageData.event) {
		case "frameUpdate":
			const updateData: FrameData = JSON.parse(MessageData.data);
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			//Draw the grids
			if (settings.showGrid) {
				ctx.strokeStyle = "rgb(0,0,0,0.25)";
				ctx.beginPath();
				for (let x = 0; x < updateData.cells.length; x++) {
					ctx.moveTo(x * settings.gridResolution, 0);
					ctx.lineTo(x * settings.gridResolution, canvas.height);
					for (let y = 0; y < updateData.cells[x].length; y++) {
						ctx.moveTo(x * settings.gridResolution, y * settings.gridResolution);
						ctx.lineTo(x * settings.gridResolution + settings.gridResolution, y * settings.gridResolution);
					}
				}
				ctx.stroke();
			}

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

			if (settings.showFPS) {
				ctx.strokeStyle = "red";
				ctx.strokeText(`${frames.length} FPS`, settings.showWindow ? canvas.width - 294 : canvas.width - 64, 10);
			}
			requestAnimationFrame(() => {
				workerInstance.postMessage({ event: "frameUpdate" });
			});
			break;
	}
};

//I know it's lazy and dumb to separate this in two diffrent functions but I don't want to make it more complex

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

(document.querySelector("#toggleSettings") as HTMLButtonElement).addEventListener("click", () => {
	settings.showWindow = true;
	settingsPanel.classList.toggle("visible");
	(document.querySelector("#toggleSettings") as HTMLButtonElement).style.display = "none";
});

(document.querySelector("#settings svg") as HTMLButtonElement).addEventListener("click", () => {
	settings.showWindow = false;
	settingsPanel.classList.toggle("visible");
	(document.querySelector("#toggleSettings") as HTMLButtonElement).style.display = "block";
});

document.querySelectorAll<HTMLInputElement>("#settings input").forEach((input) => {
	if (input.type === "range") {
		input.addEventListener("input", () => {
			(input.parentElement?.querySelector("span") as HTMLSpanElement).innerText = input.value;
		});

		input.addEventListener("change", () => {
			settings.gridResolution = parseInt(input.value);
			workerInstance.postMessage({ event: "resolutionUpdate", data: { cellSize: settings.gridResolution } });
		});
	} else if (input.type === "checkbox") {
		input.addEventListener("change", () => {
			switch (input.id as keyof typeof settings) {
				case "showFPS":
					settings.showFPS = input.checked;
					break;
				case "showGrid":
					settings.showGrid = input.checked;
					break;
				case "showWindow":
					settings.showWindow = input.checked;
					break;
				case "showBalls":
					settings.showBalls = input.checked;
					break;
				case "enableLerp":
					settings.enableLerp = input.checked;
					break;
				case "showStates":
					settings.showStates = input.checked;
					break;
			}
		});
	}
});
