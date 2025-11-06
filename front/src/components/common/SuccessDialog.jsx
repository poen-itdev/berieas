import React from 'react';
import { Dialog, DialogContent, Typography, Button, Box } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const SuccessDialog = ({
  open,
  onClose,
  title = 'Success',
  message,
  buttonText = 'OK',
}) => {
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
        <Box sx={{ mb: 1, mt: 1 }}>
          <CheckCircleIcon
            sx={{
              fontSize: 50,
              color: '#4CAF50',
            }}
          />
        </Box>
        <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
          {title}
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {message}
        </Typography>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            backgroundColor: '#1976d2',
            '&:hover': {
              backgroundColor: '#1565c0',
            },
            borderRadius: 1.5,
            px: 4,
            py: 1,
          }}
        >
          {buttonText}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessDialog;
