import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Calendar, 
  Mail, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  ChevronRight, 
  ArrowLeft,
  Download,
  Share2,
  MoreVertical,
  MapPin,
  Tag,
  ExternalLink,
  Printer,
  FileText
} from 'lucide-react';
import { mockParliamentLetters } from '../../mockParliament';
import { ParliamentLetter, LetterStatus } from '../../types';
import { Button } from '../../components/UI/Button';
import { Card } from '../../components/UI/Card';

export const ParliamentLettersPage: React.FC = () => {
  const [selectedLetter, setSelectedLetter] = useState<ParliamentLetter | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<LetterStatus | 'ALL'>('ALL');

  const filteredLetters = useMemo(() => {
    return mockParliamentLetters.filter(letter => {
      const matchesSearch = letter.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          letter.refNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          letter.ministry.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || letter.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  const stats = [
    { label: 'Total', value: mockParliamentLetters.length, color: 'text-slate-600', bg: 'bg-slate-50' },
    { label: 'Pending', value: mockParliamentLetters.filter(l => l.status === 'SENT' || l.status === 'ACKNOWLEDGED').length, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Overdue', value: 2, color: 'text-red-600', bg: 'bg-red-50', isCritical: true },
    { label: 'Closed', value: mockParliamentLetters.filter(l => l.status === 'CLOSED').length, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ];

  if (selectedLetter) {
    return (
      <div className="max-w-6xl mx-auto pb-20">
        <button 
          onClick={() => setSelectedLetter(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold mb-8 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back to Letters
        </button>

        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <header className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                  {selectedLetter.refNumber}
                </span>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  selectedLetter.status === 'SENT' ? 'bg-blue-100 text-blue-600' :
                  selectedLetter.status === 'ACKNOWLEDGED' ? 'bg-amber-100 text-amber-600' :
                  selectedLetter.status === 'REPLIED' ? 'bg-emerald-100 text-emerald-600' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {selectedLetter.status}
                </span>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  selectedLetter.priority === 'High' ? 'bg-red-100 text-red-600' :
                  selectedLetter.priority === 'Medium' ? 'bg-orange-100 text-orange-600' :
                  'bg-emerald-100 text-emerald-600'
                }`}>
                  {selectedLetter.priority} Priority
                </span>
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-tight">
                {selectedLetter.subject}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-slate-500">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-indigo-500" />
                  <span className="font-bold">{selectedLetter.ministry}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-500" />
                  <span className="font-bold">Sent: {selectedLetter.sentDate}</span>
                </div>
              </div>
            </header>

            <div className="space-y-8">
              <div className="p-10 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm space-y-8">
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Summary</h4>
                  <p className="text-slate-600 font-medium leading-relaxed">{selectedLetter.summary}</p>
                </div>
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Constituency Relevance</h4>
                  <p className="text-slate-600 font-medium leading-relaxed">{selectedLetter.constituencyIssue}</p>
                </div>
              </div>

              {/* Visual Timeline */}
              <div className="space-y-6">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Status Timeline</h3>
                <div className="space-y-8 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
                  {selectedLetter.timeline.map((event, i) => (
                    <div key={i} className="flex gap-8 relative">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
                        i === 0 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white border-2 border-slate-100 text-slate-400'
                      }`}>
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{event.date}</p>
                        <p className="font-bold text-slate-900">{event.status}</p>
                        {event.note && <p className="text-sm text-slate-500 font-medium">{event.note}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-10">
            {/* Document Viewer */}
            <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 text-center space-y-6">
              <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center mx-auto shadow-sm">
                <FileText className="w-10 h-10 text-indigo-600" />
              </div>
              <div>
                <h4 className="text-lg font-black text-slate-900">Letter Document</h4>
                <p className="text-xs text-slate-400 font-bold uppercase mt-1">PDF ΓÇó 2.4 MB</p>
              </div>
              <div className="flex gap-2">
                <Button fullWidth variant="outline" className="rounded-xl"><Download className="w-4 h-4 mr-2" /> Download</Button>
                <Button fullWidth variant="outline" className="rounded-xl"><Printer className="w-4 h-4 mr-2" /> Print</Button>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-4">
              <Button fullWidth size="lg" className="rounded-2xl shadow-lg shadow-indigo-100">Update Status</Button>
              <Button fullWidth variant="outline" size="lg" className="rounded-2xl text-emerald-600 border-emerald-100 hover:bg-emerald-50">Close / Resolve</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-20 space-y-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Parliament Letters</h2>
          <p className="text-slate-500 font-medium">Track all correspondence with ministries and departments.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full md:w-auto">
          {stats.map((stat, i) => (
            <div key={i} className={`px-6 py-4 rounded-2xl ${stat.bg} ${stat.color} text-center min-w-[120px]`}>
              <p className="text-xl font-black">{stat.value}</p>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-70">{stat.label}</p>
            </div>
          ))}
        </div>
      </header>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 relative">
          <Search className="w-6 h-6 absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by subject, ref number, or ministry..." 
            className="w-full pl-16 pr-6 py-5 bg-white border border-slate-200 rounded-2xl text-lg font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl overflow-x-auto no-scrollbar">
          {['ALL', 'SENT', 'ACKNOWLEDGED', 'REPLIED', 'CLOSED'].map((status) => (
            <button 
              key={status}
              onClick={() => setStatusFilter(status as any)}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                statusFilter === status ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:bg-white/50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Letters List */}
      <div className="grid gap-4">
        {filteredLetters.map((letter, idx) => (
          <motion.div
            key={letter.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => setSelectedLetter(letter)}
            className="group bg-white p-6 rounded-[2rem] border border-slate-200 hover:border-indigo-300 hover:shadow-xl transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center gap-8"
          >
            <div className="w-full md:w-64 space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest">
                  {letter.refNumber}
                </span>
                <div className={`w-2 h-2 rounded-full ${
                  letter.priority === 'High' ? 'bg-red-500' :
                  letter.priority === 'Medium' ? 'bg-orange-500' :
                  'bg-emerald-500'
                }`} />
              </div>
              <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">
                {letter.subject}
              </h3>
            </div>

            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-4 text-slate-500 text-xs font-bold">
                <div className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-indigo-500" /> {letter.ministry}</div>
                <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-indigo-500" /> Sent: {letter.sentDate}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  letter.status === 'SENT' ? 'bg-blue-100 text-blue-600' :
                  letter.status === 'ACKNOWLEDGED' ? 'bg-amber-100 text-amber-600' :
                  letter.status === 'REPLIED' ? 'bg-emerald-100 text-emerald-600' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {letter.status}
                </span>
                <span className="px-3 py-1 bg-slate-50 text-slate-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                  12 Days Elapsed
                </span>
                {idx === 0 && (
                  <span className="px-3 py-1 bg-red-50 text-red-600 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
                    OVERDUE
                  </span>
                )}
              </div>
            </div>

            <div className="w-10 h-10 rounded-full flex items-center justify-center text-slate-300 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all">
              <ChevronRight className="w-6 h-6" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
