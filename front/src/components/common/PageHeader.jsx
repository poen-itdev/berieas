import React from 'react';
import { Box, Typography } from '@mui/material';

const PageHeader = ({ title, description, titleVariant = 'h5', fontSize }) => {
  return (
    <Box sx={{ mb: 5 }}>
      <Typography
        variant={titleVariant}
        sx={{
          fontWeight: 600,
          mb: 1,
          textAlign: 'left',
          fontSize: fontSize || '22px',
        }}
      >
        {title}
      </Typography>
      {description && (
        <Typography
          variant="body1"
          fontSize="16px"
          sx={{ color: 'text.secondary', textAlign: 'left' }}
        >
          {description}
        </Typography>
      )}
    </Box>
  );
};

export default PageHeader;
