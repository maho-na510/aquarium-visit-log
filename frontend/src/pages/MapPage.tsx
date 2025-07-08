import React, { useState, useEffect } from 'react';
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
  MyLocation as MyLocationIcon,
  Pool as PoolIcon,
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

// 行きたいリストの水族館用アイコン（金色）
const WishlistIcon = L.icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="40" height="40">
      <path fill="#ffc107" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
      <path fill="#fff" d="M12 7l1.5 3 3.5.5-2.5 2.5.5 3.5-3-1.5-3 1.5.5-3.5-2.5-2.5 3.5-.5z"/>
    </svg>
  `),
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

// ランキングTOP5の水族館用アイコン（金色の枠）
const TopRankIcon = L.icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="45" height="45">
      <path fill="#ff9800" stroke="#ffc107" stroke-width="3" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
      <text x="12" y="12" font-size="10" fill="#fff" text-anchor="middle">TOP</text>
    </svg>
  `),
  iconSize: [45, 45],
  iconAnchor: [22.5, 45],
  popupAnchor: [0, -45],
});

L.Marker.prototype.options.icon = DefaultIcon;

export default function MapPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [showVisited, setShowVisited] = useState(true);
  const [showUnvisited, setShowUnvisited] = useState(true);
  const [showWishlist, setShowWishlist] = useState(true);
  const [mapCenter, setMapCenter] = useState<[number, number]>([35.6762, 139.6503]); // 東京
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

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

  // ユーザーの現在地を取得
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          setMapCenter([latitude, longitude]);
        },
        (error) => {
          console.error('位置情報の取得に失敗しました:', error);
        }
      );
    }
  }, []);

  const handleAquariumClick = (aquariumId: number) => {
    navigate(`/aquariums/${aquariumId}`);
  };

  const handleMyLocation = () => {
    if (userLocation) {
      setMapCenter(userLocation);
    } else {
      alert('位置情報が取得できません');
    }
  };

  const getMarkerIcon = (aquarium: Aquarium) => {
    // TOP5チェック
    const isTop5 = rankingData?.rankings.some(r => r.id === aquarium.id && r.isTop5);
    if (isTop5) return TopRankIcon;
    
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
              color="warning"
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 16, height: 16, bgcolor: '#ffc107', borderRadius: '50%' }} />
              行きたいリスト
            </Box>
          }
        />
      </FormGroup>

      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          凡例
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 20, height: 20, bgcolor: '#ff9800', border: '2px solid #ffc107', borderRadius: '50%' }} />
            <Typography variant="body2">ランキングTOP5</Typography>
          </Box>
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

      {/* 現在地ボタン */}
      <IconButton
        onClick={handleMyLocation}
        sx={{
          position: 'absolute',
          bottom: 16,
          right: 16,
          zIndex: 1000,
          bgcolor: 'background.paper',
          boxShadow: 1,
        }}
      >
        <MyLocationIcon />
      </IconButton>

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
          
          {/* 現在地マーカー */}
          {userLocation && (
            <Marker
              position={userLocation}
              icon={L.divIcon({
                className: 'current-location-marker',
                html: '<div style="width: 20px; height: 20px; background: #4285F4; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
                iconSize: [20, 20],
                iconAnchor: [10, 10],
              })}
            >
              <Popup>現在地</Popup>
            </Marker>
          )}

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