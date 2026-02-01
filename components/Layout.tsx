import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, Plus, User, Store, MessageCircle, Globe } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, setLanguage, t, currentUser } = useApp();
  const { theme } = useTheme();

  const navItems = [
    { path: '/', label: t.nav.home, icon: Home },
    { path: '/store', label: t.nav.store, icon: Store },
    { path: '/create', label: t.nav.create, icon: Plus },
    { path: '/messages', label: t.nav.message, icon: MessageCircle },
    { path: '/profile', label: t.nav.profile, icon: User },
  ];

  const logoSrc = theme === 'dark' 
    ? 'https://github.com/user-attachments/assets/32f28d85-aeab-4560-a1af-96679bc1f574'
    : 'https://github.com/user-attachments/assets/112e30f8-f163-4a36-8ab1-7327fedababc';

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center">
      {/* Minimal Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-surface/90 backdrop-blur-md border-b border-gray-100/50 dark:border-white/5 transition-colors duration-300">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div 
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 cursor-pointer"
          >
            <img 
              src={logoSrc} 
              alt="Logo" 
              className="w-8 h-8 rounded-lg object-cover" 
            />
            <span className="text-sm font-bold tracking-wider text-black dark:text-zinc-400 transition-colors duration-300">ALLSET</span>
          </div>
          <div className="flex items-center space-x-3">
             <button 
               onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
               className="h-8 px-2.5 rounded-full bg-gray-50 dark:bg-zinc-800 flex items-center justify-center border border-gray-100 dark:border-white/5 hover:border-gray-200 dark:hover:border-white/20 transition-all"
             >
               <Globe size={14} className="text-gray-600 dark:text-gray-300" />
               <span className="ml-1 text-[9px] font-bold text-gray-600 dark:text-gray-300">{language === 'zh' ? 'EN' : 'CN'}</span>
             </button>
             <div 
               onClick={() => navigate('/profile')}
               className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-white/5 overflow-hidden cursor-pointer"
             >
               <img src={currentUser.avatar} alt="avatar" className="w-full h-full object-cover" />
             </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="w-full max-w-md px-6 pt-20 pb-28">
        {children}
      </main>

      {/* Minimal Floating Nav */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-black dark:bg-zinc-900 rounded-full h-16 px-6 flex items-center gap-6 shadow-xl shadow-black/10 dark:shadow-white/5 border border-transparent dark:border-white/10 transition-all duration-300">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`relative flex items-center justify-center transition-all duration-300 ${
                isActive ? 'text-accent scale-110' : 'text-white/40 hover:text-white/80'
              }`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              {isActive && (
                <div className="absolute -bottom-2.5 w-1 h-1 bg-accent rounded-full"></div>
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default Layout;