import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Alert,
  Chip,
  Rating,
  Avatar,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  TrendingUp as TrendingUpIcon,
  EmojiEvents as TrophyIcon,
  Star as StarIcon,
  Favorite as FavoriteIcon,
  Diamond as DiamondIcon,
  People as PeopleIcon,
  LocationOn as LocationIcon,
  AddPhotoAlternate
} from '@mui/icons-material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { aquariumService } from '../services/aquariumService';
import { RankingItem } from '../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`ranking-tabpanel-${index}`}
      aria-labelledby={`ranking-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function RankingsPage() {
  const navigate = useNavigate();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // 訪問数ランキング
  const { data: mostVisitedData, isLoading: isLoadingMostVisited } = useQuery({
    queryKey: ['rankings', 'most-visited'],
    queryFn: () => aquariumService.getMostVisitedRanking({ limit: 20 }),
  });

  // 評価ランキング
  const { data: highestRatedData, isLoading: isLoadingHighestRated } = useQuery({
    queryKey: ['rankings', 'highest-rated'],
    queryFn: () => aquariumService.getHighestRatedRanking({ limit: 20 }),
  });

  // トレンドランキング
  const { data: trendingData, isLoading: isLoadingTrending } = useQuery({
    queryKey: ['rankings', 'trending'],
    queryFn: () => aquariumService.getTrendingRanking({ days: 30, limit: 20 }),
  });

  // 行きたいリストチャンピオン
  const { data: wishlistData, isLoading: isLoadingWishlist } = useQuery({
    queryKey: ['rankings', 'wishlist-champions'],
    queryFn: () => aquariumService.getWishlistChampionsRanking({ limit: 20 }),
  });

  // 隠れた名所
  const { data: hiddenGemsData, isLoading: isLoadingHiddenGems } = useQuery({
    queryKey: ['rankings', 'hidden-gems'],
    queryFn: () => aquariumService.getHiddenGemsRanking({ limit: 20 }),
  });

  const getRankColor = (rank: number) => {
    if (rank === 1) return '#FFD700'; // Gold
    if (rank === 2) return '#C0C0C0'; // Silver
    if (rank === 3) return '#CD7F32'; // Bronze
    return '#757575'; // Gray
  };

  const getRankIcon = (rank: number) => {
    if (rank <= 3) {
      return <TrophyIcon sx={{ color: getRankColor(rank), fontSize: 40 }} />;
    }
    return (
      <Avatar sx={{ bgcolor: 'grey.300', width: 40, height: 40 }}>
        <Typography variant="h6" color="text.secondary">
          {rank}
        </Typography>
      </Avatar>
    );
  };

  const RankingCard = ({ item }: { item: RankingItem }) => (
    <Card
      sx={{
        display: 'flex',
        mb: 2,
        cursor: 'pointer',
        '&:hover': { boxShadow: 4 },
        transition: 'box-shadow 0.3s',
      }}
      onClick={() => navigate(`/aquariums/${item.id}`)}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', pl: 2, pr: 1 }}>
        {getRankIcon(item.rank)}
      </Box>
      <CardMedia
        component="div"
        sx={{
          width: 160,
          minWidth: 160,
          bgcolor: 'grey.200',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {item.latestPhotoUrl ? (
          <img
            src={item.latestPhotoUrl}
            alt={item.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <AddPhotoAlternate sx={{ fontSize: 60, color: 'grey.400' }} />
        )}
      </CardMedia>
      <CardContent sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography variant="h6" component="h2">
            {item.name}
          </Typography>
          {item.isTop5 && (
            <Chip label="TOP5" size="small" color="warning" icon={<StarIcon />} />
          )}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
          <LocationIcon fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            {item.prefecture}
          </Typography>
        </Box>

        {/* メトリクス表示 */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {item.visitCount !== undefined && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <PeopleIcon fontSize="small" color="primary" />
              <Typography variant="body2">
                訪問数: <strong>{item.visitCount}</strong>
              </Typography>
            </Box>
          )}
          {item.recentVisitCount !== undefined && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TrendingUpIcon fontSize="small" color="success" />
              <Typography variant="body2">
                最近30日: <strong>{item.recentVisitCount}</strong>
              </Typography>
            </Box>
          )}
          {item.wishlistCount !== undefined && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <FavoriteIcon fontSize="small" sx={{ color: '#ec4899' }} />
              <Typography variant="body2">
                行きたい: <strong>{item.wishlistCount}</strong>
              </Typography>
            </Box>
          )}
          {item.averageRating !== undefined && item.averageRating > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Rating value={item.averageRating} readOnly precision={0.1} size="small" />
              <Typography variant="body2" color="text.secondary">
                ({item.averageRating.toFixed(1)})
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );

  const RankingList = ({
    data,
    isLoading,
    emptyMessage,
  }: {
    data?: { rankings: RankingItem[] };
    isLoading: boolean;
    emptyMessage: string;
  }) => {
    if (isLoading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (!data || data.rankings.length === 0) {
      return (
        <Alert severity="info" sx={{ mt: 2 }}>
          {emptyMessage}
        </Alert>
      );
    }

    return (
      <Box>
        {data.rankings.map((item) => (
          <RankingCard key={item.id} item={item} />
        ))}
      </Box>
    );
  };

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <TrophyIcon fontSize="large" color="warning" />
          ランキング
        </Typography>
        <Typography variant="body1" color="text.secondary">
          様々な視点から人気の水族館を発見しましょう
        </Typography>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="ranking tabs"
        >
          <Tab
            icon={<PeopleIcon />}
            iconPosition="start"
            label="訪問数ランキング"
            id="ranking-tab-0"
          />
          <Tab
            icon={<StarIcon />}
            iconPosition="start"
            label="評価ランキング"
            id="ranking-tab-1"
          />
          <Tab
            icon={<TrendingUpIcon />}
            iconPosition="start"
            label="トレンド"
            id="ranking-tab-2"
          />
          <Tab
            icon={<FavoriteIcon />}
            iconPosition="start"
            label="行きたいリスト"
            id="ranking-tab-3"
          />
          <Tab
            icon={<DiamondIcon />}
            iconPosition="start"
            label="隠れた名所"
            id="ranking-tab-4"
          />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        <Typography variant="h6" gutterBottom>
          訪問数ランキング
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          全ユーザーの訪問記録数が多い水族館
        </Typography>
        <RankingList
          data={mostVisitedData}
          isLoading={isLoadingMostVisited}
          emptyMessage="まだ訪問記録がありません"
        />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Typography variant="h6" gutterBottom>
          評価ランキング
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          ユーザー評価（星の数）が高い水族館（最低3件の評価が必要）
        </Typography>
        <RankingList
          data={highestRatedData}
          isLoading={isLoadingHighestRated}
          emptyMessage="まだ評価がありません"
        />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" gutterBottom>
          トレンドランキング
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          最近30日で訪問数が多い、今人気の水族館
        </Typography>
        <RankingList
          data={trendingData}
          isLoading={isLoadingTrending}
          emptyMessage="最近の訪問記録がありません"
        />
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Typography variant="h6" gutterBottom>
          行きたいリストチャンピオン
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          多くのユーザーが「行きたい」リストに追加している水族館
        </Typography>
        <RankingList
          data={wishlistData}
          isLoading={isLoadingWishlist}
          emptyMessage="まだ行きたいリストに追加されていません"
        />
      </TabPanel>

      <TabPanel value={tabValue} index={4}>
        <Typography variant="h6" gutterBottom>
          隠れた名所
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          高評価（4.5以上）だけど訪問数が少ない、知る人ぞ知る水族館
        </Typography>
        <RankingList
          data={hiddenGemsData}
          isLoading={isLoadingHiddenGems}
          emptyMessage="条件に合う水族館が見つかりませんでした"
        />
      </TabPanel>
    </Box>
  );
}
