const SocketEvents = require("./socketEvents");
const User = require("./user");

class Lobby {

    static MAX_PLAYERS = 4;
    
    code;
    players;
    playerCounter; // number of players joined so far, used to index names
    inGame;
    
    /**
     * Lobby
     * Maintains a list of players and communications between them
     * @param {String} code 
     * @param {User} host 
     */
    constructor(code, host) {
        this.code = code;
        this.players = [host];
        this.playerCounter = 1;
        this.inGame = false;
        host.socket.join(code);
        host.isHost = true;
        host.name = `PLAYER ${this.playerCounter}`;
    }

    /**
     * generatePlayerList
     * Creates an array containing player information to broadcast to clients
     * @returns {Array<{id: String, isHost: boolean}>}
     */
    generatePlayerList() {
        return this.players.map(player => player.getGameInfo());
    }

    /**
     * isFull
     * @returns {boolean} Whether or not this room has the max number of players
     */
    isFull() {
        return this.players.length === Lobby.MAX_PLAYERS;
    }

    /**
     * size
     * @returns {number} The number of players in this lobby
     */
    size() {
        return this.players.length;
    }

    /**
     * hasUserId
     * @param {String} id 
     * @returns {boolean} If the user with the specified ID is in this lobby 
     */
    hasUserId(id) {
        return !!this.getUserById(id); // "cast" to bool
    }

    /**
     * getUserById
     * @param {String} id 
     * @returns {boolean} The user with the specified ID in this lobby, null otherwise 
     */
    getUserById(id) {
        return this.players.find(player => player.id === id);
    }

    /**
     * addPlayer
     * @param {User} user 
     * @returns {boolean} Whether or not the player could be added
     */
    addPlayer(user) {
        if (this.isFull() || this.players.includes(user) || this.inGame) {
            return false;
        }
        user.name = `PLAYER ${++this.playerCounter}`;
        this.players.push(user);
        // create socket.io room & broadcast message
        user.socket.join(this.code);
        user.socket.to(this.code).emit(SocketEvents.playerJoin, { players: this.generatePlayerList() });
        return true;
    }

    /**
     * removePlayer
     * @param {User} user 
     * @returns {boolean} Whether or not the player was removed
     */
    removePlayer(user) {
        for (let i = this.players.length-1; i >= 0; i--) {
            if (this.players[i] === user) {
                this.players.splice(i, 1);
                // choose new host
                user.isHost = false;
                if (this.players.length > 0) {
                    this.players[0].isHost = true;
                }
                // remove from socket.io room & broadcast message
                user.socket.nsp.to(this.code).emit(SocketEvents.playerLeave, { players: this.generatePlayerList() });
                user.socket.leave(this.code);
                return true;
            }
        }
        return false;
    }

    /**
     * broadcastPlayerList
     * @param {String} event  
     * @param {User} user 
     * @returns {boolean} Whether or not the user given is able to broadcast messages
     */
    broadcastPlayerList(event, user) {
        if (!this.players.includes(user)) {
            return false;
        }
        user.socket.to(this.code).emit(event, { players: this.generatePlayerList() });
        return true;
    }
}

module.exports = Lobby;