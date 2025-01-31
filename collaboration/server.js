const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let documentContent = "";

// Serve static files (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
    console.log("A user connected");

    // Send current document state to new user
    socket.emit("load-document", documentContent);

    // Listen for changes
    socket.on("edit-document", (content) => {
        documentContent = content;
        socket.broadcast.emit("update-document", content);
    });

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

server.listen(3000, () => console.log("Server running on http://localhost:3000"));
