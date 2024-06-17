// Methods for handling collisions between objects
import { Ball } from "../game_objects/ball.mjs";
import { LineSegment } from "../game_objects/lineSegment.mjs";
import { Hole } from "../game_objects/hole.mjs";
import { Consts } from "../consts.mjs";
import { Vector2D } from "./vector2D.mjs"
import { MathUtil } from "./mathUtil.mjs";


export class CollisionUtil {

    // statistics for the magnitude of correction
    static totalBallBallCorrection = 0;
    static totalBallLineHeadonCorrection = 0;
    static totalBallLineCornerCorrection = 0;
    static numBallBallCollision = 0;
    static numBallLineHeadonCollision = 0;
    static numBallLineCornerCollision = 0;

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
            this.totalBallBallCorrection += correct.getMagnitude();
            this.numBallBallCollision += 1;
            // console.log("Average Correction Ball-Ball: ", this.totalBallBallCorrection/this.numBallBallCollision, this.numBallBallCollision);

            a.pos = a.pos.subtract(correct.scale(0.5));
            b.pos = b.pos.add(correct.scale(0.5));
            ab = b.pos.subtract(a.pos);
        }

        // check velocity directions
        let va_rel = a.vel.subtract(b.vel);
        if (va_rel.dot(ab) <= 0) {
            return;
        }

        // Billiard Simulation: https://www.youtube.com/watch?v=ThhdlMbGT5g 

        let normal = ab.getUnitVector();
        let v_a = a.vel.proj(normal).scale(Consts.elasticity);
        let v_b = b.vel.proj(normal).scale(Consts.elasticity);
        // let v_af_mag = 

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
        if (!CollisionUtil.checkBallToLineOverlap(ball, line)) {
            return false;
        }
        // collides with endpoints of line
        if (MathUtil.dist(line.p1, ball.pos) < Ball.RADIUS) {
            let p_perp = ball.pos.to(line.p1);
            let v_reflect = ball.vel.proj(p_perp);
            if (v_reflect.dot(p_perp) <= 0) { // ball is moving away from line
                return false;
            }
            return true;
        }
        if (MathUtil.dist(line.p2, ball.pos) < Ball.RADIUS) {
            let p_perp = ball.pos.to(line.p2);
            let v_reflect = ball.vel.proj(p_perp);
            if (v_reflect.dot(p_perp) <= 0) { // ball is moving away from line
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


    // collision between ball a and line l, mutates a
    static computeBallToLineCollision(ball, line) {
        if (!CollisionUtil.checkBallToLineOverlap(ball, line)) {
            return;
        }
        // collides with endpoints of line
        let point = null;
        if (MathUtil.dist(line.p1, ball.pos) < Ball.RADIUS) {
            point = line.p1;
        }
        if (MathUtil.dist(line.p2, ball.pos) < Ball.RADIUS) {
            point = line.p2;
        }
        if (point != null) {
            
            let p_perp = ball.pos.to(point);
            let correct = p_perp.getUnitVector().scale(p_perp.getMagnitude() - Ball.RADIUS);
            ball.pos = ball.pos.add(correct);

            let v_reflect = ball.vel.proj(p_perp);
            if (v_reflect.dot(p_perp) <= 0) {
                return;
            }
            ball.vel = ball.vel.subtract(v_reflect).subtract(v_reflect);

            this.totalBallLineCornerCorrection += correct.getMagnitude();
            this.numBallLineCornerCollision++;
            // console.log("Average Correction Ball-Line Corner: ", this.totalBallLineCornerCorrection/this.numBallLineCornerCollision, this.numBallLineCornerCollision);

            return;
        }

        // collides normally (not on endpoints)
        let dir = line.getDirectionVector();
        let pos_perp = ball.pos.to(line.p1).perp(dir);
        let v_perp = ball.vel.perp(dir);

        // adjust position (take negative velocity, scale it to ball.radius - perpendicular distane)
        let correct = pos_perp.getUnitVector().scale(pos_perp.getMagnitude() - Ball.RADIUS);
        ball.pos = ball.pos.add(correct);

        this.totalBallLineHeadonCorrection += correct.getMagnitude();
        this.numBallLineHeadonCollision++;
        // console.log("Average Correction Ball-Line Headone: ", this.totalBallLineHeadonCorrection/this.numBallLineHeadonCollision, this.numBallLineHeadonCollision);

        /** 
         * ball is moving away from the line,
         * we will consider which side the center of the ball is on to be the side the ball is on.
         * */ 
        if (pos_perp.dot(v_perp) <= 0) {
            return;
        }

        // subtract perpendicular velocity twice
        ball.vel = ball.vel.subtract(v_perp).subtract(v_perp).scale(Consts.elasticity);
    }

    static checkBallInHole(ball, hole) {
        return MathUtil.dist(ball.pos, hole.pos) < Hole.RADIUS;
    }
    
    // ball inside hole collides with edges of the hole, mutates the ball
    static computeBallToHoleCollision(ball, hole) {
        if (!this.checkBallInHole(ball, hole)) return;
        let ball_to_hole = ball.pos.to(hole.pos);

        // correct position.
        // let dist = ball_to_hole.getMagnitude() + Ball.RADIUS - Hole.RADIUS;
        // console.log(dist);
        // if (dist > 0) {
        //     ball.pos = ball.pos.add(ball_to_hole.getUnitVector().scale(dist));
        // }

        // check if ball is moving towards inner walls of the hole, then simulate collision against wall
        if (ball_to_hole.dot(ball.vel) < 0) {
            let v_proj = ball.vel.proj(ball_to_hole);
            /** 
             * This is the magic that makes the ball stay in the center of the hole,
             * each collision loses a bit of energy (scaled by 0.9).
             * If each collision didn't, the ball would bounce around forever in the hole.
             * Somehow, this makes it so that the ball fairly consistently (not always) ends up in the middle of the hole.
             * */ 
            ball.vel = ball.vel.subtract(v_proj).subtract(v_proj).scale(0.9);
        }
        // otherwise, nudge the ball towards the center of the hole
        else {
            let mag = ball.vel.getMagnitude();
            // may be an issue if the ball somehow has no velocity, then the ball may get stuck
            let change = ball_to_hole.getUnitVector().scale(mag); 
            ball.vel = ball.vel.scale(0.95).add(change.scale(0.05));
        }
    }
}
