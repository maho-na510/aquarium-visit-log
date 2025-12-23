import { Box, Typography, Button, Container, Card, CardContent } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useNavigate } from 'react-router-dom';
import { Anchor as AnchorIcon, PhotoLibrary as PhotoLibraryIcon, Star as StarIcon } from '@mui/icons-material';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 6, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom>
          🐠 水族館訪問記録
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          あなたの水族館訪問の思い出を記録しましょう
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate('/aquariums')}
            sx={{ mr: 2 }}
          >
            水族館を探す
          </Button>
          <Button
            variant="outlined"
            size="large"
            onClick={() => navigate('/visits')}
          >
            訪問記録を見る
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mt: 4 }}>
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <AnchorIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                水族館を探す
              </Typography>
              <Typography variant="body2" color="text.secondary">
                全国の水族館情報を検索・閲覧できます
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <PhotoLibraryIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                訪問記録を残す
              </Typography>
              <Typography variant="body2" color="text.secondary">
                写真や評価、メモを記録して思い出を残せます
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              <StarIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                行きたいリスト
              </Typography>
              <Typography variant="body2" color="text.secondary">
                気になる水族館をリストに追加して管理できます
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
