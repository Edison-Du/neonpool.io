import { Vect2D, vect2d, dist } from "./modules/vect2D.mjs";
import { Ball } from "./modules/ball.mjs";

const epsilon = 1e-8;

// elements
const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");


let balls = [new Ball(100, 250, "white")];
let ball = balls[0];


// examine edge cases

// Case 1
// balls[0].pos = vect2d(76.71094956688371, 252.92236640132177);
// balls[0].vel = vect2d(0.24981693911407152, -4.793494706050241);
// balls[1].pos = vect2d(46.36193775646933,  228.04033460205426);
// balls[1].vel = vect2d(0.27819812986954195,-1.2283956705196668);

// Case 2
// balls[0].pos = vect2d(168.380452299559661, 179.61326903329226);
// balls[1].pos = vect2d(148.54772393911512,  144.8762155344588);

// Case 3
// balls[1].pos = vect2d(220, 100);
// balls.push(new Ball(180, 100, "blue"));
// balls.push(new Ball(140, 100, "yellow"));
// balls[1].vel = vect2d(20, 0);

// Break
let offset = vect2d(300, 250);
// for (let i = 0; i < 5; i++) {
//     for (let j = i%2; j <= i; j += 2) {
//         let p1 = vect2d(i*Math.sqrt(3), j).scale(Ball.RADIUS).add(offset);
//         let p2 = vect2d(i*Math.sqrt(3), -j).scale(Ball.RADIUS).add(offset);

//         balls.push(new Ball(p1.x, p1.y, "red"));
//         balls.push(new Ball(p2.x, p2.y, "red"));
//     }
// }
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
// balls[0].vel = vect2d(9.7276179, 0);
// balls[0].vel = vect2d(10.12312, 0);


function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < balls.length; i++) {
        balls[i].draw(ctx);
    }

    for (let i = 0; i < balls.length; i++) {
        balls[i].drawVelocity(ctx, 10);
    }
}

function move(dt = 1) {
    for (let i = 0; i < balls.length; i++) {
        balls[i].move(dt); 
    }
}

function checkCollisionWalls() {
    for (let i = 0; i < balls.length; i++) {
        let ball = balls[i];
        if (ball.pos.x - Ball.RADIUS < 0 && ball.vel.x < 0) {
            return true;
        }
        if (ball.pos.x + Ball.RADIUS > canvas.width && ball.vel.x > 0) {
            return true;
        }
        if (ball.pos.y - Ball.RADIUS < 0 && ball.vel.y < 0) {
            return true;
        }
        if (ball.pos.y + Ball.RADIUS > canvas.height && ball.vel.y > 0) {
            return true;
        }
    }
    return false;
}

function checkCollisionBalls() {
    for (let i = 0; i < balls.length - 1; i++) {
        for (let j = i + 1; j < balls.length; j++) {
            let a = balls[i];
            let b = balls[j];
            let ab = b.pos.subtract(a.pos);
            let d = ab.getMagnitude();

            // collision
            if (d > 2 * Ball.RADIUS) {
                continue;
            }

            // check velocity directions
            let va_rel = a.vel.subtract(b.vel);
            if (va_rel.dot(ab) > 0) {
                return true;
            }

        }   
    }
    return false;
}

function computeCollisionWalls() {
    for (let i = 0; i < balls.length; i++) {
        // collision with walls
        let ball = balls[i];
        if (ball.pos.x - Ball.RADIUS < 0 && ball.vel.x < 0) {
            ball.vel.x *= -1;
            ball.setAcceleration();
        }
        if (ball.pos.x + Ball.RADIUS > canvas.width && ball.vel.x > 0) {
            ball.vel.x *= -1;
            ball.setAcceleration();
        }
        if (ball.pos.y - Ball.RADIUS < 0 && ball.vel.y < 0) {
            ball.vel.y *= -1;
            ball.setAcceleration();
        }
        if (ball.pos.y + Ball.RADIUS > canvas.height && ball.vel.y > 0) {
            ball.vel.y *= -1;
            ball.setAcceleration();
        }
    }
}

function computeCollisionBalls() {
    for (let i = 0; i < balls.length - 1; i++) {
        for (let j = i + 1; j < balls.length; j++) {
            let a = balls[i];
            let b = balls[j];
            let ab = b.pos.subtract(a.pos);
            let d = ab.getMagnitude();

            // collision
            if (d > 2 * Ball.RADIUS) {
                continue;
            }

            // correct position overlap
            // console.log("BEFORE OVERLAP", ab.getMagnitude(), a.pos, b.pos, a.vel, b.vel);

            let correct = ab.getUnitVector().scale(2 * Ball.RADIUS - d)

            if (correct.getMagnitude() > epsilon) {
                a.pos = a.pos.subtract(correct.scale(0.5));
                b.pos = b.pos.add(correct.scale(0.5));
                ab = b.pos.subtract(a.pos);
            }

            // console.log("AFTER OVERLAP", ab.getMagnitude(), a.pos, b.pos, a.vel, b.vel);

            // check velocity directions
            let va_rel = a.vel.subtract(b.vel);
            if (va_rel.dot(ab) <= 0) {
                continue;
            }


            // console.log("COLLISION", a.pos, b.pos, a.vel, b.vel, ab);

            let normal = ab.getUnitVector();
            let v_a = a.vel.proj(normal);
            let v_b = b.vel.proj(normal);

            // console.log("PROJECTIONS", v_a, v_b, v_a.getMagnitude(), v_b.getMagnitude());

            // completetly elastic
            a.vel = a.vel.subtract(v_a).add(v_b);
            b.vel = b.vel.subtract(v_b).add(v_a);

            a.setAcceleration();
            b.setAcceleration();

            // console.log("VEL A", a.vel.getMagnitude(), a.vel.getDirection() * 180 / 2 * Math.PI);
            // console.log("VEL B", b.vel.getMagnitude(), b.vel.getDirection() * 180 / 2 * Math.PI);

            // console.log("AFTER", a.vel, b.vel);
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
        while(checkCollisionBalls() || checkCollisionWalls()) {
            computeCollisionWalls();
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
    console.log("MOUSE", vel);
    ball.vel = vel;
    ball.setAcceleration();
}

// function mouseMove(e) {
//     let mousePos = coord(e.offsetX, e.offsetY).subtract(offset).toCartesian().scale(1/tileSize).toInt();
//     hoverTile(mousePos.y, mousePos.x);
// }

canvas.addEventListener('mousedown', mouseDown);
// canvas.addEventListener('mousemove', mouseMove);

animate();