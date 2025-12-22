import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Rating,
  Button,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Skeleton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ImageList,
  ImageListItem,
} from '@mui/material';
import {
  Search as SearchIcon,
  CalendarToday as CalendarIcon,
  PhotoCamera as PhotoIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { visitService } from '../services/visitService';
import { Visit } from '../types';
import VisitForm from '../components/VisitForm';
import Grid from '@mui/material/Grid';
import { useMe } from '../hooks/useMe';

export default function VisitListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: meData } = useMe();
  const isLoggedIn = !!meData?.user;
  const currentUserId = meData?.user?.id;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAquarium, setSelectedAquarium] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'rating'>('date');
  const [selectedVisit, setSelectedVisit] = useState<Visit | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [visitToDelete, setVisitToDelete] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  // 訪問記録データを取得
  const { data: visits, isLoading, error } = useQuery({
    queryKey: ['visits', { q: searchQuery, aquarium: selectedAquarium, sort: sortBy }],
    queryFn: () =>
      visitService.getVisits({
        q: searchQuery,
        aquariumId: selectedAquarium ? Number(selectedAquarium) : undefined,
        sort: sortBy,
      }),
  });

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleAquariumChange = (event: any) => {
    setSelectedAquarium(event.target.value);
  };

  const handleSortChange = (event: any) => {
    setSortBy(event.target.value);
  };

  const handleVisitClick = (visit: Visit) => {
    setSelectedVisit(visit);
  };

  const handleEdit = (visitId: number) => {
    navigate(`/visits/${visitId}/edit`);
  };

  const deleteMutation = useMutation({
    mutationFn: (visitId: number) => visitService.deleteVisit(visitId),
    onSuccess: () => {
      // Invalidate all visit-related queries to trigger re-fetch
      queryClient.invalidateQueries({ queryKey: ['visits'] });
      queryClient.invalidateQueries({ queryKey: ['aquarium-visits'] });
      setDeleteDialogOpen(false);
      setVisitToDelete(null);
    },
    onError: (error) => {
      console.error('削除に失敗しました:', error);
    },
  });

  const handleDeleteClick = (visitId: number) => {
    setVisitToDelete(visitId);
    setDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (visitToDelete) {
      deleteMutation.mutate(visitToDelete);
    }
  };

  const getWeatherIcon = (weather?: string) => {
    switch (weather) {
      case '晴れ':
        return '☀️';
      case '曇り':
        return '☁️';
      case '雨':
        return '🌧️';
      case '雪':
        return '❄️';
      default:
        return '🌤️';
    }
  };

  if (error && !isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          訪問記録の取得に失敗しました。ネットワーク接続を確認してください。
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* ヘッダー */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          訪問記録
        </Typography>
        <Typography variant="body1" color="text.secondary">
          あなたの水族館訪問の思い出を振り返りましょう
        </Typography>
      </Box>

      {/* 追加ボタン */}
      {isLoggedIn && (
        <Box sx={{ mb: 3 }}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setFormOpen(true)}>
            訪問記録を追加
          </Button>
        </Box>
      )}

      {!isLoggedIn && (
        <Alert severity="info" sx={{ mb: 3 }}>
          訪問記録を追加するには
          <Button onClick={() => navigate('/login')} sx={{ ml: 1 }}>
            ログイン
          </Button>
          または
          <Button onClick={() => navigate('/register')} sx={{ ml: 1 }}>
            新規登録
          </Button>
          してください
        </Alert>
      )}

      {/* 検索・フィルター */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <TextField
              fullWidth
              placeholder="メモや展示名で検索..."
              value={searchQuery}
              onChange={handleSearch}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel>水族館</InputLabel>
              <Select value={selectedAquarium} onChange={handleAquariumChange} label="水族館">
                <MenuItem value="">すべて</MenuItem>
                <MenuItem value="1">すみだ水族館</MenuItem>
                <MenuItem value="2">サンシャイン水族館</MenuItem>
                <MenuItem value="3">名古屋港水族館</MenuItem>
                <MenuItem value="4">海遊館</MenuItem>
                <MenuItem value="5">沖縄美ら海水族館</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth>
              <InputLabel>並び替え</InputLabel>
              <Select value={sortBy} onChange={handleSortChange} label="並び替え">
                <MenuItem value="date">訪問日順</MenuItem>
                <MenuItem value="rating">評価順</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {/* 訪問記録一覧 */}
      <Grid container spacing={3}>
        {isLoading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={index}>
              <Card>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton variant="text" />
                  <Skeleton variant="text" width="60%" />
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : visits && visits.length > 0 ? (
          visits.map((visit) => (
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }} key={visit.id}>
              <Card>
                {visit.photoUrls && visit.photoUrls.length > 0 ? (
                  <CardMedia
                    component="img"
                    height="200"
                    image={visit.photoUrls[0]}
                    alt={visit.aquarium.name}
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleVisitClick(visit)}
                  />
                ) : (
                  <Box
                    sx={{
                      height: 200,
                      bgcolor: 'grey.200',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleVisitClick(visit)}
                  >
                    <PhotoIcon sx={{ fontSize: 60, color: 'grey.400' }} />
                  </Box>
                )}

                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {visit.aquarium.name}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CalendarIcon fontSize="small" />
                    <Typography variant="body2">
                      {visit.visitedAt
                        ? format(new Date(visit.visitedAt), 'yyyy年M月d日', { locale: ja })
                        : '日付不明'}
                    </Typography>
                    {visit.weather && <Typography variant="body2">{getWeatherIcon(visit.weather)}</Typography>}
                  </Box>

                  {visit.rating && (
                    <Box sx={{ mb: 1 }}>
                      <Rating value={visit.rating} readOnly size="small" />
                    </Box>
                  )}

                  {visit.memo && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {visit.memo}
                    </Typography>
                  )}

                  <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                    {visit.photoCount > 0 && (
                      <Chip icon={<PhotoIcon />} label={`写真 ${visit.photoCount}枚`} size="small" variant="outlined" />
                    )}
                  </Box>
                </CardContent>

                {isLoggedIn && visit.user && currentUserId === visit.user.id && (
                  <CardActions>
                    <IconButton size="small" onClick={() => handleEdit(visit.id)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteClick(visit.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                )}
              </Card>
            </Grid>
          ))
        ) : (
          <Grid size={{ xs: 12 }}>
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <PhotoIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                訪問記録がありません
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                水族館を訪れたら、記録を追加してみましょう
              </Typography>
              <Button variant="contained" onClick={() => navigate('/aquariums')}>
                水族館を探す
              </Button>
            </Box>
          </Grid>
        )}
      </Grid>

      {/* 訪問詳細ダイアログ */}
      <Dialog open={!!selectedVisit} onClose={() => setSelectedVisit(null)} maxWidth="md" fullWidth>
        {selectedVisit && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">{selectedVisit.aquarium.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedVisit.visitedAt
                    ? format(new Date(selectedVisit.visitedAt), 'yyyy年M月d日', { locale: ja })
                    : '日付不明'}
                </Typography>
              </Box>
            </DialogTitle>

            <DialogContent>
              {selectedVisit.photoUrls && selectedVisit.photoUrls.length > 0 && (
                <ImageList cols={3} gap={8} sx={{ mb: 2 }}>
                  {selectedVisit.photoUrls.map((url, index) => (
                    <ImageListItem key={index}>
                      <img
                        src={url}
                        alt={`写真 ${index + 1}`}
                        loading="lazy"
                        style={{ height: '100%', objectFit: 'cover' }}
                      />
                    </ImageListItem>
                  ))}
                </ImageList>
              )}

              {selectedVisit.rating && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    評価
                  </Typography>
                  <Rating value={selectedVisit.rating} readOnly />
                </Box>
              )}

              {selectedVisit.memo && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    メモ
                  </Typography>
                  <Typography variant="body1">{selectedVisit.memo}</Typography>
                </Box>
              )}

              {selectedVisit.goodExhibits && selectedVisit.goodExhibits.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    良かった展示
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {selectedVisit.goodExhibits.map((exhibit, index) => (
                      <Chip key={index} label={exhibit} />
                    ))}
                  </Box>
                </Box>
              )}
            </DialogContent>

            <DialogActions>
              <Button onClick={() => setSelectedVisit(null)}>閉じる</Button>
              {isLoggedIn && selectedVisit.user && currentUserId === selectedVisit.user.id && (
                <Button onClick={() => handleEdit(selectedVisit.id)} variant="contained">
                  編集
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* 削除確認ダイアログ */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>訪問記録を削除しますか？</DialogTitle>
        <DialogContent>
          <Typography>この操作は取り消すことができません。本当に削除しますか？</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>キャンセル</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            削除
          </Button>
        </DialogActions>
      </Dialog>

      {/* 訪問記録追加フォーム */}
      <VisitForm open={formOpen} onClose={() => setFormOpen(false)} />
    </Box>
  );
}
