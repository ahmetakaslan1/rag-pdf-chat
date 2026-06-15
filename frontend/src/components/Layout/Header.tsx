import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Sparkles, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return 'dark';
  });

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const isHome = location.pathname === '/' || location.pathname === '/home';

  return (
    <header className="h-16 border-b border-color bg-secondary flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-2">
        {!isHome && (
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-tertiary rounded-lg text-text-secondary transition-all"
            title="Ana Sayfaya Dön"
          >
            <Home size={18} />
          </button>
        )}
        <div className="flex items-center gap-2 font-medium text-sm text-text-secondary">
          <span>{isHome ? 'Doküman Yönetimi' : 'Sohbet Odası'}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="p-2 hover:bg-tertiary rounded-lg text-text-secondary transition-all"
          title={theme === 'light' ? 'Karanlık Temaya Geç' : 'Açık Temaya Geç'}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {!isAuthenticated && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs text-primary font-medium animate-pulse">
            <Sparkles size={12} />
            <span>Misafir Modu</span>
          </div>
        )}
      </div>
    </header>
  );
};
