const LobbyManager = require("./lobbyManager");
const User = require("./user");

class SocketManager {

    lobbyManager;

    /**
     * SocketManager
     * Creates a lobby system and a User for each incoming socket connection
     * @param {Server} io 
     */
    constructor(io) {
        this.lobbyManager = new LobbyManager();

        io.on("connection", (socket) => {
            const user = new User(this, socket);
            console.log(`New user ${user.id} has connected`);
        });
    }
}

module.exports = SocketManager;