import { Vect2D, vect2d, dist } from "./modules/vect2D.mjs";
import { Ball } from "./modules/ball.mjs";
import { LineSegment } from "./modules/lineSegment.mjs";
import { Collision } from "./modules/collisions.mjs";

const epsilon = 1e-8;


// elements
const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

let mousePos = null;
let targetPos = null;

let balls = [new Ball(100, 250, "white")];
let ball = balls[0];

// walls
let lines = [new LineSegment(10, 10, canvas.width-10, 10, "brown"), 
             new LineSegment(10, 10, 10, canvas.height-10, "brown"),
             new LineSegment(canvas.width-10, 10, canvas.width-10, canvas.height-10, "brown"),
             new LineSegment(10, canvas.height-10, canvas.width-10, canvas.height-10, "brown")];

lines.push(new LineSegment(600, 100, 700, 300, "brown")); // for fun


// Break Orientation of 15 balls
let offset = vect2d(300, 250);
for (let i = 4; i >= 0; i--) {
    for (let j = i%2; j <= i; j += 2) {
        let p1 = vect2d(i*Math.sqrt(3), j).scale(Ball.RADIUS).add(offset);
        let p2 = vect2d(i*Math.sqrt(3), -j).scale(Ball.RADIUS).add(offset);

        if (j != 0) {
            balls.push(new Ball(p2.x, p2.y, "red"));
            balls.push(new Ball(p1.x, p1.y, "red"));
        }
        else {
            balls.push(new Ball(p2.x, p2.y, "red"));
        }
    }
}




function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < balls.length; i++) {
        balls[i].draw(ctx);
    }

    // velocity vectors
    for (let i = 0; i < balls.length; i++) {
        balls[i].drawVelocity(ctx, 10);
    }

    for (let i = 0; i < lines.length; i++) {
        lines[i].draw(ctx);
    }

    // line for aimer
    if (mousePos != null) {
        ctx.strokeStyle="white";
        ctx.beginPath();
        ctx.moveTo(ball.pos.x, ball.pos.y);
        ctx.lineTo(mousePos.x, mousePos.y);
        ctx.stroke();
        ctx.closePath();
    }
    if (targetPos != null) {
        // console.log(targetPos);
        ctx.beginPath();
        ctx.arc(targetPos.x, targetPos.y, Ball.RADIUS, 0, 2 * Math.PI);
        ctx.stroke();
    }
}

function move(dt = 1) {
    for (let i = 0; i < balls.length; i++) {
        balls[i].move(dt); 
    }
}

function checkCollisionLines() {
    for (let i = 0; i < balls.length; i++) {
        for (let j = 0; j < lines.length; j++) {
            if (Collision.checkBallToLineCollision(balls[i], lines[j])) {
                return true;
            }
        }
    }
    return false;
}

function computeCollisionLines() {
    for (let i = 0; i < balls.length; i++) {
        for (let j = 0; j < lines.length; j++) {
            Collision.computeBallToLineCollision(balls[i], lines[j]);
        }
    }
}


function checkCollisionBalls() {
    for (let i = 0; i < balls.length - 1; i++) {
        for (let j = i + 1; j < balls.length; j++) {
            let a = balls[i];
            let b = balls[j];

            if (Collision.checkBallCollision(a, b)) {
                return true;
            }
        }   
    }
    return false;
}

function computeCollisionBalls() {
    for (let i = 0; i < balls.length - 1; i++) {
        for (let j = i + 1; j < balls.length; j++) {
            computeCollisionLines(); 
            Collision.computeBallCollision(balls[i], balls[j]);
        }   
    }
}


// let slow = 0;
// let pause = false;

function animate() {

    // slow++;
    // if (slow % 60 != 0) {
    //     requestAnimationFrame(animate);
    //     return;
    // }

    
    // check collision
    let n = 10;
    let dt = 1/n;

    // if (checkCollisionBalls()) pause = true;

    for (let i = 0; i < n; i++) {
        if (checkCollisionLines()) {
            computeCollisionLines();
        }
        while(checkCollisionBalls()) {
            computeCollisionBalls();
        }

        // draw();
        move(dt);
        // if (!pause) {
        //     move();
        // }
    }
    draw();
    requestAnimationFrame(animate);
}


function mouseDown(e) {
    let vel = vect2d(e.offsetX - ball.pos.x, e.offsetY - ball.pos.y).getUnitVector().scale(10);
    ball.vel = vel;
    ball.setAcceleration();

    targetPos = null;
}

function mouseMove(e) {
    mousePos = vect2d(e.offsetX, e.offsetY);

    // closest touching ball
    let direction = ball.pos.to(mousePos); // line
    let closest = -1;
    let min = 0;

    for (let i = 1; i < balls.length; i++) {
        let cur = balls[i];
        cur.col = "red";
        if (cur.pos.distToLine(ball.pos, direction) > 2 * Ball.RADIUS) {
            continue;
        }
        // ignore balls on the opposite direction of where the mouse is
        if (ball.pos.to(cur.pos).dot(ball.pos.to(mousePos)) < 0) {
            continue;
        }

        // solve a quadratic for where the cueball would be right before collision
        let rb = ball.pos.to(balls[i].pos);
        let a = direction.getMagnitude();
        let b = rb.dot(direction);
        let c = Math.pow(rb.getMagnitude(), 2) - 4 * Ball.RADIUS * Ball.RADIUS;
        
        // take the minimal value of t;
        let discr = Math.sqrt(b*b - a*a*c);
        let t = (b - discr)/(a*a);
        if (t < 0) {
            t = (b + discr)/(a*a);
        }

        if (closest == -1) {
            closest = i;
            min = t;
        }
        else if (t < min) {
            closest = i;
            min = t;
        }
    }

    if (closest != -1) {

        targetPos = ball.pos.add(direction.scale(min));

        balls[closest].col = "yellow";
    }
    else {
        targetPos = null;
    }
}

canvas.addEventListener('mousedown', mouseDown);
canvas.addEventListener('mousemove', mouseMove);

animate();






window.printBalls = function() {
    let out = "";
    for (let i = 0; i < balls.length; i++) {
        out += `balls[${i}].pos = vect2d(${balls[i].pos.x}, ${balls[i].pos.y})\n`;
    }
    console.log(out);
}

window.printBallVelocities = function() {
    let out = "";
    for (let i = 0; i < balls.length; i++) {
        out += `balls[${i}].vel = vect2d(${balls[i].vel.x}, ${balls[i].vel.y})\n`;
    }
    console.log(out);
}