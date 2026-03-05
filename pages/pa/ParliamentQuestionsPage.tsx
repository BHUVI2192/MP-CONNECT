import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Calendar, 
  HelpCircle, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  ArrowLeft,
  Download,
  Share2,
  PieChart,
  BarChart3,
  TrendingUp,
  User,
  Tag,
  MessageSquare
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart as RePieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as ReTooltip,
  Legend
} from 'recharts';
import { mockParliamentQuestions } from '../../mockParliament';
import { ParliamentQuestion, QuestionStatus } from '../../types';
import { Button } from '../../components/UI/Button';
import { Card } from '../../components/UI/Card';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444'];

export const ParliamentQuestionsPage: React.FC = () => {
  const [selectedQuestion, setSelectedQuestion] = useState<ParliamentQuestion | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<QuestionStatus | 'ALL'>('ALL');

  const filteredQuestions = useMemo(() => {
    return mockParliamentQuestions.filter(q => {
      const matchesSearch = q.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          q.questionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          q.ministry.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || q.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [searchQuery, statusFilter]);

  const analyticsData = {
    satisfaction: [
      { name: 'Satisfactory', value: 65 },
      { name: 'Partial', value: 25 },
      { name: 'Unsatisfactory', value: 10 },
    ],
    ministryAnswers: [
      { name: 'Railways', answered: 12, pending: 3 },
      { name: 'Health', answered: 8, pending: 5 },
      { name: 'Urban', answered: 15, pending: 2 },
      { name: 'Education', answered: 10, pending: 4 },
    ]
  };

  if (selectedQuestion) {
    return (
      <div className="max-w-6xl mx-auto pb-20">
        <button 
          onClick={() => setSelectedQuestion(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold mb-8 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back to Questions
        </button>

        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <header className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                  {selectedQuestion.questionNumber}
                </span>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  selectedQuestion.status === 'ANSWERED' ? 'bg-emerald-100 text-emerald-600' :
                  selectedQuestion.status === 'ADMITTED' ? 'bg-blue-100 text-blue-600' :
                  'bg-amber-100 text-amber-600'
                }`}>
                  {selectedQuestion.status}
                </span>
                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                  {selectedQuestion.type}
                </span>
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-tight">
                {selectedQuestion.subject}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-slate-500">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-500" />
                  <span className="font-bold">{selectedQuestion.sessionName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="w-5 h-5 text-indigo-500" />
                  <span className="font-bold">{selectedQuestion.ministry}</span>
                </div>
              </div>
            </header>

            <div className="space-y-8">
              <div className="p-10 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm space-y-8">
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Full Question Text</h4>
                  <p className="text-lg text-slate-700 font-bold leading-relaxed">{selectedQuestion.fullText}</p>
                </div>
                <div className="space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Constituency Relevance</h4>
                  <p className="text-slate-600 font-medium leading-relaxed">{selectedQuestion.constituencyRelevance}</p>
                </div>
              </div>

              {selectedQuestion.answer && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Answer Received</h3>
                  <div className="p-10 bg-emerald-50 border border-emerald-100 rounded-[2.5rem] space-y-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900">{selectedQuestion.answer.answeredBy}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Minister of {selectedQuestion.ministry.split('of ')[1]}</p>
                        </div>
                      </div>
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        selectedQuestion.answer.satisfaction === 'Satisfactory' ? 'bg-emerald-500 text-white' :
                        selectedQuestion.answer.satisfaction === 'Partial' ? 'bg-amber-500 text-white' :
                        'bg-red-500 text-white'
                      }`}>
                        {selectedQuestion.answer.satisfaction}
                      </span>
                    </div>
                    <p className="text-slate-700 font-medium leading-relaxed italic">
                      "{selectedQuestion.answer.text}"
                    </p>
                    <div className="pt-6 border-t border-emerald-100 flex items-center justify-between">
                      <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Answered on: {selectedQuestion.answer.date}</span>
                      <Button variant="ghost" size="sm" className="text-emerald-600 font-bold">View Full Document</Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-10">
            <div className="p-8 bg-indigo-50 rounded-[2.5rem] border border-indigo-100 space-y-6">
              <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest">Question Details</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400">Raised On</span>
                  <span className="text-xs font-black text-slate-700">{selectedQuestion.sessionDate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400">Expected Answer</span>
                  <span className="text-xs font-black text-slate-700">{selectedQuestion.expectedAnswerDate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-400">Priority</span>
                  <span className={`text-xs font-black ${
                    selectedQuestion.priority === 'High' ? 'text-red-600' :
                    selectedQuestion.priority === 'Medium' ? 'text-orange-600' :
                    'text-emerald-600'
                  }`}>{selectedQuestion.priority}</span>
                </div>
              </div>
              <div className="pt-6 border-t border-indigo-100">
                <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3">Tags</h5>
                <div className="flex flex-wrap gap-2">
                  {selectedQuestion.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 bg-white text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Button fullWidth size="lg" className="rounded-2xl shadow-lg shadow-indigo-100">
                <Download className="w-5 h-5 mr-2" /> Download Question
              </Button>
              <Button fullWidth variant="outline" size="lg" className="rounded-2xl">
                <Share2 className="w-5 h-5 mr-2" /> Share Link
              </Button>
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
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Parliament Questions</h2>
          <p className="text-slate-500 font-medium">Track questions raised and answers received during sessions.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full md:w-auto">
          {[
            { label: 'Raised', value: mockParliamentQuestions.length, color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Awaiting', value: mockParliamentQuestions.filter(q => q.status !== 'ANSWERED').length, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Answered', value: mockParliamentQuestions.filter(q => q.status === 'ANSWERED').length, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Deferred', value: 0, color: 'text-slate-600', bg: 'bg-slate-50' },
          ].map((stat, i) => (
            <div key={i} className={`px-6 py-4 rounded-2xl ${stat.bg} ${stat.color} text-center min-w-[120px]`}>
              <p className="text-xl font-black">{stat.value}</p>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-70">{stat.label}</p>
            </div>
          ))}
        </div>
      </header>

      {/* Analytics Section */}
      <div className="grid lg:grid-cols-2 gap-8">
        <Card className="p-8 rounded-[2.5rem] border-none shadow-sm">
          <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
            <PieChart className="w-6 h-6 text-indigo-600" /> Answer Satisfaction
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={analyticsData.satisfaction}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {analyticsData.satisfaction.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ReTooltip />
                <Legend />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-8 rounded-[2.5rem] border-none shadow-sm">
          <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-indigo-600" /> Answers by Ministry
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData.ministryAnswers}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} />
                <ReTooltip />
                <Bar dataKey="answered" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 relative">
            <Search className="w-6 h-6 absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by question number, subject, or ministry..." 
              className="w-full pl-16 pr-6 py-5 bg-white border border-slate-200 rounded-2xl text-lg font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl overflow-x-auto no-scrollbar">
            {['ALL', 'SUBMITTED', 'ADMITTED', 'ANSWERED', 'DEFERRED'].map((status) => (
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

        <div className="grid gap-4">
          {filteredQuestions.map((q, idx) => (
            <motion.div
              key={q.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => setSelectedQuestion(q)}
              className="group bg-white p-6 rounded-[2rem] border border-slate-200 hover:border-indigo-300 hover:shadow-xl transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center gap-8"
            >
              <div className="w-full md:w-64 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                    {q.questionNumber}
                  </span>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{q.type}</span>
                </div>
                <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">
                  {q.subject}
                </h3>
              </div>

              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-4 text-slate-500 text-xs font-bold">
                  <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-indigo-500" /> {q.sessionName}</div>
                  <div className="flex items-center gap-1.5"><Tag className="w-4 h-4 text-indigo-500" /> {q.ministry}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                    q.status === 'ANSWERED' ? 'bg-emerald-100 text-emerald-600' :
                    q.status === 'ADMITTED' ? 'bg-blue-100 text-blue-600' :
                    'bg-amber-100 text-amber-600'
                  }`}>
                    {q.status}
                  </span>
                  <span className="px-3 py-1 bg-slate-50 text-slate-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                    Raised 15 Days Ago
                  </span>
                </div>
              </div>

              <div className="w-10 h-10 rounded-full flex items-center justify-center text-slate-300 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all">
                <ChevronRight className="w-6 h-6" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
