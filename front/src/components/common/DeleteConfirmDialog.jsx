import React from 'react';
import { Dialog, DialogContent, Typography, Button, Box } from '@mui/material';
import { Close } from '@mui/icons-material';
import { useLanguage } from '../../contexts/LanguageContext';

const DeleteConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  isExistingDocument = false,
  title = null,
  message = null,
  confirmText = null,
}) => {
  const { t } = useLanguage();

  // 커스텀 메시지가 있으면 사용, 없으면 기본 메시지
  const dialogTitle =
    title || (isExistingDocument ? t('deleteDocument') : t('resetContent'));
  const dialogMessage =
    message || (isExistingDocument ? t('confirmDelete') : t('confirmReset'));
  const dialogConfirmText =
    confirmText || (isExistingDocument ? t('delete') : t('reset'));

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
          {dialogTitle}
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {dialogMessage}
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
          {dialogConfirmText}
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
