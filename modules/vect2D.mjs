export class Vect2D {
    x = null;
    y = null;
    mag = null;
    dir = null;
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    // k(x, y) => (kx, ky)
    scale(k) {
        return vect2d(this.x * k, this.y * k);
    }
    // (x, y) + (a, b) => (x + a, y + b);
    add(other) {
        if (!other) return vect2d(this.x, this.y);
        return vect2d(this.x + other.x, this.y + other.y);
    }
    subtract(other) {
        if (!other) return vect2d(this.x, this.y);
        return vect2d(this.x - other.x, this.y - other.y);
    }
    getMagnitude() {
        if (!this.mag) {
            this.mag = Math.sqrt(this.x * this.x + this.y * this.y);
        }
        return this.mag;
    }
    // in radians
    getDirection() {
        if (!this.dir) {
            this.dir = Math.atan2(this.y, this.x)
        }
        return this.dir;
    }
    getUnitVector() {
        if (this.getMagnitude() == 0) {
            return this;
        }
        return this.scale(1/this.getMagnitude());
    }
    // returns v where this + v = other
    to(other) {
        return other.subtract(this);
    }
    dist(other) {
        return this.to(other).getMagnitude();
    }
    dot(other) {
        return (other.x * this.x) + (other.y * this.y);
    }
    // projects this onto other
    proj(other) {
        // let res = other.getUnitVector().scale(this.dot(other)/other.getMagnitude());
        // console.log("Project", this, other, res, this.dot(other), other.dot(this));
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
}

export function vect2d(x, y) {
    return new Vect2D(x, y);
}

export function dist(v1, v2) {
    return v1.subtract(v2).getMagnitude();
}

// module.exports = {
//     Vect2D, 
//     vect2d
// }