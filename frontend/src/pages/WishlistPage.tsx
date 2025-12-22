import React from 'react';
import { Box, Typography, Alert, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useMe } from '../hooks/useMe';

export default function WishlistPage() {
  const navigate = useNavigate();
  const { data: meData } = useMe();
  const isLoggedIn = !!meData?.user;

  if (!isLoggedIn) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          行きたいリスト
        </Typography>
        <Alert severity="info">
          行きたいリストを使用するには
          <Button onClick={() => navigate('/login')} sx={{ ml: 1 }}>
            ログイン
          </Button>
          または
          <Button onClick={() => navigate('/register')} sx={{ ml: 1 }}>
            新規登録
          </Button>
          してください
        </Alert>
      </Box>
    );
  }

  return <Typography variant="h4">行きたいリストページ（実装予定）</Typography>;
}