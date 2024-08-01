/**
 * This object is purely used to store points and draw to the screen, 
 * there is no support for collision detection, for the sake of minimal
 * disruption to the existing code and also for simulation efficiency.
 */
import { Vector2D } from "../util/vector2D.mjs";
import { CanvasUtil } from "../util/canvasUtil.mjs";
import { Consts } from "../consts.mjs";

export class Polygon {

    vertices = [];
    colour = null;
    glow = null;

    /**
     * @param {Array<Vector2D>} vertices
     * @param {string} colour 
     */
    constructor(vertices, colour=null, glow=null) {
        this.vertices = vertices;
        this.colour = colour;
        this.glow = glow;
    }

    /**
     * Returns a polygon which is this polygon reflected over the given line.
     * @param {LineSegment} line 
     */
    getReflectedPolygon(line) {
        return new Polygon(
            this.vertices.map((vertex) => vertex.reflectOverLine(line.p1, line.getDirectionVector())),
            this.colour,
            this.glow
        );
    }

    draw(ctx, offset=null) {
        let vertices = this.vertices.map((point) => point.add(offset));
        CanvasUtil.drawPolygon(ctx, vertices, null, null, this.colour);
    }

    drawGlow(ctx, offset=null) {
        if (!this.glow) {
            return;
        }
        ctx.shadowColor = this.glow;
        ctx.shadowBlur = 7 * Consts.scale;

        let vertices = this.vertices.map((point) => point.add(offset));
        CanvasUtil.drawPolygon(ctx, vertices, null, null, this.colour);

        ctx.shadowColor = null;
        ctx.shadowBlur = 0;
    }
}