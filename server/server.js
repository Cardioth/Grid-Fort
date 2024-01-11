const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const passport = require('passport');
const initializePassport = require('./routes/passport-config');
const authRoutes = require('./routes/auth-routes');
require('dotenv').config();
const session = require('express-session');
const RedisStore = require("connect-redis").default
const redisClient = require('./db/redis');

// Express
const app = express();
const server = http.createServer(app);
app.get('/', (req, res) => {
  res.send('Grid Fort Server');
});

// Express CORS
const corsOptions = {
  origin: ['http://localhost:5173', 'https://gridfort.netlify.app'],
  methods: ['GET', 'POST']
};
app.use(cors(corsOptions));

app.use(express.json());

app.use(express.urlencoded({ extended: false }));
const sessionMiddleware = session({
  store: new RedisStore({ client: redisClient }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 1000 * 60 * 60 * 24
  }
});
app.use(sessionMiddleware)
app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRoutes);

// Socket.io
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'https://gridfort.netlify.app'],
    credentials: true,
    methods: ['GET', 'POST'],
  }
});

io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
});


// Rejects connection if user is not authenticated
io.on('connection', (socket) => {
  console.log(socket.request.session);
  if(socket.request.session && socket.request.session.passport && socket.request.session.passport.user) {
    console.log('User connected:', socket.request.session.passport.user);
  } else {
    console.log('Unauthenticated user connected');
    socket.disconnect(true);
  }
});

// Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

// Passport
initializePassport(
  passport,
  username => users.find(user => user.username === username),
  id => users.find(user => user.id === id)
);