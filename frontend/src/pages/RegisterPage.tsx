import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Link,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/userService';

export default function RegisterPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    passwordConfirmation: '',
    name: '',
    username: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const registerMutation = useMutation({
    mutationFn: () => userService.register(formData),
    onSuccess: () => {
      // ユーザー情報を再取得
      queryClient.invalidateQueries({ queryKey: ['me'] });
      // ホームページにリダイレクト
      navigate('/');
    },
    onError: (error: any) => {
      const errors = error?.response?.data?.errors;
      if (Array.isArray(errors)) {
        setError(errors.join(', '));
      } else {
        setError('アカウントの作成に失敗しました');
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // バリデーション
    if (!formData.email || !formData.password || !formData.name || !formData.username) {
      setError('すべての必須項目を入力してください');
      return;
    }

    if (formData.password !== formData.passwordConfirmation) {
      setError('パスワードが一致しません');
      return;
    }

    if (formData.password.length < 6) {
      setError('パスワードは6文字以上で入力してください');
      return;
    }

    registerMutation.mutate();
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'grey.100',
      }}
    >
      <Paper sx={{ p: 4, maxWidth: 500, width: '100%', mx: 2 }}>
        <Box sx={{ mb: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
            sx={{ textTransform: 'none' }}
          >
            ホームに戻る
          </Button>
        </Box>

        <Typography variant="h4" component="h1" gutterBottom align="center">
          新規登録
        </Typography>
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
          水族館訪問記録を始めましょう
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="メールアドレス"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="ユーザー名"
            required
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            helperText="他のユーザーに表示されるユーザー名"
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="表示名"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            helperText="プロフィールに表示される名前"
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="パスワード"
            type={showPassword ? 'text' : 'password'}
            required
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            helperText="6文字以上で入力してください"
            sx={{ mb: 2 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <TextField
            fullWidth
            label="パスワード（確認）"
            type={showPasswordConfirmation ? 'text' : 'password'}
            required
            value={formData.passwordConfirmation}
            onChange={(e) => setFormData({ ...formData, passwordConfirmation: e.target.value })}
            sx={{ mb: 3 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                    edge="end"
                  >
                    {showPasswordConfirmation ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={registerMutation.isPending}
            sx={{ mb: 2 }}
          >
            {registerMutation.isPending ? '登録中...' : '登録'}
          </Button>

          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              すでにアカウントをお持ちですか？{' '}
              <Link href="/login" underline="hover">
                ログイン
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
