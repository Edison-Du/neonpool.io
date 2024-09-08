import { Consts } from "../consts.mjs";
import { Ball } from "../game_objects/ball.mjs";

export class LogUtil {

    static createGameLog(seed) {
        return new LogUtil(seed);
    }

    static moveTypes = {
        SHOOT_BALL: "SHOOT_BALL",
        PLACE_BALL: "PLACE_BALL"
    }

    seed;
    moves;
    ballStates;
    // assume these don't change throughout the game.
    lines; 
    holes;

    constructor(seed) {
        this.seed = seed;
        this.moves = [];
        this.ballStates = [];
    }

    placeBall(position) {
        this.moves.push({
            moveType: LogUtil.moveTypes.PLACE_BALL,
            position: position
        });
    }

    shootBall(direction, strength, balls) {
        this.moves.push({
            moveType: LogUtil.moveTypes.SHOOT_BALL,
            direction: direction,
            strength: strength
        });

        let newBallState = [];
        balls.forEach((ball) => {
            newBallState.push({...ball});
        });
        this.ballStates.push(newBallState);
    }
    
    // creates a test case that simulates the last shot exactly.
    constructGameState() {
        let msg = `Ball.RADIUS = ${Ball.RADIUS};\n`;
        msg += `Ball.FRICTION = ${Ball.FRICTION};\n`;
        msg += `Consts.elasticity = ${Consts.elasticity};\n`;
        msg += `RandomUtil.seed(${this.seed});\n`;

        // balls
        msg += "let ball;\n";
        msg += "game.balls = [];\n";
        let n = this.ballStates.length;
        this.ballStates[n-1].forEach((ball) => {
            msg += `ball = new Ball(${ball.pos.x}, ${ball.pos.y}, \"${ball.colour}\");\n`;
            // msg += `ball.vel = new Vector2D(${ball.vel.x}, ${ball.vel.y});\n`;
            // msg += `ball.accel = new Vector2D(${ball.accel.x}, ${ball.accel.y});\n`;
            msg += `ball.glow = \"${ball.glow}\";`;
            msg += `ball.opacity = ${ball.opacity};`;
            msg += `ball.state = ${ball.state};`;
            msg += `ball.isFading = ${ball.isFading};\n`;
            msg += "game.balls.push(ball);\n";
        });
        msg += "game.cueBall = game.balls[0];\n";
        let m = this.moves.length;
        let d = this.moves[m-1].direction;
        let s = this.moves[m-1].strength;
        msg += `game.shootCueBall(new Vector2D(${d.x}, ${d.y}), ${s});\n`;
        console.log(msg);   
    }

    printMoves() {
        console.log(this.moves);
    }
}