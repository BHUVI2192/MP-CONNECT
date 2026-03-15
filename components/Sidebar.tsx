
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
    { label: 'Speech Bulk Upload', icon: Upload, path: '/staff/speech/bulk' },
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
    <div className="w-64 h-screen bg-gradient-to-b from-[#072a67] via-[#0B3D91] to-[#08214f] border-r border-white/10 text-white shadow-[0_30px_80px_-28px_rgba(8,33,79,0.95)] flex flex-col fixed left-0 top-0 z-50 overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-44 bg-[radial-gradient(circle_at_top,_rgba(255,153,51,0.26),_transparent_58%)] pointer-events-none" />
      <div className="p-6 border-b border-white/10 bg-black/10 backdrop-blur-sm relative">
        <h1 className="text-xl font-black tracking-tighter flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
            <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="Emblem" className="h-6 opacity-90" />
          </div>
          <span className="text-[#F5F7FA]">MP<span className="text-[#FF9933]"> Connect</span></span>
        </h1>
        <p className="text-[10px] text-white/70 mt-3 uppercase tracking-[0.28em] font-bold">{user.role} Portal</p>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto relative">
        {currentNav.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all relative group ${location.pathname === item.path ? 'bg-white/12 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] font-bold border border-white/12' : 'text-white/72 hover:bg-white/7 hover:text-white font-medium border border-transparent'
              }`}
          >
            {location.pathname === item.path && (
              <motion.div
                layoutId="activeNav"
                className="absolute left-0 top-2 bottom-2 w-1.5 bg-[#FF9933] rounded-r-full"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <item.icon className={`w-5 h-5 ${location.pathname === item.path ? 'text-[#FF9933]' : 'text-white/50 group-hover:text-white/85'}`} />
            <span className="tracking-wide text-sm">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-white/10 bg-black/10 backdrop-blur-sm relative">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center shadow-inner">
            <Users className="w-5 h-5 text-white/80" />
          </div>
          <div className="truncate">
            <p className="text-sm font-semibold truncate text-white">{user.name}</p>
            <p className="text-xs text-white/60 truncate">{user.constituency || 'Northeast Delhi'}</p>
          </div>
        </div>
        <button
          onClick={() => {
            logout();
            navigate('/');
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#ffd4d4] hover:bg-red-400/10 border border-white/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
};
