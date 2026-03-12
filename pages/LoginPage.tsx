
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/UI/Button';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { UserRole } from '../types';
import { 
  Shield, 
  User, 
  Users, 
  Briefcase, 
  Layers, 
  Mail, 
  Lock, 
  ArrowRight, 
  Smartphone, 
  Fingerprint,
  ChevronLeft,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';

interface LoginPageProps {
  portalType: 'citizen' | 'official';
}

export const LoginPage: React.FC<LoginPageProps> = ({ portalType }) => {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  
  // States
  const [isLogin, setIsLogin] = useState(true);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [step, setStep] = useState(1); 
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false);

  // Filter roles based on portal type
  const roleConfigs = [
    { role: UserRole.MP, label: 'Member of Parliament', icon: Shield, desc: 'Constituency Control', type: 'official' },
    { role: UserRole.PA, label: 'Personal Assistant', icon: Briefcase, desc: 'Protocol & Scheduling', type: 'official' },
    { role: UserRole.STAFF, label: 'Office Staff', icon: Layers, desc: 'Operations & Verification', type: 'official' },
    { role: UserRole.CITIZEN, label: 'Constituent Portal', icon: Users, desc: 'Grievances & Services', type: 'citizen' },
  ].filter(cfg => cfg.type === portalType);

  // If there's only one role (citizen portal), skip role selection step
  useEffect(() => {
    if (portalType === 'citizen') {
      setSelectedRole(UserRole.CITIZEN);
      setStep(2);
    } else {
      setSelectedRole(null);
      setStep(1);
    }
  }, [portalType]);

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setStep(2);
  };

  const handleAction = async () => {
    if (!selectedRole) return;
    setError('');
    setIsLoading(true);

    if (isLogin) {
      const result = await login(email, password);
      if (result.error) {
        setError(result.error);
        setIsLoading(false);
        return;
      }
      // Use the actual DB role for redirect — fall back to selected role if not returned
      const role = result.role ?? selectedRole;
      const redirectPath =
        role === UserRole.MP ? '/mp' :
        role === UserRole.PA ? '/pa' :
        role === UserRole.STAFF ? '/staff' :
        '/citizen';
      navigate(redirectPath);
      setIsLoading(false);
    } else {
      const result = await signup(email, password, fullName, selectedRole);
      if (result.error) {
        setError(result.error);
        setIsLoading(false);
        return;
      }
      setIsLoading(false);
      if (result.needsEmailConfirmation) {
        // Email confirmation still enabled in Supabase — show tick, switch to sign in
        setSignupSuccess(true);
        setTimeout(() => {
          setSignupSuccess(false);
          setIsLogin(true);
          setPassword('');
        }, 2500);
      } else {
        // Auto-logged in after signup — navigate directly to dashboard
        const redirectPath =
          selectedRole === UserRole.MP ? '/mp' :
          selectedRole === UserRole.PA ? '/pa' :
          selectedRole === UserRole.STAFF ? '/staff' :
          '/citizen';
        navigate(redirectPath);
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, staggerChildren: 0.1 }
    },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden font-['Plus_Jakarta_Sans'] transition-colors duration-700 ${portalType === 'official' ? 'bg-slate-950' : 'bg-[#fcfdfe]'}`}>
      
      {/* Dynamic Background Orbs */}
      {portalType === 'citizen' ? (
        <>
          <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-indigo-50/50 rounded-full blur-[120px] -z-10" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-indigo-100/30 rounded-full blur-[120px] -z-10" />
        </>
      ) : (
        <>
          <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-indigo-900/20 rounded-full blur-[120px] -z-10" />
          <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-slate-900/40 rounded-full blur-[120px] -z-10" />
        </>
      )}

      <motion.div
        key={portalType}
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-[1000px] bg-white rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)] border border-slate-100 overflow-hidden flex flex-col md:flex-row min-h-[650px]"
      >
        {/* Left Side: Brand & Context */}
        <div className={`md:w-5/12 p-12 text-white flex flex-col justify-between relative overflow-hidden transition-colors duration-500 ${portalType === 'official' ? 'bg-indigo-950' : 'bg-slate-900'}`}>
          <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none" 
               style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #4f46e5 1px, transparent 0)', backgroundSize: '24px 24px' }} />
          
          <div className="relative z-10">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-2xl mb-8 shadow-xl ${portalType === 'official' ? 'bg-slate-900 shadow-indigo-500/20' : 'bg-indigo-600 shadow-indigo-900/50'}`}>MC</div>
            <h1 className="text-4xl font-black tracking-tighter mb-4">
              {portalType === 'citizen' ? 'Citizen Connect' : 'Official Portal'}
            </h1>
            <p className="text-slate-400 font-medium leading-relaxed">
              {portalType === 'citizen' 
                ? 'Your direct line to transparent governance. Submit grievances and track local development projects.'
                : 'Secure administrative access for the Hon. Member of Parliament and authorized office executives.'}
            </p>
          </div>

          <div className="relative z-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm font-bold">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-indigo-400">
                  <Fingerprint className="w-4 h-4" />
                </div>
                {portalType === 'citizen' ? 'Secure Citizen ID Verification' : 'Biometric & Encrypted Access'}
              </div>
              <div className="flex items-center gap-3 text-sm font-bold">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-green-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                Authorized GovTech Network
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Action Forms */}
        <div className="md:w-7/12 p-8 md:p-16 flex flex-col relative bg-white">
          {/* Header Toggle */}
          <div className="flex justify-between items-center mb-12">
            <div className="bg-slate-100 p-1 rounded-2xl flex">
              <button 
                onClick={() => { setIsLogin(true); setStep(portalType === 'citizen' ? 2 : 1); setError(''); setSignupSuccess(false); }}
                className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${isLogin ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Sign In
              </button>
              <button 
                onClick={() => { setIsLogin(false); setStep(portalType === 'citizen' ? 2 : 1); setError(''); setSignupSuccess(false); }}
                className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${!isLogin ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Sign Up
              </button>
            </div>
            {step === 2 && portalType === 'official' && (
              <button 
                onClick={() => setStep(1)}
                className="flex items-center gap-1 text-xs font-black text-slate-400 hover:text-indigo-600 transition-colors uppercase tracking-widest"
              >
                <ChevronLeft className="w-4 h-4" /> Back to roles
              </button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {step === 1 ? (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div>
                   <div className="flex items-center gap-2 mb-2">
                      <ShieldAlert className="w-4 h-4 text-indigo-600" />
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Authorized Access Only</span>
                   </div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                    {isLogin ? 'Officer Login' : 'Register Official'}
                  </h2>
                  <p className="text-slate-500 font-medium mt-1">Choose your administrative designation</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {roleConfigs.map((cfg) => (
                    <motion.button
                      key={cfg.role}
                      variants={itemVariants}
                      whileHover={{ x: 8 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleRoleSelect(cfg.role)}
                      className={`group flex items-center p-6 rounded-3xl border-2 transition-all text-left relative ${
                        selectedRole === cfg.role 
                          ? 'border-indigo-600 bg-indigo-50/50 shadow-indigo-100 shadow-lg' 
                          : 'border-slate-100 hover:border-indigo-200 bg-white shadow-sm'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-6 transition-colors ${
                        selectedRole === cfg.role ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 group-hover:bg-indigo-100 group-hover:text-indigo-600'
                      }`}>
                        <cfg.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 text-base tracking-tight">{cfg.label}</h4>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wide mt-0.5">{cfg.desc}</p>
                      </div>
                      <ArrowRight className="ml-auto w-5 h-5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`px-3 py-1 text-[10px] font-black uppercase rounded-lg tracking-widest ${portalType === 'official' ? 'bg-indigo-100 text-indigo-700' : 'bg-green-100 text-green-700'}`}>
                      {selectedRole === UserRole.CITIZEN ? 'Public Access' : `${selectedRole} Access`}
                    </div>
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                    {isLogin ? 'Identity Verification' : 'Account Details'}
                  </h2>
                </div>

                {signupSuccess ? (
                  <motion.div
                    key="signup-success"
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-16 space-y-5"
                  >
                    <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-12 h-12 text-green-500" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Account Created!</h3>
                    <p className="text-sm font-medium text-slate-500 text-center">Taking you to sign in...</p>
                  </motion.div>
                ) : (
                <div className="space-y-5">
                  {!isLogin && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                        {portalType === 'citizen' ? 'Full Legal Name' : 'Full Official Name'}
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="text" 
                          placeholder={portalType === 'citizen' ? "e.g. Rahul Sharma" : "Hon. Officer Name"}
                          value={fullName}
                          onChange={e => setFullName(e.target.value)}
                          className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="email" 
                        placeholder={portalType === 'official' ? "office@gov.in" : "citizen@email.com"}
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secure Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="password" 
                        placeholder="••••••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                  </div>

                  {!isLogin && portalType === 'citizen' && (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mobile Number (OTP)</label>
                      <div className="relative">
                        <Smartphone className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                          type="tel" 
                          placeholder="+91 9XXXX XXXXX"
                          className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
                        />
                      </div>
                    </div>
                  )}

                  {error && (
                    <p className="text-xs font-bold text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                      {error}
                    </p>
                  )}

                  <Button 
                    fullWidth 
                    size="lg" 
                    className={`h-14 rounded-2xl shadow-xl mt-4 ${portalType === 'official' ? 'bg-indigo-950 shadow-indigo-200' : 'bg-indigo-600 shadow-indigo-100'}`} 
                    onClick={handleAction}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {isLogin ? 'Validating Identity...' : 'Creating Account...'}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {isLogin ? 'Enter Portal' : 'Create My Account'}
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    )}
                  </Button>
                </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-auto pt-8 flex items-center justify-between">
            <button 
              onClick={() => navigate('/')}
              className="text-[10px] font-black text-slate-300 hover:text-slate-600 transition-colors uppercase tracking-widest"
            >
              Back to landing
            </button>
            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
              NIC • GOV-SECURE v4.1
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
