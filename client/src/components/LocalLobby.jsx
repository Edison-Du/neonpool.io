import { useEffect, useRef, useState } from "react";

function LocalLobby({startGame}) {

    const MAX_PLAYERS = 4;
    const [names, setNames] = useState(["PLAYER 1"]);
    const [nameBeingEdited, setNameBeingEdited] = useState(-1);

    const editedNames = useRef([false]);
    const inputElements = useRef({});

    useEffect(() => {
        if (nameBeingEdited == -1) {
            return;
        }
        inputElements.current[nameBeingEdited].focus();
    }, [nameBeingEdited]);

    const addPlayer = () => {
        let numPlayers = names.length;
        if (numPlayers === MAX_PLAYERS) {
            return;
        }
        let newPlayer = `PLAYER ${numPlayers + 1}`;
        setNames([...names, newPlayer]);
        editedNames.current.push(false);
    }

    // Should make smart name changes if players are just PLAYER 1, 2, 3... loop from deleted to max
    const deletePlayer = (index) => {
        let newNames = [...names];
        for (let i = index + 1; i < names.length; i++) {
            if (!editedNames.current[i]) {
                newNames[i] = `PLAYER ${i}`;
            }
        }
        // remove deleted player
        newNames.splice(index, 1);
        editedNames.current.splice(index, 1);
        setNames(newNames);
    }

    const editPlayer = (index) => {
        setNameBeingEdited(index);
    }

    const onPlayerNameChange = (e, index) => {
        let newName = e.target.value;
        if (newName.length > 15) {
            return false;
        }
        let newNames = [...names];
        newNames[index] = e.target.value.toUpperCase();
        setNames(newNames);
        return true;
    }

    const onPlayerNameSubmit = (e, index) => {
        setNameBeingEdited(-1);
        // empty name given, reset to default
        if (names[index] === "") {
            let newNames = [...names];
            newNames[index] = `PLAYER ${index + 1}`;
            setNames(newNames);
        }
        else {
            editedNames.current[index] = true;
        }
    }

    const onKeyDown = (e, index) => {
        if (e.key === "Enter") {
            onPlayerNameSubmit(e, index);
        }
    }

    const onStartGame = () => {
        if (names.length > 1) {
            startGame(names);
        }
    }

    const canStartGame = () => {
        return names.length > 1;
    }

    return (
        <div className="d-flex justify-content-center h-100 w-100">
            <div className="lobby">
                <h1>Pass and Play</h1>
                {/* Player List */}
                <section className="d-flex flex-column justify-content-center">
                    {names.map((name, index) => {
                        // We need to use "callback refs" for storing many refs.
                        const ref = (element) => inputElements.current[index] = element;
                        return (
                            <div key={index} className="lobby-player-tag d-flex">
                                <div 
                                    className="player-info-left" 
                                >
                                    <div className="player-info-highlight"></div>
                                </div>
                                <input 
                                    type="text" 
                                    value={name} 
                                    disabled={nameBeingEdited != index} 
                                    onChange={(e) => onPlayerNameChange(e, index)}
                                    onBlur={(e) => onPlayerNameSubmit(e, index)}
                                    onKeyDown={(e) => onKeyDown(e, index)}
                                    ref={ref}
                                />
                                <button onClick={() => editPlayer(index)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#00d5ff" className="bi bi-pencil-square" viewBox="0 0 16 16">
                                        <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                                        <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
                                    </svg>
                                </button>
                                <button onClick={() => deletePlayer(index)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="#ff0077" className="bi bi-trash3" viewBox="0 0 16 16">
                                        <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5"/>
                                    </svg>
                                </button>
                            </div>
                        )
                    })}
                </section>
                {/* Add Player */}
                {names.length < MAX_PLAYERS && 
                    <button onClick={addPlayer} className="add-player">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-person-plus" viewBox="0 0 16 16">
                            <path d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H1s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C9.516 10.68 8.289 10 6 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z"/>
                            <path fillRule="evenodd" d="M13.5 5a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H14v1.5a.5.5 0 0 1-1 0V8h-1.5a.5.5 0 0 1 0-1H13V5.5a.5.5 0 0 1 .5-.5"/>
                        </svg>
                    </button>
                }
                {/* Start Game */}
                {
                    <button onClick={onStartGame} className={"start-game " + (canStartGame() ? "can-start-game" : "")}>
                        Start Game
                    </button>
                }
            </div>
        </div>
    );
}

export default LocalLobby;