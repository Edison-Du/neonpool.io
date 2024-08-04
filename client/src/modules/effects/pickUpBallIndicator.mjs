import { Consts } from "../consts.mjs";
import { Polygon } from "../game_objects/polygon.mjs";
import { Ball } from "../game_objects/ball.mjs";
import { Vector2D } from "../util/vector2D.mjs";

export class PickUpBallIndicator {

    counter;
    ballPosition;
    triangle;

    endFrame = 150;
    keyFrames = [0, this.endFrame/2, this.endFrame];
    translation = [5, 0, 5];

    constructor(ballPosition) {
        this.counter = 0;
        this.ballPosition = ballPosition;
        this.triangle = (new Polygon(
            [new Vector2D(0, 0), new Vector2D(10, -10), new Vector2D(-10, -10)], 
            Consts.cueBallColour, 
            Consts.cueBallColour
        ))
        .getTranslatedPolygon(new Vector2D(0, - (Ball.RADIUS + 7)))
        .getTranslatedPolygon(ballPosition); 
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
    
    #getTranslation() {
        return this.#interpolateLinear(this.keyFrames, this.translation);
    }

    draw(ctx) {
        let height = this.#getTranslation();
        let newTriangle = this.triangle.getTranslatedPolygon(new Vector2D(0, -height));
        newTriangle.draw(ctx);
        this.counter++;
        return this.counter !== this.endFrame;
    }
}