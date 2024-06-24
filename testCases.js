// Case 1 (weird swirling)
// balls[0].pos = new Vector2D(76.71094956688371, 252.92236640132177);
// balls[0].vel = new Vector2D(0.24981693911407152, -4.793494706050241);
// balls[1].pos = new Vector2D(46.36193775646933,  228.04033460205426);
// balls[1].vel = new Vector2D(0.27819812986954195,-1.2283956705196668);

import { LineSegment } from "./modules/lineSegment.mjs";

// Case 2 (touching)
// balls[0].pos = new Vector2D(168.380452299559661, 179.61326903329226);
// balls[1].pos = new Vector2D(148.54772393911512,  144.8762155344588);

// Case 3 (newton's cradle)
// balls[1].pos = new Vector2D(220, 100);
// balls.push(new Ball(180, 100, "blue"));
// balls.push(new Ball(140, 100, "yellow"));
// balls[1].vel = new Vector2D(20, 0);



// Break
// let offset = new Vector2D(300, 250);
// for (let i = 4; i >= 0; i--) {
//     for (let j = i%2; j <= i; j += 2) {
//         let p1 = new Vector2D(i*Math.sqrt(3), j).scale(Ball.RADIUS).add(offset);
//         let p2 = new Vector2D(i*Math.sqrt(3), -j).scale(Ball.RADIUS).add(offset);

//         if (j != 0) {
//             balls.push(new Ball(p2.x, p2.y, "red"));
//             balls.push(new Ball(p1.x, p1.y, "red"));
//         }
//         else {
//             balls.push(new Ball(p2.x, p2.y, "red"));
//         }
//     }
// }



// overlapping aimer
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



// wall corners
// let lines = [new LineSegment(new Vector2D(600, 100), new Vector2D(700, 300), "brown")];
// lines.push(new LineSegment(new Vector2D(600, 100), new Vector2D(700, 100), "brown"));
// ball.pos = new Vector2D(100, 90);



// newton's cradle with wall
ball.pos = new Vector2D(100, 100);
balls.push(new Ball(220, 100, "red"));
balls.push(new Ball(180, 100, "blue"));
// balls.push(new Ball(140, 100, "yellow"));
lines.push(new LineSegment(new Vector2D(200, 50), new Vector2D(200, 350), "brown"));


// two walls very close
lines.push(new LineSegment(600, 100, 700, 300, "brown")); 
lines.push(new LineSegment(601, 100, 701, 300, "brown")); 


// wall aimer touching edge of wall
lines.push(new LineSegment(600, 100, 700, 300, "brown"));
balls[0].pos = new Vector2D(896.4189667694121, 241.3458000040911)


lines.push(new LineSegment(600, 100, 700, 300, "brown"));
balls[0].pos = new Vector2D(847.2092660164719, 422.28821858011946)


// endpoint prioritization for wall aimer (closest one should be prioritized)
lines.push(new LineSegment(600, 100, 700, 300, "brown"));
balls[0].pos = new Vector2D(773.2425534583451, 450.7731407102569)


// parallel lines wall aimer
lines.push(new LineSegment(500, 100, 600, 100, "brown"));
balls[0].pos = new Vector2D(100, 100);
balls[0].pos = new Vector2D(100, 90);




// Following cases use these holes
let holes = [new Hole(50, 50), new Hole(100, 200), new Hole(700, 100)];
let lines = [new LineSegment(10, 10, canvas.width-10, 10, "black"), 
    new LineSegment(10, 10, 10, canvas.height-10, "black"),
    new LineSegment(canvas.width-10, 10, canvas.width-10, canvas.height-10, "black"),
    new LineSegment(10, canvas.height-10, canvas.width-10, canvas.height-10, "black")];

lines.push(new LineSegment(600, 100, 700, 300, "black")); // for fun
lines.push(new LineSegment(500, 100, 600, 100, "black"));

// TWO BALLS FALLING INTO HOLE AT THE SAME TIME

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

// TWO BALLS FALLING INTO HOLE AT THE SAME TIME (pt 2)

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

// Ball touches edge of hole.
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


// Ball in hole still moving after a long time
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

balls[0].vel = new Vector2D(15.879609977038012, 12.158864543087681);  


// weird aimer accuracy issue with perpendicular-ish collision (shoot ball at top)

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
