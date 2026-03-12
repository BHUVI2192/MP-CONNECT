import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  ChevronRight, 
  ArrowUpRight,
  Download,
  Filter,
  Search,
  Mail,
  MessageSquare
} from 'lucide-react';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { parliamentApi } from '../../hooks/useParliament';
import { ParliamentLetter, ParliamentQuestion } from '../../types';
import { useNavigate } from 'react-router-dom';

export const ParliamentTrackerPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'letters' | 'questions' | 'answers'>('letters');
  const [letters, setLetters] = useState<ParliamentLetter[]>([]);
  const [questions, setQuestions] = useState<ParliamentQuestion[]>([]);
  const [overdueLettersCount, setOverdueLettersCount] = useState(0);
  useEffect(() => {
    parliamentApi.getLetters().then(({ data }: any) => {
      if (data) setLetters(data.map((r: any) => ({
        id: r.letter_id, refNumber: r.ref_number ?? '', subject: r.subject,
        ministry: r.ministry, department: r.department ?? '', addressedTo: r.addressed_to ?? '',
        type: r.type ?? 'Request', priority: r.priority ?? 'Medium',
        sentDate: r.sent_date ?? '', expectedResponseDate: r.expected_response_date ?? '',
        summary: r.summary ?? '', constituencyIssue: r.constituency_issue ?? '',
        status: r.status, timeline: r.timeline ?? [],
      })));
    });
    parliamentApi.getQuestions().then(({ data }: any) => {
      if (data) setQuestions(data.map((r: any) => ({
        id: r.id, questionNumber: r.question_number ?? '', type: r.type ?? 'Unstarred',
        subject: r.subject, ministry: r.ministry ?? '', status: r.status,
        priority: r.priority ?? 'Medium', tags: r.tags ?? [],
        sessionName: r.session_name ?? '', sessionDate: r.session_date ?? '',
      })));
    });
    parliamentApi.getOverdueLetters().then(({ data }: any) => {
      setOverdueLettersCount((data ?? []).length);
    });
  }, []);

  const stats = [
    { label: 'Total Letters Sent', value: letters.length, icon: Mail, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Pending Replies', value: letters.filter(l => l.status !== 'REPLIED' && l.status !== 'CLOSED').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Questions Raised', value: questions.length, icon: HelpCircle, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Questions Answered', value: questions.filter(q => q.status === 'ANSWERED').length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Overdue Letters', value: overdueLettersCount, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', isCritical: true },
  ];

  const recentActivity = useMemo(() => {
    const letterItems = letters.map((letter) => ({
      id: `letter-${letter.id}`,
      type: 'letter',
      title: letter.subject,
      date: letter.sentDate,
      status: letter.status,
      color: 'border-blue-500',
      path: '/pa/parliament/letters',
    }));

    const questionItems = questions.map((question) => ({
      id: `question-${question.id}`,
      type: 'question',
      title: question.subject,
      date: question.sessionDate,
      status: question.status,
      color: question.status === 'ANSWERED' ? 'border-emerald-500' : 'border-indigo-500',
      path: '/pa/parliament/questions',
    }));

    return [...letterItems, ...questionItems]
      .filter((item) => item.date)
      .sort((left, right) => right.date.localeCompare(left.date))
      .slice(0, 6);
  }, [letters, questions]);

  const exportParliamentReport = () => {
    const blob = new Blob([JSON.stringify({ letters, questions }, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'parliament-report.json';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto pb-20 space-y-10">
      <header>
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Parliament Tracker</h2>
        <p className="text-slate-500 font-medium">Monitor letters, questions, and parliamentary engagements.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className={`p-6 rounded-3xl border-none shadow-sm ${stat.isCritical && stat.value > 0 ? 'ring-2 ring-red-500' : ''}`}>
            <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black text-slate-900">{stat.value}</p>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Recent Activity Feed */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900">Recent Activity</h3>
            <Button variant="ghost" size="sm" className="text-indigo-600 font-bold" onClick={() => navigate('/pa/parliament/letters')}>View All</Button>
          </div>
          <div className="space-y-4">
            {recentActivity.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-sm font-bold text-slate-500">No parliament activity recorded yet.</p>
              </div>
            ) : recentActivity.map((item, i) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`bg-white p-5 rounded-2xl border-l-4 ${item.color} shadow-sm flex items-center justify-between group cursor-pointer hover:shadow-md transition-all`}
                onClick={() => navigate(item.path)}
              >
                <div className="flex items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.type}</span>
                      <span className="text-[10px] font-bold text-slate-300">ΓÇó</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.date}</span>
                    </div>
                    <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{item.title}</h4>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {item.status}
                  </span>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="space-y-6">
          <h3 className="text-xl font-black text-slate-900">Quick Actions</h3>
          <div className="grid gap-3">
            {[
              { label: 'View Overdue Letters', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', onClick: () => navigate('/pa/parliament/letters') },
              { label: 'View Unanswered Questions', icon: HelpCircle, color: 'text-amber-600', bg: 'bg-amber-50', onClick: () => navigate('/pa/parliament/questions') },
              { label: 'Items Needing Follow-up', icon: Clock, color: 'text-indigo-600', bg: 'bg-indigo-50', onClick: () => navigate('/pa/parliament/letters') },
              { label: 'Export Parliament Report (JSON)', icon: Download, color: 'text-slate-600', bg: 'bg-slate-100', onClick: exportParliamentReport },
            ].map((action, i) => (
              <button 
                key={i}
                className="w-full p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 hover:border-indigo-200 hover:shadow-md transition-all group text-left"
                onClick={action.onClick}
              >
                <div className={`w-10 h-10 ${action.bg} ${action.color} rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <span className="text-sm font-bold text-slate-700">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sub-module Tabs */}
      <div className="space-y-8">
        <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit">
          {[
            { id: 'letters', label: 'Parliament Letters', path: '/pa/parliament/letters' },
            { id: 'questions', label: 'Parliament Questions', path: '/pa/parliament/questions' },
            { id: 'answers', label: 'Parliament Answers', path: '/pa/parliament/questions' },
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-3 rounded-xl text-sm font-black transition-all ${
                activeTab === tab.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:bg-white/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <Card className="p-12 rounded-[3rem] border-none shadow-sm bg-slate-50 text-center space-y-6">
          <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center mx-auto shadow-sm">
            <FileText className="w-10 h-10 text-indigo-600" />
          </div>
          <div className="max-w-md mx-auto">
            <h4 className="text-2xl font-black text-slate-900 mb-2">Detailed {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} View</h4>
            <p className="text-slate-500 font-medium">Access full lists, advanced filters, and detailed status tracking for all parliamentary {activeTab}.</p>
          </div>
          <Button 
            size="lg" 
            className="rounded-2xl px-12"
            onClick={() => navigate(`/pa/parliament/${activeTab}`)}
          >
            Open {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Module
          </Button>
        </Card>
      </div>
    </div>
  );
};
