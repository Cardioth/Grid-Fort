const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
      origin: ['http://localhost:5173', 'https://gridfort.netlify.app'],
      methods: ['GET', 'POST']
    }
});  

app.get('/', (req, res) => {
  res.send('Grid Fort Server');
});

const corsOptions = {
    origin: ['http://localhost:5173', 'https://gridfort.netlify.app'],
    methods: ['GET', 'POST']
};

app.use(cors(corsOptions));


io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
