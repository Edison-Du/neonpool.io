import { Vector2D } from "./vector2D.mjs";
import { Ball } from "../game_objects/ball.mjs";
import { CollisionUtil } from "./collisionUtil.mjs";
import { Consts } from "../consts.mjs";
import { CanvasUtil } from "./canvasUtil.mjs";
import { MathUtil } from "./mathUtil.mjs";

export class AimerUtil {

    static framesToFullStrength = 60;

    /**
     * May want another param later on for whether or not to lower opacity, depending on who's aiming
     * May want "offset" param
     * @param {context} ctx HTML Canvas Context 
     * @param {twoPlayerGame} game 
     * @param {vector2D} mousePos 
     */
    static drawAimAssist(ctx, game, mousePos) {

        let cueBall = game.cueBall;
        let balls = game.balls;
        let lines = game.lines;


        // closest touching ball
        let direction = cueBall.pos.to(mousePos); // line
        let closestBall = this.#targetClosestBall(cueBall, direction, balls);
        let closestLine = this.#targetClosestLine(cueBall, direction, lines);
    
        let m1 = closestBall.min;
        let m2 = closestLine.min;
        let min = m1;
        let closestIsBall = closestBall.index != -1;
        let closestIsLine = false;
    
        // checks if closest is a line
        if (m1 == null || (m2 != null && m2 < m1)) {
            min = m2;
            closestIsBall = false;
            closestIsLine = true;
        }
    
        if (min == null) {
            return;
        }
    
        let targetPos = cueBall.pos.add(direction.scale(min)); // projected location of ball before collision
        let dir_norm = direction.getUnitVector();
        let dir_rad = dir_norm.scale(Ball.RADIUS);
        let pos_target = targetPos.subtract(dir_rad);
    
        // draws pointer and projected ball location before collision
        CanvasUtil.drawLine(ctx, cueBall.pos, pos_target, 2, "white");
        CanvasUtil.drawCircle(ctx, targetPos, Ball.RADIUS - 1, 2, "white", null);
        
        // draws resultant velocity of ball-ball collision
        if (closestIsBall) {
            let closest = balls[closestBall.index];
            let ab = targetPos.to(closest.pos);
            let v_cueball = dir_norm.perp(ab).scale(4*Ball.RADIUS);
            let v_other = dir_norm.proj(ab).scale(4*Ball.RADIUS);
    
            let pos_v1 = targetPos.add(v_cueball);
    
            // let pos_v2i = targetPos.add(v_other.getUnitVector().scale(Ball.RADIUS));
            let pos_v2i = closest.pos;
            let pos_v2f = pos_v2i.add(v_other);
    
            CanvasUtil.drawLine(ctx, targetPos, pos_v1, 2, "white");
            CanvasUtil.drawLine(ctx, pos_v2i, pos_v2f, 2, "white");
        }
        // draws resultant velocity of ball-wall collision
        else if (closestIsLine) {
            let closest = lines[closestLine.index];
            let line_dir = closest.getDirectionVector();
            // ball hits corner of line segment
            if (targetPos.distToLine(closest.p1, line_dir) < Ball.RADIUS - Consts.epsilon) {
                let point = closest.p1;
                if (MathUtil.dist(point, targetPos) > MathUtil.dist(closest.p2, targetPos)) {
                    point = closest.p2;
                }
                let v_before = cueBall.pos.to(targetPos).getUnitVector();
                let v_deflect = point.to(targetPos).getUnitVector();
                let v_sub = v_before.proj(v_deflect);
                let v_cueball = v_before.subtract(v_sub).subtract(v_sub);
                let pos_v = targetPos.add(v_cueball.scale(4*Ball.RADIUS));
    
                CanvasUtil.drawLine(ctx, targetPos, pos_v, 2, "white");
            }
            // ball hits side of line segment
            else {
                let dir_proj_line = dir_norm.proj(line_dir);
                let v_cueball = dir_norm.subtract(dir_proj_line.scale(2)).scale(-1);
                let pos_v = targetPos.add(v_cueball.scale(4*Ball.RADIUS));
                CanvasUtil.drawLine(ctx, targetPos, pos_v, 2, "white");
            }
        }
    }

    static drawStrengthBar(ctx, timeElapsed) {
        const pos = new Vector2D(575, 465);
        const dim = new Vector2D(300, 20);

        let filled = new Vector2D(300 * (timeElapsed / this.framesToFullStrength), 20)

        CanvasUtil.drawRectangle(ctx, pos, filled, null, null, "orange");
        CanvasUtil.drawRectangle(ctx, pos, dim, 2, "black", null);
    }

    // Specific draw methods
    static #drawAimAssistForBall(ctx, mousePos, ball) {

    }

    static #drawAimAssistForLine(ctx, mousePos, line) {

    }

    static #drawAimAssistForHole(ctx, mousePos, hole) {

    }


    /**
     * Returns {min, obj}, where min is the distance the cue ball will travel before hitting the object,
     * and direction is the direction the cue ball is travelling
     * @param {Ball} cueBall 
     * @param {Vector2D} direction 
     */
    static #targetClosestBall(cueBall, direction, balls) {
        let closest = -1;
        let min = -1;
        for (let i = 0; i < balls.length; i++) {
            let cur = balls[i];
            
            // check ball isn't cue ball
            if (cur == cueBall) {
                continue;
            }
    
            // check ball isn't in hole
            if (cur.state == Ball.state.FALLING) {
                continue;
            }
    
            if (cur.pos.distToLine(cueBall.pos, direction) > 2 * Ball.RADIUS) {
                continue;
            }
            // ignore balls on the opposite direction of where the mouse is
            if (cueBall.pos.to(cur.pos).dot(direction) < 0) {
                continue;
            }
    
            // solve a quadratic for where the cueball would be right before collision
            let rb = cueBall.pos.to(balls[i].pos);
            let a = direction.getMagnitude();
            let b = rb.dot(direction);
            let c = Math.pow(rb.getMagnitude(), 2) - 4 * Ball.RADIUS * Ball.RADIUS;
            
            // take the minimal value of t
            let discr = Math.sqrt(b*b - a*a*c);
            let t = (b - discr)/(a*a);
            if (t < 0) {
                t = (b + discr)/(a*a);
            }
    
            if (closest == -1) {
                closest = i;
                min = t;
            }
            else if (t < min) {
                closest = i;
                min = t;
            }
    
        }
        return {min: min == -1? null : min, index: closest};
    }

    static #targetClosestLine(cueBall, direction, lines) {
        // remember to handle parallel case, non-intersection with segment case, etc
    
        let closest = -1;
        let min = -1;
    
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
    
            let a = cueBall.pos.to(line.p1);
            let d_1 = direction;
            let d_2 = line.p1.to(line.p2);
            let t = null;
    
            // prioritize the closer endpoint
            let p1 = line.p1;
            let p2 = line.p2;
            if (MathUtil.dist(p2, cueBall.pos) < MathUtil.dist(p1, cueBall.pos)) {
                p1 = line.p2;
                p2 = line.p1;
            }
    
            // parallel lines, assumes cue ball is not on the line segment
            if (Math.abs(d_1.dot(d_2)) == d_1.getMagnitude() * d_2.getMagnitude()) {
    
                // deal with case where line.p1 or line.p2 distance to line is smaller than ball.radius
                if (p1.distToLine(cueBall.pos, d_1) >= Ball.RADIUS) {
                    continue;
                }
                
                let rb = cueBall.pos.to(p1);
                let a = direction.getMagnitude();
                let b = rb.dot(direction);
                let c = Math.pow(rb.getMagnitude(), 2) - Ball.RADIUS * Ball.RADIUS;
                
                let discr = Math.sqrt(b*b - a*a*c);
                t = (b - discr)/(a*a);
                if (t < 0) {
                    t = (b + discr)/(a*a);
                    continue;
                }
            }
            else {
                // check if it intersects with line segment, doesn't work for parallel lines (div by 0)
                let k = (a.y - a.x * d_1.y / d_1.x) / (d_2.x * d_1.y / d_1.x - d_2.y);
                if (k < 0 || k > 1) {
                    if (p1.distToLine(cueBall.pos, d_1) >= Ball.RADIUS && 
                        p2.distToLine(cueBall.pos, d_1) >= Ball.RADIUS) {
                        continue;
                    }
                }
    
                // raw intersection with line, does not consider endpoints
                let w = d_1.proj(d_2).subtract(d_1);
                let u = a.subtract(a.proj(d_2));
    
                let dot = u.dot(w);
                let magw = w.getMagnitude();
                let magu = u.getMagnitude();
    
                let discr = Math.sqrt(dot*dot - magw*magw*(magu*magu - Ball.RADIUS * Ball.RADIUS));
                if (isNaN(discr)) { // yikes.
                    continue;
                }
                
                let t1 = (- dot - discr)/(magw*magw);
                if (t1 < 0) {
                    t1 = (- dot + discr)/(magw*magw);
                }
                if (t1 < 0) {
                    continue;
                }
                
                // intersection with endpoints
                let t2 = null;
                let rb = null;
    
                if (p1.distToLine(cueBall.pos, d_1) < Ball.RADIUS) {
                    rb = cueBall.pos.to(p1);
                }
                else if (p2.distToLine(cueBall.pos, d_1) < Ball.RADIUS) {
                    rb = cueBall.pos.to(p2);
                }
    
                if (rb != null) {
                    let a = direction.getMagnitude();
                    let b = rb.dot(direction);
                    let c = Math.pow(rb.getMagnitude(), 2) - Ball.RADIUS * Ball.RADIUS;
                    
                    let discr = Math.sqrt(b*b - a*a*c);
                    t2 = (b - discr)/(a*a);
                    if (t2 < 0) {
                        t2 = (b + discr)/(a*a);
                    }
                    if (t2 < 0) {
                        t2 = null;
                    }
                }
    
                // check overlap
                let b1_pos = cueBall.pos.add(direction.scale(t1 + Consts.epsilon));
                let b2_pos = cueBall.pos.add(direction.scale(t2 + Consts.epsilon));
    
                let b1 = new Ball(b1_pos.x, b1_pos.y);
                let b2 = new Ball(b2_pos.x, b2_pos.y);
                
                if (!CollisionUtil.checkBallToLineOverlap(b1, line)) {
                    t1 = null;
                }
                if (!CollisionUtil.checkBallToLineOverlap(b2, line)) {
                    t2 = null;
                }
                // take minimal t
                t = t1;
                if (t1 != null && t2 != null) {
                    t = Math.min(t1, t2);
                }
                else if (t1 == null) {
                    t = t2;
                }
                if (t == null) {
                    continue;
                }
            }
    
            if (closest == -1) {
                closest = i;
                min = t;
            }
            else if (t < min) {
                closest = i;
                min = t;
            }
        }
    
        return {min: min == -1? null : min, index: closest};
    }

    static #targetClosestHole(cueBall, direction, holes) {

    }

}