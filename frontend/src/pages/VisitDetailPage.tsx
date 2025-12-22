import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Rating,
  Chip,
  Button,
  Alert,
  CircularProgress,
  Avatar,
  IconButton,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  ArrowBack as ArrowBackIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  WbSunny as WeatherIcon,
  PhotoCamera as PhotoIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { visitService } from '../services/visitService';
import { useMe } from '../hooks/useMe';

export default function VisitDetailPage() {
  const { id } = useParams<{ id: string }>();
  const visitId = Number(id);
  const navigate = useNavigate();

  console.log('VisitDetailPage mounted, visitId:', visitId);

  const {
    data: visit,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['visit', visitId],
    queryFn: async () => {
      console.log('Fetching visit detail for ID:', visitId);
      const data = await visitService.getVisit(visitId);
      console.log('Visit detail data:', data);
      console.log('Good exhibits:', data.goodExhibits);
      console.log('Good exhibits type:', typeof data.goodExhibits);
      console.log('Good exhibits length:', data.goodExhibits?.length);
      return data;
    },
    enabled: Number.isFinite(visitId),
  });

  console.log('Query state - isLoading:', isLoading, 'error:', error, 'visit:', visit);

  const { data: meData } = useMe();
  const currentUserId = meData?.user?.id;
  const isOwner = currentUserId && visit?.user?.id === currentUserId;

  const handleBack = () => navigate(-1);

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">訪問記録の取得に失敗しました。</Alert>
        <Button onClick={handleBack} sx={{ mt: 2 }}>
          戻る
        </Button>
      </Box>
    );
  }

  if (isLoading || !visit) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Back Button and Edit Button */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
        >
          戻る
        </Button>
        {isOwner && (
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/visits/${visitId}/edit`)}
          >
            編集
          </Button>
        )}
      </Box>

      {/* Visit Card */}
      <Card>
        {/* Photo */}
        {visit.photoUrls && visit.photoUrls.length > 0 ? (
          <CardMedia
            component="img"
            height="400"
            image={visit.photoUrls[0]}
            alt={visit.aquarium?.name}
          />
        ) : (
          <Box
            sx={{
              height: 400,
              bgcolor: 'grey.200',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PhotoIcon sx={{ fontSize: 100, color: 'grey.400' }} />
          </Box>
        )}

        <CardContent>
          {/* User Info */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <Avatar
              src={visit.user?.avatarUrl}
              sx={{ width: 56, height: 56 }}
            >
              {visit.user?.name?.[0]?.toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="h6">{visit.user?.name || 'ユーザー'}</Typography>
              {visit.user?.username && (
                <Typography variant="body2" color="text.secondary">
                  @{visit.user.username}
                </Typography>
              )}
            </Box>
          </Box>

          {/* Aquarium Name */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <LocationIcon color="primary" />
            <Typography
              variant="h5"
              sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
              onClick={() => navigate(`/aquariums/${visit.aquarium?.id}`)}
            >
              {visit.aquarium?.name}
            </Typography>
          </Box>

          {/* Visit Date & Weather */}
          <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CalendarIcon fontSize="small" />
              <Typography variant="body1">
                {visit.visitedAt
                  ? new Date(visit.visitedAt).toLocaleDateString('ja-JP', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : '日付不明'}
              </Typography>
            </Box>
            {visit.weather && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WeatherIcon fontSize="small" />
                <Typography variant="body1">{visit.weather}</Typography>
              </Box>
            )}
          </Box>

          {/* Rating */}
          {visit.rating && (
            <Box sx={{ mb: 3 }}>
              <Rating value={visit.rating} readOnly size="large" />
            </Box>
          )}

          {/* Memo */}
          {visit.memo && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                メモ
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                {visit.memo}
              </Typography>
            </Box>
          )}

          {/* Good Exhibits */}
          {visit.goodExhibits && visit.goodExhibits.filter(e => e.trim()).length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                良かった展示
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {visit.goodExhibits
                  .filter(e => e.trim())
                  .map((exhibit, index) => (
                    <Chip key={index} label={exhibit} color="primary" variant="outlined" />
                  ))}
              </Box>
            </Box>
          )}

          {/* Additional Photos */}
          {visit.photoUrls && visit.photoUrls.length > 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                写真 ({visit.photoUrls.length}枚)
              </Typography>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {visit.photoUrls.map((url, index) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={index}>
                    <Box
                      component="img"
                      src={url}
                      alt={`訪問記録 ${index + 1}`}
                      sx={{
                        width: '100%',
                        height: 200,
                        objectFit: 'cover',
                        borderRadius: 1,
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
