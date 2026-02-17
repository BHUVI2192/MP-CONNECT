
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../components/UI/Button';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Users, Globe, BarChart3, Lock, ArrowRight } from 'lucide-react';

const fadeInUp = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-100px" },
  transition: { duration: 0.8, ease: [0.21, 0.47, 0.32, 0.98] }
};

const staggerContainer = {
  initial: {},
  whileInView: {
    transition: {
      staggerChildren: 0.2
    }
  },
  viewport: { once: true }
};

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white font-['Plus_Jakarta_Sans'] overflow-x-hidden">
      {/* Background Decorative Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-indigo-50/40 rounded-full blur-[120px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1.2, 1, 1.2],
            x: [0, -50, 0],
            y: [0, -30, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-50/40 rounded-full blur-[120px]" 
        />
      </div>

      {/* Header */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-8 py-4 max-w-7xl mx-auto mt-4 rounded-full shadow-sm"
      >
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-200">MC</div>
          <span className="text-xl font-extrabold tracking-tighter text-slate-900">MPConnect</span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="text-slate-500 hover:text-indigo-600 font-bold flex items-center gap-2 text-sm" onClick={() => navigate('/official/secure-access')}>
            <Lock className="w-4 h-4" /> Official Gateway
          </Button>
          <Button className="rounded-xl px-6 font-bold text-sm shadow-md" onClick={() => navigate('/login')}>Citizen Portal</Button>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative px-8 pt-24 pb-32 max-w-7xl mx-auto text-center">
        <motion.div
          initial="initial"
          whileInView="whileInView"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.span 
            variants={fadeInUp}
            className="inline-block px-4 py-1.5 mb-8 text-xs font-black uppercase tracking-[0.2em] text-indigo-600 bg-indigo-50 rounded-full border border-indigo-100/50"
          >
            Digital Governance v4.1
          </motion.span>
          
          <motion.h1 
            variants={fadeInUp}
            className="text-6xl md:text-8xl font-[900] text-slate-950 mb-8 tracking-[-0.04em] leading-[0.95]"
          >
            Smarter Governance for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-500">Modern India.</span>
          </motion.h1>

          <motion.p 
            variants={fadeInUp}
            className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed font-medium"
          >
            A mission-critical ecosystem bridging the gap between representatives and constituents through real-time data, transparency, and rapid response.
          </motion.p>

          <motion.div 
            variants={fadeInUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Button size="lg" className="px-12 rounded-[1.25rem] h-16 text-lg font-black shadow-2xl shadow-indigo-200 group" onClick={() => navigate('/login')}>
              Get Started <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <button 
              onClick={() => navigate('/official/secure-access')}
              className="text-slate-400 hover:text-slate-900 font-black text-sm uppercase tracking-widest transition-colors p-4"
            >
              Government Authorization
            </button>
          </motion.div>
        </motion.div>

        {/* 3D Dashboard Mockup Preview */}
        <motion.div
          initial={{ opacity: 0, y: 100, rotateX: 20, scale: 0.9 }}
          whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          viewport={{ once: true, margin: "-100px" }}
          style={{ perspective: "2000px" }}
          className="mt-24 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-500/20 to-transparent blur-[120px] -z-10 rounded-full opacity-50 scale-75" />
          <div className="rounded-[3rem] border border-slate-200 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] overflow-hidden bg-white p-2">
            <div className="bg-slate-50 rounded-[2.5rem] overflow-hidden border border-slate-100">
               <img 
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2426" 
                alt="Dashboard Preview" 
                className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-700"
              />
            </div>
          </div>

          {/* Floating UI Badges */}
          <motion.div 
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-12 -left-12 bg-white p-6 rounded-3xl shadow-2xl border border-slate-100 hidden lg:block"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resolution Rate</p>
                <p className="text-2xl font-black text-slate-900">98.2%</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -bottom-10 -right-10 bg-slate-900 p-6 rounded-3xl shadow-2xl border border-slate-800 hidden lg:block"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white">
                <Globe className="w-6 h-6" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Live Connectivity</p>
                <p className="text-2xl font-black text-white">Active</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="bg-slate-50/50 py-32 px-8 border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial="initial"
            whileInView="whileInView"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              { 
                icon: ShieldCheck, 
                title: "Secure Governance", 
                desc: "Military-grade encryption for all constituent data and departmental communications." 
              },
              { 
                icon: BarChart3, 
                title: "Actionable Intelligence", 
                desc: "Real-time fund tracking and sentiment analysis for informed legislative decisions." 
              },
              { 
                icon: Users, 
                title: "Constituent Centric", 
                desc: "Transparent grievance redressal pipeline with automated status tracking for citizens." 
              },
            ].map((feature, idx) => (
              <motion.div 
                key={idx}
                variants={fadeInUp}
                className="group p-10 bg-white rounded-[2.5rem] border border-slate-200 hover:border-indigo-400 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 text-left"
              >
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-slate-950 mb-4 tracking-tight">{feature.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Trust & Compliance Footer */}
      <footer className="py-24 px-8 border-t border-slate-100">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all"
        >
          <div className="text-center md:text-left">
            <h4 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-6">In Compliance With</h4>
            <div className="flex flex-wrap justify-center md:justify-start gap-12 items-center">
              <span className="font-black text-xl text-slate-900 tracking-tighter">NIC-SECURE</span>
              <span className="font-black text-xl text-slate-900 tracking-tighter">DIGITAL INDIA</span>
              <span className="font-black text-xl text-slate-900 tracking-tighter">G20 PROTOCOL</span>
            </div>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 max-w-xs text-center md:text-right">
            Proprietary Technology of the Office of Member of Parliament. All rights reserved © 2024.
          </p>
        </motion.div>
      </footer>
    </div>
  );
};

const TrendingUp = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);
