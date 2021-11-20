import { Ball } from "./ball";

export class Grid {
	width: number;
	height: number;
	balls: Ball[];
	cells: number[][] = [];
	cellSize: number;

	constructor(width: number, height: number, cellSize: number) {
		this.width = width;
		this.height = height;
		this.cellSize = cellSize;
		this.balls = [];

		for (let i = 0; i < getRandomInt(7, 15); i++) {
			const ballRadius = getRandomInt(20, 35);
			this.balls[i] = new Ball(
				getRandomInt(ballRadius, this.width),
				getRandomInt(ballRadius, this.height),
				ballRadius,
				getRandomInt(1, 3) * (Math.random() > 0.5 ? 1 : -1),
				getRandomInt(1, 3) * (Math.random() > 0.5 ? 1 : -1)
			);
		}

		for (let x = 0; x < Math.round(this.width / this.cellSize); x++) {
			this.cells[x] = [];
			for (let y = 0; y < Math.round(this.height / this.cellSize); y++) {
				this.cells[x][y] = 0;
			}
		}
	}

	frameUpdate = () => {
		const timestamp = performance.now();

		this.balls.forEach((ball) => {
			ball.calculateNextPosition(this.width, this.height);
		});

		for (let x = 0; x < this.cells.length; x++) {
			for (let y = 0; y < this.cells[x].length; y++) {
				this.cells[x][y] = this.calculateCellValue(x, y);
			}
		}

		return { cells: this.cells, balls: this.balls, calcBegin: timestamp };
	};

	calculateCellValue = (x: number, y: number): number => {
		let value = 0;
		this.balls.forEach((ball) => {
			const distance = Math.sqrt(Math.pow(x * this.cellSize - ball.x, 2) + Math.pow(y * this.cellSize - ball.y, 2));
			value += ball.radius / distance;
		});
		return value;
	};
}

const getRandomInt = (min: number, max: number) => {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min) + min);
};

// const lerp = (a: number, b: number, t: number) => {
// 	return (1 - t) * a + t * b;
// };
