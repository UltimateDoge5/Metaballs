import { Ball } from "./ball";

export class Grid {
	width: number;
	height: number;
	cells: Ball[];

	constructor(width: number, height: number) {
		this.width = width;
		this.height = height;
		this.cells = [];

		for (let i = 0; i < getRandomInt(7, 15); i++) {
			const ballRadius = getRandomInt(10, 35);
			this.cells[i] = new Ball(getRandomInt(ballRadius, this.width), getRandomInt(ballRadius, this.height), ballRadius);
		}
	}
}

const getRandomInt = (min: number, max: number) => {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min) + min);
};
