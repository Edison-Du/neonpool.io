export class Player {
    colour;
    state;
    endTurn; // the turn in the game where the player wins/loses

    static state = {
        IN_PLAY: 0,
        WON: 1,
        LOST: 2
    }

    constructor() {
        this.colour = null;
        this.resetStatus();
    }

    resetStatus() {
        this.state = Player.state.IN_PLAY;
        this.endTurn = -1; // denotes the player hasn't won or lost yet
    }

    inPlay() {
        return this.state == Player.state.IN_PLAY;
    }

    lost() {
        return this.state == Player.state.LOST;
    }

    won() {
        return this.state == Player.state.WON;
    }

    setLoss() {
        this.state = Player.state.LOST;
    }

    setWin() {
        this.state = Player.state.WON;
    }
}