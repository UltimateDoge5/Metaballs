import "./styles/style.css";
import { FrameData, MessageData } from "./vite-env";

const canvas = document.querySelector("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
const frames: number[] = [];
const cellSize = 10;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

import gridWorker from "./worker?worker";

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
					const state = updateData.states[x][y];

					// ctx.strokeText(state.toString(), x * cellSize + cellSize / 2, y * cellSize + cellSize / 2);

					const top = [x * cellSize + cellSize / 2, y * cellSize];
					const right = [(x + 1) * cellSize, y * cellSize + cellSize / 2];
					const bottom = [x * cellSize + cellSize / 2, (y + 1) * cellSize];
					const left = [x * cellSize, y * cellSize + cellSize / 2];

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

			ctx.strokeText(`${frames.length} FPS`, canvas.width - 36, 10);
			ctx.stroke();

			requestAnimationFrame(() => {
				workerInstance.postMessage({ event: "frameUpdate" });
			});
			break;
	}
};

requestAnimationFrame(() => {
	workerInstance.postMessage({ event: "frameUpdate" });
});
