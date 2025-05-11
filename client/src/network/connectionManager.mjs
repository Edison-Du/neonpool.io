import { socket } from "./socket.mjs";

export class ConnectionManager {
    static init() {
        socket.connect();
    } 

    static destroy() {
        socket.disconnect();
    }

    static getId() {
        return socket.id;
    }

    static addListener(eventName, listener) {
        socket.on(eventName, listener);
    }

    static removeListener(eventName) {
        socket.off(eventName);
    }

    // Takes object mapping event name to a callback function
    static addListeners(listeners) {
        for (const [event, listener] of Object.entries(listeners)) {
            this.addListener(event, listener);
        }
    }

    // Option to remove all listeners or some from a given array.
    static removeListeners(eventNames) {
        for (const eventName of eventNames) {
            this.removeListener(eventName);
        }
    }

    static sendEvent(eventName, arg=null, responseHandler=null) {
        socket.emit(eventName, arg, responseHandler);
    }
}