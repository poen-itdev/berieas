import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Container, IconButton, Drawer } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import DashboardContent from '../components/dashboard/DashboardContent';
import MemberManagementContent from '../components/dashboard/MemberManagementContent';
import OrganizationManagementContent from '../components/dashboard/OrganizationManagementContent';
import ProgressListContent from '../components/dashboard/ProgressListContent';
import '../styles/custom.css';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard'); // 현재 보고 있는 뷰
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      navigate('/login');
      return;
    }

    fetchUserInfo();
  }, [navigate]);

  // 반응형 감지
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 900);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const fetchUserInfo = async () => {
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
      case '/progress-list':
        setCurrentView('progress-list');
        break;
      case '/organization-management':
        setCurrentView('organization-management');
        break;
      default:
        setCurrentView('dashboard');
    }
    // 모바일에서 메뉴 클릭 시 햄버거 메뉴 닫기
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // 현재 뷰에 따라 컨텐츠 렌더링
  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardContent userInfo={userInfo} isMobile={isMobile} />;
      case 'progress-list':
        return <ProgressListContent isMobile={isMobile} />;
      case 'member-management':
        return <MemberManagementContent />;
      case 'organization-management':
        return <OrganizationManagementContent />;
      default:
        return <DashboardContent userInfo={userInfo} isMobile={isMobile} />;
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
      <Header onLogout={handleLogout} isMobile={isMobile} />

      {/* 하단 영역 - 사이드바 + 메인 콘텐츠 */}
      <Box sx={{ display: 'flex', flexGrow: 1, position: 'relative' }}>
        {/* 데스크톱 사이드바 */}
        {!isMobile && <Sidebar onMenuClick={handleMenuClick} />}

        {/* 모바일 햄버거 메뉴 */}
        {isMobile && (
          <IconButton
            onClick={toggleMobileMenu}
            sx={{
              position: 'fixed',
              top: 16,
              left: 16,
              zIndex: 1300,
              bgcolor: 'white',
              boxShadow: 2,
            }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* 모바일 사이드바 Drawer */}
        {isMobile && (
          <Drawer
            anchor="left"
            open={mobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
            sx={{
              '& .MuiDrawer-paper': {
                width: 280,
                bgcolor: '#fff',
              },
            }}
          >
            <Sidebar onMenuClick={handleMenuClick} />
          </Drawer>
        )}

        {/* 메인 콘텐츠 */}
        <Box
          sx={{
            bgcolor: '#fff',
            overflow: 'auto',
            height: isMobile ? 'calc(100vh - 56px)' : 'calc(100vh - 64px)',
            width: isMobile ? '100%' : 'calc(100% - 280px)',
          }}
        >
          {renderContent()}
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardPage;
