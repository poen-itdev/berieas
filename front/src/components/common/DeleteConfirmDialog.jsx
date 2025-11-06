import React from 'react';
import { Dialog, DialogContent, Typography, Button, Box } from '@mui/material';
import { Close, Check } from '@mui/icons-material';
import { useLanguage } from '../../contexts/LanguageContext';

const DeleteConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  isExistingDocument = false,
  title = null,
  message = null,
  confirmText = null,
  isActivate = false, // 활성화 작업인지 여부
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
        {/* 아이콘 - 활성화면 초록색 체크, 비활성화면 빨간색 X */}
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
              backgroundColor: isActivate ? '#4caf50' : '#f44336',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isActivate ? (
              <Check sx={{ color: 'white', fontSize: 30 }} />
            ) : (
              <Close sx={{ color: 'white', fontSize: 30 }} />
            )}
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
            backgroundColor: isActivate ? '#4caf50' : '#f44336',
            '&:hover': {
              backgroundColor: isActivate ? '#45a049' : '#d32f2f',
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
