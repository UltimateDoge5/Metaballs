import { Grid } from "./classes/grid";
import "./style.css";

const canvas = document.querySelector("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const gridInstance = new Grid(canvas.width, canvas.height);

console.log(gridInstance.cells);

gridInstance.cells.forEach((cell) => {
	cell.draw(ctx);
});
