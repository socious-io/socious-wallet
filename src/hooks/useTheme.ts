import { useState, useEffect } from 'react';

const useTheme = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    return prefersDarkScheme ? 'dark' : 'light';
  });
  useEffect(() => {
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setTheme('dark');
      } else {
        setTheme('light');
      }
    };
    prefersDarkScheme.addEventListener('change', handleChange);
    return () => {
      prefersDarkScheme.removeEventListener('change', handleChange);
    };
  }, []);
  return theme;
};

export default useTheme;
