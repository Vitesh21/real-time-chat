/**
 * Real-time Chat Server
 * 
 * Features:
 * - Real-time messaging using Socket.IO
 * - User presence management
 * - Message history
 * - Typing indicators
 * - Error handling and logging
 */

const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const path = require('path');

// Constants
const MAX_MESSAGES = 100; // Limit stored messages for memory management
const TYPING_TIMEOUT = 5000; // Milliseconds to show typing indicator

// Initialize Express and Socket.IO
const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client/build')));

// In-memory data stores
const users = new Map();
const messages = [];
const typingTimeouts = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`New client connected (${socket.id})`);

  // Handle user login
  socket.on('login', (username) => {
    try {
      // Validate username
      if (!username || typeof username !== 'string') {
        throw new Error('Invalid username');
      }

      // Store user data
      users.set(socket.id, {
        username,
        id: socket.id,
        isTyping: false,
        lastActive: new Date()
      });

      // Broadcast user list update
      io.emit('users_update', Array.from(users.values()));

      // Send message history (limited to last MAX_MESSAGES)
      socket.emit('message_history', messages.slice(-MAX_MESSAGES));

      console.log(`User logged in: ${username}`);
    } catch (error) {
      console.error('Login error:', error);
      socket.emit('error', 'Failed to login. Please try again.');
    }
  });

  // Handle new messages
  socket.on('message', (message) => {
    try {
      const user = users.get(socket.id);
      if (!user) {
        throw new Error('User not found');
      }

      // Validate message
      if (!message || typeof message !== 'string' || message.trim().length === 0) {
        throw new Error('Invalid message');
      }

      // Create message object
      const messageObject = {
        id: Date.now(),
        text: message.trim(),
        user: user.username,
        timestamp: new Date().toISOString()
      };

      // Store message and maintain message limit
      messages.push(messageObject);
      if (messages.length > MAX_MESSAGES) {
        messages.shift();
      }

      // Broadcast message to all clients
      io.emit('message', messageObject);

      // Update user's last active timestamp
      user.lastActive = new Date();
      users.set(socket.id, user);

    } catch (error) {
      console.error('Message error:', error);
      socket.emit('error', 'Failed to send message. Please try again.');
    }
  });

  // Handle typing indicator
  socket.on('typing', (isTyping) => {
    try {
      const user = users.get(socket.id);
      if (!user) return;

      // Clear existing typing timeout
      if (typingTimeouts.has(socket.id)) {
        clearTimeout(typingTimeouts.get(socket.id));
      }

      // Update user's typing status
      user.isTyping = isTyping;
      users.set(socket.id, user);

      // Broadcast typing status
      socket.broadcast.emit('user_typing', {
        username: user.username,
        isTyping
      });

      // Set timeout to automatically clear typing status
      if (isTyping) {
        const timeout = setTimeout(() => {
          if (users.has(socket.id)) {
            const user = users.get(socket.id);
            user.isTyping = false;
            users.set(socket.id, user);
            socket.broadcast.emit('user_typing', {
              username: user.username,
              isTyping: false
            });
          }
        }, TYPING_TIMEOUT);
        typingTimeouts.set(socket.id, timeout);
      }
    } catch (error) {
      console.error('Typing indicator error:', error);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    try {
      // Clear typing timeout
      if (typingTimeouts.has(socket.id)) {
        clearTimeout(typingTimeouts.get(socket.id));
        typingTimeouts.delete(socket.id);
      }

      // Remove user and broadcast update
      const user = users.get(socket.id);
      if (user) {
        console.log(`User disconnected: ${user.username}`);
        users.delete(socket.id);
        io.emit('users_update', Array.from(users.values()));
      }
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  });
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`- Socket.IO enabled`);
  console.log(`- Serving static files from ${path.join(__dirname, '../client/build')}`);
  console.log(`- Maximum message history: ${MAX_MESSAGES} messages`);
});
