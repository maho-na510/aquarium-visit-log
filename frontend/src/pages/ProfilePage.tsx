import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Avatar,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Divider,
  IconButton,
  Card,
  CardContent,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  PhotoCamera as PhotoCameraIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useMe } from '../hooks/useMe';
import { userService } from '../services/userService';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { data: meData, isLoading: meLoading } = useMe();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const userId = meData?.user?.id;

  // ユーザー詳細情報を取得
  const { data: userData, isLoading: userLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => userService.getUser(userId!),
    enabled: !!userId,
  });

  // Redirect to home page if not logged in
  useEffect(() => {
    if (!meLoading && !meData?.user) {
      navigate('/');
    }
  }, [meLoading, meData, navigate]);

  // ユーザーデータが読み込まれたらフォームデータを初期化
  useEffect(() => {
    if (userData) {
      setFormData({
        name: (userData as any).name || '',
        username: (userData as any).username || '',
      });
    }
  }, [userData]);

  // ユーザー情報更新
  const updateMutation = useMutation({
    mutationFn: () => userService.updateUser(userId!, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      queryClient.invalidateQueries({ queryKey: ['me'] });
      setEditMode(false);
      setSuccess('プロフィールを更新しました');
      setError(null);
    },
    onError: (error: any) => {
      const errors = error?.response?.data?.errors;
      if (Array.isArray(errors)) {
        setError(errors.join(', '));
      } else {
        setError('更新に失敗しました');
      }
    },
  });

  // アバター画像アップロード
  const uploadAvatarMutation = useMutation({
    mutationFn: (file: File) => userService.uploadAvatar(userId!, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', userId] });
      queryClient.invalidateQueries({ queryKey: ['me'] });
      setSuccess('アバター画像を更新しました');
    },
    onError: () => {
      setError('画像のアップロードに失敗しました');
    },
  });

  const handleEdit = () => {
    setFormData({
      name: (userData as any)?.name || '',
      username: (userData as any)?.username || '',
    });
    setEditMode(true);
    setError(null);
    setSuccess(null);
  };

  const handleCancel = () => {
    setEditMode(false);
    setError(null);
  };

  const handleSave = () => {
    if (!formData.name || !formData.username) {
      setError('すべての項目を入力してください');
      return;
    }
    updateMutation.mutate();
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('ファイルサイズは5MB以下にしてください');
        return;
      }
      uploadAvatarMutation.mutate(file);
    }
  };

  if (meLoading || userLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!meData?.user) {
    return null;
  }

  const user = userData as any;
  const avatarUrl = user?.avatar_url || user?.avatarUrl;
  const visitCount = user?.visit_count || user?.visitCount || 0;
  const wishlistCount = user?.wishlist_count || user?.wishlistCount || 0;

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" component="h1" gutterBottom>
        プロフィール
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3, mb: 3 }}>
          <Box sx={{ position: 'relative' }}>
            <Avatar
              src={avatarUrl}
              sx={{ width: 120, height: 120 }}
            >
              {user?.name?.[0]?.toUpperCase()}
            </Avatar>
            <IconButton
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' },
              }}
              size="small"
              onClick={handleAvatarClick}
              disabled={uploadAvatarMutation.isPending}
            >
              {uploadAvatarMutation.isPending ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <PhotoCameraIcon fontSize="small" />
              )}
            </IconButton>
            <input
              ref={fileInputRef}
              type="file"
              hidden
              accept="image/*"
              onChange={handleFileChange}
            />
          </Box>

          <Box sx={{ flex: 1 }}>
            {editMode ? (
              <>
                <TextField
                  fullWidth
                  label="表示名"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  label="ユーザー名"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  sx={{ mb: 2 }}
                />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    startIcon={<SaveIcon />}
                    onClick={handleSave}
                    disabled={updateMutation.isPending}
                  >
                    保存
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
                  >
                    キャンセル
                  </Button>
                </Box>
              </>
            ) : (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="h5">{user?.name}</Typography>
                  <IconButton onClick={handleEdit}>
                    <EditIcon />
                  </IconButton>
                </Box>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  @{user?.username}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.email}
                </Typography>
              </>
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          <Grid size={{ xs: 6, sm: 4 }}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {visitCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  訪問記録
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {wishlistCount}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  行きたいリスト
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 4 }}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary">
                  {user?.favorite_aquariums?.length || user?.favoriteAquariums?.length || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  お気に入り
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {/* お気に入り水族館 */}
      {(user?.favorite_aquariums?.length > 0 || user?.favoriteAquariums?.length > 0) && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            お気に入り水族館
          </Typography>
          <Grid container spacing={2}>
            {(user?.favorite_aquariums || user?.favoriteAquariums || []).map((aquarium: any) => (
              <Grid size={{ xs: 12, sm: 6 }} key={aquarium.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle1">{aquarium.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {aquarium.prefecture} {aquarium.address}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}
    </Box>
  );
}
