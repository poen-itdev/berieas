import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  Chip,
  Pagination,
  InputAdornment,
} from '@mui/material';
import { Search, CalendarToday } from '@mui/icons-material';
import PageHeader from '../common/PageHeader';
import { API_URLS } from '../../config/api';
import { apiRequest } from '../../utils/apiHelper';

const ProgressListContent = ({ isMobile = false }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(false);

  const tabData = [
    { label: '전체' },
    { label: '기안중' },
    { label: '진행중' },
    { label: '반려' },
    { label: '완료' },
  ];

  // API 파라미터 생성 함수 (pageNum 인자 사용)
  const buildApiParams = (pageNum) => {
    const params = new URLSearchParams();
    params.append('page', String((pageNum ?? page) - 1)); // Spring page index = 0-based
    params.append('size', String(pageSize));

    const kw = searchTerm.trim();
    if (kw) params.append('keyword', kw);
    if (startDate) params.append('from', startDate);
    if (endDate) params.append('to', endDate);
    return params.toString();
  };

  // API URL 매핑 (오타 수정)
  const getApiUrl = (tabIndex) => {
    const urlMap = {
      0: API_URLS.APPROVAL_ALL, // 전체 (서버 페이지네이션)
      1: API_URLS.APPROVAL_DRAFTING, // 기안중 (서버 페이지네이션)
      2: API_URLS.APPROVAL_ALL, // 진행중 (전용 API 없다고 가정 → ALL 호출 후 클라필터)
      3: API_URLS.APPROVAL_RETURNED, // 반려 (오타 수정)
      4: API_URLS.APPROVAL_APPROVED, // 완료
    };
    return urlMap[tabIndex] || API_URLS.APPROVAL_ALL;
  };

  // 데이터 전처리
  const processData = (data, tabIndex) => {
    if (!data) return { items: [], totalPages: 1, totalElements: 0, number: 0 };

    // 스프링 Page<T>
    const content = Array.isArray(data.content)
      ? data.content
      : Array.isArray(data)
      ? data
      : [];
    let items = content;

    // 진행중 탭: 진행중 상태 문서만 필터링
    if (tabIndex === 2) {
      items = content.filter((item) => item.approvalStatus === '진행중');
    }

    return {
      items,
      totalPages: typeof data.totalPages === 'number' ? data.totalPages : 1,
      totalElements:
        typeof data.totalElements === 'number'
          ? data.totalElements
          : items.length,
      number: typeof data.number === 'number' ? data.number : page - 1,
    };
  };

  // API 호출: 쿼리스트링 포함
  const fetchProgressData = async (tabIndex = selectedTab, pageNum = page) => {
    try {
      setLoading(true);
      const apiUrl = getApiUrl(tabIndex);
      const qs = buildApiParams(pageNum);
      const response = await apiRequest(`${apiUrl}?${qs}`, { method: 'GET' });

      if (response.ok) {
        const { items, totalPages, totalElements, number } = processData(
          response.data,
          tabIndex
        );
        setProgressData(items);
        setTotalPages(totalPages);
        setTotalElements(totalElements);
        setPage((number ?? 0) + 1);
      } else {
        setProgressData([]);
        setTotalPages(1);
        setTotalElements(0);
      }
    } catch (e) {
      setProgressData([]);
      setTotalPages(1);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  };

  // 탭 파라미터 매핑
  const getTabIndexFromParam = (tabParam) => {
    const tabMap = {
      all: 0, // 전체
      inProgress: 2, // 진행중
      completed: 4, // 완료
    };
    return tabMap[tabParam] || 0;
  };

  // 탭/파라미터 변화 시: page=1로 리셋 후 호출
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    const tabIndex = tabParam ? getTabIndexFromParam(tabParam) : 0;
    setSelectedTab(tabIndex);
    setPage(1);
    fetchProgressData(tabIndex, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    // 검색/기간 변경 시 1페이지부터
    setPage(1);
    fetchProgressData(selectedTab, 1);
  }, [searchTerm, startDate, endDate]);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    setPage(1);
    fetchProgressData(newValue, 1);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    fetchProgressData(selectedTab, value);
  };

  // 행 클릭 핸들러
  const handleRowClick = (row) => {
    // 기안중 상태인 경우 기안작성 페이지로 이동
    if (row.approvalStatus === '기안중') {
      navigate(`/approvalwrite?approvalNo=${row.approvalNo}`);
    } else {
      // 다른 상태인 경우 상세보기 페이지로 이동
      navigate(`/approval-detail?approvalNo=${row.approvalNo}`);
    }
  };

  // 상태 색상 매핑
  const statusColors = {
    기안중: '#F59E0B',
    진행중: '#3B82F6',
    완료: '#10B981',
    반려: '#EF4444',
  };

  const getStatusColor = (status) => statusColors[status] || '#9E9E9E';

  // 번호 칼럼: 서버 페이지 기준 오프셋 적용
  const rowNumberBase = (page - 1) * pageSize;
  const getDisplayNumber = (rowIndex) => {
    const base = Number.isFinite(rowNumberBase) ? rowNumberBase : 0;
    const idx = Number.isFinite(rowIndex) ? rowIndex : 0;
    return base + idx + 1;
  };

  // 상태 칩 컴포넌트
  const StatusChip = ({ status }) => (
    <Chip
      label={status}
      size="small"
      sx={{
        fontWeight: 500,
        fontSize: { xs: '10px', sm: '12px' },
        height: { xs: '20px', sm: '24px' },
        backgroundColor: getStatusColor(status),
        color: 'white',
        '& .MuiChip-label': {
          color: 'white',
          fontSize: { xs: '10px', sm: '12px' },
          padding: { xs: '0 6px', sm: '0 8px' },
        },
      }}
    />
  );

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
              overflowX: 'auto',
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
                <span>{tab.label}</span>
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
                  fontSize: { xs: '12px', sm: '14px' },
                  textAlign: 'center',
                  padding: { xs: '8px 4px', sm: '12px 8px' },
                },
                '& .MuiTableCell-head': {
                  fontWeight: 600,
                  fontSize: { xs: '12px', sm: '14px' },
                  padding: { xs: '8px 4px', sm: '12px 8px' },
                },
              }}
            >
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8F9FA' }}>
                  <TableCell sx={{ minWidth: { xs: '40px', sm: '60px' } }}>
                    번호
                  </TableCell>
                  <TableCell sx={{ minWidth: { xs: '80px', sm: '100px' } }}>
                    기안일자
                  </TableCell>
                  <TableCell sx={{ minWidth: { xs: '120px', sm: '200px' } }}>
                    제목
                  </TableCell>
                  <TableCell sx={{ minWidth: { xs: '60px', sm: '80px' } }}>
                    구분
                  </TableCell>
                  <TableCell
                    sx={{
                      display: { xs: 'none', md: 'table-cell' },
                      minWidth: '80px',
                    }}
                  >
                    부서명
                  </TableCell>
                  <TableCell sx={{ minWidth: { xs: '60px', sm: '80px' } }}>
                    기안자
                  </TableCell>
                  <TableCell
                    sx={{
                      display: { xs: 'none', sm: 'table-cell' },
                      minWidth: '80px',
                    }}
                  >
                    결재자
                  </TableCell>
                  <TableCell sx={{ minWidth: { xs: '60px', sm: '80px' } }}>
                    진행상태
                  </TableCell>
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
                      onClick={() => handleRowClick(row)}
                      sx={{
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: '#F8F9FA',
                        },
                      }}
                    >
                      <TableCell sx={{ minWidth: { xs: '40px', sm: '60px' } }}>
                        {getDisplayNumber(index)}
                      </TableCell>
                      <TableCell sx={{ minWidth: { xs: '80px', sm: '100px' } }}>
                        {row.regDate
                          ? new Date(row.regDate).toLocaleDateString()
                          : '-'}
                      </TableCell>
                      <TableCell
                        sx={{
                          minWidth: { xs: '120px', sm: '200px' },
                          maxWidth: { xs: '120px', sm: '300px' },
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            fontSize: { xs: '12px', sm: '14px' },
                          }}
                        >
                          {row.approvalTitle}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ minWidth: { xs: '60px', sm: '80px' } }}>
                        <Typography
                          sx={{ fontSize: { xs: '11px', sm: '12px' } }}
                        >
                          {row.approvalType || row.aprovalType}
                        </Typography>
                      </TableCell>
                      <TableCell
                        sx={{
                          display: { xs: 'none', md: 'table-cell' },
                          minWidth: '80px',
                        }}
                      >
                        <Typography
                          sx={{ fontSize: { xs: '11px', sm: '12px' } }}
                        >
                          {row.approvalPostion || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ minWidth: { xs: '60px', sm: '80px' } }}>
                        <Typography
                          sx={{ fontSize: { xs: '11px', sm: '12px' } }}
                        >
                          {row.approvalName || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell
                        sx={{
                          display: { xs: 'none', sm: 'table-cell' },
                          minWidth: '80px',
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: { xs: '11px', sm: '12px' },
                          }}
                        >
                          {row.approvalStatus === '반려'
                            ? `${row.approvalSigner || row.signId}`
                            : row.approvalSigner || row.signId}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ minWidth: { xs: '60px', sm: '80px' } }}>
                        <StatusChip status={row.approvalStatus} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* 페이지네이션: 서버 totalPages 사용 */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages || 1}
            page={page}
            onChange={handlePageChange}
            color="primary"
            sx={{ '& .MuiPaginationItem-root': { fontSize: '14px' } }}
          />
        </Box>
      </Container>
    </Box>
  );
};

export default ProgressListContent;
