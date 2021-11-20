/// <reference types="vite/client" />

import { Ball } from "./classes/ball";

type Events = "init" | "frameUpdate";

interface MessageData {
	event: Events;
	data: any;
}

interface FrameData {
	cells: number[][];
	balls: Ball[];
	calcBegin: number;
}
