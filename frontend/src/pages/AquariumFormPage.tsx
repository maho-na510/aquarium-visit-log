import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Grid,
  MenuItem,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  MyLocation as MyLocationIcon,
} from '@mui/icons-material';
import { aquariumService } from '../services/aquariumService';

// 都道府県リスト
const PREFECTURES = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
];

interface FormData {
  name: string;
  description: string;
  prefecture: string;
  address: string;
  latitude: string;
  longitude: string;
  phoneNumber: string;
  website: string;
  openingHours: {
    regular?: string;
    summer?: string;
    goldenWeek?: string;
    springCummer?: string;
    autumnWinter?: string;
    weekday?: string;
    holiday?: string;
  };
  admissionFee: {
    adult?: string;
    highSchool?: string;
    elementary?: string;
    child?: string;
    infant?: string;
  };
}

export default function AquariumFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    prefecture: '',
    address: '',
    latitude: '',
    longitude: '',
    phoneNumber: '',
    website: '',
    openingHours: {},
    admissionFee: {},
  });

  const [error, setError] = useState<string | null>(null);
  const [geocoding, setGeocoding] = useState(false);

  // 住所から緯度経度を取得する関数
  const geocodeAddress = async () => {
    if (!formData.prefecture || !formData.address) {
      setError('都道府県と住所を入力してください');
      return;
    }

    setGeocoding(true);
    setError(null);

    try {
      // 郵便番号を除去（〒で始まる7桁の数字）
      const cleanAddress = formData.address.replace(/〒?\d{3}-?\d{4}\s*/g, '');

      // 完全な住所を作成
      const fullAddress = `${formData.prefecture}${cleanAddress}`;

      console.log('Original address:', formData.address);
      console.log('Cleaned address:', cleanAddress);
      console.log('Full address for geocoding:', fullAddress);

      // Try Method 1: Google Geocoding API (無料枠あり、より正確)
      // Note: 本番環境では API キーが必要ですが、開発中はこちらも試せます

      // Method 2: Nominatim API (OpenStreetMap)
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?` +
        `format=json&` +
        `q=${encodeURIComponent(fullAddress)}&` +
        `countrycodes=jp&` +
        `limit=1&` +
        `accept-language=ja`;

      console.log('API URL:', nominatimUrl);

      const response = await fetch(nominatimUrl, {
        headers: {
          'Accept': 'application/json',
        },
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Geocoding response:', data);

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        console.log('Found coordinates:', { lat, lon });

        setFormData({
          ...formData,
          latitude: lat,
          longitude: lon,
        });
        setError(null);
      } else {
        // Try alternative: use only prefecture and first part of address
        const simpleAddress = formData.prefecture + cleanAddress.split(/[0-9０-９]/)[0];
        console.log('Trying simplified address:', simpleAddress);

        const simpleUrl = `https://nominatim.openstreetmap.org/search?` +
          `format=json&` +
          `q=${encodeURIComponent(simpleAddress)}&` +
          `countrycodes=jp&` +
          `limit=1`;

        const simpleResponse = await fetch(simpleUrl);
        const simpleData = await simpleResponse.json();

        if (simpleData && simpleData.length > 0) {
          const { lat, lon } = simpleData[0];
          setFormData({
            ...formData,
            latitude: lat,
            longitude: lon,
          });
          setError(null);
        } else {
          console.warn('No results found for address:', fullAddress);
          setError('住所から位置情報を取得できませんでした。市区町村名までの入力を試すか、手動で入力してください。');
        }
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      setError(`位置情報の取得に失敗しました: ${err instanceof Error ? err.message : '不明なエラー'}`);
    } finally {
      setGeocoding(false);
    }
  };

  // 編集モードの場合は既存データを取得
  const { data: aquarium } = useQuery({
    queryKey: ['aquarium', id],
    queryFn: () => aquariumService.getAquarium(Number(id)),
    enabled: isEditMode,
  });

  // 既存データをフォームにセット
  useEffect(() => {
    if (aquarium && isEditMode) {
      setFormData({
        name: aquarium.name || '',
        description: aquarium.description || '',
        prefecture: aquarium.prefecture || '',
        address: aquarium.address || '',
        latitude: aquarium.latitude?.toString() || '',
        longitude: aquarium.longitude?.toString() || '',
        phoneNumber: (aquarium as any).phoneNumber || (aquarium as any).phone_number || '',
        website: aquarium.website || '',
        openingHours: aquarium.openingHours || {},
        admissionFee: {
          adult: aquarium.admissionFee?.adult?.toString() || '',
          highSchool: aquarium.admissionFee?.highSchool?.toString() || '',
          elementary: aquarium.admissionFee?.elementary?.toString() || '',
          child: aquarium.admissionFee?.child?.toString() || '',
          infant: aquarium.admissionFee?.infant?.toString() || '',
        },
      });
    }
  }, [aquarium, isEditMode]);

  // 作成ミューテーション
  const createMutation = useMutation({
    mutationFn: (data: any) => aquariumService.createAquarium(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['aquariums'] });
      navigate(`/aquariums/${data.id}`);
    },
    onError: (err: any) => {
      setError(err?.response?.data?.errors?.join(', ') || '水族館の作成に失敗しました');
    },
  });

  // 更新ミューテーション
  const updateMutation = useMutation({
    mutationFn: (data: any) => aquariumService.updateAquarium(Number(id), data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['aquariums'] });
      queryClient.invalidateQueries({ queryKey: ['aquarium', id] });
      navigate(`/aquariums/${data.id}`);
    },
    onError: (err: any) => {
      setError(err?.response?.data?.errors?.join(', ') || '水族館の更新に失敗しました');
    },
  });

  const handleChange = (field: keyof FormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({ ...formData, [field]: event.target.value });
    setError(null);
  };

  const handleOpeningHoursChange = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      openingHours: { ...formData.openingHours, [field]: event.target.value },
    });
  };

  const handleAdmissionFeeChange = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      admissionFee: { ...formData.admissionFee, [field]: event.target.value },
    });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    // バリデーション
    if (!formData.name || !formData.prefecture || !formData.address) {
      setError('必須項目を入力してください');
      return;
    }

    // データ整形
    const submitData: any = {
      name: formData.name,
      description: formData.description || undefined,
      prefecture: formData.prefecture,
      address: formData.address,
      latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
      longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
      phone_number: formData.phoneNumber || undefined,
      website: formData.website || undefined,
      opening_hours: Object.keys(formData.openingHours).length > 0 ? formData.openingHours : undefined,
      admission_fee: {},
    };

    // 入場料を数値に変換
    if (formData.admissionFee.adult) submitData.admission_fee.adult = parseInt(formData.admissionFee.adult);
    if (formData.admissionFee.highSchool) submitData.admission_fee.highSchool = parseInt(formData.admissionFee.highSchool);
    if (formData.admissionFee.elementary) submitData.admission_fee.elementary = parseInt(formData.admissionFee.elementary);
    if (formData.admissionFee.child) submitData.admission_fee.child = parseInt(formData.admissionFee.child);
    if (formData.admissionFee.infant) submitData.admission_fee.infant = parseInt(formData.admissionFee.infant);

    if (Object.keys(submitData.admission_fee).length === 0) {
      delete submitData.admission_fee;
    }

    if (isEditMode) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleBack = () => {
    navigate('/aquariums');
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <IconButton onClick={handleBack}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            {isEditMode ? '水族館を編集' : '水族館を追加'}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* 基本情報 */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom>
                基本情報
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                required
                label="水族館名"
                value={formData.name}
                onChange={handleChange('name')}
                disabled={isLoading}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                required
                select
                label="都道府県"
                value={formData.prefecture}
                onChange={handleChange('prefecture')}
                disabled={isLoading}
              >
                {PREFECTURES.map((pref) => (
                  <MenuItem key={pref} value={pref}>
                    {pref}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                required
                label="住所"
                value={formData.address}
                onChange={handleChange('address')}
                disabled={isLoading}
                helperText="例: 兵庫県神戸市中央区1-1-1 (郵便番号は自動的に除外されます)"
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="説明"
                value={formData.description}
                onChange={handleChange('description')}
                disabled={isLoading}
              />
            </Grid>

            {/* 位置情報セクション */}
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                <Typography variant="h6">位置情報</Typography>
                <Button
                  variant="outlined"
                  startIcon={geocoding ? <CircularProgress size={18} /> : <MyLocationIcon />}
                  onClick={geocodeAddress}
                  disabled={isLoading || geocoding || !formData.prefecture || !formData.address}
                  size="small"
                >
                  住所から自動取得
                </Button>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                住所を入力後、ボタンをクリックすると緯度・経度が自動で入力されます
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="緯度"
                value={formData.latitude}
                onChange={handleChange('latitude')}
                disabled={isLoading}
                inputProps={{ step: 'any' }}
                helperText="自動取得または手動入力"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                type="number"
                label="経度"
                value={formData.longitude}
                onChange={handleChange('longitude')}
                disabled={isLoading}
                inputProps={{ step: 'any' }}
                helperText="自動取得または手動入力"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="電話番号"
                value={formData.phoneNumber}
                onChange={handleChange('phoneNumber')}
                disabled={isLoading}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="ウェブサイト"
                value={formData.website}
                onChange={handleChange('website')}
                disabled={isLoading}
                placeholder="https://example.com"
              />
            </Grid>

            {/* 営業時間 */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                営業時間
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="通常"
                value={formData.openingHours.regular || ''}
                onChange={handleOpeningHoursChange('regular')}
                disabled={isLoading}
                placeholder="9:00-17:00"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="夏季"
                value={formData.openingHours.summer || ''}
                onChange={handleOpeningHoursChange('summer')}
                disabled={isLoading}
                placeholder="9:00-18:00"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="平日"
                value={formData.openingHours.weekday || ''}
                onChange={handleOpeningHoursChange('weekday')}
                disabled={isLoading}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="休日"
                value={formData.openingHours.holiday || ''}
                onChange={handleOpeningHoursChange('holiday')}
                disabled={isLoading}
              />
            </Grid>

            {/* 入場料 */}
            <Grid size={{ xs: 12 }}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                入場料
              </Typography>
            </Grid>

            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <TextField
                fullWidth
                type="number"
                label="大人"
                value={formData.admissionFee.adult || ''}
                onChange={handleAdmissionFeeChange('adult')}
                disabled={isLoading}
                InputProps={{ endAdornment: '円' }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <TextField
                fullWidth
                type="number"
                label="高校生"
                value={formData.admissionFee.highSchool || ''}
                onChange={handleAdmissionFeeChange('highSchool')}
                disabled={isLoading}
                InputProps={{ endAdornment: '円' }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <TextField
                fullWidth
                type="number"
                label="小学生"
                value={formData.admissionFee.elementary || ''}
                onChange={handleAdmissionFeeChange('elementary')}
                disabled={isLoading}
                InputProps={{ endAdornment: '円' }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <TextField
                fullWidth
                type="number"
                label="子供"
                value={formData.admissionFee.child || ''}
                onChange={handleAdmissionFeeChange('child')}
                disabled={isLoading}
                InputProps={{ endAdornment: '円' }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6, lg: 4 }}>
              <TextField
                fullWidth
                type="number"
                label="幼児"
                value={formData.admissionFee.infant || ''}
                onChange={handleAdmissionFeeChange('infant')}
                disabled={isLoading}
                InputProps={{ endAdornment: '円' }}
              />
            </Grid>

            {/* ボタン */}
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={isLoading}
                  size="large"
                >
                  {isEditMode ? '更新' : '作成'}
                </Button>
                <Button variant="outlined" onClick={handleBack} disabled={isLoading} size="large">
                  キャンセル
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
}
