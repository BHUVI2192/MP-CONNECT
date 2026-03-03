
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { 
  Building2, 
  ShieldCheck, 
  MapPin, 
  Search, 
  Filter, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  X,
  ArrowRight,
  ClipboardList
} from 'lucide-react';
import { Complaint } from '../../types';

const mockVerified: Complaint[] = [
  { id: 'CMP-8821', citizenName: 'Aman Varma', category: 'Water Supply', location: 'West Enclave', status: 'Verified', createdAt: '2024-05-20', description: 'Severe water shortage for 48 hours.', priority: 'High', staffNotes: 'Verification complete. Images confirmed. Requires Jal Board intervention.' },
  { id: 'CMP-9122', citizenName: 'Suresh Raina', category: 'Electricity', location: 'Sector 4', status: 'Verified', createdAt: '2024-05-18', description: 'Fluctuating voltage damaging appliances.', priority: 'Medium', staffNotes: 'Verified video of sparks. Power grid issue suspected.' },
];

export const ComplaintsPaPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Pending Dispatch');
  const [selectedForDispatch, setSelectedForDispatch] = useState<Complaint | null>(null);

  const departments = ['Municipal Corporation', 'Jal Board (Water)', 'Discom (Electricity)', 'PWD (Roads)', 'Health Dept.', 'Education Dept.'];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter text-indigo-600">Departmental Dispatch</h2>
          <p className="text-slate-500 font-medium">Assign validated citizen grievances to the correct executive bodies.</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="rounded-xl"><ClipboardList className="w-4 h-4 mr-2" /> Assignment History</Button>
        </div>
      </header>

      <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit">
        {['Pending Dispatch', 'Dispatched', 'Follow-up Needed'].map((t) => (
          <button 
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === t ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:bg-white/50'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
         {mockVerified.map((item, idx) => (
           <motion.div key={item.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
              <Card className="hover:border-indigo-200 border-slate-200 group relative">
                 <div className="flex flex-col lg:flex-row gap-8">
                    <div className="flex-1">
                       <div className="flex items-center gap-3 mb-4">
                          <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
                             <ShieldCheck className="w-6 h-6" />
                          </div>
                          <div>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.id} • Verified by Staff</p>
                             <h4 className="text-xl font-black text-slate-900">{item.citizenName}</h4>
                          </div>
                          <span className={`ml-auto text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                             item.priority === 'High' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'
                          }`}>{item.priority} Urgency</span>
                       </div>

                       <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                             <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Citizen's Statement</p>
                                <p className="text-sm font-medium text-slate-700 italic">"{item.description}"</p>
                             </div>
                             <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                                <MapPin className="w-4 h-4 text-indigo-400" /> {item.location} • {item.category}
                             </div>
                          </div>
                          <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                             <p className="text-[10px] font-black text-indigo-600 uppercase mb-2">Internal Staff Notes</p>
                             <p className="text-sm font-bold text-slate-700">{item.staffNotes}</p>
                          </div>
                       </div>
                    </div>

                    <div className="lg:w-72 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-slate-100 pt-6 lg:pt-0 lg:pl-8">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Final Assignment</p>
                       <Button fullWidth size="lg" className="rounded-2xl h-14" onClick={() => setSelectedForDispatch(item)}>
                          <Building2 className="w-5 h-5 mr-2" /> Assign Dept.
                       </Button>
                    </div>
                 </div>
              </Card>
           </motion.div>
         ))}
      </div>

      {/* Dispatch Modal */}
      <AnimatePresence>
        {selectedForDispatch && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setSelectedForDispatch(null)} />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 30 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
               <div className="p-10">
                  <div className="flex justify-between items-center mb-10">
                     <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Departmental Dispatch</h3>
                        <p className="text-sm text-slate-500 font-medium">Assigning ID: {selectedForDispatch.id}</p>
                     </div>
                     <button onClick={() => setSelectedForDispatch(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X className="w-6 h-6" /></button>
                  </div>

                  <div className="space-y-6">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Department</label>
                        <select className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500">
                           <option>Select Responsible Department</option>
                           {departments.map(d => <option key={d}>{d}</option>)}
                        </select>
                     </div>

                     <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PA Instructions to Dept.</label>
                        <textarea rows={4} className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none resize-none" placeholder="Requesting immediate resolution for the citizen. Please update status by EOD..."></textarea>
                     </div>

                     <div className="flex gap-4 pt-4">
                        <Button variant="ghost" fullWidth onClick={() => setSelectedForDispatch(null)}>Cancel</Button>
                        <Button fullWidth size="lg" className="rounded-2xl" onClick={() => setSelectedForDispatch(null)}>
                           Dispatch to Department <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                     </div>
                  </div>
               </div>
               <div className="bg-indigo-600 px-10 py-4 flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                     <Clock className="w-4 h-4 text-indigo-300" />
                     <p className="text-[10px] font-black uppercase">Auto-tracking Enabled</p>
                  </div>
                  <p className="text-[10px] font-black uppercase">MP Alerted on Dispatch</p>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
