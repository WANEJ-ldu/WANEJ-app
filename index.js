const express = require('express');
const http = require('http');
const path = require('path');
const morgan = require('morgan');
// Import config
const config = require('./config');
const cookieParser = require('cookie-parser');

const { Server } = require('socket.io');

const apiRoutes = require('./routes/api/routes');
const webRoutes = require('./routes/web/routes');

const app = express();
const server = http.createServer(app);

// Configuration Socket.IO
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const userToLocals = require('./middleware/userToLocals');

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Pour les formulaires
app.use(cookieParser());

app.use((req, res, next) => {
    req.realIp = req.headers['x-real-ip'] || req.ip;
    next();
});

// Fix for CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Config EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
// Expose static files
app.use(express.static(path.join(__dirname, 'public')));

app.use(morgan('common'));

app.use(userToLocals);

app.use('/', webRoutes);
app.use('/api', apiRoutes);

server.listen(config.port, () => {
    console.log(`SYSTEM: Server is running on port: ${config.port}`);
});