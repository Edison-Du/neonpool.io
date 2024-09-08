import { Consts } from "../consts.mjs";
import { Ball } from "../game_objects/ball.mjs"
import { Hole } from "../game_objects/hole.mjs";
import { LineSegment } from "../game_objects/lineSegment.mjs";
import { RandomUtil } from "./randomUtil.mjs";
import { Vector2D } from "./vector2D.mjs";

/**
 * Should be added at the end of the constructor in ClassicGame.
 * Primarily used to test the math.
 */
export class TestUtil {

    static #simpleBreak_15(balls) {
        balls.push(new Ball(100, 250, "white"));
        let offset = new Vector2D(300, 250);
        for (let i = 4; i >= 0; i--) {
            for (let j = i%2; j <= i; j += 2) {
                let p1 = new Vector2D(i*Math.sqrt(3), j).scale(Ball.RADIUS).add(offset);
                let p2 = new Vector2D(i*Math.sqrt(3), -j).scale(Ball.RADIUS).add(offset);

                if (j != 0) {
                    balls.push(new Ball(p2.x, p2.y, "red"));
                    balls.push(new Ball(p1.x, p1.y, "red"));
                }
                else {
                    balls.push(new Ball(p2.x, p2.y, "red"));
                }
            }
        }
    }

    static #simpleBreak_21(balls) {
        balls.push(new Ball(100, 250, "white"));
        let offset = new Vector2D(300, 250);
        for (let i = 5; i >= 0; i--) {
            for (let j = i%2; j <= i; j += 2) {
                let p1 = new Vector2D(i*Math.sqrt(3), j).scale(Ball.RADIUS).add(offset);
                let p2 = new Vector2D(i*Math.sqrt(3), -j).scale(Ball.RADIUS).add(offset);
        
                if (j != 0) {
                    balls.push(new Ball(p2.x, p2.y, "red"));
                    balls.push(new Ball(p1.x, p1.y, "red"));
                }
                else {
                    balls.push(new Ball(p2.x, p2.y, "red"));
                }
            }
        }
    }

    static #fourPlayerBreakAndShuffle(balls) {
        balls.push(new Ball(Consts.breakLine, Consts.boardHeight/2, Consts.cueBallColour));

        /** Break Orientation of 21 balls **/
        let breakOffset = new Vector2D(700, 250);
        for (let i = 0; i < 6; i++) {
            for (let j = i%2; j <= i; j += 2) {
                let p1 = new Vector2D(i*Math.sqrt(3), j).scale(Ball.RADIUS).add(breakOffset);
                let p2 = new Vector2D(i*Math.sqrt(3), -j).scale(Ball.RADIUS).add(breakOffset);

                if (j != 0) {
                    balls.push(new Ball(p2.x, p2.y, Consts.playerColours[0]));
                    balls.push(new Ball(p1.x, p1.y, Consts.playerColours[0]));
                }
                else {
                    balls.push(new Ball(p2.x, p2.y, Consts.playerColours[0]));
                }
            }
        }
        // set middle ball to 8 ball, and bring to index 1
        balls[11].colour = Consts.eightBallColour;
        [balls[1], balls[11]] = [balls[11], balls[1]];

        // distribute ball colours
        for (let i = 2; i < balls.length; i++) {
            balls[i].colour = Consts.playerColours[i%4];
        }

        // shuffle the ball colours
        for (let i = balls.length-1; i > 2; i--) {
            let index = Math.floor(RandomUtil.random()*(i-2))+2;
            let temp = balls[index].colour;
            balls[index].colour = balls[i].colour;
            balls[i].colour = temp;
        }

        // shuffle the balls themselves for unique collision upon break
        // Note that the cue ball and eight-ball have fixed positions.
        for (let i = balls.length-1; i > 2; i--) {
            let index = Math.floor(RandomUtil.random()*(i-2))+2;
            let temp = balls[index];
            balls[index] = balls[i];
            balls[i] = temp;
        }
    }

    static weirdSwirlingDotProductTest(game) {
        Ball.RADIUS = 20;
        Consts.elasticity = 1;

        game.balls = [
            new Ball(76.71094956688371, 252.92236640132177, "red"),
            new Ball(46.36193775646933,  228.04033460205426, "red")
        ];
        game.balls[0].vel = new Vector2D(0.24981693911407152, -4.793494706050241);
        game.balls[1].vel = new Vector2D(0.27819812986954195,-1.2283956705196668);
        
        game.lines = [];
        game.holes = [];
    }

    static touchingBallsCollisionTest(game) {
        Ball.RADIUS = 20;
        Consts.elasticity = 1;

        game.balls = [
            new Ball(168.380452299559661, 179.61326903329226, "red"),
            new Ball(148.54772393911512,  144.8762155344588, "red")
        ];
        
        game.lines = [];
        game.holes = [];
    }

    static newtonsCradleCollisionTest(game) {
        Ball.RADIUS = 20;
        Consts.elasticity = 1;

        game.balls = [ 
            new Ball(220, 100, "red"), 
            new Ball(180, 100, "blue"),
            new Ball(140, 100, "yellow")];

        game.balls[0].vel = new Vector2D(20, 0);
    }

    static overlappingAimerTest(game) {
        Ball.RADIUS = 20;
        Consts.elasticity = 1;

        game.balls = []
        this.#simpleBreak_15(game.balls);
        game.cueBall = game.balls[0];

        let balls = game.balls;
        balls[0].pos = new Vector2D(856.4322258916669, 338.89962440869635);
        balls[1].pos = new Vector2D(564.6481097526154, 323.2375361544168);
        balls[2].pos = new Vector2D(418.26044614330846, 365.75353435145223);
        balls[3].pos = new Vector2D(499.9507164612502, 367.6205428384135);
        balls[4].pos = new Vector2D(88.26784820869159, 160.39798568029465);
        balls[5].pos = new Vector2D(542.1262427693463, 389.7788168814025);
        balls[6].pos = new Vector2D(386.7673360739973, 214.60078715791204);
        balls[7].pos = new Vector2D(408.41804941443934, 271.58104680216877);
        balls[8].pos = new Vector2D(392.152574562932, 169.37519682068097);
        balls[9].pos = new Vector2D(404.0539428150367, 311.59692983538736);
        balls[10].pos = new Vector2D(366.30004839559103, 251.52228453173342);
        balls[11].pos = new Vector2D(353.6384815218505, 182.68405308936227);
        balls[12].pos = new Vector2D(367.60474039688637, 293.4957617092476);
        balls[13].pos = new Vector2D(274.5390799626864, 125.58204897578018);
        balls[14].pos = new Vector2D(320.1407690438606, 295.27063240580986);
        balls[15].pos = new Vector2D(287.5990077848266, 271.58561748357675);
    }

    static newtonsCradleThroughWallCollisionTest(game) {
        Ball.RADIUS = 20;
        Consts.elasticity = 1;

        game.lines = [
            new LineSegment(600, 100, 700, 300, "brown"),
            new LineSegment(600, 100, 700, 100, "brown"),
            new LineSegment(200,  50, 200, 350, "brown")
        ];

        game.balls = [
            new Ball(100, 100, "white"),
            new Ball(220, 100, "red"),
            new Ball(180, 100, "blue"),
            new Ball(140, 100, "yellow")
        ]

        game.cueBall = game.balls[0];
    }

    static twoCloseWallsCollisionTest(game) {
        Ball.RADIUS = 20;

        game.balls = [new Ball(100, 100, "white")];
        game.cueBall = game.balls[0];

        game.lines = [
            new LineSegment(600, 100, 700, 300, "brown"),
            new LineSegment(600, 100, 701, 300, "brown")
        ];
    }
    
    static edgeOfWallAimerTest(game) {
        Ball.RADIUS = 20;

        game.balls = [new Ball(896.4189667694121, 241.3458000040911, "white")];
        game.cueBall = game.balls[0];

        game.lines = [
            new LineSegment(600, 100, 700, 300, "brown"),
            new LineSegment(600, 100, 700, 100, "brown"),
        ];
    }

    static edgeOfWallAimerTestV2(game) {
        Ball.RADIUS = 20;

        game.balls = [new Ball(847.2092660164719, 422.28821858011946, "white")];
        game.cueBall = game.balls[0];

        game.lines = [
            new LineSegment(600, 100, 700, 300, "brown"),
            new LineSegment(600, 100, 700, 100, "brown"),
        ];
    }

    static lineEndpointPrioritizationAimerTest(game) {
        Ball.RADIUS = 20;

        game.balls = [new Ball(773.2425534583451, 450.7731407102569, "white")];
        game.cueBall = game.balls[0];

        game.lines = [
            new LineSegment(600, 100, 700, 300, "brown")
        ];
    }

    static parallelLinesAimerTest(game) {
        Ball.RADIUS = 20;

        game.balls = [new Ball(100, 100, "white")];
        game.cueBall = game.balls[0];

        game.lines = [
            new LineSegment(500, 100, 600, 100, "brown")
        ];
    }

    static twoBallsFallingInSameTimeHoleTest(game) {
        Ball.RADIUS = 15;
        Consts.elasticity = 1;

        game.balls = [];
        this.#simpleBreak_21(game.balls);
        game.cueBall = game.balls[0];

        game.holes = [new Hole(50, 50), new Hole(100, 200), new Hole(700, 100)];

        game.lines = [
            new LineSegment(10, 10, Consts.boardWidth-10, 10, "black"), 
            new LineSegment(10, 10, 10, Consts.boardHeight-10, "black"),
            new LineSegment(Consts.boardWidth-10, 10, Consts.boardWidth-10, Consts.boardHeight-10, "black"),
            new LineSegment(10, Consts.boardHeight-10, Consts.boardWidth-10, Consts.boardHeight-10, "black"),
            new LineSegment(600, 100, 700, 300, "black"),
            new LineSegment(500, 100, 600, 100, "black")
        ];

        let balls = game.balls;
        balls[0].pos = new Vector2D(498.6158841234245, 122.94793557388402)
        balls[1].pos = new Vector2D(411.5938425445668, 416.2995145064672)
        balls[2].pos = new Vector2D(595.4403497643563, 290.5727368523424)
        balls[3].pos = new Vector2D(454.82595815085466, 182.83611731162023)
        balls[4].pos = new Vector2D(661.3672906411468, 329.80818829292093)
        balls[5].pos = new Vector2D(431.6674097899037, 86.12075753030204)
        balls[6].pos = new Vector2D(93.03981220735844, 431.9459071058042)
        balls[7].pos = new Vector2D(416.6923106857432, 230.24362069230446)
        balls[8].pos = new Vector2D(425.61883847800186, 359.6848170009521)
        balls[9].pos = new Vector2D(568.7671256585563, 333.5552617664937)
        balls[10].pos = new Vector2D(338.82812030023604, 157.77796731964585)
        balls[11].pos = new Vector2D(468.3443226810903, 463.5147403070148)
        balls[12].pos = new Vector2D(385.3449152474135, 249.93579188853937)
        balls[13].pos = new Vector2D(344.17930962910185, 284.3130720291836)
        balls[14].pos = new Vector2D(404.80624350369266, 199.43913574486436)
        balls[15].pos = new Vector2D(403.09135207701036, 298.2251866732948)
        balls[16].pos = new Vector2D(325.99806742933805, 400.0993841036647)
        balls[17].pos = new Vector2D(362.5798446771014, 192.2050275166799)
        balls[18].pos = new Vector2D(263.1869555754129, 326.786475243301)
        balls[19].pos = new Vector2D(406.0671669044976, 384.5790693438721)
        balls[20].pos = new Vector2D(107.50254925204688, 36.35689367724756)
        balls[21].pos = new Vector2D(128.23863121726106, 266.78032104211735)

        balls[0].vel = new Vector2D(-13.28817876540872, 14.94738455712372)
    }

    static twoBallsFallingInSameTimeHoleTestV2(game) {
        Ball.RADIUS = 15;
        Consts.elasticity = 1;

        game.balls = [];
        this.#simpleBreak_21(game.balls);
        game.cueBall = game.balls[0];

        game.holes = [new Hole(50, 50), new Hole(100, 200), new Hole(700, 100)];

        game.lines = [
            new LineSegment(10, 10, Consts.boardWidth-10, 10, "black"), 
            new LineSegment(10, 10, 10, Consts.boardHeight-10, "black"),
            new LineSegment(Consts.boardWidth-10, 10, Consts.boardWidth-10, Consts.boardHeight-10, "black"),
            new LineSegment(10, Consts.boardHeight-10, Consts.boardWidth-10, Consts.boardHeight-10, "black"),
            new LineSegment(600, 100, 700, 300, "black"),
            new LineSegment(500, 100, 600, 100, "black")
        ];

        let balls = game.balls;
        balls[0].pos = new Vector2D(809.5182423230692, 70.38160474385938)
        balls[1].pos = new Vector2D(729.1194783184694, 449.77769502355784)
        balls[2].pos = new Vector2D(100.00000000000006, 199.99999999999994)
        balls[3].pos = new Vector2D(50.00000000000002, 49.99999999999976)
        balls[4].pos = new Vector2D(955.5282550463862, 398.75608363621484)
        balls[5].pos = new Vector2D(741.9006509117736, 371.2246083431258)
        balls[6].pos = new Vector2D(884.8908653465028, 197.4536203051531)
        balls[7].pos = new Vector2D(491.402586552157, 374.20214552913086)
        balls[8].pos = new Vector2D(666.5354346628136, 73.842373872988)
        balls[9].pos = new Vector2D(547.5996517042497, 430.14237398950655)
        balls[10].pos = new Vector2D(699.9999999999999, 99.99999999999999)
        balls[11].pos = new Vector2D(640.6622837040743, 385.33476481685045)
        balls[12].pos = new Vector2D(50, 50)
        balls[13].pos = new Vector2D(576.5147120564208, 406.73070659775846)
        balls[14].pos = new Vector2D(367.0509652833182, 468.2927695162253)
        balls[15].pos = new Vector2D(657.230231629252, 259.4147812215152)
        balls[16].pos = new Vector2D(102.4162103274395, 122.78344588231383)
        balls[17].pos = new Vector2D(855.0247562895278, 384.19944634573193)
        balls[18].pos = new Vector2D(799.0552096007073, 375.06618809886714)
        balls[19].pos = new Vector2D(500.3211558527778, 37.40103739086836)
        balls[20].pos = new Vector2D(699.9999999999998, 100.00000000000009)
        balls[21].pos = new Vector2D(334.86577944108274, 464.57501570907334)
        
        balls[0].vel = new Vector2D(-19.88124380214861, -2.176268567876537)
    }

    static ballTouchesEdgeHoleTest(game) {
        Ball.RADIUS = 15;
        Ball.FRICTION = 0.05;
        Consts.elasticity = 1;

        game.balls = [];
        this.#simpleBreak_21(game.balls);
        game.cueBall = game.balls[0];

        game.holes = [new Hole(50, 50), new Hole(100, 200), new Hole(700, 100)];

        game.lines = [
            new LineSegment(10, 10, Consts.boardWidth-10, 10, "black"), 
            new LineSegment(10, 10, 10, Consts.boardHeight-10, "black"),
            new LineSegment(Consts.boardWidth-10, 10, Consts.boardWidth-10, Consts.boardHeight-10, "black"),
            new LineSegment(10, Consts.boardHeight-10, Consts.boardWidth-10, Consts.boardHeight-10, "black"),
            new LineSegment(600, 100, 700, 300, "black"),
            new LineSegment(500, 100, 600, 100, "black")
        ];

        let balls = game.balls;
        balls[0].pos = new Vector2D(332.3086085047554, 182.99246331837278)
        balls[1].pos = new Vector2D(950.7888169052608, 424.3433401486238)
        balls[2].pos = new Vector2D(628.906026794558, 276.5055763316165)
        balls[3].pos = new Vector2D(950.3220993728307, 126.24187415115942)
        balls[4].pos = new Vector2D(625.4308396129178, 463.33226291505304)
        balls[5].pos = new Vector2D(927.9866252310006, 337.62545820149927)
        balls[6].pos = new Vector2D(896.0019262707089, 361.7673439237367)
        balls[7].pos = new Vector2D(642.6353920313657, 431.17717727344296)
        balls[8].pos = new Vector2D(511.09803323847757, 382.9652297675113)
        balls[9].pos = new Vector2D(386.2871244462583, 122.13334834125544)
        balls[10].pos = new Vector2D(84.195067881023, 140.06391484713407)
        balls[11].pos = new Vector2D(445.7111040376389, 309.4106605317439)
        balls[12].pos = new Vector2D(446.1133314433911, 347.0779415515692)
        balls[13].pos = new Vector2D(477.494151251509, 330.5032228778587)
        balls[14].pos = new Vector2D(146.89584079846327, 137.00101111722878)
        balls[15].pos = new Vector2D(50.76270627240973, 50.184179103909294)
        balls[16].pos = new Vector2D(699.9045527920866, 99.9542332043237)
        balls[17].pos = new Vector2D(699.9807822991796, 99.9656788340769)
        balls[18].pos = new Vector2D(99.98038746021301, 200.00948111292385)
        balls[19].pos = new Vector2D(99.97865716089628, 199.9644868146278)
        balls[20].pos = new Vector2D(50.00932766420303, 49.99108884506571)
        balls[21].pos = new Vector2D(100.12094823801779, 200.02022970284554)

        balls[0].vel = new Vector2D(11.237439449987718, -16.544484114285936)
    }

    static ballMovingAfterLongTimeInHoleTest(game) {
        Ball.RADIUS = 15;
        Ball.FRICTION = 0.05;
        Consts.elasticity = 1;

        game.balls = [];
        this.#simpleBreak_21(game.balls);
        game.cueBall = game.balls[0];

        game.holes = [new Hole(50, 50), new Hole(100, 200), new Hole(700, 100)];

        game.lines = [
            new LineSegment(10, 10, Consts.boardWidth-10, 10, "black"), 
            new LineSegment(10, 10, 10, Consts.boardHeight-10, "black"),
            new LineSegment(Consts.boardWidth-10, 10, Consts.boardWidth-10, Consts.boardHeight-10, "black"),
            new LineSegment(10, Consts.boardHeight-10, Consts.boardWidth-10, Consts.boardHeight-10, "black"),
            new LineSegment(600, 100, 700, 300, "black"),
            new LineSegment(500, 100, 600, 100, "black")
        ];

        game.balls[0].vel = new Vector2D(15.879609977038012, 12.158864543087681);  
    }

    static doubleCollisionHittingBallNearEdgeTest(game) {
        Ball.RADIUS = 15;
        Ball.FRICTION = 0.05;
        Consts.elasticity = 1;

        game.balls = [];
        this.#simpleBreak_15(game.balls);
        game.cueBall = game.balls[0];

        // Use Cue Ball to hit the ball at the top (10 o'clock) so it goes directly left
        let balls = game.balls;
        balls[0].pos = new Vector2D(640.3614061340904, 141.40705803776507)
        balls[1].pos = new Vector2D(679.8741803179529, 277.8878024963153)
        balls[2].pos = new Vector2D(642.380063075623, 172.17795511484627)
        balls[3].pos = new Vector2D(789.7823626130559, 327.39916293960806)
        balls[4].pos = new Vector2D(564.2930421373665, 73.59784671640308)
        balls[5].pos = new Vector2D(722.7713233411617, 391.0843914795096)
        balls[6].pos = new Vector2D(706.1356833705574, 264.91493403036526)
        balls[7].pos = new Vector2D(781.5989672045854, 267.8998271120471)
        balls[8].pos = new Vector2D(745.3382059805217, 149.45690991697452)
        balls[9].pos = new Vector2D(698.1722611760778, 412.0867657409604)
        balls[10].pos = new Vector2D(748.8387913633854, 295.80453324455715)
        balls[11].pos = new Vector2D(718.6268062923649, 142.7128793698482)
        balls[12].pos = new Vector2D(502.55455178115267, 381.0017778080927)
        balls[13].pos = new Vector2D(407.3409126190954, 331.4637868149021)
        balls[14].pos = new Vector2D(652.2501589454832, 439.5277645683747)
        balls[15].pos = new Vector2D(515.6288447107848, 241.2289570362635)
    }

    static doubleCollisionHittingBallNearEdgeTestV2(game) {
        Ball.RADIUS = 15;
        Ball.FRICTION = 0.05;
        Consts.elasticity = 1;

        game.balls = [];
        this.#simpleBreak_15(game.balls);
        game.cueBall = game.balls[0];

        // Watch first ball hit at bottom
        let balls = game.balls;
        balls[0].pos = new Vector2D(576.4996465479767, 96.08223905557128)
        balls[1].pos = new Vector2D(857.4733144562352, 424.3642320551454)
        balls[2].pos = new Vector2D(729.6134428425052, 188.81143408773377)
        balls[3].pos = new Vector2D(754.3613479702707, 395.36594535209923)
        balls[4].pos = new Vector2D(500.00000000000057, 469.9999999999997)
        balls[5].pos = new Vector2D(711.3732762969354, 401.7340818843784)
        balls[6].pos = new Vector2D(775.421056951154, 196.0124223091102)
        balls[7].pos = new Vector2D(799.6533746685301, 278.0992471924053)
        balls[8].pos = new Vector2D(703.4380477937771, 60.5565762448357)
        balls[9].pos = new Vector2D(827.8181444968161, 320.79597694349536)
        balls[10].pos = new Vector2D(721.5118555473305, 264.9433615009885)
        balls[11].pos = new Vector2D(661.4546700469742, 67.63049169648063)
        balls[12].pos = new Vector2D(799.2691625775319, 243.19878153370416)
        balls[13].pos = new Vector2D(435.43307803495446, 424.4368574584086)
        balls[14].pos = new Vector2D(658.0779283714038, 389.1433051172482)
        balls[15].pos = new Vector2D(763.6137187620445, 332.9875039674061)
        balls[0].vel = new Vector2D(-5.229685780924716, 14.944725861561942)
    }

    static breakLagTest(game) {
        Ball.RADIUS = 13;
        Ball.FRICTION = 0.03;
        Consts.elasticity = 0.95;
        RandomUtil.seed(1447706);

        // aim directly at the break
        game.balls = [];
        this.#fourPlayerBreakAndShuffle(game.balls);
        game.cueBall = game.balls[0];
    }

    static breakLagTestV2(game) {
        Ball.RADIUS = 13;
        Ball.FRICTION = 0.03;
        Consts.elasticity = 0.95;
        RandomUtil.seed(161011);

        game.balls = [];
        this.#fourPlayerBreakAndShuffle(game.balls);
        game.cueBall = game.balls[0];
        game.cueBall.vel = new Vector2D(19.999634180172333, 0.12096552931555846)
    }

    // make sure holes and polygons are set to state at 2024-08-06
    static turnEndingTwiceTest(game) {
        Ball.RADIUS = 13;
        Ball.FRICTION = 0.03;
        Consts.elasticity = 0.95;
        RandomUtil.seed(314402);
        let ball;
        game.balls = [];
        ball = new Ball(872.4134927172241, 122.52141871418493, "white");
        ball.glow = "white";ball.opacity = 1;ball.state = 1;ball.isFading = false;
        game.balls.push(ball);
        ball = new Ball(938.612455715914, 67.84044675735173, "#302352");
        ball.glow = "#00FFF8";ball.opacity = 1;ball.state = 1;ball.isFading = false;
        game.balls.push(ball);
        ball = new Ball(669.273007660892, 430.8655573622441, "#ffd587");
        ball.glow = "#FFD400";ball.opacity = 1;ball.state = 1;ball.isFading = false;
        game.balls.push(ball);
        ball = new Ball(772.9543130053672, 400.6265556454379, "#59ff88");
        ball.glow = "#26FF00";ball.opacity = 1;ball.state = 1;ball.isFading = false;
        game.balls.push(ball);
        ball = new Ball(238.6084910794436, 186.47919693087698, "#ec2b7f");
        ball.glow = "#FF0068";ball.opacity = 1;ball.state = 1;ball.isFading = false;
        game.balls.push(ball);
        ball = new Ball(878.3903768959175, 184.02493397415736, "#31bdff");
        ball.glow = "#09C3FC";ball.opacity = 1;ball.state = 1;ball.isFading = false;
        game.balls.push(ball);
        ball = new Ball(564.5293701768578, 350.7498488875035, "#ffd587");
        ball.glow = "#FFD400";ball.opacity = 1;ball.state = 1;ball.isFading = false;
        game.balls.push(ball);
        ball = new Ball(595.8872703669423, 369.1014126366689, "#59ff88");
        ball.glow = "#26FF00";ball.opacity = 1;ball.state = 1;ball.isFading = false;
        game.balls.push(ball);
        ball = new Ball(729.7648789777501, 137.6661684407571, "#ec2b7f");
        ball.glow = "#FF0068";ball.opacity = 1;ball.state = 1;ball.isFading = false;
        game.balls.push(ball);
        ball = new Ball(819.9171001882808, 202.771744119088, "#31bdff");
        ball.glow = "#09C3FC";ball.opacity = 1;ball.state = 1;ball.isFading = false;
        game.balls.push(ball);
        ball = new Ball(738.7267366611751, 168.22096460135563, "#ffd587");
        ball.glow = "#FFD400";ball.opacity = 1;ball.state = 1;ball.isFading = false;
        game.balls.push(ball);
        ball = new Ball(959.9999999999999, 460.0000000000001, "#59ff88");
        ball.glow = "#26FF00";ball.opacity = 0;ball.state = 2;ball.isFading = true;
        game.balls.push(ball);
        ball = new Ball(672.6095293312303, 363.61124703023, "#ec2b7f");
        ball.glow = "#FF0068";ball.opacity = 1;ball.state = 1;ball.isFading = false;
        game.balls.push(ball);
        ball = new Ball(672.7628305533184, 293.7740942802089, "#31bdff");
        ball.glow = "#09C3FC";ball.opacity = 1;ball.state = 1;ball.isFading = false;
        game.balls.push(ball);
        ball = new Ball(707.4316004427355, 271.7846668256579, "#ffd587");
        ball.glow = "#FFD400";ball.opacity = 1;ball.state = 1;ball.isFading = false;
        game.balls.push(ball);
        ball = new Ball(657.709603706885, 208.14913353198776, "#59ff88");
        ball.glow = "#26FF00";ball.opacity = 1;ball.state = 1;ball.isFading = false;
        game.balls.push(ball);
        ball = new Ball(585.1371443878617, 315.77420673646975, "#ec2b7f");
        ball.glow = "#FF0068";ball.opacity = 1;ball.state = 1;ball.isFading = false;
        game.balls.push(ball);
        ball = new Ball(774.6365034419921, 168.92592939668617, "#31bdff");
        ball.glow = "#09C3FC";ball.opacity = 1;ball.state = 1;ball.isFading = false;
        game.balls.push(ball);
        ball = new Ball(469.15196439646996, 157.78161738672378, "#ffd587");
        ball.glow = "#FFD400";ball.opacity = 1;ball.state = 1;ball.isFading = false;
        game.balls.push(ball);
        ball = new Ball(500, 470, "#59ff88");
        ball.glow = "#26FF00";ball.opacity = 0;ball.state = 2;ball.isFading = true;
        game.balls.push(ball);
        ball = new Ball(841.670029467872, 410.6283198812063, "#ec2b7f");
        ball.glow = "#FF0068";ball.opacity = 1;ball.state = 1;ball.isFading = false;
        game.balls.push(ball);
        ball = new Ball(809.0914862386611, 133.75305815771281, "#31bdff");
        ball.glow = "#09C3FC";ball.opacity = 1;ball.state = 1;ball.isFading = false;
        game.balls.push(ball);
        game.cueBall = game.balls[0];
        game.shootCueBall(new Vector2D(72.95236094131258, -64.96044310442883), 2.166666666666667);

        /**
         * Notes on this test case. 2024-08-06
         * 1. When debugging, printing out ball objects is inaccurate, 
         *    it is better to print properties directly or call toString().
         *       See: https://bambielli.com/til/2017-01-31-console-log-incorrect/
         *            https://stackoverflow.com/questions/4057440/is-chrome-s-javascript-console-lazy-about-evaluating-objects
         * 2. Explanation of bug: 
         *      a. The turn ends when all the balls are either not moving, or have an opacity of 0.
         *      b. The black ball was pocketed. It's opacity reached 0 but it still had velocity.
         *      c. When the black ball respawned, it's velocity was not set to 0 and it kept moving.
         *      d. Eventually, friction stopped the black ball, causing the turn to end again.
         *      e. Two players were eliminated because the turn was never started, meaning the array of 
         *         pocketed balls was not cleared from b).
         *    This was fixed by setting the balls velocity to 0 upon resetState. If I wanted to be extra certain a bug of
         *    this type never happens again, I could break out of the simulation loop once balls aren't moving anymore,
         *    so endTurn isn't called again when a ball is magically moving after it stopped moving. 
         *    However, I am confident that the movement logic is correct and that this won't be necessary.      
         */
    }

    static ballSlightOverlapAimerPrecisionTest(game) {
        Ball.RADIUS = 13;
        Ball.FRICTION = 0.03;
        Consts.elasticity = 0.95;
        RandomUtil.seed(993776);
        let ball;
        game.balls = [];
        ball = new Ball(275, 250, "white");
        ball.glow = "white";ball.opacity = 1;ball.state = 1;ball.isFading = false;
        game.balls.push(ball);
        ball = new Ball(790.0666419935816, 250, "#302352");
        ball.glow = "#00FFF8";ball.opacity = 1;ball.state = 1;ball.isFading = false;
        game.balls.push(ball);
        ball = new Ball(790.0666419935816, 302, "#ffd587");
        ball.glow = "#FFD400";ball.opacity = 1;ball.state = 1;ball.isFading = false;
        game.balls.push(ball);
        ball = new Ball(767.5499814951862, 263, "#59ff88");
        ball.glow = "#26FF00";ball.opacity = 1;ball.state = 1;ball.isFading = false;
        game.balls.push(ball);
        ball = new Ball(700, 250, "#ec2b7f");
        ball.glow = "#FF0068";ball.opacity = 1;ball.state = 1;ball.isFading = false;
        game.balls.push(ball);
        ball = new Ball(812.5833024919771, 211, "#31bdff");
        ball.glow = "#09C3FC";ball.opacity = 1;ball.state = 1;ball.isFading = false;
        game.balls.push(ball);
        ball = new Ball(767.5499814951862, 289, "#ffd587");
        ball.glow = "#FFD400";ball.opacity = 1;ball.state = 1;ball.isFading = false;
        game.balls.push(ball);
        ball = new Ball(745.0333209967908, 250, "#59ff88");
        ball.glow = "#26FF00";ball.opacity = 1;ball.state = 1;ball.isFading = false;
        game.balls.push(ball);
        ball = new Ball(812.5833024919771, 315, "#ec2b7f");
        ball.glow = "#FF0068";ball.opacity = 1;ball.state = 1;ball.isFading = false;
        game.balls.push(ball);
        ball = new Ball(767.5499814951862, 237, "#31bdff");
        ball.glow = "#09C3FC";ball.opacity = 1;ball.state = 1;ball.isFading = false;
        game.balls.push(ball);
        ball = new Ball(812.5833024919771, 185, "#ffd587");
        ball.glow = "#FFD400";ball.opacity = 1;ball.state = 1;ball.isFading = false;
        game.balls.push(ball);
        ball = new Ball(812.5833024919771, 263, "#59ff88");
        ball.glow = "#26FF00";ball.opacity = 1;ball.state = 1;ball.isFading = false;
        game.balls.push(ball);
        ball = new Ball(812.5833024919771, 289, "#ec2b7f");
        ball.glow = "#FF0068";ball.opacity = 1;ball.state = 1;ball.isFading = false;
        game.balls.push(ball);
        ball = new Ball(745.0333209967908, 224, "#31bdff");
        ball.glow = "#09C3FC";ball.opacity = 1;ball.state = 1;ball.isFading = false;
        game.balls.push(ball);
        ball = new Ball(790.0666419935816, 276, "#ffd587");
        ball.glow = "#FFD400";ball.opacity = 1;ball.state = 1;ball.isFading = false;
        game.balls.push(ball);
        ball = new Ball(790.0666419935816, 198, "#59ff88");
        ball.glow = "#26FF00";ball.opacity = 1;ball.state = 1;ball.isFading = false;
        game.balls.push(ball);
        ball = new Ball(745.0333209967908, 276, "#ec2b7f");
        ball.glow = "#FF0068";ball.opacity = 1;ball.state = 1;ball.isFading = false;
        game.balls.push(ball);
        ball = new Ball(722.5166604983954, 237, "#31bdff");
        ball.glow = "#09C3FC";ball.opacity = 1;ball.state = 1;ball.isFading = false;
        game.balls.push(ball);
        ball = new Ball(722.5166604983954, 263, "#ffd587");
        ball.glow = "#FFD400";ball.opacity = 1;ball.state = 1;ball.isFading = false;
        game.balls.push(ball);
        ball = new Ball(812.5833024919771, 237, "#59ff88");
        ball.glow = "#26FF00";ball.opacity = 1;ball.state = 1;ball.isFading = false;
        game.balls.push(ball);
        ball = new Ball(767.5499814951862, 211, "#ec2b7f");
        ball.glow = "#FF0068";ball.opacity = 1;ball.state = 1;ball.isFading = false;
        game.balls.push(ball);
        ball = new Ball(790.0666419935816, 224, "#31bdff");
        ball.glow = "#09C3FC";ball.opacity = 1;ball.state = 1;ball.isFading = false;
        game.balls.push(ball);
        game.cueBall = game.balls[0];
        game.shootCueBall(new Vector2D(523.048780487805, -4.146341463414615), 5);
        /**
         * Fixed by accepting the negative value of t in AimerUtil.#targetCloserBall.
         * The balls overlap very slightly, and the computed value for the cue ball before collision
         * goes backwards.
         */
    }

    static ballPocketedVerySlowlyTest(game) {
        Ball.RADIUS = 13;
        Ball.FRICTION = 0.03;
        Consts.elasticity = 0.95;
        RandomUtil.seed(240081);
        let ball;
        game.balls = [];
        ball = new Ball(604.9997973889685, 307.2071381259317, "white");
        ball.glow = "white";ball.opacity = 1;ball.state = 1;ball.isFading = false;
        game.balls.push(ball);
        ball = new Ball(856.9902543205238, 229.65843753182725, "#302352");
        ball.glow = "#00FFF8";ball.opacity = 1;ball.state = 1;ball.isFading = false;
        game.balls.push(ball);
        ball = new Ball(960.0000000000043, 40.00000000000045, "#ffd587");
        ball.glow = "#FFD400";ball.opacity = 0;ball.state = 2;ball.isFading = true;
        game.balls.push(ball);
        ball = new Ball(395.8070463237611, 63.39417205229697, "#59ff88");
        ball.glow = "#26FF00";ball.opacity = 1;ball.state = 1;ball.isFading = false;
        game.balls.push(ball);
        ball = new Ball(794.6342028523974, 59.564130132569815, "#ec2b7f");
        ball.glow = "#FF0068";ball.opacity = 1;ball.state = 1;ball.isFading = false;
        game.balls.push(ball);
        ball = new Ball(500.0000000000009, 29.999999999999954, "#31bdff");
        ball.glow = "#09C3FC";ball.opacity = 0;ball.state = 2;ball.isFading = true;
        game.balls.push(ball);
        ball = new Ball(70.00760947565973, 80.21451178029385, "#ffd587");
        ball.glow = "#FFD400";ball.opacity = 1;ball.state = 1;ball.isFading = false;
        game.balls.push(ball);
        ball = new Ball(921.6279980725981, 347.3794370478176, "#59ff88");
        ball.glow = "#26FF00";ball.opacity = 1;ball.state = 1;ball.isFading = false;
        game.balls.push(ball);
        ball = new Ball(921.5798163150628, 400.5187589351589, "#ec2b7f");
        ball.glow = "#FF0068";ball.opacity = 1;ball.state = 1;ball.isFading = false;
        game.balls.push(ball);
        ball = new Ball(960.0000000000003, 39.999999999999126, "#31bdff");
        ball.glow = "#09C3FC";ball.opacity = 0;ball.state = 2;ball.isFading = true;
        game.balls.push(ball);
        ball = new Ball(959.9999999999994, 460.0000000000003, "#ffd587");
        ball.glow = "#FFD400";ball.opacity = 0;ball.state = 2;ball.isFading = true;
        game.balls.push(ball);
        ball = new Ball(584.3452145214834, 284.8833334097159, "#59ff88");
        ball.glow = "#26FF00";ball.opacity = 1;ball.state = 1;ball.isFading = false;
        game.balls.push(ball);
        ball = new Ball(902.5446107426337, 115.08658090285374, "#ec2b7f");
        ball.glow = "#FF0068";ball.opacity = 1;ball.state = 1;ball.isFading = false;
        game.balls.push(ball);
        ball = new Ball(912.0130151534197, 59.78394674122043, "#31bdff");
        ball.glow = "#09C3FC";ball.opacity = 1;ball.state = 1;ball.isFading = false;
        game.balls.push(ball);
        ball = new Ball(326.69314287460645, 149.78773042002706, "#ffd587");
        ball.glow = "#FFD400";ball.opacity = 1;ball.state = 1;ball.isFading = false;
        game.balls.push(ball);
        ball = new Ball(959.9999999999998, 40.00000000000002, "#59ff88");
        ball.glow = "#26FF00";ball.opacity = 0;ball.state = 2;ball.isFading = true;
        game.balls.push(ball);
        ball = new Ball(39.99999999999989, 459.9999999999999, "#ec2b7f");
        ball.glow = "#FF0068";ball.opacity = 0;ball.state = 2;ball.isFading = true;
        game.balls.push(ball);
        ball = new Ball(40.00000000000001, 40.00000000000001, "#31bdff");
        ball.glow = "#09C3FC";ball.opacity = 0;ball.state = 2;ball.isFading = true;
        game.balls.push(ball);
        ball = new Ball(802.703792321998, 271.2912345989402, "#ffd587");
        ball.glow = "#FFD400";ball.opacity = 1;ball.state = 1;ball.isFading = false;
        game.balls.push(ball);
        ball = new Ball(763.1324521676883, 253.27119366601363, "#59ff88");
        ball.glow = "#26FF00";ball.opacity = 1;ball.state = 1;ball.isFading = false;
        game.balls.push(ball);
        ball = new Ball(500.00000000000006, 470, "#ec2b7f");
        ball.glow = "#FF0068";ball.opacity = 0;ball.state = 2;ball.isFading = true;
        game.balls.push(ball);
        ball = new Ball(851.1238050680419, 265.7669404740154, "#31bdff");
        ball.glow = "#09C3FC";ball.opacity = 1;ball.state = 1;ball.isFading = false;
        game.balls.push(ball);
        game.cueBall = game.balls[0];
        game.shootCueBall(new Vector2D(222.00913118246, -192.25178098307453), 20);
    }
}