import React, { useState } from 'react';
import { Form, Button, Card } from 'react-bootstrap';
import '../styles/custom.css';

const BACKEND_API_BASE_URL = import.meta.env.VITE_BACKEND_API_BASE_URL;

const LoginPage = () => {
  //자체 로그인 시 username/password 변수
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  //자체 로그인 이벤트

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (username === '' || password === '') {
      setError('아이디와 비밀번호를 입력해주세요.');
      return;
    }

    try {
      const response = await fetch(`${BACKEND_API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) throw new Error('로그인 실패');

      const data = await response.json();
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
    } catch (error) {
      setError('아이디 또는 비밀번호가 틀렸습니다.');
    }
  };

  return (
    <div className="login-container d-flex align-items-center justify-content-center">
      <Card className="login-card">
        <Card.Body className="p-4">
          <Card.Title className="text-center mb-4 login-title">
            BERIEAS
          </Card.Title>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3 d-flex flex-column align-items-start">
              <Form.Label className=" login-label">USER ID</Form.Label>
              <Form.Control
                type="text"
                placeholder="아이디를 입력하세요"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="login-input"
              />
            </Form.Group>
            <Form.Group className="mb-3 d-flex flex-column align-items-start">
              <Form.Label className="login-label">PASSWORD</Form.Label>
              <Form.Control
                type="password"
                placeholder="비밀번호를 입력하세요"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input"
              />
            </Form.Group>
            {error && (
              <div className="alert alert-danger mb-3" role="alert">
                {error}
              </div>
            )}
            <Button type="submit" className="w-100 login-btn">
              로그인
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
};

export default LoginPage;
