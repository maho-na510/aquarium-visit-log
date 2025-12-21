import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Star as StarIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { aquariumService } from '../../services/aquariumService';
import { Aquarium, AllPhoto } from '../../types';

type Props = {
  aquarium: Aquarium;
  isAdmin: boolean;
};

export default function AquariumAllPhotosSection({ aquarium, isAdmin }: Props) {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedPhotoId, setSelectedPhotoId] = useState<number | null>(aquarium.headerPhotoId || null);
  const [error, setError] = useState<string | null>(null);

  const setHeaderMutation = useMutation({
    mutationFn: (photoId: number) => aquariumService.setHeaderPhoto(aquarium.id, photoId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aquarium', aquarium.id] });
      setDialogOpen(false);
      setError(null);
    },
    onError: (error: any) => {
      setError(error?.response?.data?.error || 'ヘッダー写真の設定に失敗しました');
    },
  });

  const allPhotos = aquarium.allPhotos || [];

  const handleOpenDialog = () => {
    setSelectedPhotoId(aquarium.headerPhotoId || null);
    setDialogOpen(true);
    setError(null);
  };

  const handleSetHeader = () => {
    if (selectedPhotoId) {
      setHeaderMutation.mutate(selectedPhotoId);
    }
  };

  if (allPhotos.length === 0) {
    return (
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" gutterBottom>
          すべての写真
        </Typography>
        <Typography variant="body2" color="text.secondary">
          まだ写真がありません
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">
          すべての写真 ({allPhotos.length}枚)
        </Typography>
        {isAdmin && (
          <Button
            variant="outlined"
            startIcon={<StarIcon />}
            onClick={handleOpenDialog}
          >
            ヘッダー写真を選択
          </Button>
        )}
      </Box>

      <Grid container spacing={2}>
        {allPhotos.map((photo) => (
          <Grid key={`${photo.source}-${photo.id}`} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Box sx={{ position: 'relative' }}>
              <Box
                component="img"
                src={photo.url}
                alt=""
                sx={{
                  width: '100%',
                  height: 180,
                  objectFit: 'cover',
                  borderRadius: 2,
                  display: 'block',
                  bgcolor: 'grey.100',
                  border: photo.id === aquarium.headerPhotoId ? '3px solid' : 'none',
                  borderColor: 'primary.main',
                }}
              />

              {/* ソースバッジ */}
              <Chip
                label={photo.source === 'aquarium' ? '水族館' : '訪問記録'}
                size="small"
                color={photo.source === 'aquarium' ? 'primary' : 'secondary'}
                sx={{
                  position: 'absolute',
                  top: 8,
                  left: 8,
                }}
              />

              {/* ヘッダー写真バッジ */}
              {photo.id === aquarium.headerPhotoId && (
                <Chip
                  icon={<StarIcon fontSize="small" />}
                  label="ヘッダー"
                  size="small"
                  color="warning"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                  }}
                />
              )}

              {/* 訪問日表示 */}
              {photo.source === 'visit' && photo.visitedAt && (
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: 8,
                    left: 8,
                    right: 8,
                    bgcolor: 'rgba(0, 0, 0, 0.6)',
                    color: 'white',
                    px: 1,
                    py: 0.5,
                    borderRadius: 1,
                  }}
                >
                  <Typography variant="caption">
                    {format(new Date(photo.visitedAt), 'yyyy年M月d日', { locale: ja })}
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* ヘッダー写真選択ダイアログ */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>ヘッダー写真を選択</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            一覧ページに表示されるヘッダー写真を選択してください
          </Typography>

          <RadioGroup
            value={selectedPhotoId}
            onChange={(e) => setSelectedPhotoId(Number(e.target.value))}
          >
            <Grid container spacing={2}>
              {allPhotos.map((photo) => (
                <Grid key={`${photo.source}-${photo.id}`} size={{ xs: 12, sm: 6, md: 4 }}>
                  <FormControlLabel
                    value={photo.id}
                    control={<Radio />}
                    label=""
                    sx={{ m: 0, width: '100%' }}
                  />
                  <Box sx={{ position: 'relative', mt: -4, ml: 5 }}>
                    <Box
                      component="img"
                      src={photo.url}
                      alt=""
                      sx={{
                        width: '100%',
                        height: 120,
                        objectFit: 'cover',
                        borderRadius: 1,
                        display: 'block',
                        bgcolor: 'grey.100',
                        border: selectedPhotoId === photo.id ? '2px solid' : '1px solid',
                        borderColor: selectedPhotoId === photo.id ? 'primary.main' : 'grey.300',
                        cursor: 'pointer',
                      }}
                      onClick={() => setSelectedPhotoId(photo.id)}
                    />
                    <Chip
                      label={photo.source === 'aquarium' ? '水族館' : '訪問記録'}
                      size="small"
                      color={photo.source === 'aquarium' ? 'primary' : 'secondary'}
                      sx={{
                        position: 'absolute',
                        top: 4,
                        left: 4,
                      }}
                    />
                    {selectedPhotoId === photo.id && (
                      <CheckIcon
                        color="primary"
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          bgcolor: 'white',
                          borderRadius: '50%',
                        }}
                      />
                    )}
                  </Box>
                </Grid>
              ))}
            </Grid>
          </RadioGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>キャンセル</Button>
          <Button
            onClick={handleSetHeader}
            variant="contained"
            disabled={!selectedPhotoId || setHeaderMutation.isPending}
          >
            {setHeaderMutation.isPending ? '設定中...' : '設定'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
