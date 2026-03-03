
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight, 
  Send, 
  MoreVertical,
  X,
  UserCheck,
  Building
} from 'lucide-react';
import { Letter } from '../../types';

const mockLetters: Letter[] = [
  { id: 'LT-2024-001', subject: 'Establishment of Primary Health Center', recipient: 'Ministry of Health', recipientType: 'Ministry', status: 'Pending Approval', type: 'Recommendation', createdAt: '2024-05-20', updatedAt: '2024-05-21' },
  { id: 'LT-2024-002', subject: 'Enquiry on Road Allotment NH-24', recipient: 'NHAI Regional Office', recipientType: 'Local Authority', status: 'Sent', type: 'Enquiry', createdAt: '2024-05-18', updatedAt: '2024-05-19' },
  { id: 'LT-2024-003', subject: 'Scholarship Recommendation - Rahul S.', recipient: 'Director of Education', recipientType: 'Local Authority', status: 'Draft', type: 'Recommendation', createdAt: '2024-05-21', updatedAt: '2024-05-21' },
];

export const LettersPaPage: React.FC = () => {
  const [showDraftModal, setShowDraftModal] = useState(false);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Correspondence Tracker</h2>
          <p className="text-slate-500 font-medium">Manage letters, recommendations, and official enquiry cycles.</p>
        </div>
        <Button onClick={() => setShowDraftModal(true)} className="rounded-2xl shadow-lg shadow-indigo-100">
          <Plus className="w-5 h-5 mr-2" /> Draft New Letter
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-slate-200">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sent (Monthly)</p>
          <h4 className="text-3xl font-black text-slate-900 mt-2">42</h4>
          <p className="text-green-600 text-[10px] font-bold mt-2 flex items-center gap-1"><ArrowUpRight className="w-3 h-3" /> +12% from April</p>
        </Card>
        <Card className="border-slate-200">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg. Response Time</p>
          <h4 className="text-3xl font-black text-slate-900 mt-2">14 Days</h4>
          <p className="text-slate-400 text-[10px] font-bold mt-2">Target: 10 Days</p>
        </Card>
        <Card className="border-slate-200">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Awaiting MP Sig.</p>
          <h4 className="text-3xl font-black text-indigo-600 mt-2">08</h4>
          <p className="text-indigo-400 text-[10px] font-bold mt-2 italic font-medium">Updated 1h ago</p>
        </Card>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search by ID, recipient or subject..." className="w-full pl-11 pr-4 py-3.5 text-sm bg-slate-50 border border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl transition-all outline-none" />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button variant="outline" size="sm" className="rounded-xl"><Filter className="w-4 h-4 mr-2" /> Filter Status</Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-slate-400 uppercase text-[10px] font-black tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-8 py-5">Letter Details</th>
                <th className="px-8 py-5">Recipient</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Last Activity</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockLetters.map((letter) => (
                <tr key={letter.id} className="hover:bg-indigo-50/30 transition-colors group cursor-pointer">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                       <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                         letter.type === 'Recommendation' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-500'
                       }`}>
                          <FileText className="w-5 h-5" />
                       </div>
                       <div>
                          <p className="font-black text-slate-900 leading-tight">{letter.subject}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{letter.id} • {letter.type}</p>
                       </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                       <Building className="w-3 h-3 text-slate-400" />
                       <span className="text-xs font-bold text-slate-700">{letter.recipient}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">{letter.recipientType}</span>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg flex items-center gap-1.5 w-fit ${
                      letter.status === 'Sent' ? 'bg-green-100 text-green-700' : 
                      letter.status === 'Pending Approval' ? 'bg-orange-100 text-orange-700' : 
                      letter.status === 'Draft' ? 'bg-slate-100 text-slate-500' : 'bg-indigo-100 text-indigo-700'
                    }`}>
                      {letter.status === 'Sent' ? <Send className="w-3 h-3" /> : 
                       letter.status === 'Pending Approval' ? <UserCheck className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {letter.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-xs font-bold text-slate-500">{letter.updatedAt}</td>
                  <td className="px-8 py-5 text-right">
                    <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-300 hover:text-indigo-600 transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showDraftModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowDraftModal(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden">
               <div className="p-10">
                  <div className="flex justify-between items-center mb-8">
                     <h3 className="text-2xl font-black text-slate-900">Draft New Correspondence</h3>
                     <button onClick={() => setShowDraftModal(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X className="w-6 h-6" /></button>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Letter Type</label>
                          <select className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm">
                             <option>Recommendation Letter</option>
                             <option>Ministry Enquiry</option>
                             <option>Constituent Response</option>
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Office</label>
                          <input type="text" placeholder="e.g. Ministry of Railways" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm" />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject Line</label>
                       <input type="text" placeholder="Regarding the expansion of..." className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-sm" />
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Letter Body Content</label>
                       <textarea rows={6} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-medium text-sm resize-none" placeholder="I am writing to bring your attention to..."></textarea>
                    </div>

                    <div className="flex gap-4 pt-4">
                       <Button variant="ghost" fullWidth onClick={() => setShowDraftModal(false)}>Save Draft</Button>
                       <Button fullWidth onClick={() => setShowDraftModal(false)}>Send to MP for Approval</Button>
                    </div>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
