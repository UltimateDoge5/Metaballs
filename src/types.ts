import { Ball } from "./classes/ball";

export type Events = "init" | "frameUpdate" | "resize" | "resolutionUpdate" | "reset" | "collisionUpdate";
export interface MessageData {
	event: Events;
	data: any;
}

export interface FrameData {
	cells: number[][];
	balls: Ball[];
	calcBegin: number;
	states: number[][];
}
