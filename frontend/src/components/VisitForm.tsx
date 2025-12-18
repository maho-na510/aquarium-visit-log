import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Rating,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Chip,
  IconButton,
  Alert,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ja } from 'date-fns/locale';
import {
  PhotoCamera as PhotoIcon,
  Close as CloseIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { visitService } from '../services/visitService';
import { aquariumService } from '../services/aquariumService';
import { VisitForm as VisitFormType } from '../types';

interface VisitFormProps {
  open: boolean;
  onClose: () => void;
  aquariumId?: number;
}

const WEATHER_OPTIONS = ['晴れ', '曇り', '雨', '雪'];

export default function VisitForm({ open, onClose, aquariumId }: VisitFormProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Partial<VisitFormType>>({
    aquariumId: aquariumId || 0,
    visitedAt: format(new Date(), 'yyyy-MM-dd'),
    weather: '',
    rating: 3,
    memo: '',
    goodExhibitsList: [],
    photos: [],
  });
  const [exhibitInput, setExhibitInput] = useState('');
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: (data: VisitFormType) => visitService.createVisit(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visits'] });
      handleClose();
    },
    onError: (_error: any) => {
      setError('訪問記録の作成に失敗しました');
    },
  });

  const handleClose = () => {
    setFormData({
      aquariumId: aquariumId || 0,
      visitedAt: format(new Date(), 'yyyy-MM-dd'),
      weather: '',
      rating: 3,
      memo: '',
      goodExhibitsList: [],
      photos: [],
    });
    setPreviewUrls([]);
    setExhibitInput('');
    setError(null);
    onClose();
  };

  const handleAddExhibit = () => {
    if (exhibitInput.trim()) {
      setFormData({
        ...formData,
        goodExhibitsList: [...(formData.goodExhibitsList || []), exhibitInput.trim()],
      });
      setExhibitInput('');
    }
  };

  const handleRemoveExhibit = (index: number) => {
    setFormData({
      ...formData,
      goodExhibitsList: formData.goodExhibitsList?.filter((_, i) => i !== index) || [],
    });
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length + (formData.photos?.length || 0) > 10) {
      setError('写真は最大10枚までです');
      return;
    }

    setFormData({
      ...formData,
      photos: [...(formData.photos || []), ...files],
    });

    const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
    setPreviewUrls([...previewUrls, ...newPreviewUrls]);
  };

  const handleRemovePhoto = (index: number) => {
    const newPhotos = formData.photos?.filter((_, i) => i !== index) || [];
    const newPreviewUrls = previewUrls.filter((_, i) => i !== index);

    URL.revokeObjectURL(previewUrls[index]);

    setFormData({ ...formData, photos: newPhotos });
    setPreviewUrls(newPreviewUrls);
  };

  const handleSubmit = () => {
    if (!formData.aquariumId) {
      setError('水族館を選択してください');
      return;
    }
    createMutation.mutate(formData as VisitFormType);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>訪問記録を追加</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Grid container spacing={3}>
            {!aquariumId && (
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth required>
                  <InputLabel>水族館</InputLabel>
                  <Select
                    value={formData.aquariumId}
                    onChange={(e) =>
                      setFormData({ ...formData, aquariumId: Number(e.target.value) })
                    }
                    label="水族館"
                  >
                    {/* TODO: 水族館リストを動的に取得 */}
                    <MenuItem value={1}>すみだ水族館</MenuItem>
                    <MenuItem value={2}>サンシャイン水族館</MenuItem>
                    <MenuItem value={3}>名古屋港水族館</MenuItem>
                    <MenuItem value={4}>海遊館</MenuItem>
                    <MenuItem value={5}>沖縄美ら海水族館</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid size={{ xs: 12, sm: 6 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
                <DatePicker
                  label="訪問日"
                  value={new Date(formData.visitedAt || new Date())}
                  onChange={(date) =>
                    setFormData({
                      ...formData,
                      visitedAt: date ? format(date, 'yyyy-MM-dd') : '',
                    })
                  }
                  format="yyyy年MM月dd日"
                  slotProps={{
                    textField: { fullWidth: true, required: true },
                  }}
                />
              </LocalizationProvider>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <FormControl fullWidth>
                <InputLabel>天気</InputLabel>
                <Select
                  value={formData.weather}
                  onChange={(e) => setFormData({ ...formData, weather: e.target.value })}
                  label="天気"
                >
                  <MenuItem value="">選択なし</MenuItem>
                  {WEATHER_OPTIONS.map((weather) => (
                    <MenuItem key={weather} value={weather}>
                      {weather}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Box>
                <Typography component="legend">評価</Typography>
                <Rating
                  value={formData.rating}
                  onChange={(_, value) => setFormData({ ...formData, rating: value || 0 })}
                  size="large"
                />
              </Box>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="メモ"
                value={formData.memo}
                onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                placeholder="訪問時の感想や思い出を記録しましょう"
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" gutterBottom>
                良かった展示
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  size="small"
                  placeholder="展示名を入力"
                  value={exhibitInput}
                  onChange={(e) => setExhibitInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddExhibit();
                    }
                  }}
                />
                <Button variant="outlined" onClick={handleAddExhibit} startIcon={<AddIcon />}>
                  追加
                </Button>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {formData.goodExhibitsList?.map((exhibit, index) => (
                  <Chip key={index} label={exhibit} onDelete={() => handleRemoveExhibit(index)} />
                ))}
              </Box>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <Typography variant="subtitle2" gutterBottom>
                写真（最大10枚）
              </Typography>
              <Button
                variant="outlined"
                component="label"
                startIcon={<PhotoIcon />}
                disabled={(formData.photos?.length || 0) >= 10}
              >
                写真を追加
                <input
                  type="file"
                  hidden
                  multiple
                  accept="image/*"
                  onChange={handlePhotoChange}
                />
              </Button>

              {previewUrls.length > 0 && (
                <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {previewUrls.map((url, index) => (
                    <Box key={index} sx={{ position: 'relative' }}>
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        style={{
                          width: 100,
                          height: 100,
                          objectFit: 'cover',
                          borderRadius: 4,
                        }}
                      />
                      <IconButton
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: -8,
                          right: -8,
                          bgcolor: 'background.paper',
                        }}
                        onClick={() => handleRemovePhoto(index)}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              )}
            </Grid>
          </Grid>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>キャンセル</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={createMutation.isPending}>
          {createMutation.isPending ? '保存中...' : '保存'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
