import { Vector2D } from "./modules/util/vector2D.mjs";
import { Ball } from "./modules/game_objects/ball.mjs";
import { LineSegment } from "./modules/game_objects/lineSegment.mjs";
import { Hole } from "./modules/game_objects/hole.mjs";
import { CollisionUtil } from "./modules/util/collisionUtil.mjs";
import { Consts } from "./modules/consts.mjs";
import { CanvasUtil } from "./modules/util/canvasUtil.mjs";
import { MathUtil } from "./modules/util/mathUtil.mjs";

// elements
const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

let mousePos = null;
let ballsAreMoving = false;

// balls
let balls = [new Ball(100, 250, "white")];
let ball = balls[0];

// walls
let lines = [new LineSegment(10, 10, canvas.width-10, 10, "black"), 
             new LineSegment(10, 10, 10, canvas.height-10, "black"),
             new LineSegment(canvas.width-10, 10, canvas.width-10, canvas.height-10, "black"),
             new LineSegment(10, canvas.height-10, canvas.width-10, canvas.height-10, "black")];

lines.push(new LineSegment(600, 100, 700, 300, "black")); // for fun
lines.push(new LineSegment(500, 100, 600, 100, "black"));

balls[0].pos = new Vector2D(100, 90);

// holes
let holes = [new Hole(50, 50), new Hole(100, 200), new Hole(700, 100)];


// Break Orientation of 15 balls
let offset = new Vector2D(300, 250);
for (let i = 5; i >= 0; i--) {
    for (let j = i%2; j <= i; j += 2) {
        let p1 = new Vector2D(i*Math.sqrt(3), j).scale(Ball.RADIUS).add(offset);
        let p2 = new Vector2D(i*Math.sqrt(3), -j).scale(Ball.RADIUS).add(offset);

        if (j != 0) {
            balls.push(new Ball(p2.x, p2.y, "red"));
            balls.push(new Ball(p1.x, p1.y, "red"));
        }
        else {
            balls.push(new Ball(p2.x, p2.y, "red"));
        }
    }
}


function drawAimAssist(mousePos) {
    // closest touching ball
    let direction = ball.pos.to(mousePos); // line
    let closestBall = targetClosestBall(direction);
    let closestLine = targetClosestLine(direction);

    let m1 = closestBall.min;
    let m2 = closestLine.min;
    let min = m1;
    let closestIsBall = closestBall.index != -1;
    let closestIsLine = false;

    // checks if closest is a line
    if (m1 == null || (m2 != null && m2 < m1)) {
        min = m2;
        closestIsBall = false;
        closestIsLine = true;
    }

    if (min == null) {
        return;
    }

    let targetPos = ball.pos.add(direction.scale(min)); // projected location of ball before collision
    let dir_norm = direction.getUnitVector();
    let dir_rad = dir_norm.scale(Ball.RADIUS);
    let pos_target = targetPos.subtract(dir_rad);

    // draws pointer and projected ball location before collision
    CanvasUtil.drawLine(ctx, ball.pos, pos_target, 2, "white");
    CanvasUtil.drawCircle(ctx, targetPos, Ball.RADIUS - 1, 2, "white", null);
    
    // draws resultant velocity of ball-ball collision
    if (closestIsBall) {
        let closest = balls[closestBall.index];
        let ab = targetPos.to(closest.pos);
        let v_cueball = dir_norm.perp(ab).scale(4*Ball.RADIUS);
        let v_other = dir_norm.proj(ab).scale(4*Ball.RADIUS);

        let pos_v1 = targetPos.add(v_cueball);

        // let pos_v2i = targetPos.add(v_other.getUnitVector().scale(Ball.RADIUS));
        let pos_v2i = closest.pos;
        let pos_v2f = pos_v2i.add(v_other);

        CanvasUtil.drawLine(ctx, targetPos, pos_v1, 2, "white");
        CanvasUtil.drawLine(ctx, pos_v2i, pos_v2f, 2, "white");
    }
    // draws resultant velocity of ball-wall collision
    else if (closestIsLine) {
        let closest = lines[closestLine.index];
        let line_dir = closest.getDirectionVector();
        // ball hits corner of line segment
        if (targetPos.distToLine(closest.p1, line_dir) < Ball.RADIUS - Consts.epsilon) {
            let point = closest.p1;
            if (MathUtil.dist(point, targetPos) > MathUtil.dist(closest.p2, targetPos)) {
                point = closest.p2;
            }
            let v_before = ball.pos.to(targetPos).getUnitVector();
            let v_deflect = point.to(targetPos).getUnitVector();
            let v_sub = v_before.proj(v_deflect);
            let v_cueball = v_before.subtract(v_sub).subtract(v_sub);
            let pos_v = targetPos.add(v_cueball.scale(4*Ball.RADIUS));

            CanvasUtil.drawLine(ctx, targetPos, pos_v, 2, "white");
        }
        // ball hits side of line segment
        else {
            let dir_proj_line = dir_norm.proj(line_dir);
            let v_cueball = dir_norm.subtract(dir_proj_line.scale(2)).scale(-1);
            let pos_v = targetPos.add(v_cueball.scale(4*Ball.RADIUS));
            CanvasUtil.drawLine(ctx, targetPos, pos_v, 2, "white");
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // holes
    for (let i = 0; i < holes.length; i++) {
        holes[i].draw(ctx);
    }

    // balls
    for (let i = 0; i < balls.length; i++) {
        balls[i].draw(ctx);
    }

    // velocity vectors on balls
    for (let i = 0; i < balls.length; i++) {
        balls[i].drawVelocity(ctx, Ball.RADIUS/2);
    }

    // line segments
    for (let i = 0; i < lines.length; i++) {
        lines[i].draw(ctx);
    }

    // line for aim assist
    if (mousePos != null && !ballsAreMoving) {
        drawAimAssist(mousePos);
    }
}

function move(dt = 1) {
    let moving = false; // nothing is moving
    for (let i = 0; i < balls.length; i++) {
        balls[i].move(dt); 
        if (balls[i].isFading && balls[i].opacity < Consts.epsilon) {
            continue;
        }
        if (balls[i].vel.x != 0 || balls[i].vel.y != 0) {
            moving = true;
        }
    }
    return moving;
}

function checkCollisionLines() {
    for (let i = 0; i < balls.length; i++) {
        for (let j = 0; j < lines.length; j++) {
            if (balls[i].state == Ball.state.FALLING) continue;
            if (CollisionUtil.checkBallToLineCollision(balls[i], lines[j])) {
                return true;
            }
        }
    }
    return false;
}

function computeCollisionLines() {
    for (let i = 0; i < balls.length; i++) {
        for (let j = 0; j < lines.length; j++) {
            if (balls[i].state == Ball.state.FALLING) continue;
            CollisionUtil.computeBallToLineCollision(balls[i], lines[j]);
        }
    }
}

function checkCollisionBalls() {
    /**
     * More efficient checking algorithm O(n^2) -> O(n)
     * Divide the grid into cells of size k * Ball.RADIUS (k > 2, something like k = 2.5 sounds good)
     * Each ball is located in one of these cells.
     * Only balls in the neighbouring 8 cells need to be checked for collision.
     */
    for (let i = 0; i < balls.length - 1; i++) {
        for (let j = i + 1; j < balls.length; j++) {
            let a = balls[i];
            let b = balls[j];
            if (a.state == Ball.state.FALLING || b.state == Ball.state.FALLING) 
                continue;
            if (CollisionUtil.checkBallCollision(a, b)) {
                return true;
            }
        }   
    }
    return false;
}

function computeCollisionBalls() {
    for (let i = 0; i < balls.length - 1; i++) {
        for (let j = i + 1; j < balls.length; j++) {
            let a = balls[i];
            let b = balls[j];
            if (a.state == Ball.state.FALLING || b.state == Ball.state.FALLING) 
                continue;
            computeCollisionLines(); // this needs to be done for weird cases such as balls hitting other balls through walls.
            CollisionUtil.computeBallCollision(a, b);
        }   
    }
}

function computeCollisionHoles() {
    for (let i = 0; i < balls.length; i++) {
        for (let j = 0; j < holes.length; j++) {
            if (CollisionUtil.checkBallInHole(balls[i], holes[j])) {
                balls[i].state = Ball.state.FALLING;
                CollisionUtil.computeBallToHoleCollision(balls[i], holes[j]);
                if (MathUtil.dist(balls[i].pos, holes[j].pos) < Hole.RADIUS - Ball.RADIUS) {
                    balls[i].isFading = true;
                }
            }
        }
    }
}



// let slow = 0;
// let ticks = 30; // 60
function animate() {

    // slow++;
    // if (slow % ticks != 0) {
    //     requestAnimationFrame(animate);
    //     return;
    // }
    
    // check collision
    let n = 10;
    let dt = 1/n;

    for (let i = 0; i < n; i++) {
        computeCollisionHoles();
        if (checkCollisionLines()) {
            computeCollisionLines();
        }
        let safe = 30;
        while(checkCollisionBalls() && safe > 0) {
            computeCollisionBalls();
            safe--;
        }
        ballsAreMoving = move(dt);
    }
    draw();
    requestAnimationFrame(animate);
}

/**
 * Returns {min, index} where
 *  min is the minimum non-negative scalar such that the point 
 * "ball.pos + min * direction" is the center of a ball that just touches
 * a ball in "balls" that isn't the cue ball. The index of the ball it touches
 * in "balls" is also returned.
 * */ 
function targetClosestBall(direction) {
    let closest = -1;
    let min = -1;
    for (let i = 0; i < balls.length; i++) {
        let cur = balls[i];
        
        // check ball isn't cue ball
        if (cur == ball) {
            continue;
        }

        // check ball isn't in hole
        if (cur.state == Ball.state.FALLING) {
            continue;
        }

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
    return {min: min == -1? null : min, index: closest};
}

/**
 * Returns {min, index} where
 *  min is the minimum non-negative scalar such that the point 
 * "ball.pos + min * direction" is the center of a ball that just touches
 * a line segment in "lines". The index of the line segment it touches
 * in "lines" is also returned.
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
        if (MathUtil.dist(p2, ball.pos) < MathUtil.dist(p1, ball.pos)) {
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
            
            if (!CollisionUtil.checkBallToLineOverlap(b1, line)) {
                t1 = null;
            }
            if (!CollisionUtil.checkBallToLineOverlap(b2, line)) {
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

    return {min: min == -1? null : min, index: closest};
}

/**
 * Returns {min, index} where
 *  min is the minimum non-negative scalar such that the point 
 * "ball.pos + min * direction" is the center of a ball that just enters
 * a hole in "holes". The index of the hole it touches
 * in "holes" is also returned.
 * */ 
function targetClosestHole(direction) {
    let closest = -1;
    let min = -1;

    for (let i = 0; i < holes.length; i++) {

        // check distance from line to hole is < hole.radius
        // make sure direction.to(hole.pos) dotted with direction > 0
        // solve a quadratic to place the ball :()

    }

    return {min: min == -1? null : min, index: closest};
}


function mouseDown(e) {
    if (ballsAreMoving) {
        return;
    }
    let vel = new Vector2D(e.offsetX - ball.pos.x, e.offsetY - ball.pos.y).getUnitVector().scale(20);
    ball.vel = vel;

    console.log(ball.pos, ball.vel);
    printBalls();
}

function mouseMove(e) {
    mousePos = new Vector2D(e.offsetX, e.offsetY);
}

canvas.addEventListener('mousedown', mouseDown);
canvas.addEventListener('mousemove', mouseMove);

animate();



window.printBalls = function() {
    let out = "";
    for (let i = 0; i < balls.length; i++) {
        out += `balls[${i}].pos = new Vector2D(${balls[i].pos.x}, ${balls[i].pos.y})\n`;
    }
    console.log(out);
}

window.printBallVelocities = function() {
    let out = "";
    for (let i = 0; i < balls.length; i++) {
        out += `balls[${i}].vel = new Vector2D(${balls[i].vel.x}, ${balls[i].vel.y})\n`;
    }
    console.log(out);
}