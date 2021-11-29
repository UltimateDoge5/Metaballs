export class Ball {
	x: number;
	y: number;
	radius: number;
	vX: number;
	vY: number;

	constructor(x: number, y: number, radius: number, vX: number, vY: number) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.vX = vX;
		this.vY = vY;
	}

	calculateNextPosition = (width: number, height: number) => {
		this.x += this.vX;
		this.y += this.vY;

		if (this.x + this.radius > width || this.x - this.radius < 0) {
			this.vX = -this.vX;
		}
		if (this.y + this.radius > height || this.y - this.radius < 0) {
			this.vY = -this.vY;
		}
	};
}
