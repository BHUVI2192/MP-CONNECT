
import React from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  MapPin,
  FileText,
  MessageSquare,
  Users,
  Calendar,
  PieChart,
  LogOut,
  Gift,
  Search,
  HardHat,
  Camera,
  Layers,
  Navigation,
  ShieldAlert,
  Plus,
  Upload
} from 'lucide-react';
import { UserRole } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const navItems = {
  [UserRole.MP]: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/mp' },
    { label: 'Live Briefing', icon: Navigation, path: '/mp/live' },
    { label: 'Tours & Visits', icon: MapPin, path: '/mp/tours' },
    { label: 'Development Works', icon: HardHat, path: '/mp/works' },
    { label: 'MPLADS Funds', icon: PieChart, path: '/mp/mplads' },
    { label: 'Complaints', icon: MessageSquare, path: '/mp/complaints' },
  ],
  [UserRole.PA]: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/pa' },
    { label: 'Plan Today', icon: Calendar, path: '/pa/plan-today' },
    { label: 'Dispatch Hub', icon: ShieldAlert, path: '/pa/complaints' },
    { label: 'Tour Hub', icon: MapPin, path: '/pa/tours' },
    { label: 'Schedule Tour', icon: Plus, path: '/pa/tours/new' },
    { label: 'Daybook', icon: Calendar, path: '/pa/daybook' },
    { label: 'Draft Letters', icon: FileText, path: '/pa/letters' },
    { label: 'Constituent Greetings', icon: Gift, path: '/pa/greetings' },
  ],
  [UserRole.STAFF]: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/staff' },
    { label: 'Plan Today', icon: Calendar, path: '/staff/plan-today' },
    { label: 'Tour Program', icon: MapPin, path: '/staff/tours' },
    { label: 'Verify Complaints', icon: ShieldAlert, path: '/staff/complaints' },
    { label: 'Draft Letters', icon: FileText, path: '/staff/letters' },
    { label: 'Project Data', icon: Layers, path: '/staff/entry' },
    { label: 'Work Upload', icon: Upload, path: '/staff/works/upload' },
    { label: 'Contact Book', icon: Users, path: '/staff/contacts' },
    { label: 'Media Gallery', icon: Camera, path: '/staff/media' },
  ],
  [UserRole.CITIZEN]: [
    { label: 'My Grievances', icon: MessageSquare, path: '/citizen' },
    { label: 'MP Schedule', icon: Calendar, path: '/citizen/schedule' },
  ],
  [UserRole.ADMIN]: []
};

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return null;

  const currentNav = navItems[user.role] || [];

  return (
    <div className="w-64 h-screen bg-slate-900 text-white flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold tracking-tighter flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">MP</div>
          Connect
        </h1>
        <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">{user.role} Portal</p>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
        {currentNav.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all relative group ${location.pathname === item.path ? 'text-white' : 'text-slate-400 hover:text-white'
              }`}
          >
            {location.pathname === item.path && (
              <motion.div
                layoutId="activeNav"
                className="absolute inset-0 bg-white/10 rounded-lg -z-10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <item.icon className={`w-5 h-5 ${location.pathname === item.path ? 'text-indigo-400' : 'text-slate-500 group-hover:text-indigo-400'}`} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
            <Users className="w-6 h-6 text-slate-300" />
          </div>
          <div className="truncate">
            <p className="text-sm font-semibold truncate">{user.name}</p>
            <p className="text-xs text-slate-500 truncate">{user.constituency || 'Northeast Delhi'}</p>
          </div>
        </div>
        <button
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
};
