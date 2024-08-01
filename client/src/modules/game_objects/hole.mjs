import { Vector2D } from "../util/vector2D.mjs";
import { CanvasUtil } from "../util/canvasUtil.mjs";

export class Hole {

    static RADIUS = 25;
    static COLOUR = "black";

    pos = null;

    constructor(x, y) {
        this.pos = new Vector2D(x, y);
    }

    draw(ctx, offset=null) {
        let coord = this.pos.add(offset);
        CanvasUtil.drawCircle(ctx, coord, Hole.RADIUS, null, null, Hole.COLOUR);
    }
}