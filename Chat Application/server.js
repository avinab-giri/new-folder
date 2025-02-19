const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public")); // Serve static files

io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("joinRoom", (room) => {
        socket.join(room);
        console.log(`User joined room: ${room}`);
    });

    socket.on("chatMessage", ({ room, message }) => {
        io.to(room).emit("message", message);
    });

    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });
});

server.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
