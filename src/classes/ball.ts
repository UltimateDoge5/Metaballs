export class Ball {
	x: number;
	y: number;
	radius: number;
	vX: number;
	vY: number;
	mass: number;
	id = Math.random();

	constructor(x: number, y: number, radius: number, vX: number, vY: number) {
		this.x = x;
		this.y = y;
		this.radius = radius;
		this.vX = vX;
		this.vY = vY;
		this.mass = this.radius * this.radius;
	}

	calculateNextPosition = (width: number, height: number, collisions: boolean, balls: Ball[]) => {
		this.x += this.vX;
		this.y += this.vY;

		if (this.x + this.radius > width || this.x - this.radius < 0) {
			this.vX = -this.vX;
		}
		if (this.y + this.radius > height || this.y - this.radius < 0) {
			this.vY = -this.vY;
		}

		if (collisions) {
			// Check for collisions
			for (const ball of balls) {
				if (ball.id === this.id) {
					continue;
				}

				const dx = this.x - ball.x;
				const dy = this.y - ball.y;
				const distance = Math.sqrt(dx * dx + dy * dy);

				// If the baLLs are overlapping
				if (distance < this.radius + ball.radius) {
					const collision = { x: dx / distance, y: dy / distance };
					const aci = this.vX * collision.x + this.vY * collision.y;
					const bci = ball.vX * collision.x + ball.vY * collision.y;

					const acf = bci;
					const bcf = aci;

					this.vX += (acf - aci) * collision.x;
					this.vY += (acf - aci) * collision.y;
					ball.vX += (bcf - bci) * collision.x;
					ball.vY += (bcf - bci) * collision.y;
				}
			}
		}
	};
}
