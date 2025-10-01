import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Grid,
  Paper,
  Tabs,
  Tab,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from '@mui/material';
import { API_URLS } from '../../config/api';
import { apiRequest } from '../../utils/apiHelper';
import PageHeader from '../common/PageHeader';

const BACKEND_API_BASE_URL =
  import.meta.env.VITE_BACKEND_API_BASE_URL || 'http://localhost:8080';

const DashboardContent = ({ userInfo, isMobile = false }) => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState(0);

  // 대시보드 카운트 데이터 (백엔드 연동)
  const [statusData, setStatusData] = useState({
    total: 0,
    inProgress: 0,
    completed: 0,
  });

  const [mySubmittedDocs, setMySubmittedDocs] = useState([]);
  const [myPendingDocs, setMyPendingDocs] = useState([]);

  useEffect(() => {
    fetchSummaryCounts();
    fetchMySubmittedDocs();
    fetchMyPendingDocs();
  }, []);

  const parseCount = async (res) => {
    try {
      const data = await res.json();
      // 응답이 객체인 경우 숫자 값을 추출
      if (typeof data === 'object' && data !== null) {
        // 숫자 값이 있는 경우 해당 값을 반환
        if (typeof data === 'number') {
          return data;
        }
        // 객체에 count나 value 같은 필드가 있는 경우
        if (data.count !== undefined) {
          return data.count;
        }
        if (data.value !== undefined) {
          return data.value;
        }
        // 그 외의 경우 0 반환
        return 0;
      }
      return data;
    } catch (_) {
      const text = await res.text();
      const num = Number(text);
      return Number.isNaN(num) ? 0 : num;
    }
  };

  const fetchSummaryCounts = async () => {
    try {
      const headers = {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        'Content-Type': 'application/json',
      };

      const requestOptions = {
        method: 'GET',
        headers,
        credentials: 'include',
      };

      const [totalRes, inProgRes, completedRes] = await Promise.all([
        fetch(API_URLS.APPROVAL_TOTAL, requestOptions),
        fetch(API_URLS.APPROVAL_IN_PROGRESS, requestOptions),
        fetch(API_URLS.APPROVAL_COMPLETED, requestOptions),
      ]);

      // 응답 상태 확인
      if (!totalRes.ok || !inProgRes.ok || !completedRes.ok) {
        throw new Error('API 요청 실패');
      }

      const [total, inProgress, completed] = await Promise.all([
        parseCount(totalRes),
        parseCount(inProgRes),
        parseCount(completedRes),
      ]);

      setStatusData({ total, inProgress, completed });
    } catch (error) {
      console.error('대시보드 요약 조회 실패:', error);
      setStatusData({ total: 15, inProgress: 8, completed: 7 });
    }
  };

  const fetchMySubmittedDocs = async () => {
    try {
      const response = await apiRequest(API_URLS.APPROVAL_MY_SUBMITTED, {
        method: 'GET',
      });

      if (response.ok) {
        console.log('내가 기안한 문서 데이터:', response.data);
        setMySubmittedDocs(Array.isArray(response.data) ? response.data : []);
      } else {
        console.error(
          '내가 기안한 문서 조회 실패:',
          response.status,
          response.statusText
        );
        setMySubmittedDocs([]);
      }
    } catch (error) {
      console.error('내가 기안한 문서 조회 실패:', error);
      setMySubmittedDocs([]);
    }
  };

  const fetchMyPendingDocs = async () => {
    try {
      const response = await apiRequest(API_URLS.APPROVAL_MY_PENDING, {
        method: 'GET',
      });

      if (response.ok) {
        console.log('내가 결재할 문서 데이터:', response.data);
        setMyPendingDocs(Array.isArray(response.data) ? response.data : []);
      } else {
        console.error(
          '내가 결재할 문서 조회 실패:',
          response.status,
          response.statusText
        );
        setMyPendingDocs([]);
      }
    } catch (error) {
      console.error('내가 결재할 문서 조회 실패:', error);
      setMyPendingDocs([]);
    }
  };

  const handleDocumentClick = (document) => {
    console.log('문서 클릭:', document);
  };

  const handleTabChange = (_e, value) => setSelectedTab(value);

  return (
    <Box sx={{ p: 3, mt: 3 }}>
      <Container maxWidth="xl" sx={{ mx: 0, px: 0 }}>
        {/* 모바일에서만 사용자 인사말 표시 */}
        {isMobile && userInfo && (
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Typography
              variant="h6"
              sx={{ color: '#333', fontWeight: 500, textAlign: 'left' }}
            >
              안녕하세요. {userInfo.memberName}님
            </Typography>
          </Box>
        )}

        {/* 제목 */}
        <PageHeader title="결재 현황" fontSize="30px" />

        {/* 상단 통계 카드 3개 */}
        <Grid container spacing={3} sx={{ mb: 5 }}>
          {[
            { value: statusData.total, label: '전체' },
            { value: statusData.inProgress, label: '진행중' },
            { value: statusData.completed, label: '완료' },
          ].map((item, idx) => (
            <Grid key={idx} size={{ xs: 12, md: 4 }}>
              <Paper
                sx={{
                  p: 3,
                  height: 150,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  pt: 2,
                  position: 'relative', // absolute 포지셔닝을 위한 기준점
                  border: '1px solid #3275FC',
                  bgcolor: '#eef4ff',
                }}
              >
                <Typography
                  sx={{
                    fontSize: 14,
                    color: '#3275FC',
                  }}
                >
                  {item.label}
                </Typography>
                <Typography
                  sx={{
                    fontSize: 32,
                    fontWeight: 800,
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  {item.value}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* 하단 탭과 표 */}
        <Box sx={{ mb: 1 }}>
          <Tabs
            value={selectedTab}
            onChange={handleTabChange}
            sx={{ minHeight: 40 }}
          >
            <Tab label="내가 상신한 문서" sx={{ minHeight: 40 }} />
            <Tab label="내가 결재할 문서" sx={{ minHeight: 40 }} />
          </Tabs>
        </Box>

        <Paper>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell align="center">결재상태</TableCell>
                <TableCell align="center">기안양식</TableCell>
                <TableCell align="center">기안제목</TableCell>
                <TableCell align="center">
                  {selectedTab === 0 ? '현재 결재자' : '현재 기안자'}
                </TableCell>
                <TableCell align="center">기안일자</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(selectedTab === 0 ? mySubmittedDocs : myPendingDocs).map(
                (doc, index) => (
                  <TableRow
                    key={index}
                    hover
                    onClick={() => handleDocumentClick(doc)}
                  >
                    <TableCell align="center">
                      {doc.approvalStatus || '진행중'}
                    </TableCell>
                    <TableCell align="center">
                      {doc.aprovalType || '기안서'}
                    </TableCell>
                    <TableCell align="center">{doc.approvalTitle}</TableCell>
                    <TableCell align="center">
                      {doc.signId || doc.approvalId}
                    </TableCell>
                    <TableCell align="center">
                      {doc.regDate
                        ? new Date(doc.regDate).toLocaleDateString()
                        : '-'}
                    </TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </Paper>
      </Container>
    </Box>
  );
};

export default DashboardContent;
