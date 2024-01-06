import { vect2d } from "./vect2D.mjs";

export class CanvasTools {

    /**
     * start and end are vectors
     */
    static drawLine(ctx, start, end, strokeWidth, strokeColour) {
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.lineWidth = strokeWidth;
        ctx.strokeStyle = strokeColour;
        ctx.stroke();
        ctx.closePath();
    }

    /**
     * center is a vector
     */
    static drawCircle(ctx, center, radius, strokeWidth, strokeColour, fillColour) {
        ctx.beginPath();
        ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
        ctx.lineWidth = strokeWidth;
        ctx.strokeStyle = strokeColour;
        ctx.fillStyle = fillColour;
        if (strokeWidth != null) {
            ctx.stroke();
        }
        if (fillColour != null) {
            ctx.fill();
        }
        ctx.closePath();
    }
}