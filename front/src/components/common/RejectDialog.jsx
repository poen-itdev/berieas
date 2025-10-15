import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
} from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';

const RejectDialog = ({
  open,
  onClose,
  onConfirm,
  title = '반려 사유 입력',
}) => {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    if (reason.trim()) {
      onConfirm(reason);
      setReason('');
      onClose();
    } else {
      alert('반려 사유를 입력해주세요.');
    }
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
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
          <CancelIcon sx={{ color: '#d32f2f', fontSize: 30 }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ pb: 2 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          반려 사유를 입력해주세요.
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="반려 사유를 입력하세요..."
          variant="outlined"
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          }}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          sx={{
            borderRadius: 1.5,
            px: 3,
          }}
        >
          취소
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          sx={{
            backgroundColor: '#d32f2f',
            '&:hover': {
              backgroundColor: '#b71c1c',
            },
            borderRadius: 1.5,
            px: 3,
          }}
        >
          반려
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RejectDialog;
