import { io } from "socket.io-client";

const socket = io("http://localhost:8800", {
  autoConnect: false, 
});

socket.connect();

export default socket;
