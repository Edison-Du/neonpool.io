import { memo, useEffect, useRef, useState } from "react";
import PlayerInfoTag from "./PlayerInfoTag";
import { Player } from "../modules/game/player.mjs";

// ballColourCount: Object with keys = colour, value = # of balls of that colour remaining
function PlayerInfoBar({playerNames, playerColours, playerStates, playerTurn, ballColourCounts, numBallsEach}) {

    const numPlayers = playerNames.length;
    const [ballCounts, setBallCounts] = useState(new Array(numPlayers).fill(0));
    const previousPlayerStates = useRef(new Array(numPlayers).fill(Player.state.IN_PLAY));
    const [tagWidth, setTagWidth] = useState((
        () => {
            let w = 70;
            if (numPlayers == 2) {
                return `${0.30*w}vw`;
            }
            else if (numPlayers == 3) {
                return `${0.25*w}vw`;
            }
            else {
                return `${0.18*w}vw`;
            }
        }
    )());

    // update ball counts of players that are still in play
    useEffect(() => {

        const newBallCounts = [...ballCounts];

        // reset states when game restarts
        for (let i = 0; i < playerStates.length; i++) {
            if (playerStates[i] === Player.state.IN_PLAY) {
                previousPlayerStates.current[i] = Player.state.IN_PLAY;
            }
        }

        // recompute ball counts, only for players in play.
        for (let i = 0; i < numPlayers; i++) {
            if (previousPlayerStates.current[i] !== Player.state.IN_PLAY) {
                continue;
            }
            if (playerColours[i] === null) {
                newBallCounts[i] = 0;
                continue;
            }
            newBallCounts[i] = numBallsEach - ballColourCounts[playerColours[i]];
        }

        setBallCounts(newBallCounts);

        // update player states
        previousPlayerStates.current = [...playerStates];

        console.log("changed", ballCounts, newBallCounts, ballColourCounts, playerColours, playerStates);

    }, [ballColourCounts, playerColours, playerStates]);

    return (
        <div className="player-info-bar d-flex justify-content-between">
            {playerNames.map((name, index) => (
                <PlayerInfoTag 
                    key={index}
                    name={name}
                    playerColour = {playerColours[index]}
                    playerState = {playerStates[index]}
                    isPlayerTurn={playerTurn === index}
                    ballsPotted={ballCounts[index]}
                    totalBalls={numBallsEach + 1} // + 1 for the black ball
                    width={tagWidth}
                ></PlayerInfoTag>
            ))}
        </div>
    );
}

export default memo(PlayerInfoBar);