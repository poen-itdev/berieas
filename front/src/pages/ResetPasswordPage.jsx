import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
  Container,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { ArrowBack } from '@mui/icons-material';
import { API_URLS } from '../config/api';
import { useLanguage } from '../contexts/LanguageContext';
import '../styles/custom.css';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const { t, language, changeLanguage } = useLanguage();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const handleLanguageChange = (event) => {
    changeLanguage(event.target.value);
  };

  // Enter 키 이벤트 리스너
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'Enter' && success) {
        navigate('/login');
      }
    };

    document.addEventListener('keydown', handleKeyPress);

    return () => {
      document.removeEventListener('keydown', handleKeyPress);
    };
  }, [success, navigate]);

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      setError(t('resetPasswordErrorEmpty'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t('resetPasswordErrorMismatch'));
      return;
    }

    if (newPassword.length < 6) {
      setError(t('resetPasswordErrorLength'));
      return;
    }

    // 영문 6~12자, 특수문자 1개 포함 검증
    const passwordRegex =
      /^(?=.*[a-zA-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{6,12}$/;
    if (!passwordRegex.test(newPassword)) {
      setError(t('resetPasswordErrorFormat'));
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const accessToken = localStorage.getItem('accessToken');

      const response = await fetch(API_URLS.MEMBER_CHANGE_PASSWORD, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          memberPw: newPassword,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(t('resetPasswordFailed'));
      }

      setShowSuccessDialog(true);

      // 토큰 제거 (재로그인 강제)
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } catch (error) {
      setError(t('resetPasswordFailedRetry'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setShowSuccessDialog(false);
    navigate('/login');
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* 언어 선택 - 오른쪽 상단에 고정 */}
        <Box
          sx={{
            position: 'absolute',
            top: 20,
            right: 20,
          }}
        >
          <FormControl size="small">
            <Select
              value={language}
              onChange={handleLanguageChange}
              sx={{
                bgcolor: 'white',
                minWidth: 100,
                height: 36,
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(0, 0, 0, 0.23)',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(0, 0, 0, 0.4)',
                },
              }}
            >
              <MenuItem value="ko">한국어</MenuItem>
              <MenuItem value="en">English</MenuItem>
            </Select>
          </FormControl>
        </Box>

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
                {t('backToLogin')}
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
                component="h2"
                fontSize={18}
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
                    left: '-10%',
                    right: '-10%',
                    height: '1px',
                    backgroundColor: '#3275FC',
                    zIndex: 2,
                  },
                }}
              >
                {t('resetPasswordTitle')}
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

            {/* 안내 메시지 */}
            <Typography variant="body1" sx={{ mb: 2, color: '#666' }}>
              {t('resetPasswordMessage')}
            </Typography>

            <Typography variant="body2" sx={{ mb: 3, color: '#999' }}>
              {t('resetPasswordHint')}
            </Typography>

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

            {/* 비밀번호 입력 필드 */}
            <TextField
              fullWidth
              label={t('enterPassword')}
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label={t('confirmPassword')}
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              sx={{ mb: 3 }}
            />

            {/* 비밀번호 재설정 버튼 */}
            <Button
              fullWidth
              variant="contained"
              onClick={handleResetPassword}
              disabled={isLoading}
              sx={{
                py: 1.5,
                borderRadius: 2,
                '&:hover': {
                  transform: 'translateY(-2px)',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 8px 25px rgba(50, 117, 252, 0.3)',
                },
              }}
            >
              {isLoading ? t('resetting') : t('resetPasswordTitle')}
            </Button>
          </CardContent>
        </Card>
      </Box>
      <Dialog
        open={showSuccessDialog}
        onClose={handleCloseDialog}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,

            textAlign: 'center',
          },
        }}
      >
        <DialogContent sx={{ padding: 3 }}>
          <Box sx={{ mb: 1, mt: 1 }}>
            <CheckCircleIcon
              sx={{
                fontSize: 50,
                color: '#4CAF50',
              }}
            />
          </Box>
          <Typography variant="body1">{t('resetPasswordSuccess')}</Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {t('resetPasswordRelogin')}
          </Typography>
          <Button
            onClick={handleCloseDialog}
            variant="contained"
            sx={{
              backgroundColor: '#1976d2',
              '&:hover': {
                backgroundColor: '#1565c0',
              },
              borderRadius: 1.5,
              px: 4,
              py: 1,
            }}
          >
            {t('confirm')}
          </Button>
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default ResetPasswordPage;
