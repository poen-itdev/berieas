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
  Container,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { API_URLS } from '../../config/api';
import PageHeader from '../common/PageHeader';
import { apiRequest } from '../../utils/apiHelper';

const OrganizationManagementContent = () => {
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [newDepartment, setNewDepartment] = useState('');
  const [newPosition, setNewPosition] = useState('');

  // 편집 상태 관리
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [editingPosition, setEditingPosition] = useState(null);
  const [editDepartmentName, setEditDepartmentName] = useState('');
  const [editPositionName, setEditPositionName] = useState('');

  // 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        const [departmentsRes, positionsRes] = await Promise.all([
          apiRequest(API_URLS.DEPARTMENTS, { method: 'GET' }),
          apiRequest(API_URLS.POSITIONS, { method: 'GET' }),
        ]);

        if (!departmentsRes.ok || !positionsRes.ok) {
          throw new Error('API 요청 실패');
        }

        const departmentsData = await departmentsRes.json();
        const positionsData = await positionsRes.json();

        // 배열이 아닌 경우 빈 배열로 설정
        setDepartments(Array.isArray(departmentsData) ? departmentsData : []);
        setPositions(Array.isArray(positionsData) ? positionsData : []);
      } catch (error) {
        console.error('데이터 로드 실패:', error);
        console.log('백엔드 API 오류로 인해 빈 배열을 사용합니다.');
        setDepartments([]);
        setPositions([]);
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

  // 부서 편집 시작
  const handleEditDepartment = (index) => {
    const department = departments[index];
    setEditingDepartment(index);
    setEditDepartmentName(department.name || department);
  };

  // 부서 편집 저장
  const handleSaveDepartment = async () => {
    if (editDepartmentName.trim()) {
      try {
        const department = departments[editingDepartment];
        const response = await fetch(
          `${API_URLS.UPDATE_DEPARTMENT}/${
            department.idx || editingDepartment
          }`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
            body: JSON.stringify({ name: editDepartmentName.trim() }),
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
          setEditingDepartment(null);
          setEditDepartmentName('');
          alert('부서가 수정되었습니다.');
        } else {
          throw new Error('부서 수정 실패');
        }
      } catch (error) {
        console.error('부서 수정 실패:', error);
        alert('부서 수정에 실패했습니다.');
      }
    }
  };

  // 부서 편집 취소
  const handleCancelEditDepartment = () => {
    setEditingDepartment(null);
    setEditDepartmentName('');
  };

  // 직급 편집 시작
  const handleEditPosition = (index) => {
    const position = positions[index];
    setEditingPosition(index);
    setEditPositionName(position.name || position);
  };

  // 직급 편집 저장
  const handleSavePosition = async () => {
    if (editPositionName.trim()) {
      try {
        const position = positions[editingPosition];
        const response = await fetch(
          `${API_URLS.UPDATE_POSITION}/${position.idx || editingPosition}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            },
            body: JSON.stringify({ name: editPositionName.trim() }),
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
          setEditingPosition(null);
          setEditPositionName('');
          alert('직급이 수정되었습니다.');
        } else {
          throw new Error('직급 수정 실패');
        }
      } catch (error) {
        console.error('직급 수정 실패:', error);
        alert('직급 수정에 실패했습니다.');
      }
    }
  };

  // 직급 편집 취소
  const handleCancelEditPosition = () => {
    setEditingPosition(null);
    setEditPositionName('');
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
    <Box sx={{ p: 3, mt: 4 }}>
      <Container maxWidth="xl" sx={{ mx: 0, px: 0 }}>
        {/* 제목 그룹 */}
        <PageHeader
          title="조직관리"
          description="조직(부서)와 직급 정보를 등록/수정 가능"
        />

        {/* 콘텐츠 영역 */}
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Grid
            container
            spacing={{ xs: 2, md: 8 }}
            sx={{
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Grid
              item
              xs={12}
              md={6}
              sx={{ display: 'flex', justifyContent: 'center' }}
            >
              <Paper
                sx={{
                  p: 4,
                  height: '600px',
                  width: '450px',
                  maxWidth: '450px',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ mb: 2, fontWeight: 600, fontSize: '18px' }}
                >
                  부서추가
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    gap: { xs: 1, md: 2 },
                    mb: 3,
                    flexShrink: 0,
                    flexDirection: { xs: 'column', sm: 'row' },
                  }}
                >
                  <TextField
                    fullWidth
                    size="medium"
                    placeholder="부서명 입력"
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === 'Enter' && handleAddDepartment()
                    }
                    sx={{
                      '& .MuiInputBase-root': {
                        height: { xs: '40px', md: '48px' },
                        fontSize: { xs: '14px', md: '16px' },
                      },
                    }}
                  />
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={handleAddDepartment}
                    sx={{
                      bgcolor: '#fff',
                      color: '#3275FC',
                      '&:hover': { color: '#fff', bgcolor: '#3275FC' },
                      border: '1px solid #3275FC',
                      minWidth: { xs: '100px', md: '120px' },
                      height: { xs: '44px', md: '48px' },
                      fontSize: { xs: '15px', md: '16px' },
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    추가
                  </Button>
                </Box>

                {/* 부서 목록 */}
                <List
                  sx={{
                    maxHeight: '450px',
                    overflow: 'auto',
                    '&::-webkit-scrollbar': {
                      display: 'none',
                    },
                    scrollbarWidth: 'none', // Firefox
                    msOverflowStyle: 'none', // IE and Edge
                  }}
                >
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
                      {editingDepartment === index ? (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            width: '100%',
                          }}
                        >
                          <TextField
                            value={editDepartmentName}
                            onChange={(e) =>
                              setEditDepartmentName(e.target.value)
                            }
                            size="small"
                            sx={{ flexGrow: 1 }}
                            onKeyPress={(e) =>
                              e.key === 'Enter' && handleSaveDepartment()
                            }
                          />
                          <Button
                            size="small"
                            variant="contained"
                            onClick={handleSaveDepartment}
                            sx={{ bgcolor: '#3275FC', minWidth: '60px' }}
                          >
                            저장
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={handleCancelEditDepartment}
                            sx={{ minWidth: '60px' }}
                          >
                            취소
                          </Button>
                        </Box>
                      ) : (
                        <>
                          <ListItemText primary={dept.name || dept} />
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                              size="small"
                              sx={{ color: '#666' }}
                              onClick={() => handleEditDepartment(index)}
                            >
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
                        </>
                      )}
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>

            {/* 직급명 관리 */}
            <Grid
              item
              xs={12}
              md={6}
              sx={{ display: 'flex', justifyContent: 'center' }}
            >
              <Paper
                sx={{
                  p: 4,
                  height: '600px',
                  width: '450px',
                  maxWidth: '450px',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Typography
                  variant="h6"
                  sx={{ mb: 2, fontWeight: 600, fontSize: '18px' }}
                >
                  직급추가
                </Typography>

                {/* 직급 추가 */}
                <Box
                  sx={{
                    display: 'flex',
                    gap: { xs: 1, md: 2 },
                    mb: 3,
                    flexShrink: 0,
                    flexDirection: { xs: 'column', sm: 'row' },
                  }}
                >
                  <TextField
                    fullWidth
                    size="medium"
                    placeholder="직급명 입력"
                    value={newPosition}
                    onChange={(e) => setNewPosition(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddPosition()}
                    sx={{
                      '& .MuiInputBase-root': {
                        height: { xs: '40px', md: '48px' },
                        fontSize: { xs: '14px', md: '16px' },
                      },
                    }}
                  />
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={handleAddPosition}
                    sx={{
                      bgcolor: '#fff',
                      color: '#3275FC',
                      '&:hover': { color: '#fff', bgcolor: '#3275FC' },
                      border: '1px solid #3275FC',
                      minWidth: { xs: '100px', md: '120px' },
                      height: { xs: '44px', md: '48px' },
                      fontSize: { xs: '15px', md: '16px' },
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    추가
                  </Button>
                </Box>

                {/* 직급 목록 */}
                <List
                  sx={{
                    maxHeight: '450px',
                    overflow: 'auto',
                    '&::-webkit-scrollbar': {
                      display: 'none',
                    },
                    scrollbarWidth: 'none', // Firefox
                    msOverflowStyle: 'none', // IE and Edge
                  }}
                >
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
                      {editingPosition === index ? (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            width: '100%',
                          }}
                        >
                          <TextField
                            value={editPositionName}
                            onChange={(e) =>
                              setEditPositionName(e.target.value)
                            }
                            size="small"
                            sx={{ flexGrow: 1 }}
                            onKeyPress={(e) =>
                              e.key === 'Enter' && handleSavePosition()
                            }
                          />
                          <Button
                            size="small"
                            variant="contained"
                            onClick={handleSavePosition}
                            sx={{ bgcolor: '#3275FC', minWidth: '60px' }}
                          >
                            저장
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={handleCancelEditPosition}
                            sx={{ minWidth: '60px' }}
                          >
                            취소
                          </Button>
                        </Box>
                      ) : (
                        <>
                          <ListItemText primary={pos.name || pos} />
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <IconButton
                              size="small"
                              sx={{ color: '#666' }}
                              onClick={() => handleEditPosition(index)}
                            >
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
                        </>
                      )}
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default OrganizationManagementContent;
