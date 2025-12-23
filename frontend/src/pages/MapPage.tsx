import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import {
  Box,
  Paper,
  Typography,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Button,
  Rating,
  Chip,
  FormGroup,
  FormControlLabel,
  Switch,
  Drawer,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { aquariumService } from '../services/aquariumService';
import { Aquarium } from '../types';

// Leafletのデフォルトアイコンの問題を修正
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import iconRetina from 'leaflet/dist/images/marker-icon-2x.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  iconRetinaUrl: iconRetina,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});

// 訪問済みの水族館用アイコン（緑）
const VisitedIcon = L.icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40">
      <path fill="#4caf50" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
      <circle fill="#fff" cx="12" cy="9" r="3"/>
    </svg>
  `),
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

// 未訪問の水族館用アイコン（青）
const UnvisitedIcon = L.icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40">
      <path fill="#2196f3" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
      <circle fill="#fff" cx="12" cy="9" r="3"/>
    </svg>
  `),
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

// 行きたいリストの水族館用アイコン（ピンクのハート）
const WishlistIcon = L.icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40">
      <path fill="#ec4899" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
      <path fill="#fff" d="M12 8.5c0.9-1 2.4-1 3.3 0 .5.5.7 1.1.7 1.7s-.2 1.2-.7 1.7L12 14.5l-3.3-2.6c-.5-.5-.7-1.1-.7-1.7s.2-1.2.7-1.7c0.9-1 2.4-1 3.3 0z"/>
    </svg>
  `),
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

// 訪問数ランキングTOP5の水族館用アイコン（トロフィー）- ランク別に色を変える
const getTopRankIcon = (rank: number) => {
  let trophyColor: string;
  switch (rank) {
    case 1:
      trophyColor = '#FFD700'; // Gold
      break;
    case 2:
      trophyColor = '#C0C0C0'; // Silver
      break;
    case 3:
      trophyColor = '#CD7F32'; // Bronze
      break;
    default:
      trophyColor = '#FFFFFF'; // White (for 4th and 5th)
  }

  return L.icon({
    iconUrl: 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="42" height="42">
        <!-- Trophy cup -->
        <path fill="${trophyColor}" stroke="#333" stroke-width="1.5" d="M14 8h20v12c0 5.5-4.5 10-10 10s-10-4.5-10-10V8z"/>
        <!-- Left handle -->
        <path fill="${trophyColor}" stroke="#333" stroke-width="1.5" d="M12 10h-4c-1 0-2 1-2 2v4c0 2 1.5 3.5 3.5 3.5H12V10z"/>
        <!-- Right handle -->
        <path fill="${trophyColor}" stroke="#333" stroke-width="1.5" d="M36 10h4c1 0 2 1 2 2v4c0 2-1.5 3.5-3.5 3.5H36V10z"/>
        <!-- Base stand -->
        <rect x="20" y="30" width="8" height="6" fill="${trophyColor}" stroke="#333" stroke-width="1.5"/>
        <!-- Bottom base -->
        <rect x="16" y="36" width="16" height="3" rx="1" fill="${trophyColor}" stroke="#333" stroke-width="1.5"/>
        <!-- Rank number -->
        <text x="24" y="20" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="#333" text-anchor="middle">${rank}</text>
      </svg>
    `),
    iconSize: [42, 42],
    iconAnchor: [21, 42],
    popupAnchor: [0, -42],
  });
};

L.Marker.prototype.options.icon = DefaultIcon;

export default function MapPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [showVisited, setShowVisited] = useState(true);
  const [showUnvisited, setShowUnvisited] = useState(true);
  const [showWishlist, setShowWishlist] = useState(true);
  const [showRanking, setShowRanking] = useState(true);
  const [mapCenter] = useState<[number, number]>([35.6762, 139.6503]); // 東京

  // 水族館データを取得
  const { data, isLoading, error } = useQuery({
    queryKey: ['aquariums-map'],
    queryFn: () => aquariumService.getAquariums({ per: 100 }), // 全件取得
  });

  // ランキングデータを取得
  const { data: rankingData } = useQuery({
    queryKey: ['aquariums-ranking'],
    queryFn: () => aquariumService.getMostVisitedRanking({ limit: 5 }),
  });

  const handleAquariumClick = (aquariumId: number) => {
    navigate(`/aquariums/${aquariumId}`);
  };

  const getMarkerIcon = (aquarium: Aquarium) => {
    // TOP5チェック - ランクを取得（ランキング表示がONの場合のみ）
    if (showRanking) {
      const rankingItem = rankingData?.rankings.find(r => r.id === aquarium.id);
      if (rankingItem && rankingItem.isTop5) {
        return getTopRankIcon(rankingItem.rank);
      }
    }

    // その他の状態チェック
    if (aquarium.visited) return VisitedIcon;
    if (aquarium.inWishlist) return WishlistIcon;
    return UnvisitedIcon;
  };

  const shouldShowMarker = (aquarium: Aquarium) => {
    if (aquarium.visited && !showVisited) return false;
    if (!aquarium.visited && !aquarium.inWishlist && !showUnvisited) return false;
    if (aquarium.inWishlist && !showWishlist) return false;
    return true;
  };

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          地図データの読み込みに失敗しました。
        </Alert>
      </Box>
    );
  }

  const drawerContent = (
    <Box sx={{ p: 2, width: isMobile ? 250 : 300 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">表示設定</Typography>
        {isMobile && (
          <IconButton onClick={() => setDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        )}
      </Box>
      
      <FormGroup>
        <FormControlLabel
          control={
            <Switch
              checked={showVisited}
              onChange={(e) => setShowVisited(e.target.checked)}
              color="success"
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 16, height: 16, bgcolor: '#4caf50', borderRadius: '50%' }} />
              訪問済み
            </Box>
          }
        />
        <FormControlLabel
          control={
            <Switch
              checked={showUnvisited}
              onChange={(e) => setShowUnvisited(e.target.checked)}
              color="primary"
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 16, height: 16, bgcolor: '#2196f3', borderRadius: '50%' }} />
              未訪問
            </Box>
          }
        />
        <FormControlLabel
          control={
            <Switch
              checked={showWishlist}
              onChange={(e) => setShowWishlist(e.target.checked)}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: '#ec4899',
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: '#ec4899',
                },
              }}
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 16, height: 16, bgcolor: '#ec4899', borderRadius: '50%' }} />
              行きたいリスト
            </Box>
          }
        />
        <FormControlLabel
          control={
            <Switch
              checked={showRanking}
              onChange={(e) => setShowRanking(e.target.checked)}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: '#ff9800',
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: '#ff9800',
                },
              }}
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 16, height: 16, bgcolor: '#FFD700', borderRadius: '2px' }} />
              ランキング
            </Box>
          }
        />
      </FormGroup>

      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          ランキング
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            component="span"
            sx={{
              display: 'inline-block',
              width: 20,
              height: 20,
              bgcolor: '#FFD700',
              borderRadius: '2px',
              border: '1px solid #333'
            }}
          />
          <Typography variant="body2">訪問数TOP5</Typography>
        </Box>
      </Box>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <CircularProgress />
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ height: 'calc(100vh - 112px)', position: 'relative' }}>
      {/* モバイル用メニューボタン */}
      {isMobile && (
        <IconButton
          onClick={() => setDrawerOpen(true)}
          sx={{
            position: 'absolute',
            top: 16,
            left: 16,
            zIndex: 1000,
            bgcolor: 'background.paper',
            boxShadow: 1,
          }}
        >
          <MenuIcon />
        </IconButton>
      )}

      {/* サイドバー */}
      <Drawer
        variant={isMobile ? 'temporary' : 'persistent'}
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            position: 'relative',
            height: '100%',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* 地図 */}
      <Box sx={{ height: '100%', width: '100%' }}>
        <MapContainer
          center={mapCenter}
          zoom={6}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* 水族館マーカー */}
          {data?.aquariums
            .filter(shouldShowMarker)
            .map((aquarium) => (
              <Marker
                key={aquarium.id}
                position={[aquarium.latitude, aquarium.longitude]}
                icon={getMarkerIcon(aquarium)}
              >
                <Popup>
                  <Card sx={{ minWidth: 280, boxShadow: 'none' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {aquarium.name}
                      </Typography>
                      <Box sx={{ mb: 1 }}>
                        <Rating value={aquarium.averageRating || 0} readOnly size="small" />
                        <Typography variant="body2" color="text.secondary">
                          訪問数: {aquarium.visitCount || 0}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {aquarium.address}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        {aquarium.visited && (
                          <Chip label="訪問済み" size="small" color="success" />
                        )}
                        {aquarium.inWishlist && (
                          <Chip label="行きたい" size="small" color="primary" />
                        )}
                      </Box>
                      <Button
                        variant="contained"
                        fullWidth
                        onClick={() => handleAquariumClick(aquarium.id)}
                      >
                        詳細を見る
                      </Button>
                    </CardContent>
                  </Card>
                </Popup>
              </Marker>
            ))}
        </MapContainer>
      </Box>
    </Box>
  );
}