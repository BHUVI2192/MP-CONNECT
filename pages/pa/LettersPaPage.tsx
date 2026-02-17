
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import {
  FileText,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  X,
  Eye,
  Building,
  AlertCircle
} from 'lucide-react';
import { Letter } from '../../types';

const mockLetters: Letter[] = [
  {
    id: 'LTR-2024-001',
    type: 'Central',
    department: 'Finance',
    title: 'Request for Fund Release - JJ Cluster Development',
    content: 'Formal request for the release of pending funds...',
    status: 'Pending',
    version: 1,
    tags: ['Funds', 'Development'],
    createdAt: '2024-05-20',
    updatedAt: '2024-05-20',
    senderId: 'STAFF-001'
  },
  {
    id: 'LTR-2024-002',
    type: 'State',
    department: 'PWD',
    title: 'Road Repair Request - Sector 4',
    content: 'Urgent repair needed for the main road...',
    status: 'Completed',
    version: 2,
    tags: ['Roads', 'Urgent'],
    createdAt: '2024-05-18',
    updatedAt: '2024-05-19',
    senderId: 'STAFF-001'
  },
  {
    id: 'LTR-2024-003',
    type: 'Devotional',
    department: 'Community',
    title: 'Navratri Greeting Draft',
    content: 'Draft for community greetings...',
    status: 'Pending',
    version: 1,
    tags: ['Festival', 'Greeting'],
    createdAt: '2024-05-21',
    updatedAt: '2024-05-21',
    senderId: 'STAFF-002'
  },
];

export const LettersPaPage: React.FC = () => {
  const [letters, setLetters] = useState<Letter[]>(mockLetters);
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [activeTab, setActiveTab] = useState<'Pending' | 'Completed'>('Pending');

  const filteredLetters = letters.filter(l =>
    activeTab === 'Pending' ? l.status === 'Pending' || l.status === 'In Progress' : l.status === 'Completed'
  );

  const handleStatusUpdate = (id: string, newStatus: 'Pending' | 'In Progress' | 'Completed') => {
    setLetters(letters.map(l => l.id === id ? { ...l, status: newStatus } : l));
    setSelectedLetter(null);
  };

  const pendingCount = letters.filter(l => l.status === 'Pending').length;
  const completedCount = letters.filter(l => l.status === 'Completed').length;

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Draft Letters Review</h2>
          <p className="text-slate-500 font-medium">Review, approve, and finalize staff-drafted correspondence.</p>
        </div>
      </header>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-slate-200">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending Review</p>
          <h4 className="text-3xl font-black text-amber-500 mt-2">{pendingCount}</h4>
          <p className="text-slate-400 text-[10px] font-bold mt-2">Requires Action</p>
        </Card>
        <Card className="border-slate-200">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Completed (Month)</p>
          <h4 className="text-3xl font-black text-green-600 mt-2">{completedCount}</h4>
          <p className="text-green-600 text-[10px] font-bold mt-2 flex items-center gap-1"><ArrowUpRight className="w-3 h-3" /> +5 This Week</p>
        </Card>
        <Card className="border-slate-200">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg. Turnaround</p>
          <h4 className="text-3xl font-black text-indigo-600 mt-2">1.2 Days</h4>
          <p className="text-indigo-400 text-[10px] font-bold mt-2">Efficient</p>
        </Card>
      </div>

      {/* Main Dashboard */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden min-h-[500px]">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
          {/* Tabs */}
          <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl">
            {['Pending', 'Completed'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:bg-white/50'
                  }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-100" />
            </div>
            <Button variant="outline" size="sm" className="rounded-xl"><Filter className="w-4 h-4 mr-2" /> Filter</Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-slate-400 uppercase text-[10px] font-black tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-8 py-5">Draft Details</th>
                <th className="px-8 py-5">Department</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5">Date</th>
                <th className="px-8 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLetters.map((letter) => (
                <tr key={letter.id} className="hover:bg-indigo-50/30 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${letter.type === 'Central' ? 'bg-blue-50 text-blue-600' :
                          letter.type === 'State' ? 'bg-purple-50 text-purple-600' : 'bg-orange-50 text-orange-600'
                        }`}>
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 leading-tight">{letter.title}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">{letter.id} • {letter.type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <Building className="w-3 h-3 text-slate-400" />
                      <span className="text-xs font-bold text-slate-700">{letter.department}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg flex items-center gap-1.5 w-fit ${letter.status === 'Completed' ? 'bg-green-100 text-green-700' :
                        letter.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'
                      }`}>
                      {letter.status === 'Completed' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {letter.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-xs font-bold text-slate-500">{letter.createdAt}</td>
                  <td className="px-8 py-5 text-right">
                    <Button size="sm" variant="ghost" className="rounded-xl hover:bg-slate-100" onClick={() => setSelectedLetter(letter)}>
                      Review <Eye className="w-4 h-4 ml-2" />
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredLetters.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-8 py-12 text-center text-slate-400 font-medium">
                    No {activeTab.toLowerCase()} drafts found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {selectedLetter && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" onClick={() => setSelectedLetter(null)} />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className={`text-[10px] font-black px-2 py-1 rounded uppercase mb-2 inline-block ${selectedLetter.type === 'Central' ? 'bg-blue-100 text-blue-600' :
                        selectedLetter.type === 'State' ? 'bg-purple-100 text-purple-600' : 'bg-orange-100 text-orange-600'
                      }`}>{selectedLetter.type}</span>
                    <h3 className="text-2xl font-black text-slate-900 leading-tight">{selectedLetter.title}</h3>
                    <p className="text-xs font-bold text-slate-400 mt-1">{selectedLetter.department} • Version {selectedLetter.version}</p>
                  </div>
                  <button onClick={() => setSelectedLetter(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X className="w-6 h-6" /></button>
                </div>

                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-6">
                  <p className="text-sm font-medium text-slate-700 leading-relaxed whitespace-pre-wrap">{selectedLetter.content}</p>
                </div>

                <div className="flex items-center gap-2 mb-8">
                  {selectedLetter.tags.map(tag => (
                    <span key={tag} className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded-lg uppercase">#{tag}</span>
                  ))}
                </div>

                <div className="flex gap-4">
                  {selectedLetter.status !== 'Completed' ? (
                    <>
                      <Button variant="outline" fullWidth className="rounded-xl border-slate-200" onClick={() => setSelectedLetter(null)}>Request Changes</Button>
                      <Button fullWidth className="rounded-xl bg-green-600 hover:bg-green-700 text-white" onClick={() => handleStatusUpdate(selectedLetter.id, 'Completed')}>
                        <CheckCircle2 className="w-4 h-4 mr-2" /> Approve & Finalize
                      </Button>
                    </>
                  ) : (
                    <div className="w-full p-4 bg-green-50 text-green-700 rounded-xl text-center font-bold text-sm flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-5 h-5" /> This letter has been finalized.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
