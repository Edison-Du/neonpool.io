import { io } from 'socket.io-client';

// "undefined" means the URL will be computed from the `window.location` object
const URL = process.env.REACT_APP_SOCKET_SERVER_URL || undefined;

console.log(URL);

export const socket = io(URL, {
    autoConnect: false
});