import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, Search, MessageCircle, User, Plus } from 'lucide-react';
import { CreatePostModal } from '../feed/CreatePostModal';

export const AppLayout = () => {
  const location = useLocation();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const navItems = [
    { path: '/app/feed', icon: Home, label: 'Home' },
    { path: '/app', icon: Search, label: 'Explore' },
  ];

  const rightNavItems = [
    { path: '/app/chats', icon: MessageCircle, label: 'Chats' },
    { path: '/app/profile', icon: User, label: 'Profile' },
  ];

  const getIsActive = (path: string) => {
    if (path === '/app') {
      return location.pathname === '/app' || location.pathname === '/app/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <main className="flex-1 pb-20">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 safe-bottom z-50">
        <div className="flex items-center justify-around px-4 py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = getIsActive(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`
                  flex flex-col items-center gap-1 px-3 py-1
                  transition-all duration-200
                  ${isActive
                    ? 'text-blue-500'
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

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center justify-center w-12 h-12 bg-blue-500 rounded-full shadow-lg -mt-4 hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-6 h-6 text-white" />
          </button>

          {rightNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = getIsActive(item.path);
            const hasNotification = item.path === '/app/chats';

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`
                  flex flex-col items-center gap-1 px-3 py-1 relative
                  transition-all duration-200
                  ${isActive
                    ? 'text-blue-500'
                    : 'text-slate-400 hover:text-slate-600'
                  }
                `}
              >
                <div className="relative">
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  {hasNotification && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </div>
                <span className={`text-xs ${isActive ? 'font-medium' : ''}`}>
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </nav>

      {showCreateModal && (
        <CreatePostModal
          onClose={() => setShowCreateModal(false)}
          onCreated={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
};
