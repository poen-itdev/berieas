import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Container,
} from '@mui/material';
import PageHeader from '../common/PageHeader';
import { Add, Search } from '@mui/icons-material';
import { API_URLS } from '../../config/api';
import { apiRequest } from '../../utils/apiHelper';
import PermissionGuard from '../common/PermissionGuard';
import { useLanguage, getLocalizedName } from '../../contexts/LanguageContext';
import SuccessDialog from '../common/SuccessDialog';
import DeleteConfirmDialog from '../common/DeleteConfirmDialog';

const MemberManagementContent = () => {
  const { t, language } = useLanguage(); // 다국어 지원
  const [selectedTab, setSelectedTab] = useState(0); // 0: 전체, 1: 활성, 2: 비활성
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('전체');
  const [memberList, setMemberList] = useState([]);
  const [departmentsData, setDepartmentsData] = useState([]); // 전체 부서 객체 저장
  const [positionsData, setPositionsData] = useState([]); // 전체 직급 객체 저장

  // 직원 등록/수정 모달 상태
  const [openModal, setOpenModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [newMember, setNewMember] = useState({
    memberId: '',
    memberName: '',
    memberEmail: '',
    memberPassword: '',
    memberDepartment: '',
    memberPosition: '',
    role: 'USER', // 기본값: 일반 사용자
    useYn: 'Y', // 기본값: 활성
  });

  // 다이얼로그 상태 관리
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showStatusConfirmDialog, setShowStatusConfirmDialog] = useState(false);
  const [statusToggleTarget, setStatusToggleTarget] = useState(null);

  // 회원 목록 가져오기
  useEffect(() => {
    fetchMembers();
    fetchDepartments();
    fetchPositions();
  }, [selectedTab]);

  const fetchMembers = async () => {
    try {
      let apiUrl;

      switch (selectedTab) {
        case 0: // 전체
          apiUrl = API_URLS.MEMBER_MEMBERS;
          break;
        case 1: // 활성
          apiUrl = API_URLS.MEMBER_ACTIVE_MEMBERS;
          break;
        case 2: // 비활성
          apiUrl = API_URLS.MEMBER_RETIRED_MEMBERS;
          break;
        default:
          apiUrl = API_URLS.MEMBER_MEMBERS;
      }

      const response = await apiRequest(apiUrl, { method: 'GET' });

      if (response.ok) {
        const data = Array.isArray(response.data) ? response.data : [];
        setMemberList(data);
      }
    } catch (error) {
      console.error('회원 목록 조회 실패:', error);
    }
  };

  // 부서 목록 가져오기
  const fetchDepartments = async () => {
    try {
      const response = await apiRequest(API_URLS.DEPARTMENTS, {
        method: 'GET',
      });

      if (response.ok) {
        const data = Array.isArray(response.data) ? response.data : [];
        setDepartmentsData(data); // 전체 객체 저장
      }
    } catch (error) {
      console.error('부서 목록 조회 실패:', error);
    }
  };

  // 직급 목록 가져오기
  const fetchPositions = async () => {
    try {
      const response = await apiRequest(API_URLS.POSITIONS, { method: 'GET' });

      if (response.ok) {
        const data = Array.isArray(response.data) ? response.data : [];
        setPositionsData(data); // 전체 객체 저장
      }
    } catch (error) {
      console.error('직급 목록 조회 실패:', error);
    }
  };

  // 탭 변경
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  // 부서 선택
  const handleDepartmentSelect = (department) => {
    setSelectedDepartment(department);
  };

  // 검색 버튼 클릭 핸들러
  const handleSearch = () => {
    setSearchQuery(searchTerm);
  };

  // 엔터키로 검색
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  // 검색 및 필터링
  const filteredMembers = memberList.filter((member) => {
    const matchesSearch =
      searchQuery === '' ||
      member.memberName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.memberId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.memberEmail.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDepartment =
      selectedDepartment === '전체' ||
      member.memberDepartment === selectedDepartment;

    return matchesSearch && matchesDepartment;
  });

  // 상태 표시
  const getStatusChip = (useYn) => {
    if (useYn === 'Y') {
      return (
        <Chip
          label={t('활성화')}
          size="small"
          variant="outlined"
          sx={{
            color: 'green',
            borderColor: 'green',
            fontSize: { xs: '10px', sm: '12px' },
            height: { xs: '20px', sm: '24px' },
            '& .MuiChip-label': {
              fontSize: { xs: '10px', sm: '12px' },
              padding: { xs: '0 6px', sm: '0 8px' },
            },
          }}
        />
      );
    } else {
      return (
        <Chip
          label={t('비활성화')}
          size="small"
          variant="outlined"
          sx={{
            color: 'red',
            borderColor: 'red',
            fontSize: { xs: '10px', sm: '12px' },
            height: { xs: '20px', sm: '24px' },
            '& .MuiChip-label': {
              fontSize: { xs: '10px', sm: '12px' },
              padding: { xs: '0 6px', sm: '0 8px' },
            },
          }}
        />
      );
    }
  };

  // 모달 열기/닫기 (등록용)
  const handleOpenModal = () => {
    setIsEditMode(false);
    setOpenModal(true);
  };

  // 수정 모달 열기
  const handleEditMember = (member) => {
    setIsEditMode(true);
    setNewMember({
      memberId: member.memberId,
      memberName: member.memberName,
      memberEmail: member.memberEmail,
      memberPassword: '',
      memberDepartment: member.memberDepartment,
      memberPosition: member.memberPosition,
      role: member.role || 'USER',
      useYn: member.useYn,
    });
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setIsEditMode(false);
    setNewMember({
      memberId: '',
      memberName: '',
      memberEmail: '',
      memberPassword: '',
      memberDepartment: '',
      memberPosition: '',
      role: 'USER',
      useYn: 'Y',
    });
  };

  // 입력 필드 변경 핸들러
  const handleInputChange = (field, value) => {
    setNewMember((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // 직원 상태 토글 (활성/비활성)
  const handleToggleMemberStatus = (memberId, currentStatus) => {
    setStatusToggleTarget({ memberId, currentStatus });
    setShowStatusConfirmDialog(true);
  };

  const confirmToggleMemberStatus = async () => {
    const { memberId, currentStatus } = statusToggleTarget;
    const newStatus = currentStatus === 'Y' ? t('비활성화') : t('활성화');
    setShowStatusConfirmDialog(false);

    try {
      const response = await fetch(
        `${API_URLS.MEMBER_DEACTIVATE}/${memberId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      if (response.ok) {
        setSuccessMessage(
          t('memberStatusChanged').replace('{status}', newStatus)
        );
        setShowSuccessDialog(true);
        fetchMembers();
      } else {
        let errorMessage = t('errorOccurred');

        const responseClone = response.clone();

        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.error(e);
          try {
            errorMessage = await responseClone.text();
          } catch (textError) {
            console.error('응답 파싱 실패:', textError);
            errorMessage = `HTTP ${response.status} ${response.statusText}`;
          }
        }

        console.error('API 호출 실패:', {
          url: `${API_URLS.MEMBER_DEACTIVATE}/${memberId}`,
          status: response.status,
          statusText: response.statusText,
          errorMessage: errorMessage,
          headers: Object.fromEntries(response.headers.entries()),
        });

        setSuccessMessage(`${newStatus} ${t('failed')}: ${errorMessage}`);
        setShowSuccessDialog(true);
      }
    } catch (error) {
      console.error(`직원 ${newStatus} 실패:`, error);
      setSuccessMessage(`${newStatus} ${t('errorOccurredDuring')}`);
      setShowSuccessDialog(true);
    }
  };

  // 직원 등록/수정 제출
  const handleSubmitMember = async () => {
    try {
      let response;

      if (isEditMode) {
        response = await fetch(
          `${API_URLS.MEMBER_UPDATE}/${newMember.memberId}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
            body: JSON.stringify({
              memberName: newMember.memberName,
              memberEmail: newMember.memberEmail,
              memberPw: newMember.memberPassword || undefined, // 백엔드 필드명에 맞게 변경
              memberDepartment: newMember.memberDepartment,
              memberPosition: newMember.memberPosition,
              role: newMember.role,
              useYn: newMember.useYn,
            }),
          }
        );
      } else {
        // 등록 모드 - POST 요청
        response = await fetch(API_URLS.MEMBER_JOIN, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
          credentials: 'include',
          body: JSON.stringify({
            memberId: newMember.memberId,
            memberPw: newMember.memberPassword, // 백엔드 필드명에 맞게 변경
            memberName: newMember.memberName,
            memberEmail: newMember.memberEmail,
            memberDepartment: newMember.memberDepartment,
            memberPosition: newMember.memberPosition,
            role: newMember.role,
          }),
        });
      }

      if (response.ok) {
        setSuccessMessage(
          isEditMode ? t('memberUpdated') : t('memberRegistered')
        );
        setShowSuccessDialog(true);
        handleCloseModal();
        fetchMembers();
      } else {
        const errorData = await response.json();
        setSuccessMessage(
          `${isEditMode ? t('update') : t('register')} ${t('failed')}: ${
            errorData.message || t('errorOccurred')
          }`
        );
        setShowSuccessDialog(true);
      }
    } catch (error) {
      console.error(isEditMode ? '직원 수정 실패:' : '직원 등록 실패:', error);
      setSuccessMessage(
        `${isEditMode ? t('update') : t('register')} ${t(
          'errorOccurredDuring'
        )}`
      );
      setShowSuccessDialog(true);
    }
  };

  return (
    <Box sx={{ p: 3, mt: 4 }}>
      <Container maxWidth="xl" sx={{ mx: 0, px: 0 }}>
        {/* 제목 */}
        <PageHeader
          title={t('memberManagement')}
          description={t('memberManagementSubtitle')}
        />

        {/* 콘텐츠 영역 - 반응형 레이아웃 */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', lg: 'row' },
            flexGrow: 1,
            gap: 2,
            overflow: 'hidden',
          }}
        >
          {/* 좌측 부서 목록 */}
          <Paper
            sx={{
              width: { xs: '100%', lg: 200 },
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              order: { xs: 1, lg: 1 },
            }}
          >
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              {t('department')}
            </Typography>
            <List
              dense
              sx={{
                flexGrow: 1,
                maxHeight: { xs: '200px', lg: 'none' },
                overflowY: { xs: 'auto', lg: 'visible' },
                overflowX: 'hidden',
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-track': {
                  background: '#f1f1f1',
                  borderRadius: '3px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#c1c1c1',
                  borderRadius: '3px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: '#a8a8a8',
                },
              }}
            >
              {/* 전체 항목 */}
              <ListItem disablePadding sx={{ minHeight: '40px' }}>
                <ListItemButton
                  selected={selectedDepartment === '전체'}
                  onClick={() => handleDepartmentSelect('전체')}
                  sx={{
                    borderRadius: 1,
                    minHeight: '40px',
                    '&.Mui-selected': {
                      bgcolor: '#e3f2fd',
                      color: '#3275FC',
                    },
                  }}
                >
                  <ListItemText primary={t('all')} />
                </ListItemButton>
              </ListItem>

              {/* 부서 목록 */}
              {departmentsData.map((dept) => (
                <ListItem
                  key={dept.idx}
                  disablePadding
                  sx={{
                    minHeight: '40px',
                  }}
                >
                  <ListItemButton
                    selected={selectedDepartment === dept.name}
                    onClick={() => handleDepartmentSelect(dept.name)}
                    sx={{
                      borderRadius: 1,
                      minHeight: '40px',
                      '&.Mui-selected': {
                        bgcolor: '#e3f2fd',
                        color: '#3275FC',
                      },
                    }}
                  >
                    <ListItemText primary={getLocalizedName(dept, language)} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Paper>

          {/* 우측 메인 영역 */}
          <Box
            sx={{
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              order: { xs: 2, lg: 2 },
            }}
          >
            <Box sx={{ mb: 3 }}>
              <Tabs value={selectedTab} onChange={handleTabChange}>
                <Tab label={t('all')} />
                <Tab label={t('activate')} />
                <Tab label={t('deactivate')} />
              </Tabs>
            </Box>

            {/* 검색 및 직원 등록 */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'stretch', sm: 'center' },
                gap: { xs: 1, sm: 2 },
                mb: 3,
              }}
            >
              <TextField
                placeholder={t('searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: '#666' }} />,
                }}
                sx={{
                  flexGrow: 1,
                  '& .MuiInputBase-root': {
                    height: { xs: '40px', sm: '56px' },
                    fontSize: { xs: '14px', sm: '16px' },
                  },
                }}
              />
              <Box
                sx={{
                  display: 'flex',
                  gap: { xs: 1, sm: 2 },
                  width: { xs: '100%', sm: 'auto' },
                }}
              >
                <Button
                  variant="contained"
                  onClick={handleSearch}
                  sx={{
                    bgcolor: '#3275FC',
                    minWidth: { xs: '80px', sm: 120 },
                    height: { xs: '40px', sm: 56 },
                    fontSize: { xs: '14px', sm: '16px' },
                    flex: { xs: 1, sm: 'none' },
                  }}
                >
                  {t('search')}
                </Button>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleOpenModal}
                  sx={{
                    bgcolor: '#FBE77B',
                    color: '#333',
                    minWidth: { xs: '80px', sm: 120 },
                    height: { xs: '40px', sm: 56 },
                    fontSize: { xs: '14px', sm: '16px' },
                    flex: { xs: 1, sm: 'none' },
                  }}
                >
                  {t('addMember')}
                </Button>
              </Box>
            </Box>

            {/* 직원 리스트 테이블 */}
            <TableContainer
              component={Paper}
              sx={{
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                overflow: 'auto',
                width: '100%',
                maxWidth: '100%',
                '& .MuiTableCell-root': {
                  fontSize: { xs: '12px', sm: '14px' },
                  textAlign: 'center',
                  padding: { xs: '8px 4px', sm: '12px 8px' },
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                },
                '& .MuiTableCell-head': {
                  fontWeight: 600,
                  fontSize: { xs: '12px', sm: '14px' },
                  padding: { xs: '8px 4px', sm: '12px 8px' },
                },
                '&::-webkit-scrollbar': {
                  height: '8px',
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: '#f1f1f1',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb': {
                  background: '#c1c1c1',
                  borderRadius: '4px',
                },
                '&::-webkit-scrollbar-thumb:hover': {
                  background: '#a8a8a8',
                },
              }}
            >
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell sx={{ minWidth: { xs: '60px', sm: '80px' } }}>
                      {t('memberName')}
                    </TableCell>
                    <TableCell
                      sx={{
                        display: { xs: 'none', sm: 'table-cell' },
                        minWidth: '80px',
                      }}
                    >
                      {t('memberId')}
                    </TableCell>
                    <TableCell
                      sx={{
                        display: { xs: 'none', md: 'table-cell' },
                        minWidth: '120px',
                      }}
                    >
                      {t('memberEmail')}
                    </TableCell>
                    <TableCell sx={{ minWidth: { xs: '60px', sm: '80px' } }}>
                      {t('memberDepartment')}
                    </TableCell>
                    <TableCell sx={{ minWidth: { xs: '60px', sm: '80px' } }}>
                      {t('memberPosition')}
                    </TableCell>
                    <TableCell sx={{ minWidth: { xs: '50px', sm: '70px' } }}>
                      {t('memberStatus')}
                    </TableCell>
                    <TableCell sx={{ minWidth: { xs: '60px', sm: '80px' } }}>
                      {t('edit')}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredMembers.map((member) => (
                    <TableRow key={member.memberId} hover>
                      <TableCell sx={{ minWidth: { xs: '60px', sm: '80px' } }}>
                        <Typography
                          sx={{ fontSize: { xs: '12px', sm: '14px' } }}
                        >
                          {member.memberName}
                        </Typography>
                      </TableCell>
                      <TableCell
                        sx={{
                          display: { xs: 'none', sm: 'table-cell' },
                          minWidth: '80px',
                        }}
                      >
                        <Typography
                          sx={{ fontSize: { xs: '11px', sm: '12px' } }}
                        >
                          {member.memberId}
                        </Typography>
                      </TableCell>
                      <TableCell
                        sx={{
                          display: { xs: 'none', md: 'table-cell' },
                          minWidth: '120px',
                        }}
                      >
                        <Typography
                          sx={{ fontSize: { xs: '11px', sm: '12px' } }}
                        >
                          {member.memberEmail}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ minWidth: { xs: '60px', sm: '80px' } }}>
                        <Typography
                          sx={{ fontSize: { xs: '11px', sm: '12px' } }}
                        >
                          {member.memberDepartment}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ minWidth: { xs: '60px', sm: '80px' } }}>
                        <Typography
                          sx={{ fontSize: { xs: '11px', sm: '12px' } }}
                        >
                          {member.memberPosition}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ minWidth: { xs: '50px', sm: '70px' } }}>
                        {getStatusChip(member.useYn)}
                      </TableCell>
                      <TableCell sx={{ minWidth: { xs: '60px', sm: '80px' } }}>
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            gap: 0.5,
                            justifyContent: 'center',
                          }}
                        >
                          <Button
                            size="small"
                            variant="outlined"
                            sx={{
                              borderRadius: '4px',
                              minWidth: { xs: '50px', sm: '60px' },
                              height: { xs: '28px', sm: '32px' },
                              fontSize: { xs: '11px', sm: '12px' },
                              whiteSpace: 'nowrap',
                            }}
                            onClick={() => handleEditMember(member)}
                          >
                            {t('edit')}
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color={member.useYn === 'Y' ? 'warning' : 'success'}
                            sx={{
                              borderRadius: '4px',
                              minWidth: { xs: '60px', sm: '80px' },
                              height: { xs: '28px', sm: '32px' },
                              fontSize: { xs: '10px', sm: '12px' },
                              whiteSpace: 'nowrap',
                            }}
                            onClick={() =>
                              handleToggleMemberStatus(
                                member.memberId,
                                member.useYn
                              )
                            }
                          >
                            {member.useYn === 'Y'
                              ? t('deactivate')
                              : t('activate')}
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* 검색 결과 없음 */}
            {filteredMembers.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">
                  {t('noSearchResults')}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        {/* 직원 등록 모달 */}
        <Dialog
          open={openModal}
          onClose={handleCloseModal}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
              p: 1,
              width: '500px',
              maxWidth: '500px',
            },
          }}
        >
          <DialogTitle
            sx={{
              fontSize: '22px',
              fontWeight: 600,
              mb: 2,
              borderBottom: '1px solid #e0e0e0',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {isEditMode ? t('editForm') : t('registerForm')}
            </Box>
          </DialogTitle>

          <DialogContent sx={{ pt: 1, pb: 1 }}>
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                {/* 첫 번째 행 */}
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={t('memberName')}
                    value={newMember.memberName}
                    onChange={(e) =>
                      handleInputChange('memberName', e.target.value)
                    }
                    variant="outlined"
                    sx={{ mb: 1.5 }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={t('memberEmail')}
                    type="email"
                    value={newMember.memberEmail}
                    onChange={(e) =>
                      handleInputChange('memberEmail', e.target.value)
                    }
                    variant="outlined"
                    sx={{ mb: 1.5 }}
                  />
                </Grid>

                {/* 두 번째 행 */}
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={t('memberId')}
                    value={newMember.memberId}
                    onChange={(e) =>
                      handleInputChange('memberId', e.target.value)
                    }
                    variant="outlined"
                    sx={{ mb: 1.5 }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label={t('password')}
                    type="password"
                    value={isEditMode ? '*****' : newMember.memberPassword}
                    onChange={(e) =>
                      handleInputChange('memberPassword', e.target.value)
                    }
                    variant="outlined"
                    sx={{ mb: 1.5 }}
                    disabled={isEditMode}
                    placeholder={
                      isEditMode
                        ? t('keepExistingPassword')
                        : t('enterPassword')
                    }
                  />
                </Grid>

                {/* 세 번째 행 */}
                <Grid item xs={6}>
                  <FormControl fullWidth sx={{ mb: 1.5, minWidth: '205px' }}>
                    <InputLabel>{t('department')}</InputLabel>
                    <Select
                      fullWidth
                      value={newMember.memberDepartment}
                      onChange={(e) =>
                        handleInputChange('memberDepartment', e.target.value)
                      }
                      label={t('department')}
                      variant="outlined"
                      sx={{ height: '56px' }}
                    >
                      {departmentsData.map((dept) => (
                        <MenuItem key={dept.idx} value={dept.name}>
                          {getLocalizedName(dept, language)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth sx={{ mb: 1.5, minWidth: '205px' }}>
                    <InputLabel>{t('position')}</InputLabel>
                    <Select
                      fullWidth
                      value={newMember.memberPosition}
                      onChange={(e) =>
                        handleInputChange('memberPosition', e.target.value)
                      }
                      label={t('position')}
                      variant="outlined"
                      sx={{ height: '56px' }}
                    >
                      {positionsData.map((pos) => (
                        <MenuItem key={pos.idx} value={pos.name}>
                          {getLocalizedName(pos, language)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth sx={{ mb: 1.5, minWidth: '205px' }}>
                    <InputLabel>{t('memberRole')}</InputLabel>
                    <Select
                      fullWidth
                      value={newMember.role}
                      onChange={(e) =>
                        handleInputChange('role', e.target.value)
                      }
                      label={t('memberRole')}
                      variant="outlined"
                      sx={{ height: '56px' }}
                    >
                      <MenuItem value="USER">{t('user')}</MenuItem>
                      <MenuItem value="ADMIN">{t('admin')}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 2, justifyContent: 'center', gap: 1 }}>
            <Button
              onClick={handleSubmitMember}
              variant="contained"
              sx={{
                bgcolor: '#3275FC',
                minWidth: 100,
                height: 40,
                fontSize: '14px',
              }}
            >
              {t('save')}
            </Button>
            <Button
              onClick={handleCloseModal}
              variant="outlined"
              sx={{
                minWidth: 100,
                height: 40,
                fontSize: '14px',
              }}
            >
              {t('close')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Success Dialog */}
        <SuccessDialog
          open={showSuccessDialog}
          onClose={() => setShowSuccessDialog(false)}
          message={successMessage}
          title={t('confirm')}
          buttonText={t('confirm')}
        />

        {/* Status Toggle Confirmation Dialog */}
        <DeleteConfirmDialog
          open={showStatusConfirmDialog}
          onClose={() => setShowStatusConfirmDialog(false)}
          onConfirm={confirmToggleMemberStatus}
          isExistingDocument={true}
        />
      </Container>
    </Box>
  );
};

// 관리자 권한이 필요한 컴포넌트
const AdminOnlyContent = () => {
  const { t } = useLanguage();

  return (
    <Box sx={{ p: 3, mt: 3 }}>
      <Container maxWidth="xl" sx={{ mx: 0, px: 0 }}>
        <PageHeader title={t('memberManagement')} fontSize="30px" />
        <Paper sx={{ p: 4, textAlign: 'center', mt: 3 }}>
          <Typography variant="h5" sx={{ color: '#666', fontWeight: 500 }}>
            {t('adminPageOnly')}
          </Typography>
          <Typography variant="body1" sx={{ color: '#999', mt: 1 }}>
            {t('adminPermissionRequired')}
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

// props를 받을 수 있도록 명명된 컴포넌트로 export
const MemberManagementWithPermission = (props) => (
  <PermissionGuard requiredPermission="ADMIN" fallback={<AdminOnlyContent />}>
    <MemberManagementContent {...props} />
  </PermissionGuard>
);

export default MemberManagementWithPermission;
