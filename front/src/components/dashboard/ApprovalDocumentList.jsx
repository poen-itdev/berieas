import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Chip,
} from '@mui/material';
import { Description } from '@mui/icons-material';

const ApprovalDocumentList = ({ documents, onDocumentClick }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case '결재 대기':
        return '#FF9800';
      case '수신 대기':
        return '#2196F3';
      case '완료':
        return '#4CAF50';
      default:
        return '#757575';
    }
  };

  const handleDocumentClick = (document) => {
    if (onDocumentClick) {
      onDocumentClick(document);
    }
  };

  return (
    <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#333' }}>
          결재할 문서
        </Typography>
        <List>
          {documents.map((doc, index) => (
            <React.Fragment key={doc.id}>
              <ListItem
                sx={{ px: 0, py: 2, cursor: 'pointer' }}
                onClick={() => handleDocumentClick(doc)}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Description sx={{ color: '#3275FC' }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        {doc.title}
                      </Typography>
                      <Chip
                        label={doc.status}
                        size="small"
                        sx={{
                          bgcolor: getStatusColor(doc.status),
                          color: 'white',
                          fontSize: '0.75rem',
                        }}
                      />
                    </Box>
                  }
                  secondaryTypographyProps={{ component: 'div' }}
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Typography
                        variant="body2"
                        sx={{ color: '#666', mb: 0.5 }}
                      >
                        {doc.form} • {doc.type} • {doc.drafter}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#999' }}>
                        {doc.date}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
              {index < documents.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default ApprovalDocumentList;
