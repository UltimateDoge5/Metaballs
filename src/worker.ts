import { Grid } from "./classes/grid";
import { MessageData } from "./vite-env";

let gridInstance: Grid;

self.onmessage = (message: MessageEvent<MessageData>) => {
	const messageData = message.data;

	switch (messageData.event) {
		case "init":
			gridInstance = new Grid(messageData.data.width, messageData.data.height, messageData.data.cellSize);
			break;
		case "frameUpdate":
			const updateData = gridInstance.frameUpdate();
			self.postMessage({ event: "frameUpdate", data: JSON.stringify(updateData) });
			break;
		case "resize":
			gridInstance.resize(messageData.data.width, messageData.data.height);
			break;
		case "resolutionUpdate":
			gridInstance.cellResolution = messageData.data.cellSize;
			break;
	}
};
