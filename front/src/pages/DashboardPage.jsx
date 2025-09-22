import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Container } from '@mui/material';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import DashboardContent from '../components/dashboard/DashboardContent';
import MemberManagementContent from '../components/dashboard/MemberManagementContent';
import OrganizationManagementContent from '../components/dashboard/OrganizationManagementContent';
import '../styles/custom.css';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard'); // 현재 보고 있는 뷰

  useEffect(() => {
    // 로그인 상태 확인
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      navigate('/login');
      return;
    }

    fetchUserInfo();
  }, [navigate]);

  const fetchUserInfo = async () => {
    // DashboardContent에서 처리하므로 여기서는 간단하게
    setUserInfo({ memberName: '사용자' });
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  const handleMenuClick = (path) => {
    console.log('메뉴 클릭:', path);
    switch (path) {
      case '/dashboard':
        setCurrentView('dashboard');
        break;
      case '/member-management':
        setCurrentView('member-management');
        break;
      case '/organization-management':
        setCurrentView('organization-management');
        break;
      default:
        setCurrentView('dashboard');
    }
  };

  // 현재 뷰에 따라 컨텐츠 렌더링
  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardContent />;
      case 'member-management':
        return <MemberManagementContent />;
      case 'organization-management':
        return <OrganizationManagementContent />;
      default:
        return <DashboardContent />;
    }
  };

  if (!userInfo) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <Typography>로딩 중...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* 상단 헤더 - 전체 너비 100% */}
      <Header onLogout={handleLogout} />

      {/* 하단 영역 - 사이드바 + 메인 콘텐츠 */}
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        <Sidebar onMenuClick={handleMenuClick} />
        <Box
          sx={{
            flexGrow: 1,
            bgcolor: '#fff',
            overflow: 'auto',
          }}
        >
          {renderContent()}
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardPage;
