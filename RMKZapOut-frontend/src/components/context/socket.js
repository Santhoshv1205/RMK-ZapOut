import { io } from "socket.io-client";

const socket = io("https://rmk-zapout-production.up.railway.app", {
  autoConnect: false,
});

export default socket;
