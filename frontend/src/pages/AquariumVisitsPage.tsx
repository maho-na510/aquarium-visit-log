import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Rating,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Avatar,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  CalendarToday as CalendarIcon,
  PhotoCamera as PhotoIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { visitService } from '../services/visitService';
import { aquariumService } from '../services/aquariumService';

export default function AquariumVisitsPage() {
  const { id } = useParams<{ id: string }>();
  const aquariumId = Number(id);
  const navigate = useNavigate();

  // 水族館情報を取得
  const { data: aquarium, isLoading: aquariumLoading } = useQuery({
    queryKey: ['aquarium', aquariumId],
    queryFn: () => aquariumService.getAquarium(aquariumId),
    enabled: Number.isFinite(aquariumId),
  });

  // この水族館の訪問記録を取得
  const { data: visits, isLoading: visitsLoading, error } = useQuery({
    queryKey: ['aquarium-visits', aquariumId],
    queryFn: () => visitService.getVisits({ aquariumId }),
    enabled: Number.isFinite(aquariumId),
  });

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

  if (aquariumLoading || visitsLoading) {
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
          訪問記録の取得に失敗しました
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(`/aquariums/${aquariumId}`)}
          sx={{ mb: 2 }}
        >
          水族館詳細に戻る
        </Button>
        <Typography variant="h4" component="h1" gutterBottom>
          {aquarium?.name || '水族館'} の訪問記録
        </Typography>
        <Typography variant="body1" color="text.secondary">
          みんなの訪問記録 ({visits?.length || 0}件)
        </Typography>
      </Box>

      {visits && visits.length > 0 ? (
        <Grid container spacing={3}>
          {visits.map((visit) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={visit.id}>
              <Card sx={{ cursor: 'pointer' }} onClick={() => navigate(`/visits/${visit.id}`)}>
                {visit.photoUrls && visit.photoUrls.length > 0 ? (
                  <CardMedia
                    component="img"
                    height="200"
                    image={visit.photoUrls[0]}
                    alt={aquarium?.name}
                  />
                ) : (
                  <Box
                    sx={{
                      height: 200,
                      bgcolor: 'grey.200',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <PhotoIcon sx={{ fontSize: 60, color: 'grey.400' }} />
                  </Box>
                )}

                <CardContent>
                  {/* ユーザー情報 */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Avatar
                      src={visit.user?.avatarUrl}
                      sx={{ width: 32, height: 32 }}
                    >
                      {visit.user?.name?.[0]?.toUpperCase()}
                    </Avatar>
                    <Typography variant="body2" fontWeight="bold">
                      {visit.user?.name || 'ユーザー'}
                    </Typography>
                  </Box>

                  {/* 訪問日 */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CalendarIcon fontSize="small" />
                    <Typography variant="body2">
                      {visit.visitedAt
                        ? format(new Date(visit.visitedAt), 'yyyy年M月d日', { locale: ja })
                        : '日付不明'}
                    </Typography>
                    {visit.weather && (
                      <Typography variant="body2">{getWeatherIcon(visit.weather)}</Typography>
                    )}
                  </Box>

                  {/* 評価 */}
                  {visit.rating && (
                    <Box sx={{ mb: 1 }}>
                      <Rating value={visit.rating} readOnly size="small" />
                    </Box>
                  )}

                  {/* メモ */}
                  {visit.memo && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        mb: 1,
                      }}
                    >
                      {visit.memo}
                    </Typography>
                  )}

                  {/* 写真枚数 */}
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {visit.photoCount > 0 && (
                      <Chip
                        icon={<PhotoIcon />}
                        label={`写真 ${visit.photoCount}枚`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <PhotoIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            まだ訪問記録がありません
          </Typography>
        </Box>
      )}
    </Box>
  );
}
