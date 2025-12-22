import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// ページコンポーネント（これから作成）
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import MapPage from './pages/MapPage';
import AquariumListPage from './pages/AquariumListPage';
import AquariumDetailPage from './pages/AquariumDetailPage';
import AquariumFormPage from './pages/AquariumFormPage';
import VisitListPage from './pages/VisitListPage';
import VisitEditPage from './pages/VisitEditPage';
import WishlistPage from './pages/WishlistPage';
import RankingPage from './pages/RankingPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AquariumVisitsPage from './pages/AquariumVisitsPage';
import VisitDetailPage from './pages/VisitDetailPage';

// MUIテーマの設定
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#26a69a',
      light: '#4db6ac',
      dark: '#00897b',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
      '"Apple Color Emoji"',
      '"Segoe UI Emoji"',
      '"Segoe UI Symbol"',
      '"Noto Sans JP"',
    ].join(','),
  },
});

// React Queryの設定
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5分
      gcTime: 10 * 60 * 1000, // 10分
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            {/* 認証不要のルート */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* 認証必要なルート */}
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="map" element={<MapPage />} />
              <Route path="aquariums" element={<AquariumListPage />} />
              <Route path="aquariums/new" element={<AquariumFormPage />} />
              <Route path="aquariums/:id" element={<AquariumDetailPage />} />
              <Route path="aquariums/:id/visits" element={<AquariumVisitsPage />} />
              <Route path="aquariums/:id/edit" element={<AquariumFormPage />} />
              <Route path="visits" element={<VisitListPage />} />
              <Route path="visits/:id" element={<VisitDetailPage />} />
              <Route path="visits/:id/edit" element={<VisitEditPage />} />
              <Route path="wishlist" element={<WishlistPage />} />
              <Route path="rankings" element={<RankingPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>
            
            {/* 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
        <ReactQueryDevtools initialIsOpen={false} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;