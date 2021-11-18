import { Grid } from "./classes/grid";
import "./style.css";

const canvas = document.querySelector("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

canvas.width = Math.floor(window.innerWidth / 2);
canvas.height = Math.floor(window.innerHeight / 2);

new Grid(canvas.width, canvas.height, ctx);
