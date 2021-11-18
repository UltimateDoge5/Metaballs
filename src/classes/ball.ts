export class Ball {
	private _x: number;
	private _y: number;
	private _radius: number;
	private _vX: number;
	private _vY: number;

	constructor(x: number, y: number, radius: number, vX: number, vY: number) {
		this._x = x;
		this._y = y;
		this._radius = radius;
		this._vX = vX;
		this._vY = vY;
	}

	public draw(ctx: CanvasRenderingContext2D): void {
		ctx.beginPath();
		ctx.arc(this._x, this._y, this._radius, 0, Math.PI * 2);
		ctx.fillStyle = "red";
		ctx.fill();
		ctx.closePath();
	}

	calculateNextPosition = (width: number, height: number): number[] => {
		this._x += this._vX;
		this._y += this._vY;

		if (this._x + this._radius > width || this._x - this._radius < 0) {
			this._vX = -this._vX;
		}
		if (this._y + this._radius > height || this._y - this._radius < 0) {
			this._vY = -this._vY;
		}

		return [this._x, this._y];
	};
}
