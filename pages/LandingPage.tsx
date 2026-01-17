
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '../components/UI/Button';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Users, Globe, BarChart3 } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">MC</div>
          <span className="text-xl font-extrabold tracking-tighter text-slate-900">MPConnect</span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/login')}>Sign In</Button>
          <Button onClick={() => navigate('/login')}>Citizen Portal</Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-8 pt-20 pb-32 max-w-7xl mx-auto text-center overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-4 py-1.5 mb-6 text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-full">
            The Digital Bridge for Modern Governance
          </span>
          <h1 className="text-6xl md:text-7xl font-extrabold text-slate-900 mb-6 tracking-tight">
            Connecting Representatives <br /> <span className="text-indigo-600">to the People.</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed">
            A unified constituency management ecosystem designed to empower Members of Parliament with actionable data and offer citizens a transparent grievance redressal channel.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="px-10" onClick={() => navigate('/login')}>Get Started as MP/PA</Button>
            <Button size="lg" variant="outline" className="px-10" onClick={() => navigate('/login')}>Citizen Services</Button>
          </div>
        </motion.div>

        {/* Mock Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-20 rounded-2xl border border-slate-200 shadow-2xl overflow-hidden bg-slate-50 p-4"
        >
           <img 
            src="https://picsum.photos/seed/mp-connect/1200/600" 
            alt="Dashboard Preview" 
            className="rounded-lg shadow-sm"
          />
        </motion.div>
      </section>

      {/* Features */}
      <section className="bg-slate-50 py-24 px-8">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12 text-center">
          <div className="space-y-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto text-indigo-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Secure Governance</h3>
            <p className="text-slate-600">Enterprise-grade security ensuring data privacy and role-based access control.</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto text-indigo-600">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Actionable Analytics</h3>
            <p className="text-slate-600">Track fund utilization, project progress, and public sentiment in real-time.</p>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto text-indigo-600">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Citizen Centric</h3>
            <p className="text-slate-600">Direct channel for grievances, transparent tracking, and local development updates.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
