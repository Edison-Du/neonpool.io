// immutable vector class
// yes it's technically mutable if you adjust x and y manually, but none of the methods will mutate the class.
export class Vector2D {
    x = null;
    y = null;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    // k(x, y) => (kx, ky)
    // does not mutate this or other
    scale(k) {
        return new Vector2D(this.x * k, this.y * k);
    }
    // (x, y) + (a, b) => (x + a, y + b)
    // does not mutate this or other
    add(other) {
        if (!other) return new Vector2D(this.x, this.y);
        return new Vector2D(this.x + other.x, this.y + other.y);
    }
    addXY(x, y) {
        return new Vector2D(this.x + x, this.y + y);
    }
    // (x, y) - (a, b) => (x - a, y - b)
    // does not mutate this or other
    subtract(other) {
        if (!other) return new Vector2D(this.x, this.y);
        return new Vector2D(this.x - other.x, this.y - other.y);
    }
    getMagnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }
    getUnitVector() {
        if (this.getMagnitude() == 0) {
            return this;
        }
        return this.scale(1/this.getMagnitude());
    }
    // returns vector v where this + v = other
    to(other) {
        return other.subtract(this);
    }
    // returns scalar distance between this and other
    dist(other) {
        return this.to(other).getMagnitude();
    }
    dot(other) {
        return (other.x * this.x) + (other.y * this.y);
    }
    // projects this onto other
    proj(other) {
        return other.getUnitVector().scale(this.dot(other)/other.getMagnitude());
    }
    // component of this perpendicular to other
    perp(other) {
        return this.subtract(this.proj(other));
    }
    // distance to a line in r2
    distToLine(point, direction) {
        let rp = point.to(this);
        return rp.perp(direction).getMagnitude();
    }
    // returns reflected point, does not mutate this
    reflectOverLine(point, direction) {
        let rp = this.to(point).perp(direction);
        return this.add(rp).add(rp);
    }
}