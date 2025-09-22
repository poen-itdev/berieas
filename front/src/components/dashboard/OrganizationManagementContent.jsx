import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Grid,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { API_URLS } from '../../config/api';

const OrganizationManagementContent = () => {
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [newDepartment, setNewDepartment] = useState('');
  const [newPosition, setNewPosition] = useState('');

  // 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        const [departmentsRes, positionsRes] = await Promise.all([
          fetch(API_URLS.DEPARTMENTS, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
          }),
          fetch(API_URLS.POSITIONS, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
          }),
        ]);

        const departmentsData = await departmentsRes.json();
        const positionsData = await positionsRes.json();

        setDepartments(departmentsData);
        setPositions(positionsData);
      } catch (error) {
        console.error('데이터 로드 실패:', error);
        // 기본 데이터 사용
        setDepartments(['기획실', '운영본부', '재제조사업본부', '경영지원실']);
        setPositions([
          '매니저',
          '책임매니저',
          '수석매니저',
          '엔지니어',
          '주임엔지니어',
        ]);
      }
    };
    loadData();
  }, []);

  const handleAddDepartment = async () => {
    if (newDepartment.trim()) {
      try {
        const response = await fetch(API_URLS.ADD_DEPARTMENT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
          body: JSON.stringify({ name: newDepartment.trim() }),
        });

        if (response.ok) {
          // 성공하면 데이터 다시 로드
          const departmentsRes = await fetch(API_URLS.DEPARTMENTS, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
          });
          const departmentsData = await departmentsRes.json();
          setDepartments(departmentsData);
          setNewDepartment('');
          alert('부서가 추가되었습니다.');
        } else {
          throw new Error('부서 추가 실패');
        }
      } catch (error) {
        console.error('부서 추가 실패:', error);
        alert('부서 추가에 실패했습니다.');
      }
    }
  };

  const handleAddPosition = async () => {
    if (newPosition.trim()) {
      try {
        const response = await fetch(API_URLS.ADD_POSITION, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
          body: JSON.stringify({ name: newPosition.trim() }),
        });

        if (response.ok) {
          // 성공하면 데이터 다시 로드
          const positionsRes = await fetch(API_URLS.POSITIONS, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
          });
          const positionsData = await positionsRes.json();
          setPositions(positionsData);
          setNewPosition('');
          alert('직급이 추가되었습니다.');
        } else {
          throw new Error('직급 추가 실패');
        }
      } catch (error) {
        console.error('직급 추가 실패:', error);
        alert('직급 추가에 실패했습니다.');
      }
    }
  };

  const handleDeleteDepartment = async (index) => {
    const department = departments[index];
    if (
      window.confirm(
        `"${department.name || department}" 부서를 삭제하시겠습니까?`
      )
    ) {
      try {
        const response = await fetch(
          `${API_URLS.DELETE_DEPARTMENT}/${department.idx || index}`,
          {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
          }
        );

        if (response.ok) {
          // 성공하면 데이터 다시 로드
          const departmentsRes = await fetch(API_URLS.DEPARTMENTS, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
          });
          const departmentsData = await departmentsRes.json();
          setDepartments(departmentsData);
          alert('부서가 삭제되었습니다.');
        } else {
          throw new Error('부서 삭제 실패');
        }
      } catch (error) {
        console.error('부서 삭제 실패:', error);
        alert('부서 삭제에 실패했습니다.');
      }
    }
  };

  const handleDeletePosition = async (index) => {
    const position = positions[index];
    if (
      window.confirm(`"${position.name || position}" 직급을 삭제하시겠습니까?`)
    ) {
      try {
        const response = await fetch(
          `${API_URLS.DELETE_POSITION}/${position.idx || index}`,
          {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
          }
        );

        if (response.ok) {
          // 성공하면 데이터 다시 로드
          const positionsRes = await fetch(API_URLS.POSITIONS, {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
          });
          const positionsData = await positionsRes.json();
          setPositions(positionsData);
          alert('직급이 삭제되었습니다.');
        } else {
          throw new Error('직급 삭제 실패');
        }
      } catch (error) {
        console.error('직급 삭제 실패:', error);
        alert('직급 삭제에 실패했습니다.');
      }
    }
  };

  return (
    <Box
      sx={{
        p: 3,
        width: '100%',
        maxWidth: 'none',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 제목 그룹 */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          fontSize="28px"
          sx={{ mb: 1, fontWeight: 700, textAlign: 'left' }}
        >
          조직관리
        </Typography>
        <Typography
          variant="body1"
          fontSize="18px"
          sx={{ color: 'text.secondary', textAlign: 'left' }}
        >
          조직(부서)와 직급 정보를 등록/수정 가능
        </Typography>
      </Box>

      {/* 콘텐츠 영역 */}
      <Box sx={{ width: '100%' }}>
        <Grid container spacing={6} sx={{ width: '100%', maxWidth: 'none' }}>
          {/* 부서명 관리 */}
          <Grid item xs={12} md={6} lg={6}>
            <Paper
              sx={{
                p: 4,
                height: '600px',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography
                variant="h6"
                sx={{ mb: 2, fontWeight: 600, fontSize: '20px' }}
              >
                부서명
              </Typography>

              {/* 부서 추가 */}
              <Box sx={{ display: 'flex', gap: 2, mb: 3, flexShrink: 0 }}>
                <TextField
                  fullWidth
                  size="medium"
                  placeholder="부서명 입력"
                  value={newDepartment}
                  onChange={(e) => setNewDepartment(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddDepartment()}
                  sx={{
                    '& .MuiInputBase-root': {
                      height: '48px',
                      fontSize: '16px',
                    },
                  }}
                />
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleAddDepartment}
                  sx={{
                    bgcolor: '#3275FC',
                    '&:hover': { bgcolor: '#2563eb' },
                    minWidth: '100px',
                    height: '48px',
                    fontSize: '16px',
                    fontWeight: 600,
                  }}
                >
                  추가
                </Button>
              </Box>

              {/* 부서 목록 */}
              <List sx={{ maxHeight: '450px', overflow: 'auto' }}>
                {departments.map((dept, index) => (
                  <ListItem
                    key={index}
                    sx={{
                      border: '1px solid #e0e0e0',
                      borderRadius: 1,
                      mb: 1,
                      '&:hover': { bgcolor: '#f5f5f5' },
                    }}
                  >
                    <ListItemText primary={dept.name || dept} />
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton size="small" sx={{ color: '#666' }}>
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteDepartment(index)}
                        sx={{ color: '#f44336' }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* 직급명 관리 */}
          <Grid item xs={12} md={6} lg={6}>
            <Paper
              sx={{
                p: 4,
                height: '600px',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography
                variant="h6"
                sx={{ mb: 2, fontWeight: 600, fontSize: '20px' }}
              >
                직급명
              </Typography>

              {/* 직급 추가 */}
              <Box sx={{ display: 'flex', gap: 2, mb: 3, flexShrink: 0 }}>
                <TextField
                  fullWidth
                  size="medium"
                  placeholder="직급명 입력"
                  value={newPosition}
                  onChange={(e) => setNewPosition(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddPosition()}
                  sx={{
                    '& .MuiInputBase-root': {
                      height: '48px',
                      fontSize: '16px',
                    },
                  }}
                />
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={handleAddPosition}
                  sx={{
                    bgcolor: '#3275FC',
                    '&:hover': { bgcolor: '#2563eb' },
                    minWidth: '100px',
                    height: '48px',
                    fontSize: '16px',
                    fontWeight: 600,
                  }}
                >
                  추가
                </Button>
              </Box>

              {/* 직급 목록 */}
              <List sx={{ maxHeight: '450px', overflow: 'auto' }}>
                {positions.map((pos, index) => (
                  <ListItem
                    key={index}
                    sx={{
                      border: '1px solid #e0e0e0',
                      borderRadius: 1,
                      mb: 1,
                      '&:hover': { bgcolor: '#f5f5f5' },
                    }}
                  >
                    <ListItemText primary={pos.name || pos} />
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton size="small" sx={{ color: '#666' }}>
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeletePosition(index)}
                        sx={{ color: '#f44336' }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default OrganizationManagementContent;
