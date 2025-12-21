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
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
} from '@mui/material';
import Grid from '@mui/material/Grid';
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
import AquariumAllPhotosSection from '../components/aquarium/AquariumAllPhotosSection';
import { useMe } from '../hooks/useMe';
import apiClient from '../services/api';
import VisitForm from '../components/VisitForm';

type OgImageResponse = {
  og_image_url?: string | null;
  ogImageUrl?: string | null;
  og_image?: string | null;
  ogImage?: string | null;
};

// Helper to convert relative URLs to absolute
function getApiOrigin(): string {
  const base = (apiClient.defaults.baseURL || '').trim();
  if (!base) return window.location.origin;

  try {
    return new URL(base).origin;
  } catch {
    return window.location.origin;
  }
}

function toAbsoluteUrl(maybeUrl: string | null | undefined): string | null {
  if (!maybeUrl) return null;

  // すでに絶対URLならそのまま
  if (/^https?:\/\//i.test(maybeUrl)) return maybeUrl;

  // "/rails/..." のような相対なら backend origin を付ける
  if (maybeUrl.startsWith('/')) {
    return `${getApiOrigin()}${maybeUrl}`;
  }

  return maybeUrl;
}

export default function AquariumDetailPage() {
  const { id } = useParams<{ id: string }>();
  const aquariumId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [openVisitDialog, setOpenVisitDialog] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);

  const { data: meData } = useMe();
  const isAdmin = useMemo(() => meData?.user?.role === 'admin', [meData]);

  // 水族館詳細データを取得
  const {
    data: aquarium,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['aquarium', aquariumId],
    queryFn: () => aquariumService.getAquarium(aquariumId),
    enabled: Number.isFinite(aquariumId),
  });

  // 公式サイトOGP画像（ヘッダー用フォールバック）
  const { data: ogData } = useQuery<OgImageResponse>({
    queryKey: ['aquariumOgImage', aquariumId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/aquariums/${aquariumId}/og_image`, {
        credentials: 'include',
      });
      if (!res.ok) return { og_image_url: null };
      return (await res.json()) as OgImageResponse;
    },
    enabled: Number.isFinite(aquariumId),
    staleTime: 1000 * 60 * 60, // 1h
  });

  const ogImageUrl =
    ogData?.ogImageUrl ??
    ogData?.og_image_url ??
    ogData?.og_image ??
    ogData?.ogImage ??
    null;

  const headerImageUrl = toAbsoluteUrl(
    (aquarium as any)?.photos?.[0]?.url ||
    (aquarium as any)?.photoUrls?.[0] ||
    (aquarium as any)?.photo_urls?.[0] ||
    ogImageUrl
  );  

  // キーゆれ吸収（snake/camel混在）
  const latestPhotoUrl =
    (aquarium as any)?.latestPhotoUrl ??
    (aquarium as any)?.latest_photo_url ??
    null;

  //const headerImageUrl = latestPhotoUrl || ogImageUrl || null;

  const averageRating =
    (aquarium as any)?.averageRating ??
    (aquarium as any)?.average_rating ??
    0;

  const visitCount =
    (aquarium as any)?.visitCount ??
    (aquarium as any)?.visit_count ??
    0;

  const visited =
    (aquarium as any)?.visited ??
    false;

  const aquariumName =
    (aquarium as any)?.name ?? '';

  const prefecture =
    (aquarium as any)?.prefecture ?? '';

  const address =
    (aquarium as any)?.address ?? '';

  const phoneNumber =
    (aquarium as any)?.phoneNumber ??
    (aquarium as any)?.phone_number ??
    null;

  const website =
    (aquarium as any)?.website ?? null;

  const openingHours =
    (aquarium as any)?.openingHours ??
    (aquarium as any)?.opening_hours ??
    null;

  const admissionFee =
    (aquarium as any)?.admissionFee ??
    (aquarium as any)?.admission_fee ??
    null;

  const description =
    (aquarium as any)?.description ?? null;

  const recentVisits =
    (aquarium as any)?.recentVisits ??
    (aquarium as any)?.recent_visits ??
    [];

  // wishlist 状態（snake/camel混在対応）
  useEffect(() => {
    if (!aquarium) return;
    const next =
      (aquarium as any)?.inWishlist ??
      (aquarium as any)?.in_wishlist ??
      false;
    setInWishlist(Boolean(next));
  }, [aquarium]);

  const handleBack = () => navigate('/aquariums');
  const handleAddVisit = () => setOpenVisitDialog(true);

  const handleToggleWishlist = () => {
    // TODO: API繋ぐときはここで叩く
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
          <Grid size={{ xs: 12, md: 8 }}>
            <Skeleton variant="text" height={40} />
            <Skeleton variant="text" />
            <Skeleton variant="text" />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
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
          backgroundImage: headerImageUrl ? `url(${headerImageUrl})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {!headerImageUrl && <PoolIcon sx={{ fontSize: 100, color: 'grey.400' }} />}

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
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3 }}>
            {/* タイトルとアクションボタン */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography variant="h4" component="h1" gutterBottom>
                  {aquariumName}
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Rating value={averageRating || 0} readOnly precision={0.5} />
                    <Typography variant="body1">{Number(averageRating || 0).toFixed(1)}</Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary">
                    訪問数: {visitCount || 0}件
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  {visited && <Chip label="訪問済み" color="success" />}
                  {inWishlist && <Chip label="行きたいリスト登録済み" color="primary" />}
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                <IconButton onClick={handleToggleWishlist} color={inWishlist ? 'primary' : 'default'}>
                  {inWishlist ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>

                {isAdmin && (
                  <IconButton onClick={handleEdit}>
                    <EditIcon />
                  </IconButton>
                )}
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* 写真セクション */}
            <AquariumPhotoSection
              aquariumId={(aquarium as any).id}
              aquarium={aquarium as any}
              isAdmin={isAdmin}
              onUpdated={(next) => {
                queryClient.setQueryData(['aquarium', aquariumId], next);
              }}
            />

            <Divider sx={{ my: 2 }} />

            {/* すべての写真セクション (水族館 + 訪問記録) */}
            {((aquarium as any).allPhotos || (aquarium as any).all_photos) &&
             ((aquarium as any).allPhotos?.length > 0 || (aquarium as any).all_photos?.length > 0) && (
              <>
                <AquariumAllPhotosSection
                  aquarium={{
                    ...(aquarium as any),
                    allPhotos: (aquarium as any).allPhotos || (aquarium as any).all_photos,
                    headerPhotoId: (aquarium as any).headerPhotoId || (aquarium as any).header_photo_id,
                  }}
                  isAdmin={isAdmin}
                />
                <Divider sx={{ my: 2 }} />
              </>
            )}

            {/* 説明 */}
            {description && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  概要
                </Typography>
                <Typography variant="body1" paragraph>
                  {description}
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
                  <ListItemText primary="住所" secondary={`${prefecture} ${address}`} />
                </ListItem>

                {phoneNumber && (
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <PhoneIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary="電話番号" secondary={phoneNumber} />
                  </ListItem>
                )}

                {website && (
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <WebsiteIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary="ウェブサイト"
                      secondary={
                        <a href={website} target="_blank" rel="noopener noreferrer">
                          {website}
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
          {openingHours && Object.keys(openingHours).length > 0 && (
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <ClockIcon color="primary" />
                  <Typography variant="h6">営業時間</Typography>
                </Box>

                {Object.entries(openingHours).map(([key, value]) => {
                  if (key === 'recentVisits' || key === 'recent_visits') return null;
                  return (
                    <Box key={key} sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {key === 'regular'
                          ? '通常'
                          : key === 'summer'
                          ? '夏季'
                          : key === 'goldenWeek'
                          ? 'ゴールデンウィーク'
                          : key === 'springCummer'
                          ? '春夏'
                          : key === 'autumnWinter'
                          ? '秋冬'
                          : key === 'weekday'
                          ? '平日'
                          : key === 'holiday'
                          ? '休日'
                          : key}
                      </Typography>
                      <Typography variant="body1">{String(value)}</Typography>
                    </Box>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* 入場料 */}
          {admissionFee && Object.keys(admissionFee).length > 0 && (
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <MoneyIcon color="primary" />
                  <Typography variant="h6">入場料</Typography>
                </Box>

                {Object.entries(admissionFee).map(([key, value]) => (
                  <Box key={key} sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {key === 'adult'
                        ? '大人'
                        : key === 'highSchool'
                        ? '高校生'
                        : key === 'elementary'
                        ? '小学生'
                        : key === 'child'
                        ? '子供'
                        : key === 'infant'
                        ? '幼児'
                        : key}
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
                        primary={visit.userName ?? visit.user_name ?? ''}
                        secondary={
                          <Box>
                            <Rating value={visit.rating || 0} size="small" readOnly />
                            <Typography variant="caption" display="block">
                              {visit.visitedAt || visit.visited_at
                                ? new Date(visit.visitedAt || visit.visited_at).toLocaleDateString('ja-JP')
                                : ''}
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

      {/* 訪問記録追加フォーム */}
      <VisitForm
        open={openVisitDialog}
        onClose={() => setOpenVisitDialog(false)}
        aquariumId={aquariumId}
      />
    </Box>
  );
}
