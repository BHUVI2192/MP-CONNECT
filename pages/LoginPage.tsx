
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../components/UI/Button';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types';
import { Shield, User, Users, Briefcase, Layers } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const handleLogin = () => {
    if (selectedRole) {
      login(selectedRole);
      const redirectPath = 
        selectedRole === UserRole.MP ? '/mp' : 
        selectedRole === UserRole.PA ? '/pa' : 
        selectedRole === UserRole.STAFF ? '/staff' : 
        '/citizen';
      navigate(redirectPath);
    }
  };

  const roleConfigs = [
    { role: UserRole.MP, label: 'Member of Parliament', icon: Shield, desc: 'Strategy, Approvals & Analytics' },
    { role: UserRole.PA, label: 'Personal Assistant', icon: Briefcase, desc: 'Scheduling & Correspondence' },
    { role: UserRole.STAFF, label: 'Office Staff', icon: Layers, desc: 'Operations & Data Management' },
    { role: UserRole.CITIZEN, label: 'Citizen Portal', icon: Users, desc: 'Grievances & Requests' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold mx-auto mb-4 text-2xl">MC</div>
          <h2 className="text-3xl font-bold text-slate-900">Portal Login</h2>
          <p className="text-slate-500 mt-2">Choose your access level</p>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          {roleConfigs.map((cfg) => (
            <button
              key={cfg.role}
              onClick={() => setSelectedRole(cfg.role)}
              className={`w-full flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                selectedRole === cfg.role ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-slate-200'
              }`}
            >
              <div className={`p-2 rounded-lg flex-shrink-0 ${selectedRole === cfg.role ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                <cfg.icon className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <p className={`font-bold ${selectedRole === cfg.role ? 'text-indigo-900' : 'text-slate-900'}`}>{cfg.label}</p>
                <p className="text-xs text-slate-500 truncate">{cfg.desc}</p>
              </div>
            </button>
          ))}

          <Button 
            fullWidth 
            size="lg" 
            className="mt-6" 
            disabled={!selectedRole}
            onClick={handleLogin}
          >
            Authenticate
          </Button>
          
          <div className="text-center mt-6">
            <button 
              onClick={() => navigate('/')}
              className="text-sm font-medium text-slate-400 hover:text-slate-600"
            >
              Back to Main Website
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
