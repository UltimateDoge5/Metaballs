import "./styles/style.css";
import { FrameData, MessageData } from "./vite-env";

const canvas = document.querySelector("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

canvas.width = Math.floor(window.innerWidth / 2);
canvas.height = Math.floor(window.innerHeight / 2);

import gridWorker from "./worker?worker";

const workerInstance = new gridWorker();

workerInstance.postMessage({ event: "init", data: { width: canvas.width, height: canvas.height } });

workerInstance.onmessage = (message: MessageEvent<MessageData>) => {
	const MessageData = message.data;

	switch (MessageData.event) {
		case "frameUpdate":
			const updateData: FrameData = JSON.parse(MessageData.data);

			ctx.clearRect(0, 0, canvas.width, canvas.height);

			for (let x = 0; x < updateData.cells.length; x++) {
				for (let y = 0; y < updateData.cells[x].length; y++) {
					if (updateData.cells[x][y] < 1) continue;
					ctx.beginPath();
					ctx.rect(x, y, 1, 1);
					ctx.fillStyle = `green`;
					ctx.fill();
				}
			}

			updateData.balls.forEach((ball) => {
				ctx.beginPath();
				ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
				ctx.strokeStyle = "red";
				ctx.stroke();
			});

			requestAnimationFrame(() => {
				workerInstance.postMessage({ event: "frameUpdate" });
			});
			break;
	}
};

requestAnimationFrame(() => {
	workerInstance.postMessage({ event: "frameUpdate" });
});
