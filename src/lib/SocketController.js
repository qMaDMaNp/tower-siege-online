import io from "socket.io-client";

class SocketController {
    constructor() {
        this.socket = io(`ws://${process.env.VUE_APP_ORIGIN}`, {
            query: {token: window.localStorage.getItem('token')}
        });
    }
}

const socketController = new SocketController();
export default socketController;
