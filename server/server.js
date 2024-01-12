const fs = require('fs');
const express = require('express');
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
let server;
if (process.env.NODE_ENV === 'development') {
  const https = require('https');
  const options = {
    key: fs.readFileSync('localhost+2-key.pem'),
    cert: fs.readFileSync('localhost+2.pem')
  };
  server = https.createServer(options, app).listen(3000, () => {
    console.log('HTTPS server running locally on port 3000');
  });
} else {
  const http = require('http');
  server = http.createServer(app).listen(process.env.PORT || 3000, () => {
    console.log(`Server running on port ${process.env.PORT || 3000}`);
  });
}


// Express CORS
const corsOptions = {
  origin: ['https://localhost:5173', 'https://gridfort.netlify.app'],
  methods: ['GET', 'POST'],
  credentials: true,
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
    domain: process.env.NODE_ENV === 'development' ? 'localhost' : 'api.gridfort.net',
    httpOnly: true,
    sameSite: 'none',
    secure: true,
    expires: 1000 * 60 * 60 * 24 * 7 // 1 week
  }
});
app.set('trust proxy', 2)
app.use(sessionMiddleware)
app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRoutes);

// Socket.io
const io = new Server(server, {
  cors: {
    origin: ['https://localhost:5173', 'https://gridfort.netlify.app'],
    credentials: true,
    methods: ['GET', 'POST'],
  }
});

io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
});


// Rejects connection if user is not authenticated
io.on('connection', (socket) => {
  if(socket.request.session && socket.request.session.passport && socket.request.session.passport.user) {
    console.log('User connected:', socket.request.session.passport.user);
  } else {
    console.log('Unauthenticated user connected');
    socket.disconnect(true);
  }
});

// Passport
initializePassport(
  passport,
  username => users.find(user => user.username === username),
  id => users.find(user => user.id === id)
);