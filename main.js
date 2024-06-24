import { Vector2D } from "./modules/util/vector2D.mjs";
import { TwoPlayerGame } from "./modules/game/twoPlayerGame.mjs";
import { AimerUtil } from "./modules/util/aimerUtil.mjs";

// elements
const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

let mousePos = null;
let heldTime = -1;
let game = new TwoPlayerGame();

// output
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    game.draw(ctx);

    // line for aim assist
    if (mousePos != null && !game.ballsAreMoving) {
        AimerUtil.drawAimAssist(ctx, game, mousePos);
    }
    
    // strength bar
    if (heldTime >= 0) {
        heldTime++;
    }
    // reset if held long enough
    if (heldTime >= AimerUtil.framesToFullStrength * 5) {
        heldTime = -1;
    }
    AimerUtil.drawStrengthBar(ctx, Math.max(0, Math.min(heldTime, AimerUtil.framesToFullStrength)));
}

// game loop
function animate() {
    game.simulateTick();
    draw();
    requestAnimationFrame(animate);
}

// user input
function mouseDown(e) {
    if (heldTime == -1) {
        heldTime = 0;
    }
}

function mouseUp(e) {
    if (heldTime == -1) {
        return;
    }
    
    let strength = Math.min((heldTime/AimerUtil.framesToFullStrength), 1) * 20;

    mousePos = new Vector2D(e.offsetX, e.offsetY);
    game.shootCueBall(game.cueBall.pos.to(mousePos), strength);
    heldTime = -1;

    // debugging
    console.log(`balls[0].vel = new Vector2D(${game.cueBall.vel.x}, ${game.cueBall.vel.y})\n`);
    printBalls();
}

function mouseMove(e) {
    mousePos = new Vector2D(e.offsetX, e.offsetY);
}

canvas.addEventListener('mousedown', mouseDown);
canvas.addEventListener('mouseup', mouseUp);
canvas.addEventListener('mousemove', mouseMove);

animate();


// debugging
window.printBalls = function() {
    let out = "";
    for (let i = 0; i < game.balls.length; i++) {
        out += `balls[${i}].pos = new Vector2D(${game.balls[i].pos.x}, ${game.balls[i].pos.y})\n`;
    }
    console.log(out);
}