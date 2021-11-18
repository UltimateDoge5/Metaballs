import { Ball } from "./ball";

export class Grid {
	width: number;
	height: number;
	balls: Ball[];
	ctx: CanvasRenderingContext2D;

	constructor(width: number, height: number, ctx: CanvasRenderingContext2D) {
		this.width = width;
		this.height = height;
		this.balls = [];
		this.ctx = ctx;

		for (let i = 0; i < getRandomInt(7, 15); i++) {
			const ballRadius = getRandomInt(10, 35);
			this.balls[i] = new Ball(
				getRandomInt(ballRadius, this.width),
				getRandomInt(ballRadius, this.height),
				ballRadius,
				Math.max(Math.random() * 1.5, 0.25),
				Math.max(Math.random() * 1.5, 0.25)
			);
		}

		window.requestAnimationFrame(this.draw);
	}

	draw = () => {
		this.ctx.clearRect(0, 0, this.width, this.height);
		this.balls.forEach((ball) => {
			ball.calculateNextPosition(this.width, this.height);
			ball.draw(this.ctx);
		});

		requestAnimationFrame(this.draw);
	};
}

const getRandomInt = (min: number, max: number) => {
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min) + min);
};
