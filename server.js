const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// WebSocket Connection & Real-time Broadcasting
wss.on('connection', (ws) => {
  console.log('Phone/PC Connected via WebSocket');

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);

      // Sabhi connected clients ko broadcast karo (Chat, Camera, Gallery)
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      });
    } catch (e) {
      console.log('Error parsing message');
    }
  });

  ws.on('close', () => {
    console.log('Client Disconnected');
  });
});

// Render ke liye dynamic port use karna zaroori hai
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
