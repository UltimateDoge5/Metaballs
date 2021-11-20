export class Cell {
	x: number;
	y: number;
	size: number;
	value = 0;

	constructor(x: number, y: number, size: number) {
		this.x = x;
		this.y = y;
		this.size = size;
	}
}
