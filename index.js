const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./src/utils/db');
const toyRoutes = require('./src/routes/toyRoutes');
const userRoutes = require('./src/routes/userRoutes');
const swapRoutes = require('./src/routes/swapRoutes');
const purchaseRoutes = require('./src/routes/purchaseRoutes');
const transactionRoutes = require('./src/routes/transactionRoutes');
const reviewRoutes = require('./src/routes/reviewRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const authRoutes = require('./src/routes/authRoutes');
const oldToyRoutes = require('./src/routes/oldToyRoutes');
const exchangeRoutes = require('./src/routes/exchangeRoutes');
const shopRoutes = require('./src/routes/shopRoutes');
const chatRoutes = require('./src/routes/chatRoutes');
const { initializeSocket } = require('./src/socket/socketServer');

require('dotenv').config();

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/', authRoutes); // Mounts /auth/register, /auth/login
app.use('/', toyRoutes); // Mounts /toys, /mytoys
app.use('/', userRoutes); // Mounts /users
app.use('/', swapRoutes); // Mounts /swap
app.use('/', purchaseRoutes); // Mounts /purchase
app.use('/', transactionRoutes); // Mounts /transactions
app.use('/', reviewRoutes); // Mounts /reviews
app.use('/', analyticsRoutes); // Mounts /analytics
app.use('/', oldToyRoutes); // Mounts /old-toys
app.use('/', exchangeRoutes); // Mounts /exchange
app.use('/', shopRoutes); // Mounts /shops
app.use('/', chatRoutes); // Mounts /chat

app.get('/hi', (req, res) => {
  res.send('shafin,,,your server is running...')
});

// Initialize Socket.io
const io = initializeSocket(server);

// Start Server
const startServer = async () => {
  await connectDB();
  server.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log(`Socket.io server initialized`);
  });
};

startServer().catch(console.dir);
