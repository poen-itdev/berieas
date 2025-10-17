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

const MemberManagementContent = () => {
  const [selectedTab, setSelectedTab] = useState(0); // 0: 전체, 1: 활성, 2: 비활성
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('전체');
  const [memberList, setMemberList] = useState([]);
  const [departments, setDepartments] = useState(['전체']);
  const [positions, setPositions] = useState([]);

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
    useYn: 'Y', // 기본값: 활성
  });

  // 회원 목록 가져오기
  useEffect(() => {
    fetchMembers();
    fetchDepartments();
    fetchPositions();
    checkCurrentUserRole(); // 현재 사용자 권한 확인
  }, [selectedTab]);

  // 현재 사용자 권한 확인
  const checkCurrentUserRole = async () => {
    try {
      const response = await apiRequest(API_URLS.MEMBER_INFO, {
        method: 'GET',
      });

      if (response.ok) {
        const userInfo = response.data;
      }
    } catch (error) {
      console.error('사용자 정보 조회 실패:', error);
    }
  };

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
        const departmentNames = data.map((dept) => dept.name);
        setDepartments(['전체', ...departmentNames]);
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
        const positionNames = data.map((pos) => pos.name);
        setPositions(positionNames);
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
          label="활성"
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
          label="비활성"
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
      memberPassword: '', // 비밀번호는 빈 값으로
      memberDepartment: member.memberDepartment,
      memberPosition: member.memberPosition,
      useYn: member.useYn, // 현재 상태 유지
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
      useYn: 'Y', // 기본값: 활성
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
  const handleToggleMemberStatus = async (memberId, currentStatus) => {
    const newStatus = currentStatus === 'Y' ? '비활성화' : '활성화';

    if (!window.confirm(`정말 이 직원을 ${newStatus}하시겠습니까?`)) {
      return;
    }

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
        alert(`직원이 ${newStatus}되었습니다.`);
        fetchMembers(); // 목록 새로고침
      } else {
        let errorMessage = '오류가 발생했습니다.';

        // Response body 복제하여 중복 읽기 방지
        const responseClone = response.clone();

        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // JSON 파싱 실패 시 response text 사용
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

        alert(`${newStatus} 실패: ${errorMessage}`);
      }
    } catch (error) {
      console.error(`직원 ${newStatus} 실패:`, error);
      alert(`${newStatus} 중 오류가 발생했습니다.`);
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
          }),
        });
      }

      if (response.ok) {
        alert(
          isEditMode ? '직원 정보가 수정되었습니다.' : '직원이 등록되었습니다.'
        );
        handleCloseModal();
        fetchMembers();
      } else {
        const errorData = await response.json();
        alert(
          `${isEditMode ? '수정' : '등록'} 실패: ${
            errorData.message || '오류가 발생했습니다.'
          }`
        );
      }
    } catch (error) {
      console.error(isEditMode ? '직원 수정 실패:' : '직원 등록 실패:', error);
      alert(`${isEditMode ? '수정' : '등록'} 중 오류가 발생했습니다.`);
    }
  };

  return (
    <Box sx={{ p: 3, mt: 4 }}>
      <Container maxWidth="xl" sx={{ mx: 0, px: 0 }}>
        {/* 제목 그룹 */}
        <PageHeader
          title="회원관리"
          description="조직현황 확인 및 직원 검색/등록 가능"
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
              부서
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
              {departments.map((department) => (
                <ListItem
                  key={department}
                  disablePadding
                  sx={{
                    minHeight: '40px',
                  }}
                >
                  <ListItemButton
                    selected={selectedDepartment === department}
                    onClick={() => handleDepartmentSelect(department)}
                    sx={{
                      borderRadius: 1,
                      minHeight: '40px',
                      '&.Mui-selected': {
                        bgcolor: '#e3f2fd',
                        color: '#3275FC',
                      },
                    }}
                  >
                    <ListItemText primary={department} />
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
                <Tab label="전체" />
                <Tab label="활성" />
                <Tab label="비활성" />
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
                placeholder="이름, 아이디, 이메일로 검색"
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
                  검색
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
                  직원 등록
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
                      이름
                    </TableCell>
                    <TableCell
                      sx={{
                        display: { xs: 'none', sm: 'table-cell' },
                        minWidth: '80px',
                      }}
                    >
                      아이디
                    </TableCell>
                    <TableCell
                      sx={{
                        display: { xs: 'none', md: 'table-cell' },
                        minWidth: '120px',
                      }}
                    >
                      이메일
                    </TableCell>
                    <TableCell sx={{ minWidth: { xs: '60px', sm: '80px' } }}>
                      부서
                    </TableCell>
                    <TableCell sx={{ minWidth: { xs: '60px', sm: '80px' } }}>
                      직급
                    </TableCell>
                    <TableCell sx={{ minWidth: { xs: '50px', sm: '70px' } }}>
                      상태
                    </TableCell>
                    <TableCell sx={{ minWidth: { xs: '60px', sm: '80px' } }}>
                      관리
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
                            수정
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
                            {member.useYn === 'Y' ? '비활성화' : '활성화'}
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
                  검색 결과가 없습니다.
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
              {isEditMode ? '직원 정보 편집' : '직원 정보 등록'}
            </Box>
          </DialogTitle>

          <DialogContent sx={{ pt: 1, pb: 1 }}>
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                {/* 첫 번째 행 */}
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="이름"
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
                    label="이메일"
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
                    label="아이디"
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
                    label="비밀번호"
                    type="password"
                    value={isEditMode ? '*****' : newMember.memberPassword}
                    onChange={(e) =>
                      handleInputChange('memberPassword', e.target.value)
                    }
                    variant="outlined"
                    sx={{ mb: 1.5 }}
                    disabled={isEditMode}
                    placeholder={
                      isEditMode ? '기존 비밀번호 유지' : '비밀번호 입력'
                    }
                  />
                </Grid>

                {/* 세 번째 행 */}
                <Grid item xs={6}>
                  <FormControl fullWidth sx={{ mb: 1.5, minWidth: '205px' }}>
                    <InputLabel>부서</InputLabel>
                    <Select
                      fullWidth
                      value={newMember.memberDepartment}
                      onChange={(e) =>
                        handleInputChange('memberDepartment', e.target.value)
                      }
                      label="부서"
                      variant="outlined"
                      sx={{ height: '56px' }}
                    >
                      {departments
                        .filter((dept) => dept !== '전체')
                        .map((dept) => (
                          <MenuItem key={dept} value={dept}>
                            {dept}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth sx={{ mb: 1.5, minWidth: '205px' }}>
                    <InputLabel>직급</InputLabel>
                    <Select
                      fullWidth
                      value={newMember.memberPosition}
                      onChange={(e) =>
                        handleInputChange('memberPosition', e.target.value)
                      }
                      label="직급"
                      variant="outlined"
                      sx={{ height: '56px' }}
                    >
                      {positions.map((pos) => (
                        <MenuItem key={pos} value={pos}>
                          {pos}
                        </MenuItem>
                      ))}
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
              저장
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
              닫기
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default MemberManagementContent;
