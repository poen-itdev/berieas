import React from 'react';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import { useLanguage } from '../../contexts/LanguageContext';

const StatusCard = ({ statusData }) => {
  const { t } = useLanguage();

  const statusItems = [
    {
      label: t('approvalRequest'),
      value: statusData.approvalRequest,
      bgColor: '#fff3e0',
      textColor: '#f57c00',
    },
    {
      label: t('inProgress'),
      value: statusData.inProgress,
      bgColor: '#e3f2fd',
      textColor: '#1976d2',
    },
    {
      label: t('completed'),
      value: statusData.completed,
      bgColor: '#e8f5e8',
      textColor: '#388e3c',
    },
  ];

  return (
    <Card
      sx={{ mb: 4, borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography
          variant="h6"
          sx={{ mb: 2, fontWeight: 500, fontSize: 16, textAlign: 'left' }}
        >
          {t('myStatus')}
        </Typography>
        <Grid container spacing={3}>
          {statusItems.map((item, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Box
                sx={{
                  textAlign: 'center',
                  p: 2,
                  bgcolor: item.bgColor,
                  borderRadius: 2,
                }}
              >
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 700, color: item.textColor }}
                >
                  {item.value}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', mt: 1 }}>
                  {item.label}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default StatusCard;
