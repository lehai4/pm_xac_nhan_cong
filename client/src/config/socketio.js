import { io } from "socket.io-client";

// Kết nối đến server Socket.io
const socket = io("http://localhost:30210"); // Địa chỉ server của bạn
// const socket = io("http://192.168.1.197:30210");
// const socket = io("https://servertienich.vietlonghung.com.vn");
// const socket = io("http://171.244.39.87:30210");

export default socket;
