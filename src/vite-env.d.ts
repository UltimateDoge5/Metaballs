/// <reference types="vite/client" />

import { Ball } from "./classes/ball";
import { Cell } from "./classes/cell";

type Events = "init" | "frameUpdate";

interface MessageData {
	event: Events;
	data: any;
}

interface FrameData {
	cells: Cell[][];
	balls: Ball[];
}
