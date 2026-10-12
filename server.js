const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Hostinger MySQL Database Connection Details
const db = mysql.createConnection({
  host: 'localhost', // jaise sql100.hostinger.com
  user: 'u611767193_chating',
  password: '882988h@H369',
  database: 'u611767193_chat'
});

db.connect((err) => {
  if (err) console.log('DB Connection Failed:', err);
  else console.log('Connected to Hostinger MySQL Database!');
});

// API to load old chat history from DB
app.get('/messages', (req, res) => {
  db.query('SELECT * FROM messages ORDER BY id ASC', (err, results) => {
    if (err) res.status(500).send(err);
    else res.json(results);
  });
});

wss.on('connection', (ws) => {
  console.log('Phone/PC Connected via WebSocket');

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);

      // Agar chat message hai, toh database me save karo
      if (data.type === 'CHAT') {
        db.query('INSERT INTO messages (sender, message) VALUES (?, ?)', [data.sender, data.text], (err) => {
          if (err) console.log('Error saving chat', err);
        });
      }

      // Sabhi connected clients ko broadcast karo
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      });
    } catch (e) {
      console.log('Error parsing message');
    }
  });
});

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
