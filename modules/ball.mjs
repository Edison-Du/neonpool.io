import { vect2d } from "./vect2D.mjs";

export class Ball {

    static FRICTION = 0.05;
    static RADIUS = 20;

    pos = null;
    vel = null;
    accel = null;

    col = null;

    // Acceleration should act opposite to the velocity at all times.
    constructor(x, y, col=null) {
        this.pos = vect2d(x, y);
        this.vel = vect2d(0, 0);
        this.accel = vect2d(0, 0);
        this.col = col;
    }
    
    move(dt = 1) {
        // console.log(this.pos);
        this.setAcceleration();
        this.vel = this.vel.add(this.accel.scale(dt));
        if (this.vel.getMagnitude() <= this.accel.getMagnitude()) {
            this.vel = vect2d(0, 0);
            this.accel = vect2d(0, 0);
        }
        this.pos = this.pos.add(this.vel.scale(dt));
    }

    // creates a copy of the ball, moves the copy and returns it
    moveClone() {

    }

    setAcceleration() {
        this.accel = this.vel.getUnitVector().scale(-Ball.FRICTION);
    }
    
    draw(ctx, offset=null) {
        let coord = this.pos.add(offset);
        ctx.beginPath();
        ctx.arc(coord.x, coord.y, Ball.RADIUS, 0, 2 * Math.PI);
        ctx.fillStyle = this.col;
        ctx.fill();
    }
    drawVelocity(ctx, scale=1, offset=null) {
        let c1 = this.pos.add(offset);
        let c2 = this.pos.add(this.vel.scale(scale)).add(offset);
        ctx.strokeStyle="blue";
        ctx.beginPath();
        ctx.moveTo(c1.x, c1.y);
        ctx.lineTo(c2.x, c2.y);
        ctx.stroke();
    }
}

// module.exports = {
//     Ball
// }