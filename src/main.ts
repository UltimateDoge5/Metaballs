import "./styles/style.css";
import { FrameData, MessageData } from "./vite-env";

const canvas = document.querySelector("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
const frames: number[] = [];
const cellSize = 30;

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
			ctx.strokeStyle = "rgb(0,0,0,0.25)";

			ctx.beginPath();
			for (let x = 0; x < updateData.cells.length; x++) {
				for (let y = 0; y < updateData.cells[x].length; y++) {
					ctx.rect(x * cellSize, y * cellSize, cellSize, cellSize);
				}
			}
			ctx.stroke();

			for (let x = 0; x < updateData.cells.length; x++) {
				for (let y = 0; y < updateData.cells[x].length; y++) {
					ctx.fillStyle = updateData.cells[x][y] >= 1 ? "green" : "black";
					ctx.beginPath();

					ctx.arc(x * cellSize, y * cellSize, 5, 0, Math.PI * 2);
					// ctx.stroke();
					ctx.fill();
				}
			}

			// ctx.beginPath();
			// for (let x = 0; x < updateData.cells.length; x++) {
			// 	for (let y = 0; y < updateData.cells[x].length; y++) {
			// 		const cell: Cell = updateData.cells[x][y];
			// 		if (cell.value < 1) continue;

			// 		ctx.rect(x * cell.size, y * cell.size, cell.size, cell.size);
			// 		ctx.fillStyle = "green";
			// 	}
			// }
			// ctx.fill();

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
