// Case 1 (weird swirling)
// balls[0].pos = vect2d(76.71094956688371, 252.92236640132177);
// balls[0].vel = vect2d(0.24981693911407152, -4.793494706050241);
// balls[1].pos = vect2d(46.36193775646933,  228.04033460205426);
// balls[1].vel = vect2d(0.27819812986954195,-1.2283956705196668);

import { LineSegment } from "./modules/lineSegment.mjs";

// Case 2 (touching)
// balls[0].pos = vect2d(168.380452299559661, 179.61326903329226);
// balls[1].pos = vect2d(148.54772393911512,  144.8762155344588);

// Case 3 (newton's cradle)
// balls[1].pos = vect2d(220, 100);
// balls.push(new Ball(180, 100, "blue"));
// balls.push(new Ball(140, 100, "yellow"));
// balls[1].vel = vect2d(20, 0);



// Break
let offset = vect2d(300, 250);
// for (let i = 0; i < 5; i++) {
//     for (let j = i%2; j <= i; j += 2) {
//         let p1 = vect2d(i*Math.sqrt(3), j).scale(Ball.RADIUS).add(offset);
//         let p2 = vect2d(i*Math.sqrt(3), -j).scale(Ball.RADIUS).add(offset);

//         balls.push(new Ball(p1.x, p1.y, "red"));
//         balls.push(new Ball(p2.x, p2.y, "red"));
//     }
// }
for (let i = 4; i >= 0; i--) {
    for (let j = i%2; j <= i; j += 2) {
        let p1 = vect2d(i*Math.sqrt(3), j).scale(Ball.RADIUS).add(offset);
        let p2 = vect2d(i*Math.sqrt(3), -j).scale(Ball.RADIUS).add(offset);

        if (j != 0) {
            balls.push(new Ball(p2.x, p2.y, "red"));
            balls.push(new Ball(p1.x, p1.y, "red"));
        }
        else {
            balls.push(new Ball(p2.x, p2.y, "red"));
        }
    }
}



// overlapping aimer
// balls[0].pos = vect2d(856.4322258916669, 338.89962440869635)
// balls[1].pos = vect2d(564.6481097526154, 323.2375361544168)
// balls[2].pos = vect2d(418.26044614330846, 365.75353435145223)
// balls[3].pos = vect2d(499.9507164612502, 367.6205428384135)
// balls[4].pos = vect2d(88.26784820869159, 160.39798568029465)
// balls[5].pos = vect2d(542.1262427693463, 389.7788168814025)
// balls[6].pos = vect2d(386.7673360739973, 214.60078715791204)
// balls[7].pos = vect2d(408.41804941443934, 271.58104680216877)
// balls[8].pos = vect2d(392.152574562932, 169.37519682068097)
// balls[9].pos = vect2d(404.0539428150367, 311.59692983538736)
// balls[10].pos = vect2d(366.30004839559103, 251.52228453173342)
// balls[11].pos = vect2d(353.6384815218505, 182.68405308936227)
// balls[12].pos = vect2d(367.60474039688637, 293.4957617092476)
// balls[13].pos = vect2d(274.5390799626864, 125.58204897578018)
// balls[14].pos = vect2d(320.1407690438606, 295.27063240580986)
// balls[15].pos = vect2d(287.5990077848266, 271.58561748357675)



// wall corners
// let lines = [new LineSegment(vect2d(600, 100), vect2d(700, 300), "brown")];

// lines.push(new LineSegment(vect2d(600, 100), vect2d(700, 100), "brown"));
// ball.pos = vect2d(100, 90);



// newton's cradle with wall
ball.pos = vect2d(100, 100);
balls.push(new Ball(220, 100, "red"));
balls.push(new Ball(180, 100, "blue"));
// balls.push(new Ball(140, 100, "yellow"));

lines.push(new LineSegment(vect2d(200, 50), vect2d(200, 350), "brown"));



// two walls very close
lines.push(new LineSegment(600, 100, 700, 300, "brown")); 
lines.push(new LineSegment(601, 100, 701, 300, "brown")); 


// wall aimer touching edge of wall
lines.push(new LineSegment(600, 100, 700, 300, "brown"));
balls[0].pos = vect2d(896.4189667694121, 241.3458000040911)


lines.push(new LineSegment(600, 100, 700, 300, "brown"));
balls[0].pos = vect2d(847.2092660164719, 422.28821858011946)


// endpoint prioritization for wall aimer (closest one should be prioritized)
lines.push(new LineSegment(600, 100, 700, 300, "brown"));
balls[0].pos = vect2d(773.2425534583451, 450.7731407102569)


// parallel lines wall aimer
lines.push(new LineSegment(500, 100, 600, 100, "brown"));
balls[0].pos = vect2d(100, 100);
balls[0].pos = vect2d(100, 90);


