import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Button,
  Chip,
  Pagination,
  InputAdornment,
} from '@mui/material';
import { Search, CalendarToday } from '@mui/icons-material';
import PageHeader from '../common/PageHeader';
import { API_URLS } from '../../config/api';
import { apiRequest } from '../../utils/apiHelper';

const ProgressListContent = ({ isMobile = false }) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tabCounts, setTabCounts] = useState({
    total: 0,
    inProgress: 0,
    completed: 0,
    drafting: 0,
    rejected: 0,
    approved: 0,
  });

  const tabData = [
    { label: '전체', count: tabCounts.total },
    { label: '기안중', count: tabCounts.drafting },
    { label: '진행중', count: tabCounts.inProgress },
    { label: '반려', count: tabCounts.rejected },
    { label: '완료', count: tabCounts.completed },
  ];

  // API 호출 함수들
  const fetchProgressData = async (tabIndex = selectedTab) => {
    try {
      setLoading(true);
      let apiUrl;

      // 선택된 탭에 따라 다른 API 호출
      switch (tabIndex) {
        case 0: // 전체
          apiUrl = API_URLS.APPROVAL_ALL;
          break;
        case 1: // 기안중
          apiUrl = API_URLS.APPROVAL_DRAFTING;
          break;
        case 2: // 진행중
          apiUrl = API_URLS.APPROVAL_ALL;
          break;
        case 3: // 반려
          apiUrl = API_URLS.APPROVAL_RETURENED;
          break;
        case 4: // 완료
          apiUrl = API_URLS.APPROVAL_APPROVED;
          break;
        default:
          apiUrl = API_URLS.APPROVAL_ALL;
      }

      const response = await apiRequest(apiUrl, {
        method: 'GET',
      });

      if (response.ok) {
        let data = response.data;

        // 각 탭별로 필요한 데이터만 필터링
        if (tabIndex === 2) {
          // 진행중 탭: 진행중 상태만 표시
          data = data.filter((item) => item.approvalStatus === '진행중');
        }

        setProgressData(Array.isArray(data) ? data : []);
      } else {
        console.error('API 응답 실패:', response.status, response.statusText);
        setProgressData([]);
      }
    } catch (error) {
      console.error('진행목록 데이터 가져오기 실패:', error);
      setProgressData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTabCounts = async () => {
    try {
      const [totalRes, inProgressRes, completedRes, draftingRes, rejectedRes] =
        await Promise.all([
          apiRequest(API_URLS.APPROVAL_TOTAL, { method: 'GET' }),
          apiRequest(API_URLS.APPROVAL_IN_PROGRESS, { method: 'GET' }),
          apiRequest(API_URLS.APPROVAL_COMPLETED, { method: 'GET' }),
          apiRequest(API_URLS.APPROVAL_DRAFTING, { method: 'GET' }),
          apiRequest(API_URLS.APPROVAL_RETURENED, { method: 'GET' }),
        ]);

      let total = 0,
        inProgress = 0,
        completed = 0,
        drafting = 0,
        rejected = 0;

      if (totalRes.ok) {
        const totalData = totalRes.data;
        total =
          typeof totalData === 'number' ? totalData : totalData?.count || 0;
      }

      if (inProgressRes.ok) {
        const inProgressData = inProgressRes.data;
        inProgress =
          typeof inProgressData === 'number'
            ? inProgressData
            : inProgressData?.count || 0;
      }

      if (completedRes.ok) {
        const completedData = completedRes.data;
        completed =
          typeof completedData === 'number'
            ? completedData
            : completedData?.count || 0;
      }

      // 기안중과 반려는 배열 길이로 카운트
      if (draftingRes.ok) {
        const draftingData = draftingRes.data;
        drafting = Array.isArray(draftingData) ? draftingData.length : 0;
      }

      if (rejectedRes.ok) {
        const rejectedData = rejectedRes.data;
        rejected = Array.isArray(rejectedData) ? rejectedData.length : 0;
      }

      setTabCounts({
        total: total,
        inProgress: inProgress,
        completed: completed,
        drafting: drafting,
        rejected: rejected,
        approved: completed,
      });
    } catch (error) {
      console.error('탭 카운트 가져오기 실패:', error);
      setTabCounts({
        total: 0,
        inProgress: 0,
        completed: 0,
        drafting: 0,
        rejected: 0,
        approved: 0,
      });
    }
  };

  useEffect(() => {
    fetchProgressData();
    fetchTabCounts();
  }, []);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    // 새로운 탭 인덱스를 직접 전달
    fetchProgressData(newValue);
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      let apiUrl;
      switch (selectedTab) {
        case 0:
          apiUrl = API_URLS.APPROVAL_ALL;
          break;
        case 1:
          apiUrl = API_URLS.APPROVAL_DRAFTING;
          break;
        case 2:
          apiUrl = API_URLS.APPROVAL_MY_PENDING;
          break;
        case 3:
          apiUrl = API_URLS.APPROVAL_RETURENED;
          break;
        case 4:
          apiUrl = API_URLS.APPROVAL_APPROVED;
          break;
        default:
          apiUrl = API_URLS.APPROVAL_ALL;
      }

      const response = await apiRequest(`${apiUrl}?${params}`, {
        method: 'GET',
      });

      if (response.ok) {
        const data = response.data;
        setProgressData(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('검색 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case '기안중':
        return '#FFA726';
      case '진행중':
        return '#42A5F5';
      case '완료':
        return '#66BB6A';
      case '반려':
        return '#EF5350';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusChip = (status, statusColor) => {
    return (
      <Chip
        label={status}
        color={statusColor}
        size="small"
        sx={{
          fontWeight: 500,
          fontSize: '12px',
          height: '24px',
        }}
      />
    );
  };

  return (
    <Box sx={{ p: 3, mt: 3 }}>
      <Container maxWidth="xl" sx={{ mx: 0, px: 0 }}>
        <PageHeader title="진행 목록" fontSize="30px" />

        {/* 탭 섹션 */}
        <Paper sx={{ mb: 3, borderRadius: 2, p: 0, overflow: 'hidden' }}>
          <Box
            sx={{
              display: 'flex',
              width: '100%',
              overflowX: 'auto', // 가로 스크롤 허용
              '&::-webkit-scrollbar': {
                height: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#c1c1c1',
                borderRadius: '3px',
              },
            }}
          >
            {tabData.map((tab, index) => (
              <Box
                key={index}
                onClick={() => handleTabChange(null, index)}
                sx={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1,
                  py: 2,
                  px: 2,
                  cursor: 'pointer',
                  borderRight:
                    index < tabData.length - 1 ? '1px solid #E0E0E0' : 'none',
                  bgcolor: selectedTab === index ? '#3275FC' : 'white',
                  color: selectedTab === index ? 'white' : '#666',
                  fontWeight: selectedTab === index ? 600 : 500,
                  fontSize: '16px',
                  transition: 'all 0.2s ease',
                  borderRadius:
                    index === 0
                      ? '8px 0 0 8px'
                      : index === tabData.length - 1
                      ? '0 8px 8px 0'
                      : '0',
                  '&:hover': {
                    bgcolor: selectedTab === index ? '#2563EB' : '#F8F9FA',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>{tab.label}</span>
                  <Box
                    sx={{
                      bgcolor:
                        selectedTab === index
                          ? 'rgba(255,255,255,0.2)'
                          : '#E3F2FD',
                      color: selectedTab === index ? 'white' : '#1976D2',
                      px: 1,
                      py: 0.5,
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 600,
                      minWidth: '20px',
                      textAlign: 'center',
                    }}
                  >
                    {tab.count}
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>

        {/* 검색 조건 */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography
            variant="h6"
            sx={{ mb: 2, display: 'flex', fontWeight: 600 }}
          >
            조회 조건
          </Typography>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: { xs: 'stretch', sm: 'center' },
            }}
          >
            <TextField
              placeholder="검색어를 입력해 주세요"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{
                flexGrow: 1,
                '& .MuiInputBase-root': {
                  height: '40px',
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: '#666', fontSize: '20px' }} />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              type="date"
              placeholder="연도-월-일"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              sx={{
                width: { xs: '100%', sm: '160px' },
                '& .MuiInputBase-root': {
                  height: '40px',
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarToday sx={{ color: '#666', fontSize: '20px' }} />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              type="date"
              placeholder="연도-월-일"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              sx={{
                width: { xs: '100%', sm: '160px' },
                '& .MuiInputBase-root': {
                  height: '40px',
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <CalendarToday sx={{ color: '#666', fontSize: '20px' }} />
                  </InputAdornment>
                ),
              }}
            />
            <Button
              variant="contained"
              onClick={handleSearch}
              sx={{
                bgcolor: '#3275FC',
                color: 'white',
                height: '40px',
                px: 3,
                fontWeight: 600,
                '&:hover': {
                  bgcolor: '#2563EB',
                },
              }}
            >
              검색
            </Button>
          </Box>
        </Paper>

        {/* 테이블 */}
        <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <TableContainer
            sx={{
              overflowX: 'auto', // 가로 스크롤 허용
              '&::-webkit-scrollbar': {
                height: '6px',
              },
              '&::-webkit-scrollbar-track': {
                background: '#f1f1f1',
              },
              '&::-webkit-scrollbar-thumb': {
                background: '#c1c1c1',
                borderRadius: '3px',
              },
            }}
          >
            <Table
              sx={{
                '& .MuiTableCell-root': {
                  fontSize: '14px',
                  textAlign: 'center',
                },
                '& .MuiTableCell-head': {
                  fontWeight: 600,
                },
              }}
            >
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8F9FA' }}>
                  <TableCell>번호</TableCell>
                  <TableCell>기안일자</TableCell>
                  <TableCell>제목</TableCell>
                  <TableCell>구분</TableCell>
                  <TableCell>부서명</TableCell>
                  <TableCell>기안자</TableCell>
                  <TableCell>결재자</TableCell>
                  <TableCell>진행상태</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                      <Typography>로딩 중...</Typography>
                    </TableCell>
                  </TableRow>
                ) : progressData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} sx={{ textAlign: 'center', py: 4 }}>
                      <Typography>데이터가 없습니다.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  progressData.map((row, index) => (
                    <TableRow
                      key={row.id || `row-${index}`}
                      sx={{
                        '&:hover': {
                          bgcolor: '#F8F9FA',
                        },
                      }}
                    >
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        {row.regDate
                          ? new Date(row.regDate).toLocaleDateString()
                          : '-'}
                      </TableCell>
                      <TableCell sx={{ maxWidth: '300px' }}>
                        <Typography
                          variant="body2"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {row.approvalTitle}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {row.approvalType || row.aprovalType}
                      </TableCell>
                      <TableCell>{row.approvalPostion || '-'}</TableCell>
                      <TableCell>{row.approvalName || '-'}</TableCell>
                      <TableCell>{row.approvalSigner || row.signId}</TableCell>
                      <TableCell>
                        {getStatusChip(
                          row.approvalStatus,
                          getStatusColor(row.approvalStatus)
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* 페이지네이션 */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={1}
            page={page}
            onChange={(event, value) => setPage(value)}
            color="primary"
            sx={{
              '& .MuiPaginationItem-root': {
                fontSize: '14px',
              },
            }}
          />
        </Box>
      </Container>
    </Box>
  );
};

export default ProgressListContent;
