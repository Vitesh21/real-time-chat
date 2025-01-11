import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Container,
  Avatar
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) {
      onLogin(username.trim());
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            borderRadius: 2,
          }}
        >
          <Avatar
            sx={{
              mb: 2,
              bgcolor: 'primary.main',
              width: 56,
              height: 56
            }}
          >
            <ChatIcon fontSize="large" />
          </Avatar>
          <Typography component="h1" variant="h5" gutterBottom>
            Welcome to Chat Room
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Connect with others in real-time
          </Typography>
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Enter your username"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              variant="outlined"
              sx={{ mb: 3 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={!username.trim()}
              sx={{
                py: 1.5,
                textTransform: 'none',
                fontSize: '1.1rem'
              }}
            >
              Join Chat
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default Login;
