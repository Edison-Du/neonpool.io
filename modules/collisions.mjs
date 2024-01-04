// Methods for handling collisions between objects
import { Ball } from "./ball.mjs";
import { LineSegment } from "./lineSegment.mjs";
import { Consts } from "./consts.mjs";
import { vect2d, dist } from "./vect2D.mjs";

export class Collision {
    // checks collision between two balls a and b
    static checkBallCollision(a, b) {
        let ab = a.pos.to(b.pos);
        let d = ab.getMagnitude();

        // collision
        if (d > 2 * Ball.RADIUS) {
            return false;
        }

        // check velocity directions
        let va_rel = a.vel.subtract(b.vel);
        if (va_rel.dot(ab) > 0) {
            return true;
        }
        return false;
    }


    // collision between two balls a and b, mutates a and b
    static computeBallCollision(a, b) {
        let ab = b.pos.subtract(a.pos);
        let d = ab.getMagnitude();

        // collision
        if (d > 2 * Ball.RADIUS) {
            return;
        }

        // correct position overlap
        let correct = ab.getUnitVector().scale(2 * Ball.RADIUS - d)

        if (correct.getMagnitude() > Consts.epsilon) {
            a.pos = a.pos.subtract(correct.scale(0.5));
            b.pos = b.pos.add(correct.scale(0.5));
            ab = b.pos.subtract(a.pos);
        }

        // check velocity directions
        let va_rel = a.vel.subtract(b.vel);
        if (va_rel.dot(ab) <= 0) {
            return;
        }

        let normal = ab.getUnitVector();
        let v_a = a.vel.proj(normal);
        let v_b = b.vel.proj(normal);

        // completetly elastic
        a.vel = a.vel.subtract(v_a).add(v_b);
        b.vel = b.vel.subtract(v_b).add(v_a);
    } 


    static checkBallToLineOverlap(ball, line) {
        if (ball.pos.distToLine(line.p1, line.getDirectionVector()) > Ball.RADIUS) {
            return false;
        }
        // on the line but not on the segment
        let p1_b = line.p1.to(ball.pos);
        let p2_b = line.p2.to(ball.pos);
        let p1_p2 = line.p1.to(line.p2);
        let p2_p1 = line.p2.to(line.p1);

        // endpoints of the line are inside the ball
        if (p1_b.getMagnitude() <= Ball.RADIUS) {
            return true;
        }
        if (p2_b.getMagnitude() <= Ball.RADIUS) {
            return true;
        }
        if (p1_p2.dot(p1_b) < 0 || p2_p1.dot(p2_b) < 0) {
            return false;
        }
        return true;
    }


    // checks collision between ball a and line l
    static checkBallToLineCollision(ball, line) {
        // isn't close enough
        if (!Collision.checkBallToLineOverlap(ball, line)) {
            return false;
        }
        // collides with endpoints of line
        if (dist(line.p1, ball.pos) < Ball.RADIUS) {
            let p_perp = ball.pos.to(line.p1);
            let v_reflect = ball.vel.proj(p_perp);
            if (v_reflect.dot(p_perp) <= 0) {
                return false;
            }
            return true;
        }
        if (dist(line.p2, ball.pos) < Ball.RADIUS) {
            let p_perp = ball.pos.to(line.p2);
            let v_reflect = ball.vel.proj(p_perp);
            if (v_reflect.dot(p_perp) <= 0) {
                return false;
            }
            return true;
        }
        /** 
         * ball is moving away from the line,
         * we will consider which side the center of the ball is on to be the side the ball is on.
         * */ 
        let dir = line.getDirectionVector();
        let pos_perp = ball.pos.to(line.p1).perp(dir);
        let v_perp = ball.vel.perp(dir);

        // console.log(v_perp);

        if (pos_perp.dot(v_perp) <= 0) {
            return false;
        }
        return true;
    }


    // collision between ball a nad line l, mutates a
    static computeBallToLineCollision(ball, line) {
        if (!Collision.checkBallToLineOverlap(ball, line)) {
            return;
        }
        // collides with endpoints of line
        if (dist(line.p1, ball.pos) < Ball.RADIUS) {
            let p_perp = ball.pos.to(line.p1);
            let correct = p_perp.getUnitVector().scale(p_perp.getMagnitude() - Ball.RADIUS);
            ball.pos = ball.pos.add(correct);

            let v_reflect = ball.vel.proj(p_perp);
            if (v_reflect.dot(p_perp) <= 0) {
                return;
            }
            ball.vel = ball.vel.subtract(v_reflect).subtract(v_reflect);
            return;
        }
        if (dist(line.p2, ball.pos) < Ball.RADIUS) {
            let p_perp = ball.pos.to(line.p2);
            let correct = p_perp.getUnitVector().scale(p_perp.getMagnitude() - Ball.RADIUS);
            ball.pos = ball.pos.add(correct);

            let v_reflect = ball.vel.proj(p_perp);
            if (v_reflect.dot(p_perp) <= 0) {
                return;
            }
            ball.vel = ball.vel.subtract(v_reflect).subtract(v_reflect);
            return;
        }


        let dir = line.getDirectionVector();
        let pos_perp = ball.pos.to(line.p1).perp(dir);
        let v_perp = ball.vel.perp(dir);

        // adjust position (take negative velocity, scale it to ball.radius - perpendicular distane)
        let correct = pos_perp.getUnitVector().scale(pos_perp.getMagnitude() - Ball.RADIUS);
        ball.pos = ball.pos.add(correct);

        /** 
         * ball is moving away from the line,
         * we will consider which side the center of the ball is on to be the side the ball is on.
         * */ 
        if (pos_perp.dot(v_perp) <= 0) {
            return;
        }

        // subtract perpendicular velocity twice
        ball.vel = ball.vel.subtract(v_perp).subtract(v_perp);
    }
}
