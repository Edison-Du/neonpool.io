import { useState } from "react";

import LocalLobby from "../components/LocalLobby";
import LocalGame from "../components/LocalGame";
import { useNavigate } from "react-router-dom";

function Local () {

    const [gameSeed, setGameSeed] = useState(Math.floor(Math.random() * (1<<21)));

    const [names, setNames] = useState([]);
    const [inGame, setInGame] = useState(false);

    const navigate = useNavigate();

    const startGame = (playerNames) => {
        setNames(playerNames);
        setInGame(true);
    }

    const exitGame = () => {
        navigate("/");
    }

    return inGame ? 
        <LocalGame playerNames={names} gameSeed={gameSeed} exitGame={exitGame}></LocalGame> : 
        <LocalLobby startGame={startGame}></LocalLobby>
}

export default Local;