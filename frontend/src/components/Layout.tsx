import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Button,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Map as MapIcon,
  Anchor as AnchorIcon,
  PhotoLibrary as PhotoLibraryIcon,
  Favorite as FavoriteIcon,
  EmojiEvents as TrophyIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Login as LoginIcon,
  PersonAdd as PersonAddIcon,
} from '@mui/icons-material';
import { useMe } from '../hooks/useMe';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../services/api';

const drawerWidth = 240;

const menuItems = [
  { text: 'ホーム', icon: <HomeIcon />, path: '/' },
  { text: '地図', icon: <MapIcon />, path: '/map' },
  { text: '水族館一覧', icon: <AnchorIcon />, path: '/aquariums' },
  { text: '訪問記録', icon: <PhotoLibraryIcon />, path: '/visits' },
  { text: '行きたいリスト', icon: <FavoriteIcon />, path: '/wishlist' },
  { text: 'ランキング', icon: <TrophyIcon />, path: '/rankings' },
];

export default function Layout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const { data: meData, isLoading: meLoading } = useMe();
  const isLoggedIn = !!meData?.user;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const logoutMutation = useMutation({
    mutationFn: () => apiClient.delete('/logout'),
    onSuccess: () => {
      // Clear all cached data on logout
      queryClient.clear();
      navigate('/');
    },
  });

  const handleLogout = () => {
    handleProfileMenuClose();
    logoutMutation.mutate();
  };

  const drawer = (
    <Box>
      <Toolbar>
        <Typography variant="h6" noWrap sx={{ color: 'primary.main', fontWeight: 'bold' }}>
          🐠 水族館ログ
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
              onClick={() => isMobile && setMobileOpen(false)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'primary.light',
                  color: 'white',
                  '& .MuiListItemIcon-root': {
                    color: 'white',
                  },
                },
              }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {menuItems.find(item => item.path === location.pathname)?.text || '水族館訪問記録'}
          </Typography>

          {!meLoading && (
            <>
              {isLoggedIn ? (
                <>
                  <IconButton
                    size="large"
                    edge="end"
                    aria-label="account of current user"
                    aria-haspopup="true"
                    onClick={handleProfileMenuOpen}
                    color="inherit"
                  >
                    <Avatar
                      src={meData?.user?.avatar_url || meData?.user?.avatarUrl}
                      sx={{ width: 32, height: 32 }}
                    >
                      {meData?.user?.name?.[0]?.toUpperCase()}
                    </Avatar>
                  </IconButton>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleProfileMenuClose}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                  >
                    <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/profile'); }}>
                      <ListItemIcon>
                        <PersonIcon fontSize="small" />
                      </ListItemIcon>
                      プロフィール
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={handleLogout}>
                      <ListItemIcon>
                        <LogoutIcon fontSize="small" />
                      </ListItemIcon>
                      ログアウト
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    color="inherit"
                    startIcon={<LoginIcon />}
                    onClick={() => navigate('/login')}
                    sx={{ textTransform: 'none' }}
                  >
                    ログイン
                  </Button>
                  <Button
                    variant="outlined"
                    color="inherit"
                    startIcon={<PersonAddIcon />}
                    onClick={() => navigate('/register')}
                    sx={{
                      textTransform: 'none',
                      borderColor: 'white',
                      '&:hover': {
                        borderColor: 'white',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      }
                    }}
                  >
                    新規登録
                  </Button>
                </Box>
              )}
            </>
          )}
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}