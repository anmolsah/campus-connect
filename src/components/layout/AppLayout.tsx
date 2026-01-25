import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, Newspaper, MessageCircle, User } from 'lucide-react';
import { ModeToggle } from '../ui';

const navItems = [
  { path: '/app', icon: Home, label: 'Discover' },
  { path: '/app/feed', icon: Newspaper, label: 'Feed' },
  { path: '/app/chats', icon: MessageCircle, label: 'Chats' },
  { path: '/app/profile', icon: User, label: 'Profile' },
];

export const AppLayout = () => {
  const location = useLocation();
  const isDiscoveryPage = location.pathname === '/app' || location.pathname === '/app/';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {isDiscoveryPage && (
        <header className="sticky top-0 z-40 bg-white border-b border-slate-100">
          <div className="px-4 py-3">
            <div className="flex items-center justify-center">
              <ModeToggle />
            </div>
          </div>
        </header>
      )}

      <main className="flex-1 pb-20">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 safe-bottom z-50">
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.path === '/app'
              ? location.pathname === '/app' || location.pathname === '/app/'
              : location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`
                  flex flex-col items-center gap-1 px-4 py-2 rounded-xl
                  transition-all duration-200
                  ${isActive
                    ? 'text-primary-600'
                    : 'text-slate-400 hover:text-slate-600'
                  }
                `}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-xs ${isActive ? 'font-medium' : ''}`}>
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
