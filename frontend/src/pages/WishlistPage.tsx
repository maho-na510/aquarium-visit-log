import React, { useState } from 'react';
import {
  Box,
  Typography,
  Alert,
  Button,
  Card,
  CardContent,
  CardMedia,
  IconButton,
  Chip,
  Rating,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Star as StarIcon,
  LocationOn as LocationIcon,
  Anchor as AnchorIcon,
  AddPhotoAlternate,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMe } from '../hooks/useMe';
import { wishlistService } from '../services/wishlistService';
import { WishlistItem } from '../types';

export default function WishlistPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: meData } = useMe();
  const isLoggedIn = !!meData?.user;

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<WishlistItem | null>(null);
  const [editForm, setEditForm] = useState({ priority: 1, memo: '' });

  // Fetch wishlist items
  const { data: wishlistItems, isLoading, error } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => wishlistService.getWishlistItems(),
    enabled: isLoggedIn,
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data: { id: number; priority?: number; memo?: string }) =>
      wishlistService.updateWishlistItem(data.id, {
        priority: data.priority,
        memo: data.memo,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      setEditDialogOpen(false);
      setSelectedItem(null);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => wishlistService.removeFromWishlist(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      setDeleteDialogOpen(false);
      setSelectedItem(null);
    },
  });

  const handleEditClick = (item: WishlistItem) => {
    setSelectedItem(item);
    setEditForm({
      priority: item.priority || 1,
      memo: item.memo || '',
    });
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (item: WishlistItem) => {
    setSelectedItem(item);
    setDeleteDialogOpen(true);
  };

  const handleEditSave = () => {
    if (selectedItem) {
      updateMutation.mutate({
        id: selectedItem.id,
        priority: editForm.priority,
        memo: editForm.memo,
      });
    }
  };

  const handleDelete = () => {
    if (selectedItem) {
      deleteMutation.mutate(selectedItem.id);
    }
  };

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

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          行きたいリストの取得に失敗しました。
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <StarIcon fontSize="large" />
          行きたいリスト
        </Typography>
        <Typography variant="body1" color="text.secondary">
          行きたい水族館を管理しましょう
        </Typography>
      </Box>

      {/* Wishlist Items */}
      {wishlistItems && wishlistItems.length > 0 ? (
        <Grid container spacing={3}>
          {wishlistItems.map((item) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
              <Card>
                <CardMedia
                  component="div"
                  sx={{
                    height: 200,
                    bgcolor: 'grey.200',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate(`/aquariums/${item.aquarium.id}`)}
                >
                  <AddPhotoAlternate sx={{ fontSize: 60, color: 'grey.400' }} />
                </CardMedia>
                <CardContent>
                  <Typography
                    variant="h6"
                    component="h2"
                    gutterBottom
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/aquariums/${item.aquarium.id}`)}
                  >
                    {item.aquarium.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                    <LocationIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {item.aquarium.prefecture} {item.aquarium.address}
                    </Typography>
                  </Box>

                  {/* Priority */}
                  {item.priority && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        優先度:
                      </Typography>
                      <Rating value={item.priority} readOnly size="small" />
                    </Box>
                  )}

                  {/* Memo */}
                  {item.memo && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {item.memo}
                    </Typography>
                  )}

                  {/* Actions */}
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleEditClick(item)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteClick(item)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <StarIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            行きたい水族館がまだありません
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            水族館一覧から行きたい水族館を追加してみましょう
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/aquariums')}
          >
            水族館一覧へ
          </Button>
        </Box>
      )}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>行きたいリストを編集</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>優先度</InputLabel>
              <Select
                value={editForm.priority}
                onChange={(e) => setEditForm({ ...editForm, priority: Number(e.target.value) })}
                label="優先度"
              >
                <MenuItem value={1}>★☆☆☆☆</MenuItem>
                <MenuItem value={2}>★★☆☆☆</MenuItem>
                <MenuItem value={3}>★★★☆☆</MenuItem>
                <MenuItem value={4}>★★★★☆</MenuItem>
                <MenuItem value={5}>★★★★★</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="メモ"
              multiline
              rows={4}
              value={editForm.memo}
              onChange={(e) => setEditForm({ ...editForm, memo: e.target.value })}
              placeholder="行きたい理由や見たい展示など..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>
            キャンセル
          </Button>
          <Button
            variant="contained"
            onClick={handleEditSave}
            disabled={updateMutation.isPending}
          >
            保存
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>リストから削除</DialogTitle>
        <DialogContent>
          <Typography>
            「{selectedItem?.aquarium.name}」を行きたいリストから削除しますか？
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            キャンセル
          </Button>
          <Button
            color="error"
            variant="contained"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            削除
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}