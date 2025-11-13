import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
  Box,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { useLanguage } from '../../contexts/LanguageContext';

const SaveConfirmDialog = ({ open, onClose, onConfirm }) => {
  const { t } = useLanguage();
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          py: 2,
        },
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
          }}
        >
          <SaveIcon sx={{ color: '#1976d2', fontSize: 30 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {t('unsavedDraftExists')}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pb: 2 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: 'center' }}
        >
          {t('unsavedDraftMessage')}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, gap: 1, justifyContent: 'center' }}>
        <Button
          onClick={() => onConfirm('save')}
          variant="contained"
          sx={{
            backgroundColor: '#1976d2',
            '&:hover': {
              backgroundColor: '#1565c0',
            },
            borderRadius: 1.5,
            px: 3,
          }}
        >
          {t('temporarySave')}
        </Button>
        <Button
          onClick={() => onConfirm('discard')}
          variant="outlined"
          sx={{
            borderColor: '#ff9800',
            color: '#ff9800',
            '&:hover': {
              borderColor: '#f57c00',
              backgroundColor: '#fff3e0',
            },
            borderRadius: 1.5,
            px: 3,
          }}
        >
          {t('doNotSave')}
        </Button>
        <Button
          onClick={() => onConfirm('cancel')}
          variant="outlined"
          sx={{
            borderRadius: 1.5,
            px: 3,
          }}
        >
          {t('close')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SaveConfirmDialog;
