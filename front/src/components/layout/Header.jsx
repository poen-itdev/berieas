import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Link,
  Select,
  MenuItem,
  FormControl,
  IconButton,
} from '@mui/material';
import { Logout as LogoutIcon, Menu as MenuIcon } from '@mui/icons-material';
import { useUserInfo } from '../../hooks/useUserInfo';
import { useLanguage } from '../../contexts/LanguageContext';

const Header = ({ onLogout, onMenuClick, isMobile = false }) => {
  const { language, changeLanguage } = useLanguage();
  const { userInfo: headerUserInfo, loading } = useUserInfo();

  const handleLanguageChange = (event) => {
    changeLanguage(event.target.value);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <AppBar
      position="static"
      sx={{
        bgcolor: '#333333',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        color: '#fff',
      }}
    >
      <Toolbar
        sx={{
          minHeight: isMobile ? '56px' : '64px',
          px: isMobile ? 1 : 2,
          position: 'relative',
        }}
      >
        {/* 왼쪽: 햄버거 메뉴 (모바일에서만) */}
        {isMobile && (
          <IconButton
            onClick={() => onMenuClick && onMenuClick('toggle-menu')}
            sx={{
              color: '#fff',
              '&:hover': {
                bgcolor: 'transparent',
              },
            }}
          >
            <MenuIcon sx={{ fontSize: 28 }} />
          </IconButton>
        )}

        {/* 가운데: 로고 */}
        <Typography
          variant="h6"
          sx={{
            color: '#fff',
            fontWeight: 700,
            cursor: 'pointer',
            fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' },
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: { xs: '120px', sm: '150px', md: '200px' },
          }}
          onClick={() => window.location.reload()}
        >
          BERI-EAS
        </Typography>

        {/* 오른쪽: 사용자정보, 언어, 로그아웃 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 'auto' }}>
          {!isMobile && !loading && headerUserInfo && (
            <Typography sx={{ color: '#fff', fontSize: '0.9rem' }}>
              {headerUserInfo.memberName} | {headerUserInfo.memberDepartment}
            </Typography>
          )}

          {/* 언어 설정 */}
          <FormControl size="small">
            <Select
              value={language}
              onChange={handleLanguageChange}
              sx={{
                color: '#fff',
                '.MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#fff',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                },
                '.MuiSvgIcon-root': {
                  color: '#fff',
                },
                minWidth: isMobile ? 60 : 80,
                height: 32,
              }}
            >
              <MenuItem value="ko">한국어</MenuItem>
              <MenuItem value="en">English</MenuItem>
            </Select>
          </FormControl>

          {/* 로그아웃 */}
          {isMobile ? (
            <IconButton
              onClick={handleLogout}
              sx={{
                color: '#fff',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              <LogoutIcon />
            </IconButton>
          ) : (
            <Link
              component="button"
              onClick={handleLogout}
              sx={{
                color: '#fff',
                textDecoration: 'none',
                fontSize: '14px',
                cursor: 'pointer',
                border: 'none',
                background: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              {language === 'ko' ? '로그아웃' : 'Logout'}
            </Link>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
