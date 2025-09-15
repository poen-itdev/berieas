import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Container } from '@mui/material';
import Sidebar from '../components/dashboard/Sidebar';
import Header from '../components/dashboard/Header';
import StatusCard from '../components/dashboard/StatusCard';
import ApprovalDocumentList from '../components/dashboard/ApprovalDocumentList';
import '../styles/custom.css';

const BACKEND_API_BASE_URL =
  import.meta.env.VITE_BACKEND_API_BASE_URL || 'http://localhost:8080';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);

  // 임시 데이터 (나중에 백엔드에서 가져올 예정)
  const [statusData] = useState({
    approvalRequest: 5,
    inProgress: 12,
    completed: 28,
  });

  const [approvalDocuments] = useState([
    {
      id: 1,
      title: '전사 카카오워크 도입의 건',
      status: '결재 대기',
      form: '기안지',
      type: '협조',
      drafter: '홍길동 | 인사',
      date: '2024-01-15',
    },
    {
      id: 2,
      title: '하반기 이벤트 마케팅 비용 사용의 건',
      status: '수신 대기',
      form: '지출결의',
      type: '부서협조',
      drafter: '김철수 | 마케팅',
      date: '2024-01-14',
    },
    {
      id: 3,
      title: '기획팀 워크샵 비용 사용의 건',
      status: '결재 대기',
      form: '기안지',
      type: '결재',
      drafter: '라이언 | 기획',
      date: '2024-01-13',
    },
  ]);

  useEffect(() => {
    // 로그인 상태 확인
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      navigate('/login');
      return;
    }

    fetchUserInfo();
  }, [navigate]);

  const fetchUserInfo = async () => {
    try {
      const response = await fetch(`${BACKEND_API_BASE_URL}/member/info`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('사용자 정보를 가져올 수 없습니다.');
      }

      const data = await response.json();
      setUserInfo(data);
    } catch (error) {
      console.error('사용자 정보 조회 실패:', error);
      // 임시 사용자 정보 설정
      setUserInfo({
        memberId: 'admin',
        memberName: '관리자',
        memberEmail: 'admin@berieas.com',
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/login');
  };

  const handleMenuClick = (path) => {
    console.log('메뉴 클릭:', path);
    // 나중에 라우팅 처리
  };

  const handleDocumentClick = (document) => {
    console.log('문서 클릭:', document);
    // 나중에 문서 상세 페이지로 이동
  };

  if (!userInfo) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <Typography>로딩 중...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* 사이드바 */}
      <Sidebar onMenuClick={handleMenuClick} />

      {/* 메인 콘텐츠 */}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* 상단 헤더 */}
        <Header onLogout={handleLogout} />

        {/* 메인 콘텐츠 영역 */}
        <Box sx={{ flexGrow: 1, p: 3, bgcolor: '#fff', overflow: 'auto' }}>
          <Container maxWidth="xl">
            {/* 환영 메시지 */}
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h4"
                sx={{ fontWeight: 700, color: '#333', mb: 1 }}
              >
                안녕하세요, {userInfo.memberName}님
              </Typography>
            </Box>

            {/* 나의 현황 */}
            <StatusCard statusData={statusData} />

            {/* 결재할 문서 */}
            <ApprovalDocumentList
              documents={approvalDocuments}
              onDocumentClick={handleDocumentClick}
            />
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardPage;
