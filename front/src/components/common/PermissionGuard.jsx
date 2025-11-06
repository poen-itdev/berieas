import React from 'react';

// 권한 레벨 정의
export const PERMISSION_LEVELS = {
  ADMIN: 2, // 관리자
  USER: 1, // 작업자
};

const PermissionGuard = ({ children, requiredPermission, fallback = null }) => {
  const currentPermission = localStorage.getItem('permissions');
  const currentLevel = PERMISSION_LEVELS[currentPermission] || 0;
  const requiredLevel = PERMISSION_LEVELS[requiredPermission] || 0;

  // 현재 권한이 요구 권한보다 높거나 같으면 표시
  if (currentLevel >= requiredLevel) {
    return children;
  }

  return fallback;
};

export default PermissionGuard;
