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
} from '@mui/material';
import { API_URLS } from '../config/api';
import '../styles/custom.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [memberId, setMemberId] = useState('');
  const [memberPw, setMemberPw] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (memberId === '' || memberPw === '') {
      setError('아이디와 비밀번호를 입력해주세요.');
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
      if (!response.ok) throw new Error('로그인 실패');

      const data = await response.json();
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);

      const isFirst = data.isFirstLogin === true || data.isFirstLogin === 'Y';
      navigate(isFirst ? '/reset-password' : '/dashboard');
    } catch (error) {
      setError('아이디 또는 비밀번호가 틀렸습니다.');
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
        }}
      >
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
                label="User ID"
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
                label="Password"
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
                {isLoading ? 'sign in...' : 'Sign In'}
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
                  Password Reset
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
