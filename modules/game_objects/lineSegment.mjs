import { Vector2D } from "../util/vector2D.mjs";
import { CanvasUtil } from "../util/canvasUtil.mjs";

export class LineSegment {

    p1 = null;
    p2 = null;
    colour = null;

    // two vectors p1 = (x1, y1) and p2 = (x2, y2) representing the endpoints of the line segment
    constructor(x1, y1, x2, y2, colour=null) {
        this.p1 = new Vector2D(x1, y1);
        this.p2 = new Vector2D(x2, y2);
        this.colour = colour;
    }

    getDirectionVector() {
        return this.p1.to(this.p2);
    }

    draw(ctx, offset=null) {
        let p1 = this.p1.add(offset);
        let p2 = this.p2.add(offset);
        CanvasUtil.drawLine(ctx, p1, p2, 2, this.colour);
    }
}