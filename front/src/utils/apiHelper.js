import { API_URLS } from '../config/api';

// 토큰 refresh 함수
const refreshToken = async () => {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token');
    }

    const response = await fetch(API_URLS.JWT_REFRESH, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        refreshToken: refreshToken,
      }),
    });

    if (!response.ok) {
      throw new Error('Refresh failed');
    }

    const data = await response.json();

    // 새로운 토큰 저장
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);

    return data.accessToken;
  } catch (error) {
    console.error('Token refresh failed:', error);
    // refresh 실패 시 로그인 페이지로 리다이렉트
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
    throw error;
  }
};

// API 요청 래퍼 함수
export const apiRequest = async (url, options = {}) => {
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    },
    credentials: 'include',
    ...options,
    // options의 headers가 있으면 기본 headers와 병합
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, defaultOptions);

    // 401 에러 시 토큰 refresh 시도
    if (response.status === 401) {
      console.log('Token expired, attempting refresh...');
      const newAccessToken = await refreshToken();

      // 새로운 토큰으로 재요청
      const retryOptions = {
        ...defaultOptions,
        headers: {
          ...defaultOptions.headers,
          Authorization: `Bearer ${newAccessToken}`,
        },
      };

      return await fetch(url, retryOptions);
    }

    return response;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

export default apiRequest;
