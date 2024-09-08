import { Vector2D } from "./vector2D.mjs";
import { Ball } from "../game_objects/ball.mjs";
import { Hole } from "../game_objects/hole.mjs";
import { CollisionUtil } from "./collisionUtil.mjs";
import { Consts } from "../consts.mjs";
import { CanvasUtil } from "./canvasUtil.mjs";
import { MathUtil } from "./mathUtil.mjs";

export class AimerUtil {

    static framesToFullStrength = 120;
    static resultantVelocityLength = 4*Ball.RADIUS;

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
        let holes = game.holes;

        let direction = cueBall.pos.to(mousePos);

        // for each type of game object (ball, line, etc), determine the closest one
        let minObjects = [
            this.#targetClosestBall(cueBall, direction, balls),
            this.#targetClosestLine(cueBall, direction, lines),
            this.#targetClosestHole(cueBall, direction, holes)
        ];

        // determine closest overall object
        let minDist = -1;
        let minIndex = -1;
        for (let i = 0; i < minObjects.length; i++) {
            let dist = minObjects[i].minDist;
            if (dist == -1) continue;
            if (dist <= minDist || minDist == -1) {
                minDist = dist;
                minIndex = i;
            }
        }

        // no object in path of cue ball
        if (minDist == -1) return;

        // important vectors
        let targetPos = cueBall.pos.add(direction.scale(minDist)); // projected location of ball before collision
        let dir_norm = direction.getUnitVector();
        let dir_rad = dir_norm.scale(Ball.RADIUS);
        let pos_target = targetPos.subtract(dir_rad);
    
        // draws pointer and projected ball location before collision
        CanvasUtil.drawLine(ctx, cueBall.pos, pos_target, 2, "white");
        CanvasUtil.drawCircle(ctx, targetPos, Ball.RADIUS - 1, 2, "white", null);

        // used to draw more specific features of the head of the aimer
        let drawFunctions = [
            (index) => {
                if (game.checkBallInPlayerSet(balls[index])) {
                    this.#drawAimAssistForHittableBall(ctx, dir_norm, targetPos, balls[index]);
                }
                else {
                    this.#drawAimAssistForUnhittableBall(ctx, dir_norm, targetPos, balls[index]);
                }
            }, // need to be more complex for diff balls
            (index) => {this.#drawAimAssistForLine(ctx, dir_norm, targetPos, lines[index])},
            (index) => {this.#drawAimAssistForHole(ctx, dir_norm, targetPos, holes[index])}
        ];

        drawFunctions[minIndex](minObjects[minIndex].index);
    }

    static drawStrengthBar(ctx, timeElapsed) {
        const pos = new Vector2D(575, 465);
        const dim = new Vector2D(300, 20);

        let filled = new Vector2D(300 * (timeElapsed / this.framesToFullStrength), 20)

        CanvasUtil.drawRectangle(ctx, pos, filled, null, null, "orange");
        CanvasUtil.drawRectangle(ctx, pos, dim, 2, "black", null);

        // dividers
        CanvasUtil.drawLine(ctx, pos.addXY(150, 0), pos.addXY(150, 20), 2, "black");
        CanvasUtil.drawLine(ctx, pos.addXY(75, 0), pos.addXY(75, 20), 2, "black");
        CanvasUtil.drawLine(ctx, pos.addXY(225, 0), pos.addXY(225, 20), 2, "black");
    }

    static drawPlaceBall(ctx, mousePos) {
        ctx.globalAlpha = 0.5;
        CanvasUtil.drawCircle(ctx, mousePos, Ball.RADIUS, null, null, "white");
        ctx.globalAlpha = 1;
    }

    static drawCannotPlaceBall(ctx, mousePos) {
        let diagonal = new Vector2D(1, -1);
        diagonal = diagonal.getUnitVector().scale(Ball.RADIUS);

        ctx.globalAlpha = 0.5;
        CanvasUtil.drawCircle(ctx, mousePos, Ball.RADIUS-1, 2, "white", null);
        CanvasUtil.drawLine(ctx, mousePos.add(diagonal), mousePos.subtract(diagonal), 2, "white");
        ctx.globalAlpha = 1;
    }

    // Specific draw methods
    static #drawAimAssistForHittableBall(ctx, velNorm, targetPos, ball) {
        let ab = targetPos.to(ball.pos);
        let v_cueball = velNorm.perp(ab).scale(this.resultantVelocityLength);
        let v_other = velNorm.proj(ab).scale(this.resultantVelocityLength);

        let pos_v1 = targetPos.add(v_cueball);

        let pos_v2i = ball.pos;
        let pos_v2f = pos_v2i.add(v_other);

        CanvasUtil.drawLine(ctx, targetPos, pos_v1, 2, "white");
        CanvasUtil.drawLine(ctx, pos_v2i, pos_v2f, 2, "white");
    }

    static #drawAimAssistForUnhittableBall(ctx, velNorm, targetPos, ball) {
        let diagonal = new Vector2D(1, -1);
        diagonal = diagonal.getUnitVector().scale(Ball.RADIUS);
        CanvasUtil.drawLine(ctx, targetPos.add(diagonal), targetPos.subtract(diagonal), 2, "white");
    }

    static #drawAimAssistForLine(ctx, velNorm, targetPos, line) {
        let line_dir = line.getDirectionVector();
        // ball hits corner of line segment
        if (targetPos.distToLine(line.p1, line_dir) < Ball.RADIUS - Consts.epsilon) {
            let point = line.p1;
            if (MathUtil.dist(point, targetPos) > MathUtil.dist(line.p2, targetPos)) {
                point = line.p2;
            }
            let v_before = velNorm;
            let v_deflect = point.to(targetPos).getUnitVector();
            let v_sub = v_before.proj(v_deflect);
            let v_cueball = v_before.subtract(v_sub).subtract(v_sub);
            let pos_v = targetPos.add(v_cueball.scale(this.resultantVelocityLength));

            CanvasUtil.drawLine(ctx, targetPos, pos_v, 2, "white");
        }
        // ball hits side of line segment
        else {
            let dir_proj_line = velNorm.proj(line_dir);
            let v_cueball = velNorm.subtract(dir_proj_line.scale(2)).scale(-1);
            let pos_v = targetPos.add(v_cueball.scale(this.resultantVelocityLength));
            CanvasUtil.drawLine(ctx, targetPos, pos_v, 2, "white");
        }
    }

    static #drawAimAssistForHole(ctx, velNorm, targetPos, hole) {
        
    }


    /**
     * Returns {minDist, index}, where min is the distance the cue ball will travel before hitting an object,
     * and direction is the direction the cue ball is travelling.
     * minDist = -1 if no object obstructing path of cue ball
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
            if (cur.isFalling()) {
                continue;
            }
    
            // not intersecting with cue ball's path
            if (cur.pos.distToLine(cueBall.pos, direction) > 2 * Ball.RADIUS) {
                continue;
            }
            // ignore balls on the opposite direction of where the mouse is
            if (cueBall.pos.to(cur.pos).dot(direction) < 0) {
                continue;
            }

            // console.log(i);
    
            // solve a quadratic for where the cueball would be right before collision
            let rb = cueBall.pos.to(balls[i].pos);
            let a = direction.getMagnitude();
            let b = rb.dot(direction);
            let c = Math.pow(rb.getMagnitude(), 2) - 4 * Ball.RADIUS * Ball.RADIUS;
            
            // take the minimal value of t
            let discr = Math.sqrt(b*b - a*a*c);
            let t = (b - discr)/(a*a);
            // if (t < 0) {
            //     t = (b + discr)/(a*a);
            // }
    
            if (closest == -1 || t < min) {
                closest = i;
                min = t;
            }
        }
        return {minDist: min, index: closest};
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
        return {minDist: min, index: closest};
    }

    static #targetClosestHole(cueBall, direction, holes) {
        let closest = -1;
        let min = -1;
        for (let i = 0; i < holes.length; i++) {
            let hole = holes[i];

            // not intersecting with cue ball's path
            if (hole.pos.distToLine(cueBall.pos, direction) > Hole.RADIUS) {
                continue;
            }
            // ignore holes on the opposite direction of where the mouse is
            if (cueBall.pos.to(hole.pos).dot(direction) < 0) {
                continue;
            }

            // solve a quadratic, take closer answer
            let m_d = direction.getMagnitude();
            let m_a = cueBall.pos.getMagnitude();
            let m_p = hole.pos.getMagnitude();

            let ad = cueBall.pos.dot(direction);
            let pd = hole.pos.dot(direction);
            let ap = cueBall.pos.dot(hole.pos);

            let a = m_d * m_d;
            let b = 2*(ad-pd);
            let c = m_a * m_a + m_p * m_p - Hole.RADIUS * Hole.RADIUS - 2 * ap;

            let t = MathUtil.solveQuadratic(a, b, c).x1;

            if (closest == -1 || t < min) {
                closest = i;
                min = t;
            }
        }
        return {minDist: min, index: closest};
    }
}