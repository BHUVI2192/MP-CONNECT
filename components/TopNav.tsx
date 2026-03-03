
import React, { useState } from 'react';
import { Bell, Search, Settings, User } from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { NotificationPanel } from './NotificationPanel';
import { useAuth } from '../context/AuthContext';

export const TopNav: React.FC = () => {
  const { unreadCount } = useNotifications();
  const { user } = useAuth();
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  return (
    <div className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-40">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-md w-full hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search operations, events, or data..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border-transparent focus:bg-white focus:border-slate-200 focus:ring-0 outline-none transition-all text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={() => setIsPanelOpen(true)}
          className="relative p-2 hover:bg-slate-50 rounded-xl transition-colors group"
        >
          <Bell className="w-6 h-6 text-slate-500 group-hover:text-indigo-600 transition-colors" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white animate-bounce">
              {unreadCount}
            </span>
          )}
        </button>
        
        <div className="h-8 w-[1px] bg-slate-200 mx-2" />
        
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-slate-900 leading-none">{user?.name}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{user?.role}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200">
            <User className="w-6 h-6" />
          </div>
        </div>
      </div>

      <NotificationPanel isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} />
    </div>
  );
};
