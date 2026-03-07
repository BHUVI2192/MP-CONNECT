
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
  Upload,
  BookOpen,
  Mic2,
  Building2,
  Train
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
    { label: 'Photo Gallery', icon: Camera, path: '/mp/gallery' },
  ],
  [UserRole.PA]: [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/pa' },
    { label: 'Plan Today', icon: Calendar, path: '/pa/plan' },
    { label: 'Daybook', icon: BookOpen, path: '/pa/daybook' },
    { label: 'Development Works', icon: HardHat, path: '/pa/works' },
    { label: 'Dispatch Hub', icon: ShieldAlert, path: '/pa/complaints' },
    { label: 'Tour Hub', icon: MapPin, path: '/pa/tours' },
    { label: 'Schedule Tour', icon: Plus, path: '/pa/tours/new' },
    { label: 'Draft Letters', icon: FileText, path: '/pa/letters' },
    { label: 'Constituent Greetings', icon: Gift, path: '/pa/greetings' },
    { label: 'Photo Gallery', icon: Camera, path: '/pa/gallery' },
    { label: 'Speech Archive', icon: Mic2, path: '/pa/speeches' },
    { label: 'Parliament Tracker', icon: Building2, path: '/pa/parliament' },
    { label: 'Railway EQ', icon: Train, path: '/pa/railway-eq' },
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
    { label: 'Speech Upload', icon: Mic2, path: '/staff/speech/upload' },
    { label: 'Parliament Entry', icon: Building2, path: '/staff/parliament/entry' },
    { label: 'Railway EQ Entry', icon: Train, path: '/staff/railway-eq' },
    { label: 'System Audit', icon: ShieldAlert, path: '/staff/audit' },
  ],
  [UserRole.CITIZEN]: [
    { label: 'My Grievances', icon: MessageSquare, path: '/citizen' },
    { label: 'MP Schedule', icon: Calendar, path: '/citizen/schedule' },
    { label: 'Photo Gallery', icon: Camera, path: '/gallery' },
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
    <div className="w-64 h-screen bg-[#0B3D91] border-r border-[#0B3D91]/20 text-white shadow-2xl flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6 border-b border-white/10 bg-[#082b66]">
        <h1 className="text-xl font-black tracking-tighter flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Emblem" className="h-6 opacity-90" />
          </div>
          <span className="text-[#F5F7FA]">MP<span className="text-[#FF9933]"> Connect</span></span>
        </h1>
        <p className="text-[10px] text-white/70 mt-3 uppercase tracking-widest font-bold">{user.role} Portal</p>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
        {currentNav.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all relative group ${location.pathname === item.path ? 'bg-white/10 text-white shadow-inner font-bold' : 'text-white/60 hover:bg-white/5 hover:text-white font-medium'
              }`}
          >
            {location.pathname === item.path && (
              <motion.div
                layoutId="activeNav"
                className="absolute left-0 top-2 bottom-2 w-1.5 bg-[#FF9933] rounded-r-full"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <item.icon className={`w-5 h-5 ${location.pathname === item.path ? 'text-[#FF9933]' : 'text-white/40 group-hover:text-white/80'}`} />
            <span className="tracking-wide text-sm">{item.label}</span>
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
