
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import {
   Search,
   Filter,
   UserPlus,
   Send,
   CheckCircle2,
   Clock,
   AlertCircle,
   MoreVertical,
   Paperclip,
   ArrowRight,
   ShieldCheck,
   FileX,
   Eye,
   X
} from 'lucide-react';
import { Complaint } from '../../types';

import { useMockData } from '../../context/MockDataContext';

export const StaffComplaintsPage: React.FC = () => {
   const { complaints, updateComplaintStatus } = useMockData();
   const [activeFilter, setActiveFilter] = useState('New');
   const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

   // Verification State
   const [verifyForm, setVerifyForm] = useState({
      priority: 'Medium' as 'High' | 'Medium' | 'Low',
      notes: ''
   });

   const handleVerify = () => {
      if (!selectedComplaint) return;
      updateComplaintStatus(selectedComplaint.id, 'Verified', verifyForm.notes);
      setSelectedComplaint(null);
      setVerifyForm({ priority: 'Medium', notes: '' });
   };

   const handleReject = () => {
      if (!selectedComplaint) return;
      updateComplaintStatus(selectedComplaint.id, 'Rejected', verifyForm.notes);
      setSelectedComplaint(null);
      setVerifyForm({ priority: 'Medium', notes: '' });
   };

   return (
      <div className="space-y-8 max-w-6xl mx-auto pb-20">
         <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
               <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Verification Queue</h2>
               <p className="text-slate-500 font-medium">Examine citizen evidence and validate legitimacy of grievances.</p>
            </div>
            <div className="flex gap-2">
               <Button variant="outline" className="rounded-xl px-6 font-bold"><ShieldCheck className="w-4 h-4 mr-2" /> Verified Logs</Button>
            </div>
         </header>

         <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar bg-slate-100 p-1.5 rounded-2xl w-fit">
            {['New', 'Verified', 'Forwarded', 'Rejected', 'Resolved'].map((f) => (
               <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-6 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${activeFilter === f ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:bg-white/50'
                     }`}
               >
                  {f === 'New' ? 'Pending Verification' : f}
               </button>
            ))}
         </div>

         <div className="space-y-4">
            {complaints.filter(c => c.status === activeFilter).map((item, idx) => (
               <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
               >
                  <Card className="hover:border-indigo-200 transition-all group overflow-hidden border-slate-200">
                     <div className="flex flex-col lg:flex-row">
                        <div className="p-8 flex-1">
                           <div className="flex justify-between items-start mb-6">
                              <div className="space-y-1">
                                 <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{item.id}</span>
                                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${item.priority === 'High' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-600'
                                       }`}>{item.priority} Priority</span>
                                 </div>
                                 <h4 className="text-2xl font-black text-slate-900 tracking-tighter">{item.citizenName}</h4>
                                 <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">{item.category} • {item.location}</p>
                              </div>
                              <Button variant="ghost" className="rounded-xl" onClick={() => setSelectedComplaint(item)}>
                                 <Eye className="w-4 h-4 mr-2" /> Inspect Evidence
                              </Button>
                           </div>

                           <p className="text-sm text-slate-600 leading-relaxed mb-6 bg-slate-50 p-5 rounded-[2rem] border border-slate-100 italic">
                              "{item.description}"
                           </p>

                           <div className="flex gap-3">
                              {item.attachments?.map((at, i) => (
                                 <div key={i} className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden cursor-pointer hover:border-indigo-400 transition-colors">
                                    <img src={at} alt="Evidence" className="w-full h-full object-cover opacity-60 hover:opacity-100" />
                                 </div>
                              ))}
                              <div className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-slate-300">
                                 <Paperclip className="w-5 h-5" />
                              </div>
                           </div>
                        </div>

                        {item.status === 'New' && (
                           <div className="lg:w-72 bg-slate-50/50 border-t lg:border-t-0 lg:border-l border-slate-100 p-8 flex flex-col justify-center gap-3">
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center mb-2">Staff Verification Action</p>
                              <Button variant="primary" fullWidth className="rounded-2xl shadow-lg shadow-indigo-100 h-12" onClick={() => setSelectedComplaint(item)}>
                                 <Send className="w-4 h-4 mr-2" /> Verify & Forward
                              </Button>
                           </div>
                        )}
                     </div>
                  </Card>
               </motion.div>
            ))}

            {complaints.filter(c => c.status === activeFilter).length === 0 && (
               <div className="py-20 text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center mx-auto text-slate-300">
                     <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                     <h4 className="font-bold text-slate-900">No {activeFilter} Items</h4>
                     <p className="text-xs text-slate-500">There are no complaints in this category at the moment.</p>
                  </div>
               </div>
            )}
         </div>

         {/* Inspection Modal */}
         <AnimatePresence>
            {selectedComplaint && (
               <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" onClick={() => setSelectedComplaint(null)} />
                  <motion.div
                     initial={{ scale: 0.95, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     exit={{ scale: 0.95, opacity: 0 }}
                     className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[80vh]"
                  >
                     <div className="flex-1 bg-slate-900 p-10 flex flex-col">
                        <div className="flex justify-between items-center mb-8">
                           <h3 className="text-white font-black tracking-widest uppercase text-xs">Evidence Inspection Board</h3>
                           <button onClick={() => setSelectedComplaint(null)} className="text-slate-500 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
                        </div>
                        <div className="flex-1 grid grid-cols-2 gap-4 overflow-y-auto pr-4 custom-scrollbar">
                           {selectedComplaint.attachments?.map((at, i) => (
                              <div key={i} className="aspect-video bg-slate-800 rounded-3xl overflow-hidden border border-slate-700">
                                 <img src={at} alt="High Res" className="w-full h-full object-cover" />
                              </div>
                           ))}
                        </div>
                     </div>
                     <div className="w-full md:w-96 p-10 space-y-8 overflow-y-auto">
                        <div>
                           <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{selectedComplaint.id}</p>
                           <h4 className="text-2xl font-black text-slate-900 leading-tight mt-1">{selectedComplaint.citizenName}</h4>
                           <p className="text-xs text-slate-500 mt-2 font-medium">{selectedComplaint.description}</p>
                        </div>

                        <div className="space-y-3">
                           <div className="space-y-0.5">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Urgency Level</label>
                              <select
                                 className="w-full px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg font-bold text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                                 value={verifyForm.priority}
                                 onChange={(e) => setVerifyForm({ ...verifyForm, priority: e.target.value as any })}
                              >
                                 <option value="High">High - Immediate Action</option>
                                 <option value="Medium">Medium - Standard Queue</option>
                                 <option value="Low">Low - Low Priority</option>
                              </select>
                           </div>

                           <div className="space-y-0.5">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verification Notes (Internal)</label>
                              <textarea
                                 className="w-full p-2 bg-slate-50 border border-slate-100 rounded-lg text-xs font-medium outline-none h-16 resize-none"
                                 placeholder="Add verification summary for PA..."
                                 value={verifyForm.notes}
                                 onChange={(e) => setVerifyForm({ ...verifyForm, notes: e.target.value })}
                              />
                           </div>
                        </div>

                        {selectedComplaint.status === 'New' ? (
                           <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                              <Button fullWidth size="sm" className="rounded-lg" onClick={handleVerify}>
                                 Verify & Forward <ArrowRight className="w-3 h-3 ml-2" />
                              </Button>
                              <Button fullWidth variant="ghost" size="sm" className="text-red-600 rounded-lg" onClick={handleReject}>Flag as Incomplete</Button>
                           </div>
                        ) : (
                           <div className="pt-4 border-t border-slate-100">
                              <div className="p-4 bg-green-50 rounded-2xl flex items-center gap-3 text-green-700 font-bold text-sm">
                                 <CheckCircle2 className="w-5 h-5" />
                                 Already Processed
                              </div>
                           </div>
                        )}
                     </div>
                  </motion.div>
               </div>
            )}
         </AnimatePresence>
      </div>
   );
};
