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
import { useLanguage } from '../../contexts/LanguageContext';

const DashboardContent = ({ userInfo, isMobile = false }) => {
  const navigate = useNavigate();
  const { t, formatDate } = useLanguage();
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
    } catch (e) {
      console.error(e);
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
      setStatusData({ total: 15, inProgress: 8, completed: 7 });
    }
  };

  const fetchMySubmittedDocs = async () => {
    try {
      const response = await apiRequest(API_URLS.APPROVAL_MY_SUBMITTED, {
        method: 'GET',
      });

      if (response.ok) {
        setMySubmittedDocs(Array.isArray(response.data) ? response.data : []);
      } else {
        setMySubmittedDocs([]);
      }
    } catch (error) {
      setMySubmittedDocs([]);
    }
  };

  const fetchMyPendingDocs = async () => {
    try {
      const response = await apiRequest(API_URLS.APPROVAL_MY_PENDING, {
        method: 'GET',
      });

      if (response.ok) {
        setMyPendingDocs(Array.isArray(response.data) ? response.data : []);
      } else {
        setMyPendingDocs([]);
      }
    } catch (error) {
      setMyPendingDocs([]);
    }
  };

  const handleDocumentClick = (document) => {
    // 기안중 상태인 경우 기안작성 페이지로 이동
    if (document.approvalStatus === '기안중') {
      navigate(`/approvalwrite?approvalNo=${document.approvalNo}`);
    } else {
      navigate(`/approval-detail?approvalNo=${document.approvalNo}`);
    }
  };

  const handleTabChange = (_e, value) => setSelectedTab(value);

  const handleStatusCardClick = (status) => {
    // 진행목록 페이지로 이동하면서 해당 탭으로 설정
    navigate(`/progress-list?tab=${status}`);
  };

  return (
    <Box sx={{ p: { xs: 1.5, sm: 3 }, mt: { xs: 1.5, sm: 3 } }}>
      <Container maxWidth="xl" sx={{ mx: 0, px: 0 }}>
        {/* 모바일에서만 사용자 인사말 표시 */}
        {isMobile && userInfo && (
          <Box sx={{ mb: 3, textAlign: 'center' }}>
            <Typography
              variant="h6"
              sx={{ color: '#333', fontWeight: 500, textAlign: 'left' }}
            >
              안녕하세요. {userInfo.memberName}님,
              <br />
              <span style={{ fontSize: '14px', color: '#666' }}>
                BERI-EAS 결재 현황을 확인해보세요.
              </span>
            </Typography>
          </Box>
        )}

        {/* 제목 */}
        <PageHeader
          title={t('approvalStatus')}
          fontSize={{ xs: '20px', sm: '30px' }}
        />

        {/* 상단 통계 카드 3개 */}
        <Grid
          container
          spacing={{ xs: 2, sm: 3 }}
          sx={{ mb: { xs: 3, sm: 5 } }}
        >
          {[
            { value: statusData.total, label: t('all'), status: 'all' },
            {
              value: statusData.inProgress,
              label: t('inProgress'),
              status: 'inProgress',
            },
            {
              value: statusData.completed,
              label: t('completed'),
              status: 'completed',
            },
          ].map((item, idx) => (
            <Grid key={idx} size={{ xs: 12, md: 4 }}>
              <Paper
                onClick={() => handleStatusCardClick(item.status)}
                sx={{
                  p: { xs: 2, sm: 3 },
                  height: { xs: 100, sm: 150 },
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  pt: { xs: 1.5, sm: 2 },
                  position: 'relative',
                  border: '1px solid #3275FC',
                  bgcolor: '#eef4ff',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    bgcolor: '#d6e3ff',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 4px 12px rgba(50, 117, 252, 0.15)',
                  },
                }}
              >
                <Typography
                  sx={{
                    fontSize: { xs: 14, sm: 16 },
                    color: '#3275FC',
                  }}
                >
                  {item.label}
                </Typography>
                <Typography
                  sx={{
                    fontSize: { xs: 24, sm: 32 },
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
            sx={{
              minHeight: { xs: 36, sm: 40 },
              '& .MuiTab-root': {
                fontSize: { xs: '12px', sm: '14px' },
                minHeight: { xs: 36, sm: 40 },
                padding: { xs: '6px 12px', sm: '12px 16px' },
              },
            }}
          >
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {t('mySubmittedDocuments')}
                  <Box
                    sx={{
                      bgcolor: '#3275FC',
                      color: 'white',
                      borderRadius: '50%',
                      minWidth: 20,
                      height: 20,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 600,
                    }}
                  >
                    {mySubmittedDocs.length}
                  </Box>
                </Box>
              }
            />
            <Tab
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {t('myPendingDocuments')}
                  <Box
                    sx={{
                      bgcolor: '#3275FC',
                      color: 'white',
                      borderRadius: '50%',
                      minWidth: 20,
                      height: 20,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 600,
                    }}
                  >
                    {myPendingDocs.length}
                  </Box>
                </Box>
              }
            />
          </Tabs>
        </Box>

        <Paper sx={{ overflow: 'auto' }}>
          <Table
            sx={{
              minWidth: { xs: '100%', sm: 650 },
              '& .MuiTableCell-root': {
                fontSize: { xs: '11px', sm: '14px' },
                padding: { xs: '8px 4px', sm: '16px' },
              },
            }}
          >
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell align="center" sx={{ fontWeight: 600 }}>
                  {t('status')}
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>
                  {t('form')}
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>
                  {t('title')}
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>
                  {selectedTab === 0 ? t('approver') : t('drafter')}
                </TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>
                  {t('date')}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(selectedTab === 0 ? mySubmittedDocs : myPendingDocs).length ===
              0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    align="center"
                    sx={{ py: 4, color: '#666' }}
                  >
                    <Typography sx={{ fontSize: { xs: '12px', sm: '14px' } }}>
                      {t('noDocuments')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                (selectedTab === 0 ? mySubmittedDocs : myPendingDocs).map(
                  (doc, index) => (
                    <TableRow
                      key={index}
                      hover
                      onClick={() => handleDocumentClick(doc)}
                      sx={{
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: '#f8f9fa' },
                      }}
                    >
                      <TableCell align="center">
                        {doc.approvalStatus || '진행중'}
                      </TableCell>
                      <TableCell align="center">
                        {doc.aprovalType || '기안서'}
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          maxWidth: { xs: '120px', sm: '300px' },
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {doc.approvalTitle}
                      </TableCell>
                      <TableCell align="center">
                        {doc.signId || doc.approvalId}
                      </TableCell>
                      <TableCell align="center">
                        {formatDate(doc.regDate)}
                      </TableCell>
                    </TableRow>
                  )
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
