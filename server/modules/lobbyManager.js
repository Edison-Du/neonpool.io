const Lobby = require("./lobby");
const User = require("./user");

class LobbyManager {

    static CODE_LENGTH = 4;
    static MAX_ROOMS = 26 ** this.CODE_LENGTH;

    lobbyMap;

    constructor() {
        this.lobbyMap = new Map();
    }

    /**
     * #getRandomCode
     * @returns {String} a random lowercase string of length CODE_LENGTH
     */
    #getRandomCode() {
        let code = "";
        for (let i = 0; i < LobbyManager.CODE_LENGTH; i++) {
            code += String.fromCharCode(Math.floor(Math.random()*26+97));
        }
        return code;
    }

    /**
     * hasLobby
     * @param {String} code 
     * @returns {boolean} if a lobby with the given code exists
     */
    hasLobby(code) {
        return this.getLobby(code) !== null;
    }

    /**
     * getLobby
     * @param {String} code the lobby code 
     * @returns {Lobby} the lobby if it exists, null otherwise 
     */
    getLobby(code) {
        return this.lobbyMap.has(code) ? this.lobbyMap.get(code) : null;
    }

    /**
     * createLobby
     * @param {User} host 
     * @returns {Lobby} the created lobby
     */
    createLobby(host) {
        if (this.lobbyMap.size === this.MAX_ROOMS) {
            return null;
        }
        let code;
        do {
            code = this.#getRandomCode();
        } while (this.lobbyMap.has(code));
        const lobby = new Lobby(code, host);
        this.lobbyMap.set(code, lobby);
        return lobby;
    }

    /**
     * joinLobby
     * @param {User} user 
     * @param {String} code 
     * @returns {Lobby} the lobby the user joins, or null if the join was unsuccessful
     */
    joinLobby(user, code) {
        if (!this.lobbyMap.has(code)) {
            return null;
        }
        const lobby = this.lobbyMap.get(code);
        return lobby.addPlayer(user) ? lobby : null;
    }

    /**
     * leaveLobby
     * @param {User} user 
     * @returns {boolean} whether or not the user left their lobby, false if the user isn't in a lobby
     */
    leaveLobby(user) {
        const lobby = user.lobby;
        if (!lobby.removePlayer(user)) {
            return false;
        }
        if (lobby.size() === 0) {
            this.lobbyMap.delete(lobby.code);
        }
        return true;
    }
}

module.exports = LobbyManager;