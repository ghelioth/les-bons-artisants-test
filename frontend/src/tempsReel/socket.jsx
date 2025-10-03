import { io } from 'socket.io-client';
import { getToken } from '../api/http';


const URL = import.meta.env.VITE_WS_URL;


const socket = io(URL, {
    autoConnect: true,
    transports: ['websocket', 'polling'],
});

export function connectSocket() {
    socket.auth = { token: getToken() };
    if (!socket.connected) socket.connect();
}

export default socket; 