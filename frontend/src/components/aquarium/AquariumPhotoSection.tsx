import React, { useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  Typography,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  AddPhotoAlternate as AddPhotoIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';

import apiClient from '../../services/api';
import { Aquarium } from '../../types';

type AquariumPhoto = {
  id: number;
  url: string;
};

type Props = {
  aquariumId: number;
  aquarium: Aquarium;
  isAdmin: boolean;
  onUpdated?: (next: Aquarium) => void;
};

function getApiOrigin(): string {
  const base = (apiClient.defaults.baseURL || '').trim();
  if (!base) return window.location.origin;

  // baseURL: "http://localhost:3001/api/v1" みたいなのを想定
  try {
    return new URL(base).origin;
  } catch {
    // baseURLが相対だった場合の保険
    return window.location.origin;
  }
}

function toAbsoluteUrl(maybeUrl: string): string {
  if (!maybeUrl) return maybeUrl;

  // すでに絶対URLならそのまま
  if (/^https?:\/\//i.test(maybeUrl)) return maybeUrl;

  // "/rails/..." のような相対なら backend origin を付ける
  if (maybeUrl.startsWith('/')) {
    return `${getApiOrigin()}${maybeUrl}`;
  }

  // それ以外は一応そのまま返す（データ側の不具合調査用）
  return maybeUrl;
}

export default function AquariumPhotoSection({
  aquariumId,
  aquarium,
  isAdmin,
  onUpdated,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { photos, fallbackUrls } = useMemo(() => {
    const anyAquarium = aquarium as any;

    const p = (anyAquarium.photos || []) as AquariumPhoto[];
    const urls = (anyAquarium.photoUrls || anyAquarium.photo_urls || []) as string[];

    const normalizedPhotos = Array.isArray(p)
      ? p
          .filter((x) => x && x.url)
          .map((x) => ({ ...x, url: toAbsoluteUrl(x.url) }))
      : [];

    const normalizedFallback = Array.isArray(urls)
      ? urls.filter(Boolean).map((u) => toAbsoluteUrl(u))
      : [];

    return {
      photos: normalizedPhotos,
      fallbackUrls: normalizedFallback,
    };
  }, [aquarium]);

  const handleSelectFiles = () => {
    setError(null);
    inputRef.current?.click();
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setError(null);

    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append('photos[]', file);
    });

    setUploading(true);
    try {
      const res = await apiClient.post(`/aquariums/${aquariumId}/upload_photos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      onUpdated?.(res.data as Aquarium);
    } catch (e: any) {
      setError(e?.response?.data?.error || '写真のアップロードに失敗しました');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleDelete = async (photoId: number) => {
    setError(null);
    setDeletingId(photoId);

    try {
      const res = await apiClient.delete(`/aquariums/${aquariumId}/photos/${photoId}`);
      onUpdated?.(res.data as Aquarium);
    } catch (e: any) {
      setError(e?.response?.data?.error || '写真の削除に失敗しました');
    } finally {
      setDeletingId(null);
    }
  };

  const hasNewPhotos = photos.length > 0;
  const hasAny = hasNewPhotos || fallbackUrls.length > 0;

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

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {!hasAny ? (
        <Typography variant="body2" color="text.secondary">
          まだ写真がありません
        </Typography>
      ) : (
        <Grid container spacing={2}>
          {hasNewPhotos
            ? photos.map((p) => (
                <Grid key={p.id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Box sx={{ position: 'relative' }}>
                    <Box
                      component="img"
                      src={p.url}
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

                    {isAdmin && (
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(p.id)}
                        disabled={deletingId === p.id}
                        sx={{
                          position: 'absolute',
                          top: 6,
                          right: 6,
                          bgcolor: 'background.paper',
                        }}
                      >
                        {deletingId === p.id ? (
                          <CircularProgress size={18} />
                        ) : (
                          <DeleteIcon fontSize="small" />
                        )}
                      </IconButton>
                    )}
                  </Box>
                </Grid>
              ))
            : fallbackUrls.map((url, idx) => (
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
