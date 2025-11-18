import React from 'react';
import { Dialog, DialogContent, Typography, Button, Box } from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';

const ErrorDialog = ({
  open,
  onClose,
  title = 'Error',
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
          <ErrorIcon
            sx={{
              fontSize: 50,
              color: '#f44336',
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
            backgroundColor: '#f44336',
            '&:hover': {
              backgroundColor: '#d32f2f',
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

export default ErrorDialog;

