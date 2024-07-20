/**
 * This object is purely used to store points and draw to the screen, 
 * there is no support for collision detection, for the sake of minimal
 * disruption to the existing code and also for simulation efficiency.
 */
import { Vector2D } from "../util/vector2D.mjs";
import { CanvasUtil } from "../util/canvasUtil.mjs";

export class Polygon {

    vertices = [];
    colour = null;

    /**
     * @param {Array<Vector2D>} vertices
     * @param {string} colour 
     */
    constructor(vertices, colour=null) {
        this.vertices = vertices;
        this.colour = colour;
    }

    /**
     * Returns a polygon which is this polygon reflected over the given line.
     * @param {LineSegment} line 
     */
    getReflectedPolygon(line) {
        return new Polygon(
            this.vertices.map((vertex) => vertex.reflectOverLine(line.p1, line.getDirectionVector())),
            this.colour
        );
    }

    draw(ctx, offset=null) {
        let vertices = this.vertices.map((point) => point.add(offset));
        CanvasUtil.drawPolygon(ctx, vertices, null, null, this.colour);
    }
}