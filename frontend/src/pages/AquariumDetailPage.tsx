import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Paper,
  Typography,
  Grid,
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
import { Aquarium } from '../types';

export default function AquariumDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [openVisitDialog, setOpenVisitDialog] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);

  // 水族館詳細データを取得
  const { data: aquarium, isLoading, error } = useQuery({
    queryKey: ['aquarium', id],
    queryFn: () => aquariumService.getAquarium(Number(id)),
    enabled: !!id,
  });

  // 初期値設定
  React.useEffect(() => {
    if (aquarium) {
      setInWishlist(aquarium.inWishlist || false);
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
    setInWishlist(!inWishlist);
  };

  const handleEdit = () => {
    // TODO: 編集ページへ遷移
    navigate(`/aquariums/${id}/edit`);
  };

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          水族館情報の取得に失敗しました。
        </Alert>
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
          <Grid item xs={12} md={8}>
            <Skeleton variant="text" height={40} />
            <Skeleton variant="text" />
            <Skeleton variant="text" />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={200} />
          </Grid>
        </Grid>
      </Box>
    );
  }

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
          backgroundImage: aquarium.latestPhotoUrl ? `url(${aquarium.latestPhotoUrl})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {!aquarium.latestPhotoUrl && (
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
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            {/* タイトルとアクションボタン */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography variant="h4" component="h1" gutterBottom>
                  {aquarium.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Rating value={aquarium.averageRating || 0} readOnly precision={0.5} />
                    <Typography variant="body1">
                      {(aquarium.averageRating || 0).toFixed(1)}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    訪問数: {aquarium.visitCount || 0}件
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {aquarium.visited && (
                    <Chip label="訪問済み" color="success" />
                  )}
                  {inWishlist && (
                    <Chip label="行きたいリスト登録済み" color="primary" />
                  )}
                </Box>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton onClick={handleToggleWishlist} color={inWishlist ? 'primary' : 'default'}>
                  {inWishlist ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>
                {aquarium.createdBy && (
                  <IconButton onClick={handleEdit}>
                    <EditIcon />
                  </IconButton>
                )}
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* 説明 */}
            {aquarium.description && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  概要
                </Typography>
                <Typography variant="body1" paragraph>
                  {aquarium.description}
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
                  <ListItemText
                    primary="住所"
                    secondary={`${aquarium.prefecture} ${aquarium.address}`}
                  />
                </ListItem>
                {aquarium.phoneNumber && (
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <PhoneIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="電話番号"
                      secondary={aquarium.phoneNumber}
                    />
                  </ListItem>
                )}
                {aquarium.website && (
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <WebsiteIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="ウェブサイト"
                      secondary={
                        <a href={aquarium.website} target="_blank" rel="noopener noreferrer">
                          {aquarium.website}
                        </a>
                      }
                    />
                  </ListItem>
                )}
              </List>
            </Box>

            {/* アクションボタン */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<AddPhotoIcon />}
                onClick={handleAddVisit}
                fullWidth
              >
                訪問記録を追加
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* サイド情報 */}
        <Grid item xs={12} md={4}>
          {/* 営業時間 */}
          {aquarium.openingHours && Object.keys(aquarium.openingHours).length > 0 && (
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <ClockIcon color="primary" />
                  <Typography variant="h6">営業時間</Typography>
                </Box>
                {Object.entries(aquarium.openingHours).map(([key, value]) => (
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
                    <Typography variant="body1">{value}</Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          )}

          {/* 入場料 */}
          {aquarium.admissionFee && Object.keys(aquarium.admissionFee).length > 0 && (
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <MoneyIcon color="primary" />
                  <Typography variant="h6">入場料</Typography>
                </Box>
                {Object.entries(aquarium.admissionFee).map(([key, value]) => (
                  <Box key={key} sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {key === 'adult' ? '大人' :
                       key === 'highSchool' ? '高校生' :
                       key === 'elementary' ? '小学生' :
                       key === 'child' ? '子供' :
                       key === 'infant' ? '幼児' : key}
                    </Typography>
                    <Typography variant="body1">¥{value?.toLocaleString()}</Typography>
                  </Box>
                ))}
              </CardContent>
            </Card>
          )}

          {/* 最近の訪問 */}
          {aquarium.recentVisits && aquarium.recentVisits.length > 0 && (
            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <StarIcon color="primary" />
                  <Typography variant="h6">最近の訪問</Typography>
                </Box>
                <List dense>
                  {aquarium.recentVisits.map((visit) => (
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
          <Typography>
            訪問記録機能は現在開発中です。
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenVisitDialog(false)}>閉じる</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}