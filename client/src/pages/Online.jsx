import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { ConnectionManager } from "../network/connectionManager.mjs";
import { SocketEvents } from "../network/socketEvents.mjs";
import OnlineLobby from "../components/OnlineLobby";
import OnlineGame from "../components/OnlineGame";
import Error from "../components/Error";
import { useNavigate } from "react-router-dom";

function Online() {
    const { lobbyCode } = useParams();
    const [code, setCode] = useState("");
    const requestedLobby = useRef(false); // Used to prevent sending two messages to server on initial render (strict mode)

    const [gameSeed, setGameSeed] = useState(0);

    const [players, setPlayers] = useState([]);
    const [inGame, setInGame] = useState(false);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        if (requestedLobby.current) {
            return;
        }
        requestedLobby.current = true;
        // Join Game
        if (lobbyCode) {
            ConnectionManager.sendEvent(SocketEvents.playerJoin, { code: lobbyCode }, (res) => {
                const { players, error } = res;
                if (error) {
                    onError(error);
                    return;
                }
                setCode(lobbyCode);
                setPlayers(players); 
                console.log("Join Game", res);
            });
        // Create Game
        } else {
            ConnectionManager.sendEvent(SocketEvents.createGame, null, (res) => {
                const { code, players, error } = res;
                if (error) {
                    onError(error);
                    return;
                }
                setCode(code);
                setPlayers(players);
                console.log("Create Game", res);
            });
        }
    }, [lobbyCode]);

    const onPlayersChange = (players) => {
        setPlayers(players);
    }
    
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

    const onPlayAgain = (players) => {
        if (!players.find(player => player.id === ConnectionManager.getId())) {
            onError("Kicked from lobby");
            return;
        }
        setPlayers(players);
        setInGame(false);
    }

    useEffect(() => {
        ConnectionManager.init();
        return () => {
            ConnectionManager.destroy();
        }
    }, []);

    return (error && <Error errorMessage={error}></Error>) || (
        inGame ? 
            <OnlineGame 
                players={players} 
                gameSeed={gameSeed} 
                exitGame={exitGame} 
                onError={onError} 
                onPlayAgain={onPlayAgain}
            ></OnlineGame> :
            <OnlineLobby 
                code={code} 
                players={players} 
                onPlayersChange={onPlayersChange} 
                startGame={startGame} 
                onError={onError}
            ></OnlineLobby>
    )
}

export default Online; 