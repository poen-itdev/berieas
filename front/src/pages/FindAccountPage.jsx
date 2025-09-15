import React, { useState } from 'react';
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
import { ArrowBack, CheckCircle } from '@mui/icons-material';
import '../styles/custom.css';

const BACKEND_API_BASE_URL = 'http://localhost:8080';

const FindAccountPage = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendVerificationCode = async () => {
    if (!email) {
      setError('이메일을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(
        `${BACKEND_API_BASE_URL}/auth/send-verification-code`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            type: 'RESET_PASSWORD',
          }),
        }
      );

      if (!response.ok) {
        throw new Error('인증 코드 전송에 실패했습니다.');
      }

      setActiveStep(1);
      setSuccess('인증 코드가 이메일로 전송되었습니다.');
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
      const response = await fetch(`${BACKEND_API_BASE_URL}/auth/verify-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code: verificationCode }),
      });

      if (!response.ok) {
        throw new Error('인증 코드가 올바르지 않습니다.');
      }

      setActiveStep(2);
      setSuccess('인증이 완료되었습니다.');
    } catch (error) {
      setError('인증 코드가 올바르지 않습니다. 다시 확인해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setError('새 비밀번호를 입력해주세요.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    if (newPassword.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(
        `${BACKEND_API_BASE_URL}/auth/reset-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, newPassword }),
        }
      );

      if (!response.ok) {
        throw new Error('비밀번호 변경에 실패했습니다.');
      }

      setSuccess('비밀번호가 성공적으로 변경되었습니다.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
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
            <TextField
              fullWidth
              label="인증 코드"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              sx={{ mb: 3 }}
            />
            <Button
              fullWidth
              variant="contained"
              onClick={handleVerifyCode}
              disabled={isLoading}
              sx={{ py: 1.5 }}
            >
              {isLoading ? '확인 중...' : '인증 코드 확인'}
            </Button>
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
            <TextField
              fullWidth
              label="새 비밀번호 확인"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              sx={{ mb: 3 }}
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
                비밀번호 찾기
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
