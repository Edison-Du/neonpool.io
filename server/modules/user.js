const SocketEvents = require("./socketEvents");
const SocketManager = require("./socketManager");
const Joi = require('joi');

// manages a single socket connection
class User {

    static MAX_NAME_LENGTH = 15;

    socket;
    lobby;
    lobbyManager;

    id;
    name;
    isHost;
    playingAgain;
    
    /**
     * User
     * @param {SocketManager} socketManager 
     * @param {Socket} socket 
     */
    constructor(socketManager, socket) {
        this.lobbyManager = socketManager.lobbyManager;
        this.socket = socket;

        // Use socket id for now
        this.id = socket.id;
        this.isHost = false;
        this.playingAgain = true;

        socket.on("disconnect", this.disconnect.bind(this));

        // Lobby events
        socket.on(SocketEvents.createGame, this.createGame.bind(this));
        socket.on(SocketEvents.playerJoin, this.joinGame.bind(this));
        socket.on(SocketEvents.playerNameChange, this.changeName.bind(this));
        socket.on(SocketEvents.playerLeave, this.removePlayer.bind(this));
        socket.on(SocketEvents.playAgainChange, this.playAgain.bind(this));
        socket.on(SocketEvents.startGame, this.startGame.bind(this));

        // Game events
        socket.on(SocketEvents.shootCueBall, this.shootCueBall.bind(this));
        socket.on(SocketEvents.placeCueBall, this.placeCueBall.bind(this));
        socket.on(SocketEvents.pickUpCueBall, this.pickUpCueBall.bind(this));
        socket.on(SocketEvents.moveMouse, this.moveMouse.bind(this));
        socket.on(SocketEvents.changeStrength, this.changeStrength.bind(this));
    }

    /**
     * getGameInfo
     * @returns {{id: String, name: String, isHost: boolean, playingAgain: boolean}} necessary information to send to other users in a game
     */
    getGameInfo() {
        return {
            id: this.id,
            name: this.name,
            isHost: this.isHost,
            playingAgain: this.playingAgain
        }
    }

    disconnect() {
        if (this.lobby) {
            this.lobbyManager.leaveLobby(this);
            this.lobby = null;
        }
        console.log(`User ${this.id} has disconnected`);
    }

    // Lobby Events

    createGame(_, callback) {
        const validation = Joi.object({
            _: Joi.any().valid(null).required(), // must be null
            callback: Joi.function().required()
        }).validate({ _, callback });
        if (validation.error) {
            console.log(`User ${this.id} requested to create a lobby with invalid arguments: ${validation.error}`);
            return;
        }
        const createGame = () => {
            if (this.lobby) {
                return { error: "Already in a game" };
            }
            this.lobby = this.lobbyManager.createLobby(this);
            if (this.lobby) {
                return { 
                    code: this.lobby.code, 
                    players: this.lobby.generatePlayerList() 
                };
            }
            return { error: "Unable to create a lobby" };
        }
        const msg = createGame();
        console.log(`User ${this.id} wants to create a lobby, reply: ${JSON.stringify(msg)}`);
        callback(msg);
    }

    joinGame(data, callback) {
        const validation = Joi.object({
            data: Joi.object({
                code: Joi.string().required()
            }),
            callback: Joi.function().required()
        }).validate({ data, callback });
        if (validation.error) {
            console.log(`User ${this.id} requested to join a lobby with invalid arguments: ${validation.error}`);
            return;
        }
        const { code } = data;
        const joinGame = () => {
            if (this.lobby) {
                return { error: "Already in a game" };
            }
            if (!this.lobbyManager.hasLobby(code)) {
                return { error: "Lobby not found" };
            }
            if (this.lobbyManager.getLobby(code).isFull()) {
                return { error: "Lobby is full" };
            }
            this.lobby = this.lobbyManager.joinLobby(this, code);
            if (!this.lobby) {
                return { error: "Unable to join lobby" };
            }
            return { players: this.lobby.generatePlayerList() };
        }
        const msg = joinGame();
        console.log(`User ${this.id} wants to join lobby ${code}, reply: ${JSON.stringify(msg)}`);
        callback(msg);
    }

    changeName(data, callback) {
        const validation = Joi.object({
            data: Joi.object({
                name: Joi.string().max(User.MAX_NAME_LENGTH).min(1).max(15).case('upper').required()
            }),
            callback: Joi.function().required()
        }).validate({ data, callback });
        if (validation.error) {
            console.log(`User ${this.id} requested to change their name with invalid arguments: ${validation.error}`);
            return;
        }
        const { name } = data;
        const changeName = () => {
            if (!this.lobby) {
                return { error: "Not in a lobby" };
            }
            this.name = name;
            this.lobby.broadcastPlayerListExcludeUser(SocketEvents.playerNameChange, this);
            return { players: this.lobby.generatePlayerList() };
        }
        const msg = changeName();
        console.log(`User ${this.id} wants to change their name to ${name}, reply: ${JSON.stringify(msg)}`);
        callback(msg);
    }

    playAgain(_, callback) {
        const validation = Joi.object({
            _: Joi.any().valid(null).required(), // must be null
            callback: Joi.function().required()
        }).validate({ _, callback });
        if (validation.error) {
            console.log(`User ${this.id} requested to play again with invalid arguments: ${validation.error}`);
            return;
        }
        const playAgain = () => {
            if (!this.lobby) {
                return { error: "Not in a lobby" };
            }
            if (!this.lobby.inGame) {
                return { error: "Game is not in progress" };
            }
            if (this.playingAgain) {
                return { error: "Already playing again" };
            }
            this.playingAgain = true;
            this.lobby.broadcastPlayerListExcludeUser(SocketEvents.playAgainChange, this);
            return { players: this.lobby.generatePlayerList() };
        }
        const msg = playAgain();
        console.log(`User ${this.id} wants to play again, reply: ${JSON.stringify(msg)}`);
        callback(msg);
    }

    removePlayer(data, callback) {
        const validation = Joi.object({
            data: Joi.object({
                id: Joi.string().min(1).required()
            }),
            callback: Joi.function().required()
        }).validate({ data, callback });
        if (validation.error) {
            console.log(`User ${this.id} requested to kick a user with invalid arguments: ${validation.error}`);
            return;
        }
        const { id } = data;
        const removePlayer = () => {
            if (!this.lobby) {
                return { error: "Not in a lobby" };
            }
            // Is host & user is in same lobby & user removed is not the host themselves
            if (!this.isHost) {
                return { error: "Insufficient permissions to remove player"};
            }
            if (id === this.id) {
                return { error: "Cannot remove yourself from the lobby" };
            }
            const player = this.lobby.getUserById(id);
            if (!player) {
                return { error: "Player is not in this lobby" };
            }
            this.lobby.removePlayer(player);
            return { players: this.lobby.generatePlayerList() };
        }
        const msg = removePlayer();
        console.log(`User ${this.id} wants to remove player ${id} from their lobby, reply: ${JSON.stringify(msg)}`);
        callback(msg);
    }

    startGame(_, callback) {
        const validation = Joi.object({
            _: Joi.any().valid(null).required(), // must be null
            callback: Joi.function().required()
        }).validate({ _, callback });
        if (validation.error) {
            console.log(`User ${this.id} requested to start a game with invalid arguments: ${validation.error}`);
            return;
        }
        const startGame = () => {
            if (!this.lobby) {
                return { error: "Not in a lobby" };
            }
            if (!this.isHost) {
                return { error: "Only host can start a game" };
            }
            if (!this.lobby.startGame()) {
                return { error: "Unable to start game" };
            }
            return { players: this.lobby.generatePlayerList() };
        }
        const msg = startGame();
        console.log(`User ${this.id} wants to start a game, reply: ${JSON.stringify(msg)}`);
        callback(msg);
    }

    // Game Events

    shootCueBall(data, callback) {
        const validation = Joi.object({
            data: Joi.object({
                direction: Joi.object({
                    x: Joi.number().required(),
                    y: Joi.number().required()
                }).required(),
                strength: Joi.number().positive().required()
            }),
            callback: Joi.function().required()
        }).validate({ data, callback });
        // More complex validation (eg. upper bound on strength) should be done by clients
        if (validation.error) {
            console.log(`User ${this.id} requested to shoot the cue ball with invalid arguments: ${validation.error}`);
            return;
        }
        const shootCueBall = () => {
            if (!this.lobby) {
                return { error: "Not in a lobby" };
            }
            if (!this.lobby.inGame) {
                return { error: "Game is not in progress" };
            }
            this.lobby.broadcastMessageExcludeUser(SocketEvents.shootCueBall, { id: this.id, ...data }, this);
            return { success: true };
        };
        const msg = shootCueBall();
        console.log(`User ${this.id} wants to shoot the cue ball, reply: ${JSON.stringify(msg)}`);
        callback(msg);
    }

    placeCueBall(data, callback) {
        const validation = Joi.object({
            data: Joi.alternatives().try(
                Joi.object({
                    position: Joi.object({
                        x: Joi.number().required(),
                        y: Joi.number().required()
                    }).required()
                }),
                Joi.any().valid(null)
            ),
            callback: Joi.function().required()
        }).validate({ data, callback });
        if (validation.error) {
            console.log(`User ${this.id} requested to place the cue ball with invalid arguments: ${validation.error}`);
            return;
        }
        const placeCueBall = () => {
            if (!this.lobby) {
                return { error: "Not in a lobby" };
            }
            if (!this.lobby.inGame) {
                return { error: "Game is not in progress" };
            }
            this.lobby.broadcastMessageExcludeUser(SocketEvents.placeCueBall, { id: this.id, ...data }, this);
            return { success: true };
        };
        const msg = placeCueBall();
        console.log(`User ${this.id} wants to place the cue ball, reply: ${JSON.stringify(msg)}`);
        callback(msg);
    }

    pickUpCueBall(_, callback) {
        const validation = Joi.object({
            _: Joi.any().valid(null).required(), // must be null
            callback: Joi.function().required()
        }).validate({ _, callback });
        if (validation.error) {
            console.log(`User ${this.id} requested to pick up the cue ball with invalid arguments: ${validation.error}`);
            return;
        }
        const pickUpCueBall = () => {
            if (!this.lobby) {
                return { error: "Not in a lobby" };
            }
            if (!this.lobby.inGame) {
                return { error: "Game is not in progress" };
            }
            this.lobby.broadcastMessageExcludeUser(SocketEvents.pickUpCueBall, { id: this.id }, this);
            return { success: true };
        };
        const msg = pickUpCueBall();
        console.log(`User ${this.id} wants to pick up the cue ball, reply: ${JSON.stringify(msg)}`);
        callback(msg);
    }

    moveMouse(data, callback) {
        const validation = Joi.object({
            data: Joi.object({
                position: Joi.object({
                    x: Joi.number().required(),
                    y: Joi.number().required()
                }).required()
            }),
            callback: Joi.function().required()
        }).validate({ data, callback });
        if (validation.error) {
            console.log(`User ${this.id} requested to move the mouse with invalid arguments: ${validation.error}`);
            return;
        }
        const moveMouse = () => {
            if (!this.lobby) {
                return { error: "Not in a lobby" };
            }
            if (!this.lobby.inGame) {
                return { error: "Game is not in progress" };
            }
            this.lobby.broadcastMessageExcludeUser(SocketEvents.moveMouse, { id: this.id, ...data }, this);
            return { success: true };
        };
        const msg = moveMouse();
        console.log(`User ${this.id} wants to move the mouse, reply: ${JSON.stringify(msg)}`);
        callback(msg);
    }

    changeStrength(data, callback) {
        const validation = Joi.object({
            data: Joi.object({
                fraction: Joi.number().min(0).max(1).required()
            }),
            callback: Joi.function().required()
        }).validate({ data, callback });
        if (validation.error) {
            console.log(`User ${this.id} requested to change the strength with invalid arguments: ${validation.error}`);
            return;
        }
        const changeStrength = () => {
            if (!this.lobby) {
                return { error: "Not in a lobby" };
            }
            if (!this.lobby.inGame) {
                return { error: "Game is not in progress" };
            }
            this.lobby.broadcastMessageExcludeUser(SocketEvents.changeStrength, { id: this.id, ...data }, this);
            return { success: true };
        };
        const msg = changeStrength();
        console.log(`User ${this.id} wants to change the strength, reply: ${JSON.stringify(msg)}`);
        callback(msg);
    }
}

module.exports = User;