import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { API_URLS } from '../config/api';
import '../styles/custom.css';

const FindAccountPage = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);

  // 타이머 useEffect
  useEffect(() => {
    let interval = null;
    if (isTimerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((timer) => timer - 1);
      }, 1000);
    } else if (timer === 0 && isTimerActive) {
      setIsTimerActive(false);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timer]);

  // 시간 포맷팅 함수 (mm:ss)
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  };

  const handleSendVerificationCode = async () => {
    if (!email) {
      setError('이메일을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(API_URLS.MEMBER_SEND_CODE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      if (response.ok) {
        setActiveStep(1);
        setSuccess('인증 코드가 이메일로 전송되었습니다.');
        // 인증 코드 입력 필드 초기화
        setVerificationCode('');
        // 기존 에러 메시지 제거
        setError('');
        // 3분(180초) 타이머 시작
        setTimer(180);
        setIsTimerActive(true);
      } else {
        try {
          const errorData = await response.json();
          // 서버에서 validation 오류가 있는 경우
          if (errorData.errors && errorData.errors.length > 0) {
            const emailError = errorData.errors.find(
              (err) => err.field === 'email'
            );
            if (emailError) {
              setError(emailError.defaultMessage);
            } else {
              setError(errorData.message || '인증 코드 전송에 실패했습니다.');
            }
          } else {
            setError(errorData.message || '인증 코드 전송에 실패했습니다.');
          }
        } catch (parseError) {
          // JSON 파싱에 실패한 경우 텍스트로 처리
          const errorText = await response.text();
          setError(errorText || '인증 코드 전송에 실패했습니다.');
        }
      }
    } catch (error) {
      setError('인증 코드 전송에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      setError('인증 코드를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(API_URLS.MEMBER_VERIFY_CODE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          code: verificationCode.trim(),
        }),
      });

      if (response.ok) {
        setActiveStep(2);
        setSuccess('인증이 완료되었습니다.');
        // 타이머 정리
        setIsTimerActive(false);
        setTimer(0);
      } else {
        try {
          const errorData = await response.json();
          setError(errorData.message || '인증 코드가 올바르지 않습니다.');
        } catch (parseError) {
          const errorText = await response.text();
          setError(errorText || '인증 코드가 올바르지 않습니다.');
        }
      }
    } catch (error) {
      setError('인증 코드가 올바르지 않습니다. 다시 확인해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword) {
      setError('새 비밀번호를 입력해주세요.');
      return;
    }

    if (newPassword.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(API_URLS.MEMBER_RESET_PASSWORD, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          memberEmail: email.trim().toLowerCase(),
          memberPw: newPassword,
        }),
      });

      if (response.ok) {
        setSuccess(
          '비밀번호가 성공적으로 변경되었습니다. 로그인 페이지로 이동합니다.'
        );
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        try {
          const errorData = await response.json();
          setError(errorData.message || '비밀번호 변경에 실패했습니다.');
        } catch (parseError) {
          const errorText = await response.text();
          setError(errorText || '비밀번호 변경에 실패했습니다.');
        }
      }
    } catch (error) {
      setError('비밀번호 변경에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const getSteps = () => {
    return ['이메일 입력', '인증 코드 확인', '새 비밀번호 설정'];
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="body1" sx={{ mb: 2, color: '#666' }}>
              이메일을 입력하시면 비밀번호를 재설정할 수 있습니다.
            </Typography>
            <TextField
              fullWidth
              label="이메일"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              sx={{ mb: 3 }}
            />
            <Button
              fullWidth
              variant="contained"
              onClick={handleSendVerificationCode}
              disabled={isLoading}
              sx={{ py: 1.5 }}
            >
              {isLoading ? '전송 중...' : '인증 코드 전송'}
            </Button>
          </Box>
        );

      case 1:
        return (
          <Box>
            <Typography variant="body1" sx={{ mb: 2, color: '#666' }}>
              {email}로 전송된 인증 코드를 입력해주세요.
            </Typography>
            <Box sx={{ position: 'relative', mb: 3 }}>
              <TextField
                fullWidth
                label="인증 코드 입력"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                disabled={timer === 0}
              />
              {timer > 0 && (
                <Typography
                  variant="body2"
                  sx={{
                    position: 'absolute',
                    right: 12,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#ff4444',
                    fontWeight: 'bold',
                    pointerEvents: 'none',
                  }}
                >
                  {formatTime(timer)}
                </Typography>
              )}
            </Box>
            {timer > 0 ? (
              <Button
                fullWidth
                variant="contained"
                onClick={handleVerifyCode}
                disabled={isLoading}
                sx={{ py: 1.5 }}
              >
                {isLoading ? '확인 중...' : '인증 코드 확인'}
              </Button>
            ) : (
              <>
                <Alert severity="error" sx={{ mb: 2 }}>
                  인증 시간이 만료되었습니다. 인증코드를 다시 받아주세요.
                </Alert>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={handleSendVerificationCode}
                  disabled={isLoading}
                  sx={{ py: 1.5 }}
                >
                  {isLoading ? '전송 중...' : '인증코드 다시 보내기'}
                </Button>
              </>
            )}
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="body1" sx={{ mb: 2, color: '#666' }}>
              새로운 비밀번호를 입력해주세요.
            </Typography>
            <TextField
              fullWidth
              label="새 비밀번호"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              fullWidth
              variant="contained"
              onClick={handleResetPassword}
              disabled={isLoading}
              sx={{ py: 1.5 }}
            >
              {isLoading ? '변경 중...' : '비밀번호 변경'}
            </Button>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Card
          sx={{
            width: '100%',
            maxWidth: 480,
            borderRadius: 3,
            boxShadow: 3,
            bgcolor: '#F9F9F9',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            {/* 뒤로가기 버튼 */}
            <Box sx={{ mb: 3 }}>
              <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate('/login')}
                sx={{ color: '#666' }}
              >
                로그인으로 돌아가기
              </Button>
            </Box>

            {/* 제목 */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                mb: 4,
              }}
            >
              <Typography
                variant="h6"
                component="h2"
                align="center"
                sx={{
                  mb: 2,
                  fontWeight: 500,
                  color: '#3275FC',
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: '-16px',
                    left: 0,
                    right: 0,
                    height: '2px',
                    backgroundColor: '#3275FC',
                    zIndex: 2,
                  },
                }}
              >
                비밀번호 재설정
              </Typography>

              {/* 전체 회색 선 */}
              <Box
                sx={{
                  width: '100%',
                  height: '1px',
                  backgroundColor: '#C1C1C1',
                }}
              />
            </Box>

            {/* 진행 단계 */}
            <Box sx={{ mb: 4 }}>
              <Stepper activeStep={activeStep} alternativeLabel>
                {getSteps().map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>

            {/* 에러 메시지 */}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* 성공 메시지 */}
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}

            {/* 단계별 콘텐츠 */}
            {renderStepContent()}
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default FindAccountPage;
