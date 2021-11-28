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

		for (let i = 0; i < getRandomInt(10, 20); i++) {
			const ballRadius = getRandomInt(20, 35);
			this.balls[i] = new Ball(
				getRandomInt(ballRadius, this.width),
				getRandomInt(ballRadius, this.height),
				ballRadius,
				getRandomInt(1, 3) * (Math.random() > 0.5 ? 1 : -1),
				getRandomInt(1, 3) * (Math.random() > 0.5 ? 1 : -1)
			);
		}

		for (let x = 0; x < Math.round(this.width / this.cellSize) + 1; x++) {
			this.cells[x] = [];
			for (let y = 0; y < Math.round(this.height / this.cellSize) + 1; y++) {
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

		const states: number[][] = [];

		for (let x = 0; x < this.cells.length - 1; x++) {
			states[x] = [];
			for (let y = 0; y < this.cells[x].length - 1; y++) {
				states[x][y] = this.classifyCell([this.cells[x][y], this.cells[x + 1][y], this.cells[x + 1][y + 1], this.cells[x][y + 1]]);
			}
		}

		return { cells: this.cells, balls: this.balls, calcBegin: timestamp, states };
	};

	calculateCellValue = (x: number, y: number): number => {
		let value = 0;
		this.balls.forEach((ball) => {
			const distance = Math.sqrt(Math.pow(x * this.cellSize - ball.x, 2) + Math.pow(y * this.cellSize - ball.y, 2));
			value += ball.radius / distance;
		});
		return value;
	};

	classifyCell = (corners: number[]) => {
		corners[0] = corners[0] >= 1 ? 1 : 0;
		corners[1] = corners[1] >= 1 ? 1 : 0;
		corners[2] = corners[2] >= 1 ? 1 : 0;
		corners[3] = corners[3] >= 1 ? 1 : 0;

		return corners[0] * 8 + corners[1] * 4 + corners[2] * 2 + corners[3];
	};

	resize(width: number, height: number) {
		const diffX = width - this.width;
		const diffY = height - this.height;

		this.width = width;
		this.height = height;

		for (let x = 0; x < Math.round(this.width / this.cellSize) + 1; x++) {
			this.cells[x] = [];
			for (let y = 0; y < Math.round(this.height / this.cellSize) + 1; y++) {
				this.cells[x][y] = 0;
			}
		}

		for (const ball of this.balls) {
			ball.x += diffX;
			ball.y += diffY;

			if (ball.x < 0) {
				ball.x = 0;
			}

			if (ball.y < 0) {
				ball.y = 0;
			}
		}
	}
}

const getRandomInt = (min: number, max: number) => {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min) + min);
};
