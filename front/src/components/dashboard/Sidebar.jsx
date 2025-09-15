import React from 'react';
import {
  Box,
  Typography,
  Button,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Drawer,
} from '@mui/material';
import {
  Description,
  CheckCircle,
  Pending,
  Schedule,
  Assignment,
  Business,
  Book,
  Add,
  ArrowForward,
} from '@mui/icons-material';

const Sidebar = ({ onMenuClick }) => {
  const menuItems = [
    { text: '기안함', icon: <Description />, path: '/draft' },
    { text: '결재함', icon: <CheckCircle />, path: '/approval' },
    { text: '수신함', icon: <Pending />, path: '/received' },
    { text: '참조함', icon: <Assignment />, path: '/reference' },
    // { text: '문서대장', icon: <Book />, path: '/document-register' },
    // { text: '회원관리', icon: <Person />, path: '/member' },
  ];

  const handleMenuClick = (path) => {
    if (onMenuClick) {
      onMenuClick(path);
    }
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 280,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
          bgcolor: '#fff',
        },
      }}
    >
      <Box sx={{ p: 2, bgcolor: '#fff' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: '#3275FC' }}>
          BERIEAS
        </Typography>
      </Box>

      {/* 기안작성 버튼 */}
      <Box sx={{ p: 2 }}>
        <Button
          variant="contained"
          startIcon={<Add />}
          fullWidth
          sx={{
            bgcolor: '#3275FC',
            '&:hover': { bgcolor: '#2563eb' },
            borderRadius: 2,
            py: 1.5,
          }}
          onClick={() => handleMenuClick('/draft/create')}
        >
          기안작성
        </Button>
      </Box>

      {/* 메뉴 목록 */}
      <List sx={{ px: 1 }}>
        {menuItems.map((item, index) => (
          <ListItemButton
            key={index}
            sx={{
              borderRadius: 1,
              mx: 1,
              mb: 0.5,
              '&:hover': {
                bgcolor: '#e3f2fd',
              },
            }}
            onClick={() => handleMenuClick(item.path)}
          >
            <ListItemIcon sx={{ minWidth: 40, color: '#666' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{
                fontSize: '0.9rem',
                fontWeight: 500,
              }}
            />
            <ArrowForward sx={{ fontSize: 16, color: '#999' }} />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
