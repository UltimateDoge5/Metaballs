import { Ball } from "./ball";

export class Grid {
	width: number;
	height: number;
	balls: Ball[];
	cells: number[][] = [];

	constructor(width: number, height: number) {
		this.width = width;
		this.height = height;
		this.balls = [];

		for (let i = 0; i < getRandomInt(7, 15); i++) {
			const ballRadius = getRandomInt(10, 35);
			this.balls[i] = new Ball(
				getRandomInt(ballRadius, this.width),
				getRandomInt(ballRadius, this.height),
				ballRadius,
				getRandomInt(1, 3) * (Math.random() > 0.5 ? 1 : -1),
				getRandomInt(1, 3) * (Math.random() > 0.5 ? 1 : -1)
			);
		}

		for (let x = 0; x < this.width; x++) {
			this.cells[x] = [];
			for (let y = 0; y < this.height; y++) {
				this.cells[x][y] = 0;
			}
		}
	}

	frameUpdate = () => {
		this.balls.forEach((ball) => {
			ball.calculateNextPosition(this.width, this.height);
		});

		return { cells: this.cells, balls: this.balls };
	};

	calculateCellValue = (x: number, y: number): number => {
		let value = 0;
		this.balls.forEach((ball) => {
			const distance = Math.sqrt(Math.pow(x - ball.x, 2) + Math.pow(y - ball.y, 2));
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
