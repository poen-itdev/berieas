// API 설정 파일
const API_CONFIG = {
  BASE_URL:
    import.meta.env.VITE_BACKEND_API_BASE_URL || 'http://localhost:8080',
  ENDPOINTS: {
    LOGIN: '/login',
    MEMBER_EXIST: '/member/exist',
    MEMBER_JOIN: '/member/join',
    MEMBER_INFO: '/member/info',
    MEMBER_UPDATE: '/member/update',
    MEMBER_DELETE: '/member/delete',
    MEMBER_CHANGE_PASSWORD: '/member/changepassword',
    JWT_REFRESH: '/jwt/refresh',
    MEMBER_SEND_CODE: '/member/send-code',
    MEMBER_VERIFY_CODE: '/member/verify-code',
    MEMBER_RESET_PASSWORD: '/member/reset-password',
  },
};

// API URL 생성 헬퍼 함수
export const getApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// 자주 사용하는 API URL들
export const API_URLS = {
  LOGIN: getApiUrl(API_CONFIG.ENDPOINTS.LOGIN),
  MEMBER_EXIST: getApiUrl(API_CONFIG.ENDPOINTS.MEMBER_EXIST),
  MEMBER_JOIN: getApiUrl(API_CONFIG.ENDPOINTS.MEMBER_JOIN),
  MEMBER_INFO: getApiUrl(API_CONFIG.ENDPOINTS.MEMBER_INFO),
  MEMBER_UPDATE: getApiUrl(API_CONFIG.ENDPOINTS.MEMBER_UPDATE),
  MEMBER_DELETE: getApiUrl(API_CONFIG.ENDPOINTS.MEMBER_DELETE),
  MEMBER_CHANGE_PASSWORD: getApiUrl(
    API_CONFIG.ENDPOINTS.MEMBER_CHANGE_PASSWORD
  ),
  JWT_REFRESH: getApiUrl(API_CONFIG.ENDPOINTS.JWT_REFRESH),
  MEMBER_SEND_CODE: getApiUrl(API_CONFIG.ENDPOINTS.MEMBER_SEND_CODE),
  MEMBER_VERIFY_CODE: getApiUrl(API_CONFIG.ENDPOINTS.MEMBER_VERIFY_CODE),
  MEMBER_RESET_PASSWORD: getApiUrl(API_CONFIG.ENDPOINTS.MEMBER_RESET_PASSWORD),
};

export default API_CONFIG;
