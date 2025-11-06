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
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import { API_URLS } from '../config/api';
import { useLanguage } from '../contexts/LanguageContext';
import '../styles/custom.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const { t, language, changeLanguage } = useLanguage();
  const [memberId, setMemberId] = useState('');
  const [memberPw, setMemberPw] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLanguageChange = (event) => {
    changeLanguage(event.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (memberId === '' || memberPw === '') {
      setError(t('loginErrorEmpty'));
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(API_URLS.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ memberId, memberPw }),
      });
      if (!response.ok) throw new Error(t('loginFailed'));

      const data = await response.json();
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);

      const isFirst = data.isFirstLogin === true || data.isFirstLogin === 'Y';
      navigate(isFirst ? '/reset-password' : '/dashboard');
    } catch (error) {
      setError(t('loginErrorInvalid'));
    } finally {
      setIsLoading(false);
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
            maxWidth: 380,
            height: 430,
            borderRadius: 3,
            boxShadow: 3,
            bgcolor: '#F9F9F9',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <CardContent
            sx={{
              p: 4,
            }}
          >
            <Typography
              variant="h4"
              component="h1"
              align="center"
              sx={{ mb: 2, fontWeight: 900, color: '#3275FC' }}
            >
              BERI-EAS
            </Typography>

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="memberId"
                label={t('userId')}
                name="memberId"
                autoComplete="username"
                autoFocus
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                sx={{ background: '#fff' }}
              />

              <TextField
                margin="normal"
                required
                fullWidth
                name="memberPw"
                label={t('password')}
                type="password"
                id="memberPw"
                autoComplete="current-password"
                value={memberPw}
                onChange={(e) => setMemberPw(e.target.value)}
                sx={{ background: '#fff' }}
              />

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading}
                sx={{
                  mt: 2,
                  mb: 2,
                  py: 1.5,
                  borderRadius: 2,
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 8px 25px rgba(50, 117, 252, 0.3)',
                  },
                }}
              >
                {isLoading ? t('signingIn') : t('signIn')}
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    cursor: 'pointer',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                  onClick={() => navigate('/find-account')}
                >
                  {t('passwordReset')}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default LoginPage;
