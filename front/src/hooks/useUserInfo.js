import { useState, useEffect } from 'react';
import { apiRequest } from '../utils/apiHelper';
import { API_URLS } from '../config/api';

export const useUserInfo = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');

      if (!accessToken) {
        setUserInfo({ memberName: '사용자' });
        setLoading(false);
        return;
      }

      const response = await apiRequest(API_URLS.MEMBER_INFO, {
        method: 'GET',
      });

      if (response.ok) {
        const userData = response.data;
        setUserInfo(userData);

        // 권한 정보를 localStorage에 저장
        if (userData.role) {
          localStorage.setItem('permissions', userData.role);
        }
      } else {
        setUserInfo({ memberName: '사용자' });
      }
    } catch (error) {
      setUserInfo({ memberName: '사용자' });
    } finally {
      setLoading(false);
    }
  };

  return { userInfo, loading, refetch: fetchUserInfo };
};
