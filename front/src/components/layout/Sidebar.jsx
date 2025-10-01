import React, { useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  List,
  ListItemButton,
  ListItemText,
  Drawer,
  Collapse,
  ListItemIcon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from '@mui/material';
import {
  Add,
  ExpandLess,
  ExpandMore,
  People,
  Business,
} from '@mui/icons-material';

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

    switch (choice) {
      case 'save':
        if (onSaveBeforeNew) {
          const saveSuccess = await onSaveBeforeNew();
          if (saveSuccess) {
            handleMenuClick(targetPath, true);
          } else {
            alert('저장에 실패했습니다. 다시 시도해주세요.');
          }
        } else {
          handleMenuClick(targetPath, true);
        }
        break;
      case 'discard':
        handleMenuClick(targetPath, true);
        break;
      case 'cancel':
        break;
    }
    setShowSaveDialog(false);
    setPendingNavigation(null);
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
          zIndex: 1200,
          overflow: 'auto',
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

      {/* 임시저장된 기안서 확인 다이얼로그 */}
      <Dialog
        open={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            임시저장된 기안서가 있습니다
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          <Typography variant="body1" sx={{ mb: 2 }}>
            현재 임시저장된 기안서가 있습니다. 다른 페이지로 이동하기 전에
            어떻게 하시겠습니까?
          </Typography>
          <Typography variant="body2" sx={{ color: '#666' }}>
            • <strong>저장하고 이동:</strong> 현재 내용을 임시저장하고 선택한
            페이지로 이동합니다.
            <br />• <strong>내용 버리고 이동:</strong> 현재 내용을 삭제하고
            선택한 페이지로 이동합니다.
            <br />• <strong>취소:</strong> 이동을 취소합니다.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={() => handleSaveChoice('save')}
            variant="contained"
            color="primary"
            sx={{ minWidth: 120 }}
          >
            저장하고 이동
          </Button>
          <Button
            onClick={() => handleSaveChoice('discard')}
            variant="outlined"
            color="warning"
            sx={{ minWidth: 120 }}
          >
            내용 버리고 이동
          </Button>
          <Button
            onClick={() => handleSaveChoice('cancel')}
            variant="outlined"
            sx={{ minWidth: 80 }}
          >
            취소
          </Button>
        </DialogActions>
      </Dialog>
    </Drawer>
  );
};

export default Sidebar;
