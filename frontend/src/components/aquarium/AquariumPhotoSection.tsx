import React, { useMemo, useRef, useState } from 'react';
import { Box, Button, CircularProgress, Divider, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import { AddPhotoAlternate as AddPhotoIcon } from '@mui/icons-material';

import apiClient from '../../services/api';
import { Aquarium } from '../../types';

type Props = {
  aquariumId: number;
  aquarium: Aquarium;
  isAdmin: boolean;
  onUpdated?: (next: Aquarium) => void;
};

export default function AquariumPhotoSection({ aquariumId, aquarium, isAdmin, onUpdated }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const photoUrls = useMemo(() => {
    const anyAquarium = aquarium as any;
    return (anyAquarium.photoUrls || anyAquarium.photo_urls || []) as string[];
  }, [aquarium]);

  const handleSelectFiles = () => {
    inputRef.current?.click();
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append('photos[]', file));

    setUploading(true);
    try {

      const res = await apiClient.post(`/aquariums/${aquariumId}/upload_photos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onUpdated?.(res.data);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
        <Typography variant="h6">写真</Typography>

        {isAdmin && (
          <>
            <input
              ref={inputRef}
              type="file"
              hidden
              multiple
              accept="image/*"
              onChange={(e) => handleUpload(e.target.files)}
            />
            <Button
              variant="outlined"
              startIcon={uploading ? <CircularProgress size={18} /> : <AddPhotoIcon />}
              onClick={handleSelectFiles}
              disabled={uploading}
            >
              写真を追加
            </Button>
          </>
        )}
      </Box>

      <Divider sx={{ my: 2 }} />

      {photoUrls.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          まだ写真がありません
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {photoUrls.map((url, idx) => (
            <Grid key={`${url}-${idx}`} size={{ xs: 12, sm: 6, md: 4 }}>
              <Box
                component="img"
                src={url}
                alt=""
                sx={{
                  width: '100%',
                  height: 180,
                  objectFit: 'cover',
                  borderRadius: 2,
                  display: 'block',
                  bgcolor: 'grey.100',
                }}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
