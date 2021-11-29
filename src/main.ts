import "./styles/style.css";
import "./styles/slider.css";
import { FrameData, MessageData } from "./vite-env";
import gridWorker from "./worker?worker";

const canvas = document.querySelector("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
const frames: number[] = [];
const cellSize = 10;

const settings = { window: false, showFPS: true, grid: false, balls: true, gridResolution: 10 };
const settingsPanel = document.querySelector("#settings") as HTMLDivElement;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const workerInstance = new gridWorker();

workerInstance.postMessage({ event: "init", data: { width: canvas.width, height: canvas.height, cellSize } });

workerInstance.onmessage = (message: MessageEvent<MessageData>) => {
	const MessageData = message.data;

	switch (MessageData.event) {
		case "frameUpdate":
			const updateData: FrameData = JSON.parse(MessageData.data);
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			//Draw the grid
			// ctx.strokeStyle = "rgb(0,0,0,0.25)";

			// ctx.beginPath();
			// for (let x = 0; x < updateData.cells.length; x++) {
			// 	for (let y = 0; y < updateData.cells[x].length; y++) {
			// 		ctx.rect(x * cellSize, y * cellSize, cellSize, cellSize);
			// 	}
			// }
			// ctx.stroke();

			//Draw corners of the cells
			// for (let x = 0; x < updateData.cells.length; x++) {
			// 	for (let y = 0; y < updateData.cells[x].length; y++) {
			// 		ctx.fillStyle = updateData.cells[x][y] >= 1 ? "green" : "black";
			// 		ctx.beginPath();

			// 		ctx.arc(x * cellSize, y * cellSize, 5, 0, Math.PI * 2);
			// 		ctx.fill();
			// 	}
			// }

			ctx.strokeStyle = "green";
			ctx.beginPath();

			for (let x = 0; x < updateData.states.length; x++) {
				for (let y = 0; y < updateData.states[x].length; y++) {
					const lerp = (x0: number, x1: number, y0: number, y1: number) => {
						return y0 + ((y1 - y0) * (1 - x0)) / (x1 - x0);
					};

					const state = updateData.states[x][y];

					// ctx.strokeText(state.toString(), x * cellSize + cellSize / 2, y * cellSize + cellSize / 2);

					const topLerp = lerp(updateData.cells[x][y], updateData.cells[x + 1][y], 0, 1);
					const rightLerp = lerp(updateData.cells[x + 1][y], updateData.cells[x + 1][y + 1], 0, 1);
					const bottomLerp = lerp(updateData.cells[x][y + 1], updateData.cells[x + 1][y + 1], 0, 1);
					const leftLerp = lerp(updateData.cells[x][y], updateData.cells[x][y + 1], 0, 1);

					const top = [(x + topLerp) * cellSize, y * cellSize];
					const right = [(x + 1) * cellSize, (y + rightLerp) * cellSize];
					const bottom = [(x + bottomLerp) * cellSize, (y + 1) * cellSize];
					const left = [x * cellSize, (y + leftLerp) * cellSize];

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

			ctx.stroke();

			//Draw the balls
			ctx.strokeStyle = "red";
			updateData.balls.forEach((ball) => {
				ctx.beginPath();
				ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
				ctx.stroke();
			});

			//Calculate FPS
			while (frames.length > 0 && frames[0] <= updateData.calcBegin - 1000) {
				frames.shift();
			}

			frames.push(updateData.calcBegin);

			if (settings.showFPS) {
				ctx.strokeText(`${frames.length} FPS`, settings.window ? canvas.width - 294 : canvas.width - 64, 10);
				ctx.stroke();
			}
			requestAnimationFrame(() => {
				workerInstance.postMessage({ event: "frameUpdate" });
			});
			break;
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

(document.querySelector("#toggleSettings") as HTMLButtonElement).addEventListener("click", (e) => {
	settings.window = true;
	settingsPanel.classList.toggle("visible");
	(document.querySelector("#toggleSettings") as HTMLButtonElement).style.display = "none";
});

(document.querySelector("#settings svg") as HTMLButtonElement).addEventListener("click", () => {
	settings.window = false;
	settingsPanel.classList.toggle("visible");
	(document.querySelector("#toggleSettings") as HTMLButtonElement).style.display = "block";
});
