const dotenv = require('dotenv');
const { createServer } = require("http");
const { Server } = require("socket.io");
const SocketManager = require("./modules/socketManager.js");

dotenv.config();

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGINS.split(',')
  }
});
const port = process.env.PORT || 8080;

new SocketManager(io);

httpServer.listen(port);

console.log(`Listening on port ${port}`);