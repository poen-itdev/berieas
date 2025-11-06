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
    localStorage.removeItem('permissions');
    window.location.href = '/login';
    throw error;
  }
};

// API 요청 래퍼 함수
export const apiRequest = async (url, options = {}) => {
  // FormData인지 확인
  const isFormData = options.body instanceof FormData;

  const defaultOptions = {
    headers: {
      // FormData가 아닐 때만 Content-Type 설정
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
    },
    credentials: 'include',
    ...options,
    // options의 headers가 있으면 기본 headers와 병합
    headers: {
      // FormData가 아닐 때만 Content-Type 설정
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      ...options.headers,
    },
  };

  try {
    let response = await fetch(url, defaultOptions);

    // 401 에러 시 토큰 refresh 시도
    if (response.status === 401) {
      const newAccessToken = await refreshToken();

      // 새로운 토큰으로 재요청
      const retryOptions = {
        ...defaultOptions,
        headers: {
          ...defaultOptions.headers,
          Authorization: `Bearer ${newAccessToken}`,
        },
      };

      response = await fetch(url, retryOptions);
    }

    // 응답이 성공적이면 데이터를 파싱해서 반환
    if (response.ok) {
      const contentType = response.headers.get('content-type');
      let data;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      return {
        ok: true,
        data: data,
        status: response.status,
        statusText: response.statusText,
      };
    } else {
      // 에러 응답도 파싱해서 반환
      const contentType = response.headers.get('content-type');
      let errorData;

      try {
        if (contentType && contentType.includes('application/json')) {
          errorData = await response.json();
        } else {
          errorData = await response.text();
        }
      } catch (parseError) {
        errorData = null;
      }

      return {
        ok: false,
        data: errorData,
        status: response.status,
        statusText: response.statusText,
      };
    }
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

export default apiRequest;
