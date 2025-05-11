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

        socket.on("disconnect", this.disconnect.bind(this));

        socket.on(SocketEvents.createGame, this.createGame.bind(this));
        socket.on(SocketEvents.playerJoin, this.joinGame.bind(this));
        socket.on(SocketEvents.playerNameChange, this.changeName.bind(this));
        socket.on(SocketEvents.playerLeave, this.removePlayer.bind(this));

        socket.on(SocketEvents.startGame, this.startGame.bind(this));
    }

    /**
     * getGameInfo
     * @returns {{id: String, isHost: boolean}} necessary information to send to other users in a game
     */
    getGameInfo() {
        return {
            id: this.id,
            name: this.name,
            isHost: this.isHost
        }
    }

    disconnect() {
        if (this.lobby) {
            this.lobbyManager.leaveLobby(this);
            this.lobby = null;
        }
        console.log(`User ${this.id} has disconnected`);
    }

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
            if (this.lobbyManager.getLobby(code).inGame) {
                return { error: "Game is in progress" };
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
                name: Joi.string().max(User.MAX_NAME_LENGTH).min(1).case('upper').required()
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
            this.lobby.broadcastPlayerList(SocketEvents.playerNameChange, this);
            return { players: this.lobby.generatePlayerList() };
        }
        const msg = changeName();
        console.log(`User ${this.id} wants to change their name to ${name}, reply: ${JSON.stringify(msg)}`);
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

    startGame(data, callback) {

    }
}

module.exports = User;