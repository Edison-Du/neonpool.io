export class SocketEvents {
    // Lobby Events
    static createGame = "createGame";
    static playerJoin = "playerJoin";
    static playerLeave = "playerLeave"; // Used to kick players as well
    static playerNameChange = "playerNameChange";
    static playAgainChange = "playAgainChange";
    static startGame = "startGame";

    // Game Events
    static shootCueBall = "shootCueBall";
    static placeCueBall = "placeCueBall";
    static pickUpCueBall = "pickUpCueBall";
    static moveMouse = "moveMouse";
    static changeStrength = "changeStrength";
}