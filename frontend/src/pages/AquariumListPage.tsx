import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Typography,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Skeleton,
  Alert,
  Chip,
  Rating,
  Button,
} from '@mui/material';
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
  Pool as PoolIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { aquariumService } from '../services/aquariumService';
import { Aquarium } from '../types';

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

export default function AquariumListPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPrefecture, setSelectedPrefecture] = useState('');
  const [sortBy, setSortBy] = useState<'rating' | 'visits' | ''>('');
  const [page, setPage] = useState(1);

  // 水族館データを取得
  const { data, isLoading, error } = useQuery({
    queryKey: ['aquariums', { 
      q: searchQuery, 
      prefecture: selectedPrefecture, 
      sort: sortBy, 
      page 
    }],
    queryFn: () => aquariumService.getAquariums({
      q: searchQuery,
      prefecture: selectedPrefecture,
      sort: sortBy || undefined,
      page,
      per: 12,
    }),
  });

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(1);
  };

  const handlePrefectureChange = (event: any) => {
    setSelectedPrefecture(event.target.value);
    setPage(1);
  };

  const handleSortChange = (event: any) => {
    setSortBy(event.target.value);
    setPage(1);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleAquariumClick = (aquariumId: number) => {
    navigate(`/aquariums/${aquariumId}`);
  };

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          水族館データの取得に失敗しました。後でもう一度お試しください。
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* ヘッダー */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PoolIcon fontSize="large" />
          水族館一覧
        </Typography>
        <Typography variant="body1" color="text.secondary">
          全国の水族館を探してみましょう
        </Typography>
      </Box>

      {/* 検索・フィルター */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              placeholder="水族館名で検索..."
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
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>都道府県</InputLabel>
              <Select
                value={selectedPrefecture}
                onChange={handlePrefectureChange}
                label="都道府県"
              >
                <MenuItem value="">すべて</MenuItem>
                {PREFECTURES.map((pref) => (
                  <MenuItem key={pref} value={pref}>
                    {pref}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>並び替え</InputLabel>
              <Select
                value={sortBy}
                onChange={handleSortChange}
                label="並び替え"
              >
                <MenuItem value="">デフォルト</MenuItem>
                <MenuItem value="rating">評価順</MenuItem>
                <MenuItem value="visits">訪問数順</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      {/* 水族館一覧 */}
      <Grid container spacing={3}>
        {isLoading ? (
          // スケルトンローディング
          Array.from({ length: 6 }).map((_, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card>
                <Skeleton variant="rectangular" height={200} />
                <CardContent>
                  <Skeleton variant="text" />
                  <Skeleton variant="text" width="60%" />
                </CardContent>
              </Card>
            </Grid>
          ))
        ) : (
          data?.aquariums.map((aquarium: Aquarium) => (
            <Grid item xs={12} sm={6} md={4} key={aquarium.id}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 3,
                  },
                }}
                onClick={() => handleAquariumClick(aquarium.id)}
              >
                {aquarium.latestPhotoUrl ? (
                  <CardMedia
                    component="img"
                    height="200"
                    image={aquarium.latestPhotoUrl}
                    alt={aquarium.name}
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
                    <PoolIcon sx={{ fontSize: 60, color: 'grey.400' }} />
                  </Box>
                )}
                <CardContent>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {aquarium.name}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                    <LocationIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {aquarium.prefecture} {aquarium.address}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Rating value={aquarium.averageRating || 0} readOnly size="small" precision={0.5} />
                      <Typography variant="body2" color="text.secondary">
                        ({(aquarium.averageRating || 0).toFixed(1)})
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      訪問数: {aquarium.visitCount || 0}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {aquarium.visited && (
                      <Chip label="訪問済み" size="small" color="success" />
                    )}
                    {aquarium.inWishlist && (
                      <Chip label="行きたい" size="small" color="primary" />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* ページネーション */}
      {data && data.pagination && data.pagination.totalPages > 1 && (
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={data.pagination.totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            size="large"
          />
        </Box>
      )}

      {/* データがない場合 */}
      {data && data.aquariums.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <PoolIcon sx={{ fontSize: 80, color: 'grey.400', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            水族館が見つかりませんでした
          </Typography>
          <Typography variant="body2" color="text.secondary">
            検索条件を変更してお試しください
          </Typography>
        </Box>
      )}
    </Box>
  );
}