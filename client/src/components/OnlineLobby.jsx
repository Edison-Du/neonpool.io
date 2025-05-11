import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { ConnectionManager } from "../network/connectionManager.mjs";
import { SocketEvents } from "../network/socketEvents.mjs";
import Loading from "./Loading";
import ResizableTextBox from "./generic/ResizableTextBox";

function OnlineLobby({startGame, onError}) {

    const { lobbyCode } = useParams();

    const [code, setCode] = useState("");
    const [players, setPlayers] = useState([]);

    // Name related
    const [currentName, setCurrentName] = useState("");
    const [nameBeingEdited, setNameBeingEdited] = useState(false);

    const defaultName = useRef(""); // Original name of user given by the server upon game join/creation
    const playerNameInputElement = useRef({});

    const requestedLobby = useRef(false); // Used to prevent sending two messages to server on initial render (strict mode)

    // Copying link related
    const [linkCopied, setLinkCopied] = useState(false);
    const linkCopyTimeoutRef = useRef(null);

    // Attach listeners
    useEffect(() => {
        const updatePlayerList = (data) => {
            const { players } = data;
            if (!players.find(player => player.id === ConnectionManager.getId())) {
                onError("Kicked from lobby");
                return;
            }
            setPlayers(players);
        }
        const eventListeners = {
            [SocketEvents.playerJoin]: updatePlayerList,
            [SocketEvents.playerLeave]: updatePlayerList,
            [SocketEvents.playerNameChange]: updatePlayerList
        }
        ConnectionManager.addListeners(eventListeners);
        return () => {
            ConnectionManager.removeListeners(Object.keys(eventListeners));
        }
    }, [onError]);

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

    // Mainly used to sync default name of the user to initial player list
    useEffect(() => {
        const name = getCurrentPlayer()?.name;
        if (!name || currentName === name) {
            return;
        }
        if (!defaultName.current) {
            defaultName.current = name;
        }
        if (!nameBeingEdited) {
            setCurrentName(name);
        }
    }, [players]);

    // Focuses name input element when user tries to edit their name
    useEffect(() => {
        if (nameBeingEdited) {
            playerNameInputElement.current.focus();
        }
    }, [nameBeingEdited]);

    // Copy link related
    const getShareLink = () => {
        return `${process.env.REACT_APP_BASE_URL}/online/${code}`;
    }

    const onCopyLink = () => {
        navigator.clipboard.writeText(getShareLink());
        // Checkmark effect when clicked
        setLinkCopied(true);
        if (linkCopyTimeoutRef.current) {   // Ref prevents spam clicking issues
            clearTimeout(linkCopyTimeoutRef.current);
        }
        linkCopyTimeoutRef.current = setTimeout(() => {
            setLinkCopied(false);
        }, 3000);
    }

    // Player related
    const getCurrentPlayer = () => {
        return players.find(player => player.id === ConnectionManager.getId());
    }

    const checkIndexIsCurrentPlayer = (index) => {
        return players[index] === getCurrentPlayer();
    }

    const deletePlayer = (index) => {
        console.log(`Delete Player ${index}`);
        if (checkIndexIsCurrentPlayer(index)) {
            return;
        }
        const id = players[index].id;
        ConnectionManager.sendEvent(SocketEvents.playerLeave, { id: id }, (res) => {
            const { players, error } = res;
            if (error) {
                onError(error);
                return;
            }
            setPlayers(players);
            console.log("Remove player", res);
        });
    }
    
    // Name change related
    const editPlayer = () => {
        setNameBeingEdited(true);
    }

    // Changes currentName state, does not communicate with server 
    const onPlayerNameChange = (e) => {
        let newName = e.target.value.toUpperCase();
        if (newName.length > 15) {
            return false;
        }
        setCurrentName(newName);
        return true;
    }

    // Sends new name to server once submitted
    const onPlayerNameSubmit = (e) => {
        setNameBeingEdited(false);
        // empty name given, reset to default
        let newName = currentName;
        if (currentName === "" || currentName === defaultName.current) {
            newName = defaultName.current;
        }
        ConnectionManager.sendEvent(SocketEvents.playerNameChange, { name: newName }, (res) => {
            const { players, error } = res;
            if (error) {
                console.log(error);
                return;
            }
            setPlayers(players); 
            console.log("Name Changed", res);
        })
    }

    const onKeyDown = (e) => {
        if (e.key === "Enter") {
            onPlayerNameSubmit(e);
        }
    }

    // Start game related
    const onStartGame = () => {
        if (canStartGame()) {
            const seed = Math.floor(Math.random() * (1<<21));
            ConnectionManager.sendEvent(SocketEvents.startGame, { seed: seed }, (res) => {
                const { error } = res;
                if (error) {
                    onError(error);
                    return;
                }
                console.log("Start Game", res);
            });
            startGame(players, seed);
        }
    }

    const canStartGame = () => {
        return players.length > 1 && getCurrentPlayer()?.isHost;
    }

    // We want an intermediate page to render while we wait for a response from the server, as it may respond with an error on lobby create/join
    return !players.length ? <Loading></Loading> :
    (
        <div className="d-flex justify-content-center h-100 w-100">
            <div className="lobby">
                <h1>Online Lobby</h1>
                {/* Share Link */}
                <div className="copy-link">
                    <ResizableTextBox
                        text={getShareLink()}
                        defaultFontSize={1.5}
                    ></ResizableTextBox>
                    <button onClick={onCopyLink} title="Copy link to clipboard" className="d-flex justify-content-center align-items-center">
                        {linkCopied ? 
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-lg" viewBox="0 0 16 16">
                                <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.425z"/>
                            </svg> :
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-clipboard" viewBox="0 0 16 16">
                                <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1z"/>
                                <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0z"/>
                            </svg>
                        }
                    </button>
                </div>
                {/* Player List */}
                <section className="d-flex flex-column justify-content-center">
                    {players.map(({id, isHost, name}, index) => {
                        return (
                            <div 
                                key={index} 
                                className={[
                                    'lobby-player-tag', 
                                    'd-flex', 
                                    checkIndexIsCurrentPlayer(index) ? 'player-current' : ''
                                ].join(' ')}
                            >
                                <div 
                                    className="player-info-left" 
                                >
                                    <div className="player-info-highlight"></div>
                                </div>
                                <input 
                                    type="text" 
                                    value={checkIndexIsCurrentPlayer(index) ? currentName : name} 
                                    disabled={!nameBeingEdited || !checkIndexIsCurrentPlayer(index)} 
                                    onChange={(e) => onPlayerNameChange(e)}
                                    onBlur={(e) => onPlayerNameSubmit(e)}
                                    onKeyDown={(e) => onKeyDown(e)}
                                    ref={checkIndexIsCurrentPlayer(index) ? playerNameInputElement : null}
                                />
                                <button 
                                    disabled={!checkIndexIsCurrentPlayer(index)}
                                    onClick={() => editPlayer(index)}
                                    title="Edit name"
                                >
                                    <svg 
                                        style={{visibility: (checkIndexIsCurrentPlayer(index) && !nameBeingEdited) ? "visible" : "hidden"}}
                                        xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#00d5ff" className="bi bi-pencil-square" viewBox="0 0 16 16"
                                    >
                                        <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                                        <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
                                    </svg>
                                </button>
                                <button 
                                    style={{visibility: (getCurrentPlayer()?.isHost && !checkIndexIsCurrentPlayer(index)) ? "visible" : "hidden"}}
                                    disabled={!getCurrentPlayer()?.isHost || checkIndexIsCurrentPlayer(index)}
                                    onClick={() => deletePlayer(index)}
                                    title="Remove player"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#ff0077" className="bi bi-trash3" viewBox="0 0 16 16">
                                        <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5"/>
                                    </svg>
                                </button>
                            </div>
                        )
                    })}
                </section>
                {/* Start Game */}
                {
                    <button onClick={onStartGame} className={"start-game " + (canStartGame() ? "can-start-game" : "")} title="Start game">
                        Start Game
                    </button>
                }
            </div>
        </div>
    );
}

export default OnlineLobby; 