import { io } from 'socket.io-client';

const URL = import.meta.env.VITE_WS_URL;
const socket = io(URL, {
    autoConnect: true,
    transports: ['websocket', 'polling'],
});

export default socket; 