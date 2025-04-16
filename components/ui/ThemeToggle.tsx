'use client';
import { useEffect, useState } from 'react';
import { Button } from './button';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>(
    typeof window !== 'undefined' && localStorage.getItem('theme') === 'dark' ? 'dark' : 'light'
  );

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <Button variant="outline" size="icon" aria-label="Toggle dark mode" onClick={toggleTheme} className="fixed top-4 right-4 z-[101]">
      {theme === 'dark' ? (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0112 21.75c-5.385 0-9.75-4.365-9.75-9.75 0-4.126 2.635-7.624 6.374-9.093a.75.75 0 01.976.937A7.501 7.501 0 0016.5 17.25a7.48 7.48 0 004.156-1.274.75.75 0 01.938.976z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1.5m0 15V21m8.485-8.485l-1.06 1.06M4.515 4.515l1.06 1.06M21 12h-1.5M4.5 12H3m16.485 4.485l-1.06-1.06M4.515 19.485l1.06-1.06M16.5 12a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
        </svg>
      )}
    </Button>
  );
} 