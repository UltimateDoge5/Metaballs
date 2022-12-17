import { Ball } from "./classes/ball";

type Events = "init" | "frameUpdate" | "resize" | "resolutionUpdate" | "reset" | "collisionUpdate";

interface MessageData {
	event: Events;
	data: any;
}

interface FrameData {
	cells: number[][];
	balls: Ball[];
	calcBegin: number;
	states: number[][];
}