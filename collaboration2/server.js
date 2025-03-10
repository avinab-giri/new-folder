const express = require('express');
const http = require('http');
const WebSocket = require('ws');

// Create an Express app
const app = express();
const server = http.createServer(app);

// Serve static files (frontend)
app.use(express.static('public'));

// Create a WebSocket server
const wss = new WebSocket.Server({ server });

// Broadcast function to send messages to all clients
wss.on('connection', (ws) => {
    console.log('New client connected');

    // Listen for messages from clients
    ws.on('message', (message) => {
        console.log(`Received: ${message}`);
        // Broadcast the message to all connected clients
        wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });

    // Handle client disconnection
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});