import { useEffect, useRef, useState } from "react";

import { ConnectionManager } from "../network/connectionManager.mjs";
import { SocketEvents } from "../network/socketEvents.mjs";

import PoolTable from "./PoolTable";
import StrengthBar from "./StrengthBar";
import PlayerInfoBar from "./PlayerInfoBar";

import useWindowWidth from "../hooks/useWindowWidth";
import useInterval from "../hooks/useInterval";

import { Vector2D } from "../modules/util/vector2D.mjs";
import { TwoPlayerGame } from "../modules/game/twoPlayerGame.mjs";
import { ThreePlayerGame } from "../modules/game/threePlayerGame.mjs";
import { FourPlayerGame } from "../modules/game/fourPlayerGame.mjs";
import { AimerUtil } from "../modules/util/aimerUtil.mjs";
import { MathUtil } from "../modules/util/mathUtil.mjs";
import { Ball } from "../modules/game_objects/ball.mjs";
import { CanvasUtil } from "../modules/util/canvasUtil.mjs";
import { Consts } from "../modules/consts.mjs";
import { Player } from "../modules/game/player.mjs";
import { EffectsUtil } from "../modules/util/effectsUtil.mjs";
import GameOver from "./GameOver";

function OnlineGame ({players, gameSeed, exitGame}) {
    const screenWidth = useWindowWidth();

    const game = useRef(null);
    const mousePos = useRef(null);
    const isHoldingBall = useRef(false);
    const heldTimeRef= useRef(-1);

    const table = useRef();
    const [heldTimeState, setHeldTimeState] = useState(-1);

    // player info
    const numPlayers = players.length;
    const [playerStates, setPlayerStates] = useState(new Array(numPlayers).fill(Player.state.IN_PLAY));
    const [playerColours, setPlayerColours] = useState(new Array(numPlayers).fill(null));
    const [turn, setTurn] = useState(0);
    const [ballCounts, setBallCounts] = useState({});
    const [numBallsEach, setNumBallsEach] = useState(0);

    // game over
    const [gameResults, setGameResults] = useState(null);

    // derived state
    const playerNames = players.map(p => p.name);

    // multiplayer logic
    const actionQueue = useRef([]);
    const [opponentHeldFraction, setOpponentHeldFraction] = useState(0);

    const getTurnPlayerId = () => {
        return game.current ? players[game.current.currentPlayerIndex].id : null;
    }

    const isOurTurn = () => {
        return getTurnPlayerId() === ConnectionManager.getId();
    }

    // Attach socket listeners
    useEffect(() => {
        const handlePlayerLeave = (data) => {
            const { players: newPlayers } = data;
            if (!game.current || game.current.gameHasEnded) return;
            const playerIds = newPlayers.map(p => p.id);
            for (let i = 0; i < players.length; i++) {
                if (!playerIds.includes(players[i].id)) {
                    game.current.forfeitPlayer(i);
                }
            }
        }
        const addGameEventToQueue = (eventName) => {
            return (data) => {
                actionQueue.current.push({ event: eventName, ...data });
            }
        }
        const eventListeners = {
            [SocketEvents.playerLeave]: handlePlayerLeave,
            // Game events
            [SocketEvents.shootCueBall]: addGameEventToQueue(SocketEvents.shootCueBall),
            [SocketEvents.placeCueBall]: addGameEventToQueue(SocketEvents.placeCueBall),
            [SocketEvents.pickUpCueBall]: addGameEventToQueue(SocketEvents.pickUpCueBall),
            [SocketEvents.moveMouse]: addGameEventToQueue(SocketEvents.moveMouse),
            [SocketEvents.changeStrength]: addGameEventToQueue(SocketEvents.changeStrength)
        }
        ConnectionManager.addListeners(eventListeners);
        return () => {
            ConnectionManager.removeListeners(Object.keys(eventListeners));
        }
    }, []);

    const createGame = () => {
        if (numPlayers == 2) {
            game.current = new TwoPlayerGame(gameSeed);
            setNumBallsEach(TwoPlayerGame.numBallsEach);
        }
        else if (numPlayers == 3) {
            game.current = new ThreePlayerGame(gameSeed);
            setNumBallsEach(ThreePlayerGame.numBallsEach);
        }
        else if (numPlayers == 4) {
            game.current = new FourPlayerGame(gameSeed);
            setNumBallsEach(FourPlayerGame.numBallsEach);
        }
        setBallCounts({...game.current.runningColourCount});
    }

    // Update visual game states for components
    const updateGameStates = () => {
        setTurn(game.current.currentPlayerIndex);
        // only change state when there are differences
        const players = game.current.players;
        // player colours
        for (let i = 0; i < numPlayers; i++) {
            if (playerColours[i] !== players[i].colour) {
                setPlayerColours(players.map(a => a.colour));
                break;
            }
        }
        // player states
        for (let i = 0; i < numPlayers; i++) {
            if (playerStates[i] !== players[i].state) {
                setPlayerStates(players.map(a => a.state));
                break;
            }
        }
        // remaining ball counts
        for (const colour in ballCounts) {
            if (ballCounts[colour] !== game.current.runningColourCount[colour]) {
                setBallCounts({...game.current.runningColourCount});
                break;
            }
        }
        // game results when game ends
        if (gameResults === null && game.current.gameHasEnded) {
            setTimeout(() => {setGameResults([...game.current.getLeaderboard()])}, 1000);
        }
        else if (!game.current.gameHasEnded) {
            setGameResults(null);
        }
    }

    // Handle inbound game events from server
    const processGameEvents = () => {
        const stopProcessingCondition = () => {
            return isOurTurn() || game.current.ballsAreMoving || game.current.gameHasEnded;
        }
        if (stopProcessingCondition()) {
            return;
        }
        while (actionQueue.current.length > 0) {
            const event = actionQueue.current.shift();
            if (event.id !== getTurnPlayerId()) {
                console.log(`Received event ${event.event} from player ${event.id} when it is not their turn`);
                continue;
            }
            if (stopProcessingCondition()) {
                break;
            }
            switch (event.event) {
                case SocketEvents.shootCueBall:
                    const { direction: { x, y }, strength } = event;
                    if (game.current.shootCueBall(new Vector2D(x, y), strength)) { // does validity checks
                        setOpponentHeldFraction(0);
                    }
                    break;
                case SocketEvents.placeCueBall: {
                    if (event.position) {
                        const { position: { x, y } } = event;
                        game.current.placeCueBall(new Vector2D(x, y)); // does validity checks                        
                    }
                    isHoldingBall.current = false;
                    break;
                }
                case SocketEvents.pickUpCueBall:
                    if (game.current.ballInHand) {
                        isHoldingBall.current = true;
                    }
                    break;
                case SocketEvents.moveMouse: {
                    const { position: { x, y } } = event;
                    mousePos.current = new Vector2D(x, y);
                    break;
                }
                case SocketEvents.changeStrength:
                    const { fraction } = event;
                    setOpponentHeldFraction(fraction);
                    break;
            }
        }
    };

    // initialize game
    useEffect(() => {
        createGame();
    }, []);

    // game loop
    useInterval(() => {
        if (game.current !== null) {
            processGameEvents();
            game.current.simulateTick();
            table.current.updateCanvas();
            updateGameStates();
        }
    }, 15);

    // used to update strength bar
    useInterval(() => {
        if (heldTimeRef.current >= 0) {
            heldTimeRef.current += 1;
        }
        if (heldTimeRef.current >= AimerUtil.framesToFullStrength * 3) {
            heldTimeRef.current = -1;
        }
        if (isOurTurn() && heldTimeRef.current != heldTimeState) {
            ConnectionManager.sendEvent(SocketEvents.changeStrength, { fraction: getStrengthBarFraction(heldTimeRef.current) }, () => {});
        }
        setHeldTimeState(heldTimeRef.current);
    }, 15);


    // helper
    const getTableWidth = () => {
        return Math.round(screenWidth * 0.7);
    }

    const getStrengthBarFraction = (heldTime) => {
        return isOurTurn() ?
            Math.max(0, Math.min(heldTime/AimerUtil.framesToFullStrength, 1)) :
            opponentHeldFraction;
    }

    // mouse related
    const mouseOnCueBall = () => {
        if (!mousePos.current) return false;
        if (game.current.cueBall.isFalling()) return false;
        return MathUtil.dist(mousePos.current, game.current.cueBall.pos) < Ball.RADIUS;
    }

    // user input
    const mouseDown = (e) => {
        if (!isOurTurn() || game.current.ballsAreMoving || game.current.gameHasEnded) {
            return;
        }

        // pick up cue ball
        if (mouseOnCueBall() && !isHoldingBall.current && game.current.ballInHand) {
            isHoldingBall.current = true;
            ConnectionManager.sendEvent(SocketEvents.pickUpCueBall, null, () => {});
            return;
        }

        // place cue ball
        if (isHoldingBall.current || !game.current.ballIsPlaced) {
            mousePos.current = new Vector2D(e.offsetX, e.offsetY).scale(1/Consts.scale);
            const position = new Vector2D(mousePos.current.x, mousePos.current.y);
            if (game.current.placeCueBall(position)) {
                ConnectionManager.sendEvent(SocketEvents.placeCueBall, { position: position }, () => {});
            } else {
                ConnectionManager.sendEvent(SocketEvents.placeCueBall, null, () => {});
            }
            isHoldingBall.current = false; // will reset the ball position if invalid placement is made
            return;
        }

        if (heldTimeRef.current == -1) {
            heldTimeRef.current = 0;
        }
    }

    const mouseUp = (e) => {
        if (!isOurTurn() || game.current.ballsAreMoving || game.current.gameHasEnded) {
            return;
        }
    
        if (heldTimeRef.current == -1) {
            return;
        }
    
        const strength = Math.min((heldTimeRef.current/AimerUtil.framesToFullStrength), 1) * Consts.maxStrength;
    
        mousePos.current = new Vector2D(e.offsetX, e.offsetY).scale(1/Consts.scale);
        const direction = game.current.cueBall.pos.to(mousePos.current);
        if (game.current.shootCueBall(direction, strength)) {
            ConnectionManager.sendEvent(SocketEvents.shootCueBall, {
                direction: direction,
                strength: strength
            }, () => {});
        }
        heldTimeRef.current = -1;
    
        // debugging
        // console.log(`balls[0].vel = new Vector2D(${game.current.cueBall.vel.x}, ${game.current.cueBall.vel.y})\n`);
        // printBalls();
    }

    const mouseMove = (e) => {
        if (!isOurTurn() || game.current.ballsAreMoving || game.current.gameHasEnded) {
            return;
        }
        mousePos.current = new Vector2D(e.offsetX, e.offsetY).scale(1/Consts.scale);
        ConnectionManager.sendEvent(SocketEvents.moveMouse, { position: mousePos.current }, () => {});
    }

    // for pool table
    const mouseHandler = {
        "mousedown": mouseDown,
        "mouseup": mouseUp,
        "mousemove": mouseMove
    }

    const draw = (ctx) => {
        if (!game.current) {
            return;
        }

        const opacity = isOurTurn() ? 1 : 0.5;

        CanvasUtil.setScale(Consts.scale);
    
        game.current.draw(ctx, null);

        if (game.current.gameHasEnded) {
            return;
        }

        // effects
        if (game.current.ballInHand && heldTimeRef.current === -1 && !isHoldingBall.current && !game.current.cueBall.isFading) {
            EffectsUtil.startBallPickUpEffect(game.current.cueBall.pos, opacity);
        }
        else {
            EffectsUtil.removeBallPickUpEffect();
        }
        EffectsUtil.draw(ctx);
        
        // line for aim assist
        if (!game.current.ballsAreMoving && !mouseOnCueBall() && !isHoldingBall.current && game.current.ballIsPlaced) {
            if (mousePos.current != null) {
                AimerUtil.drawAimAssist(ctx, game.current, mousePos.current, opacity);
            }
        }
        else if (isHoldingBall.current || !game.current.ballIsPlaced) {
            isHoldingBall.current = true;
            if (mousePos.current != null) {
                if (game.current.isValidCueBallPlacement(mousePos.current)) {
                    AimerUtil.drawPlaceBall(ctx, mousePos.current);
                }
                else {
                    AimerUtil.drawCannotPlaceBall(ctx, mousePos.current);
                }
            }
        }
    }

    // game results
    const onRematch = () => {
        createGame();
    }

    const onExit = () => {
        exitGame();
    }

    return (
        <div className="w-100 d-flex flex-column h-100 justify-content-center">
            <div className="d-flex justify-content-center mb-5">
                <div className="side"></div>
                <div className="center">
                    <PlayerInfoBar 
                        playerNames={playerNames}
                        playerColours={playerColours}
                        playerStates={playerStates}
                        playerTurn={turn}
                        ballColourCounts={ballCounts}
                        numBallsEach={numBallsEach}
                    ></PlayerInfoBar>
                </div>
                <div className="side"></div>
            </div>
            <div className="d-flex justify-content-center">
                <div className="side"></div>
                <div className="center">
                    <PoolTable draw={draw} mouseHandler={mouseHandler} width={getTableWidth()} ref={table}></PoolTable>
                    {gameResults && 
                        <GameOver 
                            gameResults={gameResults} 
                            playerNames={playerNames}
                            playerColours={playerColours}
                            onRematch={onRematch} 
                            onExit={onExit}
                        ></GameOver>}
                </div>
                <div className="side d-flex align-items-center justify-content-center">
                    <StrengthBar fractionFilled={getStrengthBarFraction(heldTimeState)}></StrengthBar>
                </div>
            </div>
        </div>
    );
}

export default OnlineGame; 