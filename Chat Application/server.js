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
        if (socket.currentRoom) {
            socket.leave(socket.currentRoom); 
        }
        socket.join(room);
        socket.currentRoom = room; // Update current room
        console.log(`User joined room: ${room}`);
    });
    
    
    socket.on("chatMessage", (data) => {
        const { message } = data;
        const room = socket.currentRoom; // Use stored room
        if (room) {
            io.to(room).emit("message", {
                message: message,
                room: socket.currentRoom
            });
        }
    });
    

    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });
});

server.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
