import React from 'react';
import {
  Box,
  Typography,
  Button,
  List,
  ListItemButton,
  ListItemText,
  Drawer,
} from '@mui/material';
import { Add } from '@mui/icons-material';

const Sidebar = ({ onMenuClick }) => {
  const menuItems = [
    { text: '대시보드', path: '/dashboard' },
    // { text: '진행목록', icon: <CheckCircle />, path: '/approval' },
    // { text: '양식관리', icon: <Pending />, path: '/received' },
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
                color: '#3275FC',
              },
            }}
            onClick={() => handleMenuClick(item.path)}
          >
            <ListItemText
              primary={item.text}
              primaryTypographyProps={{
                fontSize: '0.9rem',
                fontWeight: 500,
              }}
            />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
