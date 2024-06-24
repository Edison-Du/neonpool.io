import { Vector2D } from "../util/vector2D.mjs";
import { Ball } from "../game_objects/ball.mjs";
import { LineSegment } from "../game_objects/lineSegment.mjs";
import { Hole } from "../game_objects/hole.mjs";
import { CollisionUtil } from "../util/collisionUtil.mjs";
import { Consts } from "../consts.mjs";
import { MathUtil } from "../util/mathUtil.mjs";

export class TwoPlayerGame {

    // Game Objects
    cueBall;
    balls = [];
    lines = []; // might want to use polygons later
    holes = [];

    // Other variables
    ballsAreMoving;
    // Probablby need turns and players = [], etc.
    
    constructor() {
        this.#initializeGame();
    }

    // Draw to Canvas

    draw(ctx, offset=null) {
        // holes
        for (let i = 0; i < this.holes.length; i++) {
            this.holes[i].draw(ctx, offset);
        }

        // balls
        for (let i = 0; i < this.balls.length; i++) {
            this.balls[i].draw(ctx, offset);
        }

        // velocity vectors on balls
        for (let i = 0; i < this.balls.length; i++) {
            this.balls[i].drawVelocity(ctx, Ball.RADIUS/2, offset);
        }

        // line segments
        for (let i = 0; i < this.lines.length; i++) {
            this.lines[i].draw(ctx, offset);
        }
    }

    // User Input

    shootCueBall(direction, strength) {
        if (this.ballsAreMoving) {
            return;
        }

        // may choose to add velocity instead of set velocity in the future (explosives)
        this.cueBall.vel = direction.getUnitVector().scale(strength); // max strength is 20?
    }

    // Physics related

    simulateTick() {
        const n = 10;
        let dt = 1/n;
        for (let i = 0; i < n; i++) {
            this.#computeCollisionHoles();
            if (this.#checkCollisionLines()) {
                this.#computeCollisionLines();
            }
            let safe = 30;
            while(this.#checkCollisionBalls() && safe > 0) {
                this.#computeCollisionBalls();
                safe--;
            }
            this.ballsAreMoving = this.#move(dt);
        }
    }

    #move(dt) {
        let moving = false; // nothing is moving
        let balls = this.balls;
        for (let i = 0; i < balls.length; i++) {
            balls[i].move(dt); 
            if (balls[i].isFading && balls[i].opacity < Consts.epsilon) {
                continue;
            }
            if (balls[i].vel.x != 0 || balls[i].vel.y != 0) {
                moving = true;
            }
        }
        return moving;
    }

    // Collision Related

    #checkCollisionLines() {
        let balls = this.balls;
        let lines = this.lines;
        for (let i = 0; i < balls.length; i++) {
            for (let j = 0; j < lines.length; j++) {
                if (balls[i].state == Ball.state.FALLING) continue;
                if (CollisionUtil.checkBallToLineCollision(balls[i], lines[j])) {
                    return true;
                }
            }
        }
        return false;
    }

    #computeCollisionLines() {
        let balls = this.balls;
        let lines = this.lines;
        for (let i = 0; i < balls.length; i++) {
            for (let j = 0; j < lines.length; j++) {
                if (balls[i].state == Ball.state.FALLING) continue;
                CollisionUtil.computeBallToLineCollision(balls[i], lines[j]);
            }
        }
    }

    #checkCollisionBalls() {
        /**
         * More efficient checking algorithm O(n^2) -> O(n)
         * Divide the grid into cells of size k * Ball.RADIUS (k > 2, something like k = 2.5 sounds good)
         * Each ball is located in one of these cells.
         * Only balls in the neighbouring 8 cells need to be checked for collision.
         */
        let balls = this.balls;
        for (let i = 0; i < balls.length - 1; i++) {
            for (let j = i + 1; j < balls.length; j++) {
                let a = balls[i];
                let b = balls[j];
                if (a.state == Ball.state.FALLING || b.state == Ball.state.FALLING) 
                    continue;
                if (CollisionUtil.checkBallCollision(a, b)) {
                    return true;
                }
            }   
        }
        return false;
    }

    #computeCollisionBalls() {
        let balls = this.balls;
        for (let i = 0; i < balls.length - 1; i++) {
            for (let j = i + 1; j < balls.length; j++) {
                let a = balls[i];
                let b = balls[j];
                if (a.state == Ball.state.FALLING || b.state == Ball.state.FALLING) 
                    continue;
                this.#computeCollisionLines(); // this needs to be done for weird cases such as balls hitting other balls through walls.
                CollisionUtil.computeBallCollision(a, b);
            }   
        }
    }

    #computeCollisionHoles() {
        let balls = this.balls;
        let holes = this.holes;
        for (let i = 0; i < balls.length; i++) {
            for (let j = 0; j < holes.length; j++) {
                if (CollisionUtil.checkBallInHole(balls[i], holes[j])) {
                    balls[i].state = Ball.state.FALLING;
                    CollisionUtil.computeBallToHoleCollision(balls[i], holes[j]);
                    if (MathUtil.dist(balls[i].pos, holes[j].pos) < Hole.RADIUS - Ball.RADIUS) {
                        balls[i].isFading = true;
                    }
                }
            }
        }
    }

    // NOTE, we can create different functions for different test cases.
    #initializeGame() {
    
        // Fields
        this.ballsAreMoving = false;

        // Position constants
        const h = 500;
        const w = 1000;

        const ho = 40;
        const hm = 30;

        const ri = new Vector2D(30, 63);
        const ro = new Vector2D(46, 75); // 46, 79

        // Cueball
        this.balls.push(new Ball(250, 250, "white"));
        this.cueBall = this.balls[0];

        // Break Orientation of 15 balls
        let breakOffset = new Vector2D(700, 250);
        for (let i = 4; i >= 0; i--) {
            for (let j = i%2; j <= i; j += 2) {
                let p1 = new Vector2D(i*Math.sqrt(3), j).scale(Ball.RADIUS).add(breakOffset);
                let p2 = new Vector2D(i*Math.sqrt(3), -j).scale(Ball.RADIUS).add(breakOffset);

                if (j != 0) {
                    this.balls.push(new Ball(p2.x, p2.y, "red"));
                    this.balls.push(new Ball(p1.x, p1.y, "red"));
                }
                else {
                    this.balls.push(new Ball(p2.x, p2.y, "red"));
                }
            }
        }

        // Holes
        this.holes.push(new Hole(  ho,   ho));
        this.holes.push(new Hole(  ho, h-ho));
        this.holes.push(new Hole(w-ho,   ho));
        this.holes.push(new Hole(w-ho, h-ho));
        this.holes.push(new Hole( w/2,   hm));
        this.holes.push(new Hole( w/2, h-hm));

        // Walls
        const lineColour = "brown"

        this.lines.push(new LineSegment(ri.x,   ri.y, ro.x,   ro.y, lineColour));
        this.lines.push(new LineSegment(ri.x, h-ri.y, ro.x, h-ro.y, lineColour));
        this.lines.push(new LineSegment(ro.x,   ro.y, ro.x, h-ro.y, lineColour));

        this.lines.push(new LineSegment(w-ri.x,   ri.y, w-ro.x,   ro.y, lineColour));
        this.lines.push(new LineSegment(w-ri.x, h-ri.y, w-ro.x, h-ro.y, lineColour));
        this.lines.push(new LineSegment(w-ro.x,   ro.y, w-ro.x, h-ro.y, lineColour));

        this.lines.push(new LineSegment(         ri.y, ri.x,        ro.y, ro.x, lineColour));
        this.lines.push(new LineSegment(w/2+ho-ri.y-2, ri.x, w/2+ho-ro.y, ro.x, lineColour));
        this.lines.push(new LineSegment(         ro.y, ro.x, w/2+ho-ro.y, ro.x, lineColour));

        this.lines.push(new LineSegment(         ri.y, h-ri.x,        ro.y, h-ro.x, lineColour));
        this.lines.push(new LineSegment(w/2+ho-ri.y-2, h-ri.x, w/2+ho-ro.y, h-ro.x, lineColour));
        this.lines.push(new LineSegment(         ro.y, h-ro.x, w/2+ho-ro.y, h-ro.x, lineColour));

        this.lines.push(new LineSegment(w/2-ho+ri.y+2, ri.x, w/2-ho+ro.y, ro.x, lineColour));
        this.lines.push(new LineSegment(       w-ri.y, ri.x,      w-ro.y, ro.x, lineColour));
        this.lines.push(new LineSegment(       w-ro.y, ro.x, w/2-ho+ro.y, ro.x, lineColour));

        this.lines.push(new LineSegment(w/2-ho+ri.y+2, h-ri.x, w/2-ho+ro.y, h-ro.x, lineColour));
        this.lines.push(new LineSegment(       w-ri.y, h-ri.x,      w-ro.y, h-ro.x, lineColour));
        this.lines.push(new LineSegment(       w-ro.y, h-ro.x, w/2-ho+ro.y, h-ro.x, lineColour));
    }
}