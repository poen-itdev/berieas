import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  List,
  ListItemButton,
  ListItemText,
  Drawer,
  Collapse,
  ListItemIcon,
} from '@mui/material';
import {
  Add,
  ExpandLess,
  ExpandMore,
  People,
  Business,
} from '@mui/icons-material';

const Sidebar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const [memberMenuOpen, setMemberMenuOpen] = useState(false);

  const menuItems = [
    { text: '대시보드', path: '/dashboard' },
    // { text: '진행목록', icon: <CheckCircle />, path: '/approval' },
    // { text: '양식관리', icon: <Pending />, path: '/received' },
  ];

  const memberSubMenuItems = [
    { text: '회원관리', path: '/member-management', icon: <People /> },
    { text: '조직관리', path: '/organization-management', icon: <Business /> },
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
          top: 64,
          height: 'calc(100vh - 64px)',
          position: 'fixed',
        },
      }}
    >
      {/* 기안작성 버튼 */}
      <Box sx={{}}>
        <Button
          variant="contained"
          startIcon={<Add />}
          fullWidth
          sx={{
            width: '100%',
            bgcolor: '#3275FC',
            '&:hover': { bgcolor: '#2563eb' },
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

        {/* 회원관리 메인 메뉴 */}
        <ListItemButton
          sx={{
            borderRadius: 1,
            mx: 1,
            mb: 0.5,
            '&:hover': {
              bgcolor: '#e3f2fd',
              color: '#3275FC',
            },
          }}
          onClick={() => setMemberMenuOpen(!memberMenuOpen)}
        >
          <ListItemText
            primary="회원관리"
            primaryTypographyProps={{
              fontSize: '0.9rem',
              fontWeight: 500,
            }}
          />
          {memberMenuOpen ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>

        {/* 회원관리 서브 메뉴 */}
        <Collapse in={memberMenuOpen} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {memberSubMenuItems.map((item, index) => (
              <ListItemButton
                key={index}
                sx={{
                  borderRadius: 1,
                  mx: 1,
                  mb: 0.5,
                  pl: 4,
                  '&:hover': {
                    bgcolor: '#e3f2fd',
                    color: '#3275FC',
                  },
                }}
                onClick={() => handleMenuClick(item.path)}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '0.85rem',
                    fontWeight: 400,
                  }}
                />
              </ListItemButton>
            ))}
          </List>
        </Collapse>
      </List>
    </Drawer>
  );
};

export default Sidebar;
