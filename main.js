import { Vector2D } from "./modules/util/vector2D.mjs";
import { TwoPlayerGame } from "./modules/game/twoPlayerGame.mjs";
import { ThreePlayerGame } from "./modules/game/threePlayerGame.mjs";
import { FourPlayerGame } from "./modules/game/fourPlayerGame.mjs";
import { AimerUtil } from "./modules/util/aimerUtil.mjs";
import { MathUtil } from "./modules/util/mathUtil.mjs";
import { Ball } from "./modules/game_objects/ball.mjs";
import { CanvasUtil } from "./modules/util/canvasUtil.mjs";
import { Consts } from "./modules/consts.mjs";

// elements
const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

let mousePos = null;
let isHoldingBall = false;
let heldTime = -1;
let seed = Math.floor(Math.random() * (1<<21));
// let game = new TwoPlayerGame(seed);
let game = new FourPlayerGame(seed);
// let game = new ThreePlayerGame(seed);

console.log("SEED: ", seed);

// helper
function mouseOnCueBall() {
    if (!mousePos) return false;
    if (game.cueBall.isFalling()) return false;
    return MathUtil.dist(mousePos, game.cueBall.pos) < Ball.RADIUS;
}

// draw
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    CanvasUtil.setScale(Consts.scale);

    game.draw(ctx, null);

    AimerUtil.drawStrengthBar(ctx, Math.max(0, Math.min(heldTime, AimerUtil.framesToFullStrength)));

    if (game.gameHasEnded) {
        return;
    }

    // line for aim assist
    if (!game.ballsAreMoving && !mouseOnCueBall() && !isHoldingBall && game.ballIsPlaced) {
        if (mousePos != null) {
            AimerUtil.drawAimAssist(ctx, game, mousePos);
        }
        
        // strength bar
        if (heldTime >= 0) {
            heldTime++;
        }
        // reset if held long enough
        if (heldTime >= AimerUtil.framesToFullStrength * 3) {
            heldTime = -1;
        }
    }
    else if (isHoldingBall || !game.ballIsPlaced) {
        isHoldingBall = true;
        if (mousePos != null) {
            if (game.isValidCueBallPlacement(mousePos)) {
                AimerUtil.drawPlaceBall(ctx, mousePos);
            }
            else {
                AimerUtil.drawCannotPlaceBall(ctx, mousePos);
            }
        }
    }
}

// game loop

// let slow = 0;
// let ticks = 60; // 60
function animate() {
    // slow++;
    // if (slow % ticks != 0) {
    //     requestAnimationFrame(animate);
    //     return;
    // }
    game.simulateTick();
    draw();
    requestAnimationFrame(animate);
}

// user input
function mouseDown(e) {

    if (game.ballsAreMoving || game.gameHasEnded) {
        return;
    }

    // pick up cue ball
    if (mouseOnCueBall()) {
        isHoldingBall = game.ballInHand;
        return;
    }

    // place cue ball
    if (isHoldingBall || !game.ballIsPlaced) {
        mousePos = new Vector2D(e.offsetX, e.offsetY).scale(1/Consts.scale);
        let position = new Vector2D(mousePos.x, mousePos.y);
        game.placeCueBall(position);
        isHoldingBall = false; // will reset the ball position if invalid placement is made
        return;
    }

    // prepare to shoot ball (increase strength)
    if (heldTime == -1) {
        heldTime = 0;
    }
}


function mouseUp(e) {

    if (game.ballsAreMoving || game.gameHasEnded) {
        return;
    }

    // shooting the ball
    if (heldTime == -1) {
        return;
    }

    let strength = Math.min((heldTime/AimerUtil.framesToFullStrength), 1) * 20;

    mousePos = new Vector2D(e.offsetX, e.offsetY).scale(1/Consts.scale);
    game.shootCueBall(game.cueBall.pos.to(mousePos), strength);
    heldTime = -1;

    // debugging
    // console.log(`balls[0].vel = new Vector2D(${game.cueBall.vel.x}, ${game.cueBall.vel.y})\n`);
    // printBalls();
}

function mouseMove(e) {
    mousePos = new Vector2D(e.offsetX, e.offsetY).scale(1/Consts.scale);
}

// add listeners
canvas.addEventListener('mousedown', mouseDown);
canvas.addEventListener('mouseup', mouseUp);
canvas.addEventListener('mousemove', mouseMove);

// start game loop
animate();


// debugging
window.printBalls = function() {
    let out = "";
    for (let i = 0; i < game.balls.length; i++) {
        out += `balls[${i}].pos = new Vector2D(${game.balls[i].pos.x}, ${game.balls[i].pos.y})\n`;
    }
    console.log(out);
}