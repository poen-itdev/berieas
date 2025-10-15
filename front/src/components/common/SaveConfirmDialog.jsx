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

const SaveConfirmDialog = ({ open, onClose, onConfirm }) => {
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
            임시저장된 문서가 있습니다.
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pb: 2 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: 'center' }}
        >
          임시저장된 문서가 있습니다. 페이지를 이동하시겠습니까?
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
          임시 저장
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
          저장 안함
        </Button>
        <Button
          onClick={() => onConfirm('cancel')}
          variant="outlined"
          sx={{
            borderRadius: 1.5,
            px: 3,
          }}
        >
          닫기
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SaveConfirmDialog;
