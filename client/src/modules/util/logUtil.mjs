import { Consts } from "../consts.mjs";
import { Ball } from "../game_objects/ball.mjs";

export class LogUtil {

    static createGameLog(seed) {
        return new LogUtil(seed);
    }

    static moveTypes = {
        SHOOT_BALL: "SHOOT_BALL",
        PLACE_BALL: "PLACE_BALL",
        FORFEIT: "FORFEIT"
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

    placeBall(position, game) {
        this.moves.push(new Move({
            moveType: LogUtil.moveTypes.PLACE_BALL,
            gameTick: game.gameTick,
            data: { position }
        }));
    }

    shootBall(direction, strength, game) {
        this.moves.push(new Move({
            moveType: LogUtil.moveTypes.SHOOT_BALL,
            gameTick: game.gameTick,
            data: { direction, strength }
        }));

        let newBallState = [];
        game.balls.forEach((ball) => {
            newBallState.push({...ball});
        });
        this.ballStates.push(newBallState);
    }

    forfeit(player, game) {
        this.moves.push(new Move({
            moveType: LogUtil.moveTypes.FORFEIT,
            gameTick: game.gameTick,
            data: { player }
        }));
    }

    // creates a test case that simulates the last shot exactly.
    constructGameState() {
        if (this.moves.length === 0 || this.ballStates.length === 0) {
            console.log("No moves or ball states recorded");
            return;
        }
        let msg = `Ball.RADIUS = ${Ball.RADIUS};\n`;
        msg += `Ball.FRICTION = ${Ball.FRICTION};\n`;
        msg += `Consts.elasticity = ${Consts.elasticity};\n`;
        msg += `RandomUtil.seed(${this.seed});\n`;

        // balls
        msg += "let ball;\n";
        msg += "game.balls = [];\n";
        let n = this.ballStates.length;
        this.ballStates[n-1].forEach((ball) => {
            msg += `ball = new Ball(${ball.pos.x}, ${ball.pos.y}, "${ball.colour}");\n`;
            // msg += `ball.vel = new Vector2D(${ball.vel.x}, ${ball.vel.y});\n`;
            // msg += `ball.accel = new Vector2D(${ball.accel.x}, ${ball.accel.y});\n`;
            msg += `ball.glow = "${ball.glow}";`;
            msg += `ball.opacity = ${ball.opacity};`;
            msg += `ball.state = ${ball.state};`;
            msg += `ball.isFading = ${ball.isFading};\n`;
            msg += "game.balls.push(ball);\n";
        });
        msg += "game.cueBall = game.balls[0];\n";
        let m = this.moves.length;
        if (this.moves[m-1].moveType == LogUtil.moveTypes.SHOOT_BALL) {
            let d = this.moves[m-1].direction;
            let s = this.moves[m-1].strength;
            msg += `game.shootCueBall(new Vector2D(${d.x}, ${d.y}), ${s});\n`;
        }
        else if (this.moves[m-1].moveType == LogUtil.moveTypes.FORFEIT) {
            let player = this.moves[m-1].player;
            msg += `game.forfeitPlayer("${player}");\n`;
        }
        else {
            let p = this.moves[m-1].position;
            msg += `game.placeCueBall(new Vector2D(${p.x}, ${p.y}));\n`;
        }
        console.log(msg);   
    }

    printMoves() {
        console.log(this.moves);
    }

    getGameReplay(game) {
        return {
            seed: this.seed,
            moves: this.moves,
            numPlayers: game.players.length,
        }
    }
    
    getGameEndState(game) {
        return {
            turn: game.turn,
            gameTick: game.gameTick,
            currentPlayerIndex: game.currentPlayerIndex,
            players: game.players,
            gameHasEnded: game.gameHasEnded,
            balls: game.balls,
            ballInHand: game.ballInHand,
            ballIsPlaced: game.ballIsPlaced,
            runningColourCount: game.runningColourCount,
            ballsPocketedThisTurn: game.ballsPocketedThisTurn,
        }
    }
}

export class Move {
    moveType;
    gameTick;
    data;
    constructor({moveType, gameTick, data}) {
        this.moveType = moveType;
        this.gameTick = gameTick;
        this.data = data;
    }
}

export class GameReplay {
    seed;
    moves;
    numPlayers;
    constructor({seed, moves, numPlayers}) {
        this.seed = seed;
        this.moves = moves;
        this.numPlayers = numPlayers;
    }
}

export class GameState {
    turn;
    gameTick;
    currentPlayerIndex;
    players;
    gameHasEnded;
    balls;
    ballInHand;
    ballIsPlaced;
    runningColourCount;
    ballsPocketedThisTurn;
    constructor({
        turn, 
        gameTick, 
        currentPlayerIndex, 
        players, 
        gameHasEnded, 
        balls, 
        ballInHand, 
        ballIsPlaced, 
        runningColourCount, 
        ballsPocketedThisTurn
    }) {
        this.turn = turn;
        this.gameTick = gameTick;
        this.currentPlayerIndex = currentPlayerIndex;
        this.players = players;
        this.gameHasEnded = gameHasEnded;
        this.balls = balls;
        this.ballInHand = ballInHand;
        this.ballIsPlaced = ballIsPlaced;
        this.runningColourCount = runningColourCount;
        this.ballsPocketedThisTurn = ballsPocketedThisTurn;
    }
}