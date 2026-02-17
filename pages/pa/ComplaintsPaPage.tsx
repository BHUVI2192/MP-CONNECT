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
   ClipboardList,
   FolderOutput,
   Download,
   Paperclip,
   MessageCircle
} from 'lucide-react';
import { Complaint } from '../../types';

const mockVerified: Complaint[] = [
   { id: 'CMP-8821', citizenName: 'Aman Varma', category: 'Water Supply', location: 'West Enclave', status: 'Forwarded', createdAt: '2024-05-20', description: 'Severe water shortage for 48 hours.', priority: 'High', staffNotes: 'Verification complete. Images confirmed. Requires Jal Board intervention.' },
   { id: 'CMP-9122', citizenName: 'Suresh Raina', category: 'Electricity', location: 'Sector 4', status: 'Forwarded', createdAt: '2024-05-18', description: 'Fluctuating voltage damaging appliances.', priority: 'Medium', staffNotes: 'Verified video of sparks. Power grid issue suspected.' },
];

export const ComplaintsPaPage: React.FC = () => {
   const [activeTab, setActiveTab] = useState('Forwarded');
   const [isExporting, setIsExporting] = useState(false);
   const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

   // Dispatch State
   const [dispatchForm, setDispatchForm] = useState({
      department: '',
      notes: '',
      exportType: 'Summary' as 'Summary' | 'Full Package',
      whatsappNumber: ''
   });

   const handleDispatch = () => {
      setIsExporting(true);

      // Simulate Export Process
      setTimeout(() => {
         setIsExporting(false);
         // In a real app, this would update the status locally or refetch
         alert(`Successfully Exported ${dispatchForm.exportType} to ${dispatchForm.whatsappNumber || 'Default Number'} and Dispatched to ${dispatchForm.department}`);
         setSelectedComplaint(null);
         setDispatchForm({ department: '', notes: '', exportType: 'Summary', whatsappNumber: '' });
      }, 2000);
   };

   return (
      <div className="space-y-8 pb-20">
         <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
               <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Dispatch Hub</h2>
               <p className="text-slate-500 font-medium">Route verified complaints to respective departments.</p>
            </div>
            <div className="flex gap-2">
               <Button variant="outline" className="rounded-xl px-6 font-bold"><FolderOutput className="w-4 h-4 mr-2" /> Dispatched Logs</Button>
               <Button className="rounded-xl px-6 font-bold shadow-lg shadow-indigo-100"><Download className="w-4 h-4 mr-2" /> Export Report</Button>
            </div>
         </header>

         <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit">
            {['Forwarded', 'Dispatched', 'Resolved'].map((tab) => (
               <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:bg-white/50'
                     }`}
               >
                  {tab}
               </button>
            ))}
         </div>

         <div className="grid grid-cols-1 gap-4">
            {mockVerified.filter(c => c.status === activeTab).map((complaint) => (
               <motion.div key={complaint.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <Card className="hover:border-indigo-300 transition-all cursor-pointer group border-slate-200" onClick={() => setSelectedComplaint(complaint)}>
                     <div className="p-6 flex flex-col md:flex-row gap-6 items-center">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${complaint.priority === 'High' ? 'bg-red-100 text-red-600' : 'bg-indigo-50 text-indigo-600'
                           }`}>
                           {complaint.priority === 'High' ? <AlertCircle className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
                        </div>
                        <div className="flex-1 min-w-0">
                           <div className="flex items-center gap-3 mb-1">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{complaint.id}</span>
                              <span className="text-[10px] font-black bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase">{complaint.category}</span>
                              {complaint.priority === 'High' && <span className="text-[10px] font-black bg-red-100 text-red-600 px-2 py-0.5 rounded uppercase">High Priority</span>}
                           </div>
                           <h4 className="text-xl font-bold text-slate-900 truncate">{complaint.citizenName}</h4>
                           <p className="text-sm text-slate-500 truncate">{complaint.location} • {complaint.description}</p>
                           {complaint.staffNotes && <p className="text-xs text-indigo-600 font-bold mt-1">Staff Note: {complaint.staffNotes}</p>}
                        </div>
                        <div className="flex items-center gap-4">
                           <Button size="sm" className="rounded-xl px-6">Dispatch <ArrowRight className="w-4 h-4 ml-2" /></Button>
                        </div>
                     </div>
                  </Card>
               </motion.div>
            ))}

            {mockVerified.filter(c => c.status === activeTab).length === 0 && (
               <div className="py-20 text-center">
                  <p className="text-slate-400 font-bold">No complaints in this queue.</p>
               </div>
            )}
         </div>

         <AnimatePresence>
            {selectedComplaint && (
               <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" onClick={() => setSelectedComplaint(null)} />
                  <motion.div
                     initial={{ scale: 0.95, opacity: 0 }}
                     animate={{ scale: 1, opacity: 1 }}
                     exit={{ scale: 0.95, opacity: 0 }}
                     className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-8"
                  >
                     <div className="flex justify-between items-center mb-6">
                        <div>
                           <h3 className="text-2xl font-black text-slate-900">Dispatch Action</h3>
                           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{selectedComplaint.id}</p>
                        </div>
                        <button onClick={() => setSelectedComplaint(null)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5 text-slate-400" /></button>
                     </div>

                     <div className="space-y-3">
                        <div className="space-y-0.5">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assign Department</label>
                           <select
                              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg font-bold text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                              value={dispatchForm.department}
                              onChange={(e) => setDispatchForm({ ...dispatchForm, department: e.target.value })}
                           >
                              <option value="">Select Department</option>
                              <option value="PWD">Public Works Department (PWD)</option>
                              <option value="Jal Board">Delhi Jal Board</option>
                              <option value="MCD">MCD</option>
                              <option value="Police">Delhi Police</option>
                              <option value="Health">Health Department</option>
                              <option value="Education">Education Department</option>
                           </select>
                        </div>

                        <div className="space-y-0.5">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Instructions / Remarks</label>
                           <textarea
                              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-lg font-medium text-xs outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                              rows={2}
                              placeholder="Specific instructions for the department..."
                              value={dispatchForm.notes}
                              onChange={(e) => setDispatchForm({ ...dispatchForm, notes: e.target.value })}
                           />
                        </div>

                        <div className="bg-green-50 p-3 rounded-lg border border-green-100 space-y-2">
                           <div className="flex items-center gap-2 text-green-800 font-black text-[10px] uppercase tracking-widest">
                              <MessageCircle className="w-3 h-3" /> WhatsApp Integration
                           </div>

                           <div className="grid grid-cols-2 gap-2">
                              <button
                                 className={`p-1.5 rounded-md border text-[10px] font-bold transition-all ${dispatchForm.exportType === 'Summary' ? 'bg-white border-green-500 text-green-700 shadow-sm' : 'bg-transparent border-green-200 text-green-600 hover:bg-white'}`}
                                 onClick={() => setDispatchForm({ ...dispatchForm, exportType: 'Summary' })}
                              >
                                 Summary Only
                              </button>
                              <button
                                 className={`p-1.5 rounded-md border text-[10px] font-bold transition-all ${dispatchForm.exportType === 'Full Package' ? 'bg-white border-green-500 text-green-700 shadow-sm' : 'bg-transparent border-green-200 text-green-600 hover:bg-white'}`}
                                 onClick={() => setDispatchForm({ ...dispatchForm, exportType: 'Full Package' })}
                              >
                                 Full Evidence Pkg
                              </button>
                           </div>

                           <input
                              type="text"
                              placeholder="WhatsApp Number (Optional)"
                              className="w-full px-3 py-1.5 bg-white border border-green-200 rounded-lg text-xs font-bold text-green-800 placeholder:text-green-300 outline-none focus:ring-2 focus:ring-green-500"
                              value={dispatchForm.whatsappNumber}
                              onChange={(e) => setDispatchForm({ ...dispatchForm, whatsappNumber: e.target.value })}
                           />
                        </div>

                        <Button fullWidth size="sm" className="rounded-lg shadow-lg shadow-indigo-100 mt-1" onClick={handleDispatch} disabled={isExporting || !dispatchForm.department}>
                           {isExporting ? 'Exporting...' : 'Confirm Dispatch'}
                        </Button>
                     </div>
                  </motion.div>
               </div>
            )}
         </AnimatePresence >
      </div >
   );
};
