import { Vect2D, vect2d, dist } from "./modules/vect2D.mjs";
import { Ball } from "./modules/ball.mjs";
import { LineSegment } from "./modules/lineSegment.mjs";
import { Collision } from "./modules/collisions.mjs";
import { Consts } from "./modules/consts.mjs";

const epsilon = 1e-8;


// elements
const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

let mousePos = null;
let targetPos = null;

let balls = [new Ball(100, 250, "white")];
let ball = balls[0];
balls[0].pos = vect2d(773.2425534583451, 450.7731407102569)

// walls
let lines = [new LineSegment(10, 10, canvas.width-10, 10, "brown"), 
             new LineSegment(10, 10, 10, canvas.height-10, "brown"),
             new LineSegment(canvas.width-10, 10, canvas.width-10, canvas.height-10, "brown"),
             new LineSegment(10, canvas.height-10, canvas.width-10, canvas.height-10, "brown")];

lines.push(new LineSegment(600, 100, 700, 300, "brown")); // for fun

lines.push(new LineSegment(500, 100, 600, 100, "brown"));
balls[0].pos = vect2d(100, 90);



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

/**
 * Returns the minimum non-negative scalar t such that the point 
 * "ball.pos + t * direction" is the center of a ball that just touches
 * a ball in "balls" that isn't the cueball 
 * */ 
function targetClosestBall(direction) {
    let closest = -1;
    let min = -1;
    for (let i = 1; i < balls.length; i++) {
        let cur = balls[i];
        cur.col = "red";

        if (cur.pos.distToLine(ball.pos, direction) > 2 * Ball.RADIUS) {
            continue;
        }
        // ignore balls on the opposite direction of where the mouse is
        if (ball.pos.to(cur.pos).dot(direction) < 0) {
            continue;
        }

        // solve a quadratic for where the cueball would be right before collision
        let rb = ball.pos.to(balls[i].pos);
        let a = direction.getMagnitude();
        let b = rb.dot(direction);
        let c = Math.pow(rb.getMagnitude(), 2) - 4 * Ball.RADIUS * Ball.RADIUS;
        
        // take the minimal value of t
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
        balls[closest].col = "yellow";
    }

    return min == -1? null : min;
}

/**
 * Returns the minimum non-negative scalar t such that the point 
 * "point + t * direction" is the center of a ball that just touches
 * a line segment in "lines" 
 * */ 
// This is the most disgusting code i've ever written lol.
function targetClosestLine(direction) {
    // remember to handle parallel case, non-intersection with segment case, etc

    let closest = -1;
    let min = -1;

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        let a = ball.pos.to(line.p1);
        let d_1 = direction;
        let d_2 = line.p1.to(line.p2);
        let t = null;

        // prioritize the closer endpoint
        let p1 = line.p1;
        let p2 = line.p2;
        if (dist(p2, ball.pos) < dist(p1, ball.pos)) {
            p1 = line.p2;
            p2 = line.p1;
        }

        // parallel lines, assumes cue ball is not on the line segment
        if (Math.abs(d_1.dot(d_2)) == d_1.getMagnitude() * d_2.getMagnitude()) {

            // deal with case where line.p1 or line.p2 distance to line is smaller than ball.radius
            if (p1.distToLine(ball.pos, d_1) >= Ball.RADIUS) {
                continue;
            }
            
            let rb = ball.pos.to(p1);
            let a = direction.getMagnitude();
            let b = rb.dot(direction);
            let c = Math.pow(rb.getMagnitude(), 2) - Ball.RADIUS * Ball.RADIUS;
            
            let discr = Math.sqrt(b*b - a*a*c);
            t = (b - discr)/(a*a);
            if (t < 0) {
                t = (b + discr)/(a*a);
            }
            if (i == 5) {
                console.log("parallel ", t);
            }
            if (t < 0) {
                continue;
            }
        }
        else {
            // check if it intersects with line segment, doesn't work for parallel lines (div by 0)
            let k = (a.y - a.x * d_1.y / d_1.x) / (d_2.x * d_1.y / d_1.x - d_2.y);
            if (k < 0 || k > 1) {
                if (p1.distToLine(ball.pos, d_1) >= Ball.RADIUS && 
                    p2.distToLine(ball.pos, d_1) >= Ball.RADIUS) {
                    continue;
                }
            }

            // raw intersection with line, does not consider endpoints
            let w = d_1.proj(d_2).subtract(d_1);
            let u = a.subtract(a.proj(d_2));

            let dot = u.dot(w);
            let magw = w.getMagnitude();
            let magu = u.getMagnitude();

            let discr = Math.sqrt(dot*dot - magw*magw*(magu*magu - Ball.RADIUS * Ball.RADIUS));
            if (isNaN(discr)) { // yikes.
                continue;
            }
            
            let t1 = (- dot - discr)/(magw*magw);
            if (t1 < 0) {
                t1 = (- dot + discr)/(magw*magw);
            }
            if (t1 < 0) {
                continue;
            }
            
            // intersection with endpoints
            let t2 = null;
            let rb = null;

            if (p1.distToLine(ball.pos, d_1) < Ball.RADIUS) {
                rb = ball.pos.to(p1);
            }
            else if (p2.distToLine(ball.pos, d_1) < Ball.RADIUS) {
                rb = ball.pos.to(p2);
            }

            if (rb != null) {
                let a = direction.getMagnitude();
                let b = rb.dot(direction);
                let c = Math.pow(rb.getMagnitude(), 2) - Ball.RADIUS * Ball.RADIUS;
                
                let discr = Math.sqrt(b*b - a*a*c);
                t2 = (b - discr)/(a*a);
                if (t2 < 0) {
                    t2 = (b + discr)/(a*a);
                }
                if (t2 < 0) {
                    t2 = null;
                }
            }

            // check overlap
            let b1_pos = ball.pos.add(direction.scale(t1 + Consts.epsilon));
            let b2_pos = ball.pos.add(direction.scale(t2 + Consts.epsilon));

            let b1 = new Ball(b1_pos.x, b1_pos.y);
            let b2 = new Ball(b2_pos.x, b2_pos.y);
            
            if (!Collision.checkBallToLineOverlap(b1, line)) {
                t1 = null;
            }
            if (!Collision.checkBallToLineOverlap(b2, line)) {
                t2 = null;
            }
            // take minimal t
            t = t1;
            if (t1 != null && t2 != null) {
                t = Math.min(t1, t2);
            }
            else if (t1 == null) {
                t = t2;
            }
            if (t == null) {
                continue;
            }
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

    return min == -1? null : min;
}

function mouseMove(e) {
    mousePos = vect2d(e.offsetX, e.offsetY);

    // closest touching ball
    let direction = ball.pos.to(mousePos); // line
    let m1 = targetClosestBall(direction);
    let m2 = targetClosestLine(direction);
    let min = m1;

    if (m1 != null && m2 != null) {
        min = Math.min(m1, m2);
    }
    else if (m2 != null) {
        min = m2;
    }

    if (min != null) {
        targetPos = ball.pos.add(direction.scale(min));
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