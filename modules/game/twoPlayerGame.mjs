import { Vector2D } from "../util/vector2D.mjs";
import { Ball } from "../game_objects/ball.mjs";
import { Consts } from "../consts.mjs";
import { Player } from "./player.mjs";
import { ClassicGame } from "./classicGame.mjs";

export class TwoPlayerGame extends ClassicGame {

    constructor(seed=0) {
        super(seed);
        // this.testCase();
    }

    testCase() {
        let balls = this.balls;
        // balls[0].pos = new Vector2D(856.4322258916669, 338.89962440869635)
        // balls[1].pos = new Vector2D(564.6481097526154, 323.2375361544168)
        // balls[2].pos = new Vector2D(418.26044614330846, 365.75353435145223)
        // balls[3].pos = new Vector2D(499.9507164612502, 367.6205428384135)
        // balls[4].pos = new Vector2D(88.26784820869159, 160.39798568029465)
        // balls[5].pos = new Vector2D(542.1262427693463, 389.7788168814025)
        // balls[6].pos = new Vector2D(386.7673360739973, 214.60078715791204)
        // balls[7].pos = new Vector2D(408.41804941443934, 271.58104680216877)
        // balls[8].pos = new Vector2D(392.152574562932, 169.37519682068097)
        // balls[9].pos = new Vector2D(404.0539428150367, 311.59692983538736)
        // balls[10].pos = new Vector2D(366.30004839559103, 251.52228453173342)
        // balls[11].pos = new Vector2D(353.6384815218505, 182.68405308936227)
        // balls[12].pos = new Vector2D(367.60474039688637, 293.4957617092476)
        // balls[13].pos = new Vector2D(274.5390799626864, 125.58204897578018)
        // balls[14].pos = new Vector2D(320.1407690438606, 295.27063240580986)
        // balls[15].pos = new Vector2D(287.5990077848266, 271.58561748357675)
    }

    initializeBalls() {
        /** Break Orientation of 15 balls **/
        let breakOffset = new Vector2D(700, 250);
        for (let i = 0; i < 5; i++) {
            for (let j = i%2; j <= i; j += 2) {
                let p1 = new Vector2D(i*Math.sqrt(3), j).scale(Ball.RADIUS).add(breakOffset);
                let p2 = new Vector2D(i*Math.sqrt(3), -j).scale(Ball.RADIUS).add(breakOffset);

                if (j != 0) {
                    this.balls.push(new Ball(p2.x, p2.y, Consts.playerColours[0]));
                    this.balls.push(new Ball(p1.x, p1.y, Consts.playerColours[1]));
                }
                else {
                    this.balls.push(new Ball(p2.x, p2.y, Consts.playerColours[(i ? 0 : 1)]));
                }
            }
        }
        // set middle ball to 8 ball, and bring to index 1
        this.balls[4].colour = Consts.eightBallColour;
        [this.balls[1], this.balls[4]] = [this.balls[4], this.balls[1]];
    }

    initializePlayers() {
        for (let i = 0; i < 2; i++) {
            this.players.push(new Player());
            this.runningColourCount[Consts.playerColours[i]] = 7;
        }
    }
}