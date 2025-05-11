import { useState, useEffect } from "react";
import { ConnectionManager } from "../network/connectionManager.mjs";
import OnlineLobby from "../components/OnlineLobby";
import OnlineGame from "../components/OnlineGame";
import Error from "../components/Error";
import { useNavigate } from "react-router-dom";

function Online() {

    const [gameSeed, setGameSeed] = useState(0);

    const [players, setPlayers] = useState([]);
    const [inGame, setInGame] = useState(false);
    const [error, setError] = useState(null);

    const navigate = useNavigate();
    
    const startGame = (players, seed) => {
        setPlayers(players);
        setGameSeed(seed);
        setInGame(true);
    };

    const exitGame = () => {
        navigate("/");
    };

    const onError = (error) => {
        setError(error);
    };

    useEffect(() => {
        ConnectionManager.init();
        return () => {
            ConnectionManager.destroy();
        }
    }, []);

    return (error && <Error errorMessage={error}></Error>) || (
        inGame ? 
            <OnlineGame players={players} gameSeed={gameSeed} exitGame={exitGame}></OnlineGame> : 
            <OnlineLobby startGame={startGame} onError={onError}></OnlineLobby>
    )
}

export default Online; 