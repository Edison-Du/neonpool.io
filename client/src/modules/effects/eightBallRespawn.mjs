import { Consts } from "../consts.mjs";
import { Ball } from "../game_objects/ball.mjs";
import { CanvasUtil } from "../util/canvasUtil.mjs";

export class EightBallRespawn {

    counter;
    ballPosition;

    endFrame = 100;
    keyFrames = [0, this.endFrame];
    radius = [Ball.RADIUS, Ball.RADIUS*7];
    opacity = [1, 0];

    constructor(ballPosition) {
        this.counter = 0;
        this.ballPosition = ballPosition;
    }

    #interpolateLinear(keys, values) {
        let frame;
        for (let i = 0; i < keys.length; i++) {
            if (keys[i] <= this.counter) {
                frame = i;
            }
        }
        if (frame === keys.length - 1) {
            return values[frame];
        }
        let fraction = (this.counter - keys[frame])/(keys[frame+1] - keys[frame]);
        return values[frame] + (values[frame+1] - values[frame]) * fraction;
    }

    #getRadius() {
        return this.#interpolateLinear(this.keyFrames, this.radius);
    }

    #getOpacity() {
        return this.#interpolateLinear(this.keyFrames, this.opacity);
    }

    draw(ctx) {
        if (this.counter === this.endFrame) {
            return false;
        }
        // pre
        ctx.globalAlpha = this.#getOpacity();
        ctx.shadowColor = "#31bdff";
        ctx.shadowBlur = 7 * Consts.scale;

        CanvasUtil.drawCircle(ctx, this.ballPosition, this.#getRadius(), 4 * Consts.scale, "#31bdff", null);

        // post
        ctx.shadowColor = null;
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

        this.counter++;
        return true;
    }
}