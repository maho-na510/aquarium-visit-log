import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Rating,
  Button,
  Divider,
  Alert,
  Skeleton,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Language as WebsiteIcon,
  AccessTime as ClockIcon,
  AttachMoney as MoneyIcon,
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  AddPhotoAlternate as AddPhotoIcon,
  Pool as PoolIcon,
  Star as StarIcon,
} from '@mui/icons-material';

import { aquariumService } from '../services/aquariumService';
import AquariumPhotoSection from '../components/aquarium/AquariumPhotoSection';
import { useMe } from '../hooks/useMe';
import Grid from '@mui/material/Grid';

export default function AquariumDetail() {
  const { id } = useParams<{ id: string }>();
  const aquariumId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [openVisitDialog, setOpenVisitDialog] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);

  // ★ me（admin判定用）
  const { data: meData } = useMe();
  const isAdmin = useMemo(() => meData?.user?.role === 'admin', [meData]);

  // 水族館詳細データを取得
  const { data: aquarium, isLoading, error } = useQuery({
    queryKey: ['aquarium', aquariumId],
    queryFn: () => aquariumService.getAquarium(aquariumId),
    enabled: Number.isFinite(aquariumId),
  });

  // 初期値設定（行きたいリスト）
  useEffect(() => {
    if (aquarium) {
      setInWishlist(Boolean((aquarium as any).inWishlist));
    }
  }, [aquarium]);

  const handleBack = () => {
    navigate('/aquariums');
  };

  const handleAddVisit = () => {
    // TODO: 訪問記録追加ページへ遷移
    setOpenVisitDialog(true);
  };

  const handleToggleWishlist = () => {
    // TODO: API呼び出し
    setInWishlist((v) => !v);
  };

  const handleEdit = () => {
    navigate(`/aquariums/${aquariumId}/edit`);
  };

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">水族館情報の取得に失敗しました。</Alert>
        <Button onClick={handleBack} sx={{ mt: 2 }}>
          一覧に戻る
        </Button>
      </Box>
    );
  }

  if (isLoading || !aquarium) {
    return (
      <Box>
        <Skeleton variant="rectangular" height={300} sx={{ mb: 3 }} />
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 8}}>
            <Skeleton variant="text" height={40} />
            <Skeleton variant="text" />
            <Skeleton variant="text" />
          </Grid>
          <Grid size={{ xs: 12, md: 4}}>
            <Skeleton variant="rectangular" height={200} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  const recentVisits =
    (aquarium as any).recentVisits ||
    (aquarium as any).openingHours?.recentVisits ||
    [];

  return (
    <Box>
      {/* ヘッダー画像エリア */}
      <Paper
        sx={{
          height: 300,
          bgcolor: 'grey.200',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          mb: 3,
          backgroundImage: (aquarium as any).latestPhotoUrl ? `url(${(aquarium as any).latestPhotoUrl})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {!(aquarium as any).latestPhotoUrl && (
          <PoolIcon sx={{ fontSize: 100, color: 'grey.400' }} />
        )}
        <IconButton
          onClick={handleBack}
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            bgcolor: 'background.paper',
            '&:hover': { bgcolor: 'background.paper' },
          }}
        >
          <ArrowBackIcon />
        </IconButton>
      </Paper>

      <Grid container spacing={3}>
        {/* メイン情報 */}
        <Grid size={{ xs: 12, md: 8}}>
          <Paper sx={{ p: 3 }}>
            {/* タイトルとアクションボタン */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography variant="h4" component="h1" gutterBottom>
                  {(aquarium as any).name}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Rating value={(aquarium as any).averageRating || 0} readOnly precision={0.5} />
                    <Typography variant="body1">
                      {((aquarium as any).averageRating || 0).toFixed(1)}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    訪問数: {(aquarium as any).visitCount || 0}件
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  {(aquarium as any).visited && <Chip label="訪問済み" color="success" />}
                  {inWishlist && <Chip label="行きたいリスト登録済み" color="primary" />}
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton onClick={handleToggleWishlist} color={inWishlist ? 'primary' : 'default'}>
                  {inWishlist ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>

                {/* ★ 編集はadminだけ表示 */}
                {isAdmin && (
                  <IconButton onClick={handleEdit}>
                    <EditIcon />
                  </IconButton>
                )}
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* ★写真セクション（部品） */}
            <AquariumPhotoSection
              aquariumId={(aquarium as any).id}
              aquarium={aquarium as any}
              isAdmin={isAdmin}
              onUpdated={(next) => {
                queryClient.setQueryData(['aquarium', aquariumId], next);
              }}
            />

            <Divider sx={{ my: 2 }} />

            {/* 説明 */}
            {(aquarium as any).description && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  概要
                </Typography>
                <Typography variant="body1" paragraph>
                  {(aquarium as any).description}
                </Typography>
              </Box>
            )}

            {/* 基本情報 */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                基本情報
              </Typography>
              <List>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <LocationIcon />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary="住所" secondary={`${(aquarium as any).prefecture} ${(aquarium as any).address}`} />
                </ListItem>

                {(aquarium as any).phoneNumber && (
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <PhoneIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary="電話番号" secondary={(aquarium as any).phoneNumber} />
                  </ListItem>
                )}

                {(aquarium as any).website && (
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <WebsiteIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="ウェブサイト"
                      secondary={
                        <a href={(aquarium as any).website} target="_blank" rel="noopener noreferrer">
                          {(aquarium as any).website}
                        </a>
                      }
                    />
                  </ListItem>
                )}
              </List>
            </Box>

            {/* アクションボタン */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="contained" startIcon={<AddPhotoIcon />} onClick={handleAddVisit} fullWidth>
                訪問記録を追加
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* サイド情報 */}
        <Grid size={{ xs: 12, md: 4 }}>
          {/* 営業時間 */}
          {(aquarium as any).openingHours && Object.keys((aquarium as any).openingHours).length > 0 && (
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <ClockIcon color="primary" />
                  <Typography variant="h6">営業時間</Typography>
                </Box>
                {Object.entries((aquarium as any).openingHours).map(([key, value]) => {
                  if (key === 'recentVisits') return null;
                  return (
                    <Box key={key} sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {key === 'regular' ? '通常' :
                         key === 'summer' ? '夏季' :
                         key === 'goldenWeek' ? 'ゴールデンウィーク' :
                         key === 'springCummer' ? '春夏' :
                         key === 'autumnWinter' ? '秋冬' :
                         key === 'weekday' ? '平日' :
                         key === 'holiday' ? '休日' : key}
                      </Typography>
                      <Typography variant="body1">{String(value)}</Typography>
                    </Box>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* 入場料 */}
          {(aquarium as any).admissionFee && Object.keys((aquarium as any).admissionFee).length > 0 && (
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <MoneyIcon color="primary" />
                  <Typography variant="h6">入場料</Typography>
                </Box>
                {Object.entries((aquarium as any).admissionFee).map(([key, value]) => (
                  <Box key={key} sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {key === 'adult' ? '大人' :
                       key === 'highSchool' ? '高校生' :
                       key === 'elementary' ? '小学生' :
                       key === 'child' ? '子供' :
                       key === 'infant' ? '幼児' : key}
                    </Typography>
                    <Typography variant="body1">¥{Number(value || 0).toLocaleString()}</Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          )}

          {/* 最近の訪問 */}
          {Array.isArray(recentVisits) && recentVisits.length > 0 && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <StarIcon color="primary" />
                  <Typography variant="h6">最近の訪問</Typography>
                </Box>
                <List dense>
                  {recentVisits.map((visit: any) => (
                    <ListItem key={visit.id}>
                      <ListItemText
                        primary={visit.userName}
                        secondary={
                          <Box>
                            <Rating value={visit.rating || 0} size="small" readOnly />
                            <Typography variant="caption" display="block">
                              {new Date(visit.visitedAt).toLocaleDateString('ja-JP')}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* 訪問記録追加ダイアログ（仮） */}
      <Dialog open={openVisitDialog} onClose={() => setOpenVisitDialog(false)}>
        <DialogTitle>訪問記録を追加</DialogTitle>
        <DialogContent>
          <Typography>訪問記録機能は現在開発中です。</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenVisitDialog(false)}>閉じる</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
