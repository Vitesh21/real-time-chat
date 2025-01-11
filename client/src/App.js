/**
 * Real-time Chat Application
 * 
 * This is the main application component that handles:
 * - Socket.io connection management
 * - User authentication state
 * - Message and user state management
 * - Theme configuration
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import io from 'socket.io-client';
import Login from './components/Login';
import ChatRoom from './components/ChatRoom';

// Theme configuration
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

// Socket.io server configuration
const SOCKET_SERVER = 'http://localhost:5000';

function App() {
  // State management
  const [socket, setSocket] = useState(null);
  const [username, setUsername] = useState('');
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState(new Set());

  // Socket connection management
  useEffect(() => {
    const newSocket = io(SOCKET_SERVER);
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  // Socket event handlers
  useEffect(() => {
    if (!socket) return;

    // Message handlers
    const handleNewMessage = (message) => {
      setMessages((prev) => [...prev, message]);
    };

    const handleMessageHistory = (history) => {
      setMessages(history);
    };

    // User handlers
    const handleUsersUpdate = (updatedUsers) => {
      setUsers(updatedUsers);
    };

    const handleUserTyping = ({ username, isTyping }) => {
      setTypingUsers((prev) => {
        const newSet = new Set(prev);
        if (isTyping) {
          newSet.add(username);
        } else {
          newSet.delete(username);
        }
        return newSet;
      });
    };

    // Socket event listeners
    socket.on('message', handleNewMessage);
    socket.on('message_history', handleMessageHistory);
    socket.on('users_update', handleUsersUpdate);
    socket.on('user_typing', handleUserTyping);

    // Cleanup function
    return () => {
      socket.off('message', handleNewMessage);
      socket.off('message_history', handleMessageHistory);
      socket.off('users_update', handleUsersUpdate);
      socket.off('user_typing', handleUserTyping);
    };
  }, [socket]);

  // Event handlers
  const handleLogin = useCallback((name) => {
    setUsername(name);
    socket?.emit('login', name);
  }, [socket]);

  const handleSendMessage = useCallback((message) => {
    socket?.emit('message', message);
  }, [socket]);

  const handleTyping = useCallback((isTyping) => {
    socket?.emit('typing', isTyping);
  }, [socket]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.default'
        }}
      >
        {!username ? (
          <Login onLogin={handleLogin} />
        ) : (
          <ChatRoom
            messages={messages}
            users={users}
            username={username}
            typingUsers={typingUsers}
            onSendMessage={handleSendMessage}
            onTyping={handleTyping}
          />
        )}
      </Box>
    </ThemeProvider>
  );
}

export default App;
