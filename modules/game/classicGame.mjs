import { Vector2D } from "../util/vector2D.mjs";
import { Ball } from "../game_objects/ball.mjs";
import { LineSegment } from "../game_objects/lineSegment.mjs";
import { Hole } from "../game_objects/hole.mjs";
import { CollisionUtil } from "../util/collisionUtil.mjs";
import { Consts } from "../consts.mjs";
import { MathUtil } from "../util/mathUtil.mjs";
import { RandomUtil } from "../util/randomUtil.mjs";
import { Player } from "./player.mjs";
import { CanvasUtil } from "../util/canvasUtil.mjs";

export class ClassicGame {

    // Game Objects
    cueBall;
    balls = []; // the cue ball should always be at index 0, eight-ball should be at index 1
    lines = []; // might want to use polygons later
    holes = [];

    // Other variables
    players = [];
    currentPlayerIndex;
    turn;

    gameHasEnded;
    ballsAreMoving;
    ballInHand; // if player can move ball
    ballIsPlaced; // if cue ball is on table

    firstBallHit;
    allPocketedBalls = [];
    ballsPocketedThisTurn = [];
    runningColourCount = {};
   
    constructor(seed=0) {
        RandomUtil.seed(seed);

        this.currentPlayerIndex = 0;
        this.turn = 1;

        this.gameHasEnded = false;
        this.ballsAreMoving = false;
        this.ballInHand = true;
        this.ballIsPlaced = true;

        this.initializePlayers();        
        this.#initializeGameObjects();
    }

    // NOTE, we can create different functions for different test cases.
    #initializeGameObjects() {

        // Position constants
        const h = Consts.boardHeight;
        const w = Consts.boardWidth;

        const ho = 40;
        const hm = 30;

        const ri = new Vector2D(30, 63);
        const ro = new Vector2D(46, 75); // 46, 79

        // Cueball
        this.balls.push(new Ball(Consts.breakLine, Consts.boardHeight/2, Consts.cueBallColour));
        this.cueBall = this.balls[0];

        // Break orientation for balls
        this.initializeBalls();
        
        // shuffle the ball colours
        for (let i = this.balls.length-1; i > 2; i--) {
            let index = Math.floor(RandomUtil.random()*(i-2))+2;
            let temp = this.balls[index].colour;
            this.balls[index].colour = this.balls[i].colour;
            this.balls[i].colour = temp;
        }

        // shuffle the balls themselves for unique collision upon break
        // Note that the cue ball and eight-ball have fixed positions.
        for (let i = this.balls.length-1; i > 2; i--) {
            let index = Math.floor(RandomUtil.random()*(i-2))+2;
            let temp = this.balls[index];
            this.balls[index] = this.balls[i];
            this.balls[i] = temp;
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

    // abstract methods, public because you can't override private methods in JS.
    initializeBalls() {}

    initializePlayers() {}

    // Draw to Canvas
    draw(ctx, offset=null) {
        // break line
        CanvasUtil.drawLine(ctx, 
            new Vector2D(Consts.breakLine, 46), 
            new Vector2D(Consts.breakLine, Consts.boardHeight-46), 
            1, "white"
        );        
        
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

    /** ================================ USER INPUT ================================ */
    shootCueBall(direction, strength) {
        if (this.ballsAreMoving || !this.ballIsPlaced) {
            return;
        }
        // invalid cases
        if ((direction.x == 0  && direction.y == 0) || strength == 0) {
            return;
        }

        // may choose to add velocity instead of set velocity in the future (explosives, cueball already moving)
        this.cueBall.vel = direction.getUnitVector().scale(strength); // max strength is 20?

        this.#startTurn();
    }

    // check if ball overlaps with any obstacles.
    isValidBallPlacement(position) {
        // check boundary 
        const border = 46 + Ball.RADIUS;
        if (position.x < border || position.y < border || 
            position.x > Consts.boardWidth - border || 
            position.y > Consts.boardHeight - border) {
            return false;
        }

        // check overlap
        let temp = new Ball(position.x, position.y);

        let arrToCheck = [this.balls, this.lines, this.holes];

        let checkFunctions = [
            (ball) => {return CollisionUtil.checkBallOverlap(temp, ball)},
            (line) => {return CollisionUtil.checkBallToLineOverlap(temp, line)},
            (hole) => {return CollisionUtil.checkBallInHole(temp, hole)}
        ]

        for (let i = 0; i < arrToCheck.length; i++) {
            let arr = arrToCheck[i];
            for (let j = 0; j < arr.length; j++) {
                if (checkFunctions[i](arr[j])) {
                    return false;
                }
            }
        }

        return true;
    }

    isValidCueBallPlacement(position) {
        if (!this.ballInHand || this.ballsAreMoving) {
            return false;
        }

        // break area
        if (this.turn == 1 && position.x > Consts.breakLine) { 
            return false;
        }

        return this.isValidBallPlacement(position);
    }

    placeCueBall(position) {
        if (!this.isValidCueBallPlacement(position)) {
            return false;
        }
        this.cueBall.pos = position;
        this.cueBall.resetState();
        this.ballIsPlaced = true;
        return true;
    }

    /** ================================ PHYSICS RELATED ================================ */

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
            let isMoving = this.#move(dt);
            if (this.ballsAreMoving && !isMoving) {
                this.#endTurn();
            }
            this.ballsAreMoving = isMoving;
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

    /** ================================ COLLISION RELATED ================================ */

    #checkCollisionLines() {
        let balls = this.balls;
        let lines = this.lines;
        for (let i = 0; i < balls.length; i++) {
            for (let j = 0; j < lines.length; j++) {
                if (balls[i].isFalling()) continue;
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
                if (balls[i].isFalling()) continue;
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
                if (a.isFalling() || b.isFalling()) {
                    continue;
                }
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
                if (a.isFalling() || b.isFalling())  {
                    continue;
                }
                // this needs to be done for weird cases such as balls hitting other balls through walls.
                this.#computeCollisionLines(); 
                let collided = CollisionUtil.computeBallCollision(a, b);

                // store the first ball that the cue ball hit
                if (i == 0 && collided && this.firstBallHit == null) {
                    this.firstBallHit = b;
                }
            }   
        }
    }

    #computeCollisionHoles() {
        let balls = this.balls;
        let holes = this.holes;
        for (let i = 0; i < balls.length; i++) {
            for (let j = 0; j < holes.length; j++) {
                if (CollisionUtil.checkBallInHole(balls[i], holes[j])) {
                    CollisionUtil.computeBallToHoleCollision(balls[i], holes[j]);
                    if (balls[i].isActive()) {
                        balls[i].setFalling();
                        this.#pocketBall(i);
                    }
                    if (MathUtil.dist(balls[i].pos, holes[j].pos) < Hole.RADIUS - Ball.RADIUS) {
                        balls[i].isFading = true;
                    }
                }
            }
        }
    }

    /** ================================ GAME LOGIC ================================ */

    #getCurrentPlayer() {
        return this.players[this.currentPlayerIndex];
    }

    // takes place right after ball is shot
    #startTurn() {
        this.ballInHand = false;
        this.firstBallHit = null;
        this.ballsPocketedThisTurn = [];
    }

    // takes place after all balls have settled
    #endTurn() {
        let currentPlayer = this.#getCurrentPlayer();

        if (this.#checkEightBallPocketed()) {
            if (this.#checkCueBallPocketed() || this.#checkFoul()) {
                currentPlayer.setLoss();
                this.ballInHand = true;
            }
            else if (this.firstBallHit.colour != Consts.eightBallColour) {
                currentPlayer.setLoss();
            }
            else {
                currentPlayer.setWin();
            }

            currentPlayer.endTurn = this.turn;
            if (this.#checkGameEnded()) {
                this.gameHasEnded = true;

                console.log("GAME OVER!");
                console.log(this.#getLeaderboard());
            }
            else {
                this.#proceedToNextTurn();
                this.#respawnEightBall();
            }
        }
        else if (this.#checkCueBallPocketed() || this.#checkFoul()) {
            this.#proceedToNextTurn();
            this.ballInHand = true;
        }
        else if (!this.#checkBallInPlayerSetPocketed()) {
            this.#proceedToNextTurn();
        }

        // colour is not determined on break, or if black ball goes in
        if (this.turn > 1 && !this.#checkEightBallPocketed()) {
            this.#determineColourFromShot(currentPlayer);
        }
        // adjust running ball counts
        // Note that this cannot be done during the turn, or else the player's set may change
        this.ballsPocketedThisTurn.forEach((ball) => {
            let colour = ball.colour;
            if (this.runningColourCount[colour]) {
                this.runningColourCount[colour]--;
            }
        });

        this.turn++;

        let msg = "Turn " + this.turn + "\nPlayer " + this.currentPlayerIndex + " to go";
        for (let i = 0; i < this.players.length; i++) {
            msg += "\nPlayer " + i + ": " + this.players[i].state + ", " + this.players[i].colour;
        }
        msg += "\nBall In Hand: " + this.ballInHand;
        console.log(msg);
        console.log(this.runningColourCount);
    }

    // Assume that there exists a player that is in play, otherwise an infinite loop will occur.
    #proceedToNextTurn() {
        do {
            this.currentPlayerIndex += 1;
            this.currentPlayerIndex %= this.players.length;
        } while(!this.#getCurrentPlayer().inPlay());
    }

    #pocketBall(index) {
        let ball = this.balls[index];
        let colour = ball.colour;
        this.ballsPocketedThisTurn.push(ball);
    }

    #respawnEightBall() {
        let pos = new Vector2D(0, 0);

        do {
            pos.x = RandomUtil.random() * Consts.boardWidth;
            pos.y = RandomUtil.random() * Consts.boardHeight;
        } while (!this.isValidBallPlacement(pos));
        
        // eight ball should be at index 1
        this.balls[1].pos = pos;
        this.balls[1].resetState();
    }

    // checks if the player is able to hit ball without incurring a foul
    checkBallInPlayerSet(ball) {
        let player = this.#getCurrentPlayer();
        if (player.colour != null) {
            if (this.runningColourCount[player.colour] > 0) {
                return ball.colour == player.colour;
            }
            else {
                return ball.colour == Consts.eightBallColour;
            }
        }
        else {
            let count = 0;
            for (let colour in this.runningColourCount) {
                if (this.#checkColourIsChosen(colour)) {
                    continue;
                }
                if (this.runningColourCount[colour] > 0 && colour == ball.colour) {
                    return true;
                }
                count += this.runningColourCount[colour];
            }
            // is used for the very rare case that the player has eliminated all balls without having their colour chosen.
            if (count == 0) {
                return ball.colour == Consts.eightBallColour;
            }
            return false;
        }
    }

    #checkGameEnded() {
        let cnt = 0;
        for (let i = 0; i < this.players.length; i++) {
            if (this.players[i].inPlay()) cnt++;
        }
        return cnt <= 1;
    }

    #getLeaderboard() {
        let lastPlayer;
        let winners = [];
        let losers = [];
        this.players.forEach((player) => {
            if (player.won()) {
                winners.push(player);
            }
            else if (player.lost()) {
                losers.push(player);
            }
            else {
                lastPlayer = player;
            }
        });
        winners.sort((a, b) => {return a.endTurn - b.endTurn}); // earliest -> latest winner
        losers.sort((a, b) => {return b.endTurn - a.endTurn}); // latest -> earliest loser
        return [...winners, lastPlayer, ...losers]; 
    }

    // tries to determine a player's colour based on the last shot
    #determineColourFromShot(player) {
        if (player.colour != null) {
            return;
        }
        let playerColour = null;
        for (let i = 0; i < this.ballsPocketedThisTurn.length; i++) {
            let colour = this.ballsPocketedThisTurn[i].colour;
            if (colour == Consts.cueBallColour || 
                colour == Consts.eightBallColour || 
                this.#checkColourIsChosen(colour)) {
                continue;
            }
            // ensure a unique unchosen colour is pocketed this turn.
            if (playerColour != null && colour != playerColour) {
                return;
            }
            playerColour = colour;
        }
        player.colour = playerColour;

        // uses process of elimination to determine colour for remaining players
        let lastPlayer = null;
        for (let i = 0; i < this.players.length; i++) {
            let player = this.players[i];
            if (player.colour == null) {
                if (lastPlayer != null) return;
                lastPlayer = player;
            }
        }
        for (let colour in this.runningColourCount) {
            if (!this.#checkColourIsChosen(colour)) {
                lastPlayer.colour = colour;
                return;
            }
        }
    }

    // check if a player has chosen this colour
    #checkColourIsChosen(colour) {
        for (let i = 0; i < this.players.length; i++) {
            if (colour == this.players[i].colour) {
                return true;
            }
        }
        return false;
    }

    // Check if an invalid shot was made (e.g. hitting opponents ball)
    #checkFoul() {
        if (this.firstBallHit == null) {
            return true;
        }
        return !this.checkBallInPlayerSet(this.firstBallHit);
    }

    #checkCueBallPocketed() {
        for (let i = 0; i < this.ballsPocketedThisTurn.length; i++) {
            if (this.ballsPocketedThisTurn[i] == this.cueBall) {
                this.ballIsPlaced = false;
                return true;
            }
        }
        return false;
    }

    #checkEightBallPocketed() {
        for (let i = 0; i < this.ballsPocketedThisTurn.length; i++) {
            if (this.ballsPocketedThisTurn[i].colour == Consts.eightBallColour) {
                return true;
            }
        }
        return false;
    }

    #checkBallInPlayerSetPocketed() {
        for (let i = 0; i < this.ballsPocketedThisTurn.length; i++) {
            if (this.checkBallInPlayerSet(this.ballsPocketedThisTurn[i])) {
                return true;
            }
        }
        return false;
    }
}