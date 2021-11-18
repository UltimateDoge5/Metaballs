export class Ball {
	private _x: number;
	private _y: number;
	private _radius: number;

	constructor(x: number, y: number, radius: number) {
		this._x = x;
		this._y = y;
		this._radius = radius;
	}

	public draw(ctx: CanvasRenderingContext2D): void {
		ctx.beginPath();
		ctx.arc(this._x, this._y, this._radius, 0, Math.PI * 2);
		ctx.fillStyle = "red";
		ctx.fill();
		ctx.closePath();
	}
}
