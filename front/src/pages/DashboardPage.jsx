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
import { useUserInfo } from '../hooks/useUserInfo';
import { useResponsive } from '../hooks/useResponsive';
import '../styles/custom.css';

const DashboardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userInfo } = useUserInfo();
  const { isMobile } = useResponsive();
  const [currentView, setCurrentView] = useState('dashboard'); // 현재 보고 있는 뷰
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [saveFunction, setSaveFunction] = useState(null);

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      navigate('/login');
      return;
    }
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

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('permissions');
    navigate('/login');
  };

  const handleMenuClick = (path) => {
    // 햄버거 메뉴 토글
    if (path === 'toggle-menu') {
      setMobileMenuOpen(!mobileMenuOpen);
      return;
    }

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
        return <MemberManagementContent userInfo={userInfo} />;
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
      <Header
        onLogout={handleLogout}
        onMenuClick={handleMenuClick}
        isMobile={isMobile}
      />
      <Box sx={{ display: 'flex', flexGrow: 1, overflow: 'hidden' }}>
        {!isMobile && (
          <Box
            sx={{
              width: 280,
              flexShrink: 0,
              height: '100%',
              overflow: 'auto',
              borderRight: '1px solid #e0e0e0',
              bgcolor: '#fff',
            }}
          >
            <Sidebar
              onMenuClick={handleMenuClick}
              onSaveBeforeNew={handleSaveBeforeNew}
            />
          </Box>
        )}

        {/* 모바일: Drawer로 사이드바 */}
        {isMobile && (
          <Drawer
            anchor="left"
            open={mobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              zIndex: 1100,
              '& .MuiDrawer-paper': {
                width: 280,
                bgcolor: '#fff',
                top: { xs: 56, sm: 64 },
                height: { xs: 'calc(100vh - 56px)', sm: 'calc(100vh - 64px)' },
              },
            }}
          >
            <Sidebar
              onMenuClick={handleMenuClick}
              onSaveBeforeNew={handleSaveBeforeNew}
            />
          </Drawer>
        )}

        {/* 메인 컨텐츠 */}
        <Box
          sx={{
            flexGrow: 1,
            bgcolor: '#fff',
            overflow: 'auto',
            height: '100%',
          }}
        >
          {renderContent()}
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardPage;
