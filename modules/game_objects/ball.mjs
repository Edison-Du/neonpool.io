import { Vector2D } from "../util/vector2D.mjs";
import { CanvasUtil } from "../util/canvasUtil.mjs";
import { Consts } from "../consts.mjs";

export class Ball {

    static FRICTION = 0.03; // 0.025
    static RADIUS = 13; // 15

    pos = null;
    vel = null;
    accel = null;

    colour = null;
    opacity = null;

    static state = {
        ACTIVE: 1,
        FALLING: 2
    }

    state;
    isFading;

    constructor(x, y, colour=null) {
        this.pos = new Vector2D(x, y);
        this.vel = new Vector2D(0, 0);
        this.accel = new Vector2D(0, 0);
        this.colour = colour;
        this.resetState();
    }

    resetState() {
        this.state = Ball.state.ACTIVE;
        this.opacity = 1;
        this.isFading = false;
    }

    isFalling() {
        return this.state == Ball.state.FALLING;
    }

    isActive() {
        return this.state == Ball.state.ACTIVE;
    }

    setFalling() {
        this.state = Ball.state.FALLING;
    }
    
    move(dt = 1) {
        // Euler's method
        this.applyFriction();
        this.vel = this.vel.add(this.accel.scale(dt));
        if (this.vel.getMagnitude() <= this.accel.getMagnitude()) {
            this.vel = new Vector2D(0, 0);
            this.accel = new Vector2D(0, 0);
        }
        this.pos = this.pos.add(this.vel.scale(dt));
    }
    // Acceleration should act opposite to the velocity at all times. (ONLY FRICTION)
    applyFriction() {
        if (this.state == Ball.state.ACTIVE) {
            this.accel = this.vel.getUnitVector().scale(-Ball.FRICTION);
        }
        else {
            this.accel = new Vector2D(0, 0);
        }
    }
    
    draw(ctx, offset=null) {
        if (this.isFading) {
            ctx.globalAlpha = this.opacity;
            if (this.opacity > Consts.epsilon) {
                this.opacity = Math.max(0, this.opacity - 0.05*Math.sqrt(1-this.opacity) - Consts.epsilon);
            }
        }

        let coord = this.pos.add(offset);
        CanvasUtil.drawCircle(ctx, coord, Ball.RADIUS, null, null, this.colour);

        if (this.isFading) {
            ctx.globalAlpha = 1;
        }

    }
    
    drawVelocity(ctx, scale=1, offset=null) {
        let c1 = this.pos.add(offset);
        let c2 = this.pos.add(this.vel.scale(scale)).add(offset);
        CanvasUtil.drawLine(ctx, c1, c2, 2, "white");
    }
}