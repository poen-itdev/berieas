import React, { createContext, useState, useContext, useEffect } from 'react';
import { translate } from '../locales/translations';

// Context 생성
const LanguageContext = createContext();

/**
 * 언어 설정을 전역으로 관리하는 Provider
 */
export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return 'en';
  });

  // 언어 변경 시 localStorage에 저장
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'ko' ? 'en' : 'ko'));
  };

  const changeLanguage = (lang) => {
    if (lang === 'ko' || lang === 'en') {
      setLanguage(lang);
    }
  };

  // 번역 함수 - 현재 언어에 맞는 텍스트 반환
  const t = (key) => translate(key, language);

  // 날짜 포맷팅 함수
  const formatDate = (date) => {
    if (!date) return '-';
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '-';

    // 한국어/영어 모두 YYYY-MM-DD 형식
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <LanguageContext.Provider
      value={{ language, toggleLanguage, changeLanguage, t, formatDate }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

/**
 * 언어 설정을 사용하는 Hook
 */
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

/**
 * Basic 데이터(부서, 직급)의 이름을 언어에 따라 반환하는 헬퍼 함수
 * @param {Object} item - Basic 데이터 객체 (name, codeValue 포함)
 * @param {string} language - 'ko' 또는 'en'
 * @returns {string} - 선택된 언어의 이름
 */
export const getLocalizedName = (item, language) => {
  if (!item) return '';

  if (language === 'en' && item.codeValue) {
    return item.codeValue; // 영어
  }

  return item.name || ''; // 한글 (기본값)
};
