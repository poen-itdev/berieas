import React from 'react';
import { Dialog, DialogContent, Typography, Button, Box } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const SuccessDialog = ({
  open,
  onClose,
  title = 'Success',
  message,
  buttonText = 'OK',
  isError = false,
}) => {
  const iconColor = isError ? '#f44336' : '#4CAF50';
  const buttonColor = isError ? '#f44336' : '#1976d2';
  const buttonHoverColor = isError ? '#d32f2f' : '#1565c0';

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
          {isError ? (
            <CancelIcon
              sx={{
                fontSize: 50,
                color: iconColor,
              }}
            />
          ) : (
            <CheckCircleIcon
              sx={{
                fontSize: 50,
                color: iconColor,
              }}
            />
          )}
        </Box>
        {title && (
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
            {title}
          </Typography>
        )}
        <Typography variant="body1" sx={{ mb: 2 }}>
          {message}
        </Typography>
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            backgroundColor: buttonColor,
            '&:hover': {
              backgroundColor: buttonHoverColor,
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
