import React from 'react';
import { Dialog, DialogContent, Typography, Button, Box } from '@mui/material';
import { Close } from '@mui/icons-material';
import { useLanguage } from '../../contexts/LanguageContext';

const DeleteConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  isExistingDocument = false,
}) => {
  const { t } = useLanguage();
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          textAlign: 'center',
        },
      }}
    >
      <DialogContent sx={{ padding: 3 }}>
        {/* 빨간색 X 아이콘 */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mb: 2,
          }}
        >
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              backgroundColor: '#f44336',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Close sx={{ color: 'white', fontSize: 30 }} />
          </Box>
        </Box>

        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
          {isExistingDocument ? t('deleteDocument') : t('resetContent')}
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {isExistingDocument ? t('confirmDelete') : t('confirmReset')}
        </Typography>
        <Button
          onClick={onConfirm}
          variant="contained"
          sx={{
            backgroundColor: '#f44336',
            '&:hover': {
              backgroundColor: '#d32f2f',
            },
            borderRadius: 1.5,
            px: 4,
            py: 1,
            mr: 1,
          }}
        >
          {isExistingDocument ? t('delete') : t('reset')}
        </Button>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderRadius: 1.5,
            px: 4,
            py: 1,
          }}
        >
          {t('close')}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteConfirmDialog;
