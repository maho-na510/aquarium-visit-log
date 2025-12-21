import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Box, Alert, CircularProgress } from '@mui/material';
import { visitService } from '../services/visitService';
import VisitForm from '../components/VisitForm';

export default function VisitEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const visitId = Number(id);

  // 訪問記録詳細を取得
  const { data: visit, isLoading, error } = useQuery({
    queryKey: ['visit', visitId],
    queryFn: () => visitService.getVisit(visitId),
    enabled: !!visitId,
  });

  const handleClose = () => {
    navigate('/visits');
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !visit) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          訪問記録の取得に失敗しました。
        </Alert>
      </Box>
    );
  }

  // Visit型からVisitFormTypeに変換
  const initialData = {
    aquariumId: visit.aquarium.id,
    visitedAt: visit.visitedAt,
    weather: visit.weather,
    rating: visit.rating,
    memo: visit.memo,
    goodExhibitsList: visit.goodExhibits,
  };

  return (
    <VisitForm
      open={true}
      onClose={handleClose}
      visitId={visitId}
      initialData={initialData}
      existingPhotos={visit.photoUrls}
    />
  );
}
