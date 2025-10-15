import React, { useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  List,
  ListItemButton,
  ListItemText,
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
import SaveConfirmDialog from '../common/SaveConfirmDialog';

const Sidebar = ({ onMenuClick, onSaveBeforeNew }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [memberMenuOpen, setMemberMenuOpen] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState(null);

  const menuItems = [
    { text: '대시보드', path: '/dashboard' },
    { text: '진행목록', path: '/progress-list' },
    { text: '양식관리', path: '/form-management' },
  ];

  const memberSubMenuItems = [
    { text: '회원관리', path: '/member-management', icon: <People /> },
    { text: '조직관리', path: '/organization-management', icon: <Business /> },
  ];

  // 현재 활성화된 메뉴 확인
  const isActiveMenu = (path) => {
    const currentPath = location.pathname;
    return currentPath === path;
  };

  const handleMenuClick = (path, skipDialog = false) => {
    const currentApprovalNo = searchParams.get('approvalNo');
    const currentPath = location.pathname;

    // 기안중 상태의 기안서를 보고 있을 때 다른 메뉴 클릭 시 팝업 표시 (skipDialog가 false일 때만)
    if (
      !skipDialog &&
      currentApprovalNo &&
      currentPath === '/approvalwrite' &&
      path !== '/draft/create'
    ) {
      setShowSaveDialog(true);
      setPendingNavigation(path);
      return;
    }

    if (onMenuClick) {
      onMenuClick(path);
    }
  };

  // 기안작성 버튼 클릭 처리
  const handleCreateNewDraft = () => {
    const currentApprovalNo = searchParams.get('approvalNo');
    const currentPath = location.pathname;

    // /approvalwrite 경로에서만 임시저장된 기안서 확인
    if (currentApprovalNo && currentPath === '/approvalwrite') {
      setShowSaveDialog(true);
    } else {
      handleMenuClick('/draft/create');
    }
  };

  // 다이얼로그에서 선택 처리
  const handleSaveChoice = async (choice) => {
    const targetPath = pendingNavigation || '/draft/create';

    if (choice === 'save') {
      // 현재 수정된 내용을 DB에 저장 후 이동
      if (onSaveBeforeNew) {
        const saveSuccess = await onSaveBeforeNew();
        if (saveSuccess) {
          sessionStorage.removeItem('unsavedDraft');
          if (pendingNavigation === -1) {
            window.history.back();
          } else {
            handleMenuClick(targetPath, true);
          }
        }
        // 저장 실패 시 다이얼로그는 그대로 유지
        if (!saveSuccess) {
          return;
        }
      }
    } else if (choice === 'discard') {
      // 내용 버리고 이동
      sessionStorage.removeItem('unsavedDraft');
      if (pendingNavigation === -1) {
        window.history.back();
      } else {
        handleMenuClick(targetPath, true);
      }
    }

    setShowSaveDialog(false);
    setPendingNavigation(null);
  };

  return (
    <Box
      sx={{
        width: 280,
        height: '100%',
        overflow: 'auto',
        bgcolor: '#fff',
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
            py: 2,
            borderRadius: 0,
          }}
          onClick={handleCreateNewDraft}
        >
          기안작성
        </Button>
      </Box>

      {/* 메뉴 목록 */}
      <List sx={{ px: 0 }}>
        {menuItems.map((item, index) => (
          <ListItemButton
            key={index}
            sx={{
              borderRadius: 1,
              mx: 1,
              mb: 0.5,
              bgcolor: isActiveMenu(item.path) ? '#e3f2fd' : 'transparent',
              color: isActiveMenu(item.path) ? '#3275FC' : 'inherit',
              '&:hover': {
                bgcolor: '#e3f2fd',
                color: '#3275FC',
              },
              '&:focus': {
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
            '&:focus': {
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
                  bgcolor: isActiveMenu(item.path) ? '#e3f2fd' : 'transparent',
                  color: isActiveMenu(item.path) ? '#3275FC' : 'inherit',
                  '&:hover': {
                    bgcolor: '#e3f2fd',
                    color: '#3275FC',
                  },
                  '&:focus': {
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

      {/* 전역 임시저장 확인 다이얼로그 */}
      <SaveConfirmDialog
        open={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        onConfirm={handleSaveChoice}
      />
    </Box>
  );
};

export default Sidebar;
