export class Consts {
    static epsilon = 1e-8;
    static elasticity = 0.95; // coefficient of restitution for collisions

    // dimensions
    static boardWidth = 1000;
    static boardHeight = 500;
    static breakLine = 275; // 250
    
    static scale = 1;

    // colours,  https://www.w3schools.com/colors/colors_names.asp
    static cueBallColour = "white";
    static eightBallColour = "#302352";
    static playerColours = ["#ec2b7f", "#31bdff", "#ffd587", "#59ff88"]; // red blue yellow green
    static playerSecondaryColours= ["#ff0a94", "#3546ff", "#ff8c4e", "#00b451"];
    static cushionColour = "#ffa283";

    static cueBallGlow = "white";
    static eightBallGlow = "#00FFF8";
    static ballGlowColours = ["#FF0068", "#09C3FC", "#FFD400", "#26FF00"];
    static cushionGlow = "#492F00";
}