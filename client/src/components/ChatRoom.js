import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  List,
  ListItem,
  Badge,
  Avatar,
  Grid,
  Container,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { formatDistanceToNow } from 'date-fns';

function ChatRoom({ messages, users, username, typingUsers, onSendMessage, onTyping }) {
  const [newMessage, setNewMessage] = useState('');
  const [typingTimeout, setTypingTimeout] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
      onTyping(false);
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    if (typingTimeout) clearTimeout(typingTimeout);
    onTyping(true);
    const timeout = setTimeout(() => {
      onTyping(false);
    }, 1000);
    setTypingTimeout(timeout);
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  const getRandomColor = (name) => {
    const colors = ['#1976d2', '#dc004e', '#388e3c', '#f57c00', '#7b1fa2'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <Container maxWidth="xl" sx={{ height: '100vh', py: 2 }}>
      <Grid container spacing={2} sx={{ height: '100%' }}>
        {/* Main Chat Area */}
        <Grid item xs={12} md={9} sx={{ height: '100%' }}>
          <Paper 
            elevation={3}
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 2,
              overflow: 'hidden'
            }}
          >
            {/* Chat Header */}
            <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
              <Typography variant="h6">
                Chat Room ({users.length} online)
              </Typography>
              {typingUsers.size > 0 && (
                <Typography variant="caption">
                  {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
                </Typography>
              )}
            </Box>

            {/* Messages */}
            <Box
              sx={{
                flexGrow: 1,
                overflow: 'auto',
                p: 2,
                bgcolor: '#f5f5f5',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {messages.length === 0 ? (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center', 
                  alignItems: 'center',
                  height: '100%',
                  color: 'text.secondary'
                }}>
                  <Typography variant="body1">
                    No messages yet. Start the conversation!
                  </Typography>
                </Box>
              ) : (
                <List sx={{ width: '100%' }}>
                  {messages.map((message) => (
                    <ListItem
                      key={message.id}
                      sx={{
                        flexDirection: 'column',
                        alignItems: message.user === username ? 'flex-end' : 'flex-start',
                        py: 0.5
                      }}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          flexDirection: message.user === username ? 'row-reverse' : 'row',
                          gap: 1,
                          maxWidth: '70%'
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: getRandomColor(message.user),
                            fontSize: '0.875rem'
                          }}
                        >
                          {getInitials(message.user)}
                        </Avatar>
                        <Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ 
                              ml: message.user === username ? 0 : 1,
                              mr: message.user === username ? 1 : 0
                            }}
                          >
                            {message.user === username ? 'You' : message.user}
                          </Typography>
                          <Paper
                            elevation={1}
                            sx={{
                              p: 1.5,
                              bgcolor: message.user === username ? 'primary.main' : 'white',
                              color: message.user === username ? 'white' : 'text.primary',
                              borderRadius: 2,
                              mt: 0.5,
                              wordBreak: 'break-word'
                            }}
                          >
                            <Typography variant="body1">{message.text}</Typography>
                            <Typography 
                              variant="caption" 
                              sx={{ 
                                opacity: 0.7, 
                                display: 'block', 
                                mt: 0.5,
                                color: message.user === username ? 'white' : 'text.secondary'
                              }}
                            >
                              {formatDistanceToNow(new Date(message.timestamp), { addSuffix: true })}
                            </Typography>
                          </Paper>
                        </Box>
                      </Box>
                    </ListItem>
                  ))}
                  <div ref={messagesEndRef} />
                </List>
              )}
            </Box>

            {/* Message Input */}
            <Box
              component="form"
              onSubmit={handleSend}
              sx={{
                p: 2,
                bgcolor: 'background.paper',
                borderTop: 1,
                borderColor: 'divider'
              }}
            >
              <Grid container spacing={1}>
                <Grid item xs>
                  <TextField
                    fullWidth
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={handleTyping}
                    variant="outlined"
                    size="small"
                    autoComplete="off"
                  />
                </Grid>
                <Grid item>
                  <IconButton
                    type="submit"
                    disabled={!newMessage.trim()}
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                      '&.Mui-disabled': {
                        bgcolor: 'action.disabledBackground',
                      }
                    }}
                  >
                    <SendIcon />
                  </IconButton>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>

        {/* Users Sidebar */}
        <Grid item xs={12} md={3} sx={{ height: { md: '100%', xs: 'auto' } }}>
          <Paper
            elevation={3}
            sx={{
              height: '100%',
              p: 2,
              borderRadius: 2
            }}
          >
            <Typography variant="h6" gutterBottom>
              Online Users ({users.length})
            </Typography>
            <List>
              {users.map((user) => (
                <ListItem 
                  key={user.id}
                  sx={{
                    borderRadius: 1,
                    mb: 1,
                    bgcolor: user.username === username ? 'action.selected' : 'transparent'
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: getRandomColor(user.username),
                      mr: 1
                    }}
                  >
                    {getInitials(user.username)}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="body1">
                      {user.username === username ? `${user.username} (You)` : user.username}
                    </Typography>
                    {user.isTyping && (
                      <Typography variant="caption" color="text.secondary">
                        typing...
                      </Typography>
                    )}
                  </Box>
                  <Badge 
                    color="success" 
                    variant="dot"
                    sx={{
                      '& .MuiBadge-badge': {
                        width: 8,
                        height: 8,
                        borderRadius: '50%'
                      }
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default ChatRoom;
