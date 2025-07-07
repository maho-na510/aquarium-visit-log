import React from 'react';
import { Box, Button, TextField, Typography, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = () => {
    // TODO: 実際のログイン処理
    localStorage.setItem('authToken', 'dummy-token');
    navigate('/');
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          ログイン
        </Typography>
        <Box sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="ユーザー名"
            autoFocus
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="パスワード"
            type="password"
          />
          <Button
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            onClick={handleLogin}
          >
            ログイン
          </Button>
        </Box>
      </Box>
    </Container>
  );
}