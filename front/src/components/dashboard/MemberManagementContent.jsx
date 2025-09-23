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
} from '@mui/material';
import { Add, Search } from '@mui/icons-material';
import { API_URLS } from '../../config/api';

const MemberManagementContent = () => {
  const [selectedTab, setSelectedTab] = useState(0); // 0: 전체, 1: 활성, 2: 비활성
  const [searchTerm, setSearchTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState(''); // 실제 검색에 사용할 쿼리
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
      const response = await fetch(API_URLS.MEMBER_INFO, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (response.ok) {
        const userInfo = await response.json();
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

      const response = await fetch(apiUrl, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMemberList(data);
        // 부서 목록은 fetchDepartments에서 별도로 관리
      }
    } catch (error) {
      console.error('회원 목록 조회 실패:', error);
    }
  };

  // 부서 목록 가져오기
  const fetchDepartments = async () => {
    try {
      const response = await fetch(API_URLS.DEPARTMENTS, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
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
      const response = await fetch(API_URLS.POSITIONS, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
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
          sx={{ color: 'green', borderColor: 'green' }}
        />
      );
    } else {
      return (
        <Chip
          label="비활성"
          size="small"
          variant="outlined"
          sx={{ color: 'red', borderColor: 'red' }}
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

    console.log('토글 요청:', {
      memberId: memberId,
      currentStatus: currentStatus,
      newStatus: newStatus,
      accessToken: localStorage.getItem('accessToken')
        ? '토큰 존재'
        : '토큰 없음',
    });

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
        // 수정 모드 - PUT 요청
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
        // 성공 시 모달 닫고 목록 새로고침
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
    <Box
      sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      {/* 제목 그룹 */}
      <Box sx={{ mb: 5 }}>
        <Typography
          variant="h4"
          fontSize="24px"
          sx={{ mb: 1, fontWeight: 700, textAlign: 'left' }}
        >
          회원관리
        </Typography>
        <Typography
          variant="body1"
          fontSize="16px"
          sx={{ color: 'text.secondary', textAlign: 'left' }}
        >
          조직현황 확인 및 직원 검색/등록 가능
        </Typography>
      </Box>

      {/* 콘텐츠 영역 - flex로 같은 높이 */}
      <Box sx={{ display: 'flex', flexGrow: 1, gap: 2, overflow: 'hidden' }}>
        {/* 좌측 부서 목록 */}
        <Paper
          sx={{ width: 200, p: 2, display: 'flex', flexDirection: 'column' }}
        >
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            부서
          </Typography>
          <List dense sx={{ flexGrow: 1 }}>
            {departments.map((department) => (
              <ListItem key={department} disablePadding>
                <ListItemButton
                  selected={selectedDepartment === department}
                  onClick={() => handleDepartmentSelect(department)}
                  sx={{
                    borderRadius: 1,
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
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ mb: 3 }}>
            <Tabs value={selectedTab} onChange={handleTabChange}>
              <Tab label="전체" />
              <Tab label="활성" />
              <Tab label="비활성" />
            </Tabs>
          </Box>

          {/* 검색 및 직원 등록 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <TextField
              placeholder="이름, 아이디, 이메일로 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: '#666' }} />,
              }}
              sx={{ flexGrow: 1 }}
            />
            <Button
              variant="contained"
              onClick={handleSearch}
              sx={{
                bgcolor: '#3275FC',
                minWidth: 120,
                height: 56,
                fontSize: '16px',
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
                minWidth: 120,
                height: 56,
                fontSize: '16px',
              }}
            >
              직원 등록
            </Button>
          </Box>

          {/* 직원 리스트 테이블 */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell align="center">이름</TableCell>
                  <TableCell align="center">아이디</TableCell>
                  <TableCell align="center">이메일</TableCell>
                  <TableCell align="center">부서</TableCell>
                  <TableCell align="center">직급</TableCell>
                  <TableCell align="center">상태</TableCell>
                  <TableCell align="center">관리</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredMembers.map((member) => (
                  <TableRow key={member.memberId} hover>
                    <TableCell align="center">{member.memberName}</TableCell>
                    <TableCell align="center">{member.memberId}</TableCell>
                    <TableCell align="center">{member.memberEmail}</TableCell>
                    <TableCell align="center">
                      {member.memberDepartment}
                    </TableCell>
                    <TableCell align="center">
                      {member.memberPosition}
                    </TableCell>
                    <TableCell align="center">
                      {getStatusChip(member.useYn)}
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        variant="outlined"
                        sx={{
                          mr: 1,
                          borderRadius: '4px',
                          minWidth: '60px',
                          height: '32px',
                          fontSize: '12px',
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
                          minWidth: '70px',
                          height: '32px',
                          fontSize: '12px',
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
    </Box>
  );
};

export default MemberManagementContent;
