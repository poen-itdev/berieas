import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Link,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import { API_URLS } from '../../config/api';

const Header = ({ onLogout }) => {
  const [language, setLanguage] = useState('ko');
  const [headerUserInfo, setHeaderUserInfo] = useState(null);

  useEffect(() => {
    const fetchHeaderUserInfo = async () => {
      try {
        const response = await fetch(API_URLS.MEMBER_MEMBERS, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });

        const responseData = await response.json();
        const memberList = Array.isArray(responseData)
          ? responseData
          : responseData.data || [];
        const token = localStorage.getItem('accessToken');
        const payload = JSON.parse(atob(token.split('.')[1]));
        const currentMemberId = payload.sub;
        const currentUser = memberList.find(
          (member) => member.memberId === currentMemberId
        );

        if (currentUser) {
          setHeaderUserInfo(currentUser);
        }
      } catch (error) {
        console.error('Header 사용자 정보 조회 실패:', error);
      }
    };

    fetchHeaderUserInfo();
  }, []);

  const handleLanguageChange = (event) => {
    setLanguage(event.target.value);
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
      <Toolbar>
        <Typography
          variant="h6"
          sx={{
            color: '#fff',
            fontWeight: 600,
            cursor: 'pointer',
          }}
          onClick={() => window.location.reload()}
        >
          BERI-EAS
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, ml: 'auto' }}>
          {/* 사용자 정보 */}
          {headerUserInfo && (
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
                minWidth: 80,
                height: 32,
              }}
            >
              <MenuItem value="ko">한국어</MenuItem>
              <MenuItem value="en">English</MenuItem>
            </Select>
          </FormControl>

          {/* 로그아웃 링크 */}
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
            로그아웃
          </Link>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
