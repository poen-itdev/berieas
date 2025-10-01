import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, Container, IconButton, Drawer } from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import DashboardContent from '../components/dashboard/DashboardContent';
import MemberManagementContent from '../components/dashboard/MemberManagementContent';
import OrganizationManagementContent from '../components/dashboard/OrganizationManagementContent';
import ProgressListContent from '../components/dashboard/ProgressListContent';
import ApprovalWriteContent from '../components/dashboard/ApprovalWriteContent';
import ApprovalDetailContent from '../components/dashboard/ApprovalDetailContent';
import FormManagementContent from '../components/dashboard/FormManagementContent';
import { apiRequest } from '../utils/apiHelper';
import { API_URLS } from '../config/api';
import '../styles/custom.css';

const DashboardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userInfo, setUserInfo] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard'); // 현재 보고 있는 뷰
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [saveFunction, setSaveFunction] = useState(null);

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      navigate('/login');
      return;
    }

    fetchUserInfo();
  }, [navigate]);

  // URL 경로에 따라 currentView 설정
  useEffect(() => {
    const path = location.pathname;
    switch (path) {
      case '/dashboard':
        setCurrentView('dashboard');
        break;
      case '/approvalwrite':
        setCurrentView('approval-write');
        break;
      case '/approval-detail':
        setCurrentView('approval-detail');
        break;
      case '/progress-list':
        setCurrentView('progress-list');
        break;
      case '/member-management':
        setCurrentView('member-management');
        break;
      case '/organization-management':
        setCurrentView('organization-management');
        break;
      case '/form-management':
        setCurrentView('form-management');
        break;
      case '/draft/create':
        setCurrentView('approval-write');
        break;
      default:
        setCurrentView('dashboard');
    }
  }, [location.pathname]);

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
    try {
      const accessToken = localStorage.getItem('accessToken');

      if (!accessToken) {
        setUserInfo({ memberName: '사용자' });
        return;
      }

      const response = await apiRequest(API_URLS.MEMBER_INFO, {
        method: 'GET',
      });

      if (response.ok) {
        const userData = response.data;
        setUserInfo(userData);
      } else {
        console.error(
          '사용자 정보 가져오기 실패:',
          response.status,
          response.data
        );
        setUserInfo({ memberName: '사용자' });
      }
    } catch (error) {
      console.error('사용자 정보 가져오기 실패:', error);
      setUserInfo({ memberName: '사용자' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  const handleMenuClick = (path) => {
    try {
      if (location.pathname === path) {
        navigate(path, { replace: true });
      } else {
        navigate(path);
      }
    } catch (error) {
      console.error('navigate 실행 중 에러:', error);
    }

    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  // ApprovalWriteContent에서 저장 함수 등록
  const handleSaveFunctionRegister = useCallback((saveFn) => {
    setSaveFunction(() => saveFn);
  }, []);

  // 외부에서 저장 함수 호출 (Sidebar에서 사용)
  const handleSaveBeforeNew = useCallback(async () => {
    if (saveFunction) {
      try {
        await saveFunction();
        return true;
      } catch (error) {
        console.error('저장 실패:', error);
        return false;
      }
    }
    return false;
  }, [saveFunction]);

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
      case 'form-management':
        return <FormManagementContent />;
      case 'approval-write':
        return (
          <ApprovalWriteContent
            userInfo={userInfo}
            onSaveBeforeNew={handleSaveFunctionRegister}
          />
        );
      case 'approval-detail':
        return <ApprovalDetailContent userInfo={userInfo} />;
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
      <Header onLogout={handleLogout} isMobile={isMobile} />
      <Box sx={{ display: 'flex', flexGrow: 1, position: 'relative' }}>
        {!isMobile && (
          <Sidebar
            onMenuClick={handleMenuClick}
            onSaveBeforeNew={handleSaveBeforeNew}
          />
        )}

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
            <Sidebar
              onMenuClick={handleMenuClick}
              onSaveBeforeNew={handleSaveBeforeNew}
            />
          </Drawer>
        )}
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
