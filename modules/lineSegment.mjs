import { vect2d } from "./vect2D.mjs";

export class LineSegment {

    p1 = null;
    p2 = null;
    col = null;

    // two vectors p1 = (x1, y1) and p2 = (x2, y2) representing the endpoints of the line segment
    constructor(x1, y1, x2, y2, col=null) {
        this.p1 = vect2d(x1, y1);
        this.p2 = vect2d(x2, y2);
        this.col = col;
    }

    getDirectionVector() {
        return this.p1.to(this.p2);
    }

    draw(ctx, offset=null) {
        let p1 = this.p1.add(offset);
        let p2 = this.p2.add(offset);

        ctx.strokeStyle=this.col;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
        ctx.closePath();
    }
}