
import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { 
  Clock, 
  FileText, 
  AlertCircle, 
  Calendar, 
  CheckCircle2, 
  ArrowRight, 
  UserCheck, 
  TrendingUp,
  MessageSquare,
  Bell,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PaDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">PA Command Center</h2>
          <p className="text-slate-500 font-medium">Daily operations hub for Northeast Delhi.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-2xl border-slate-200"><Bell className="w-4 h-4 mr-2" /> Notifications</Button>
          <Button className="rounded-2xl shadow-lg shadow-indigo-100"><Calendar className="w-4 h-4 mr-2" /> Plan Today</Button>
        </div>
      </header>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Awaiting Action', val: '08', icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Today\'s Events', val: '04', icon: Calendar, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Unassigned (Verified)', val: '12', icon: MessageSquare, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Resolved (WTD)', val: '14', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
        ].map((stat, i) => (
          <Card key={i} className="border-slate-200">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <h4 className={`text-3xl font-black mt-1 ${stat.color}`}>{stat.val}</h4>
              </div>
              <div className={`${stat.bg} ${stat.color} p-3 rounded-2xl`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Daily Timeline */}
        <div className="lg:col-span-2 space-y-6">
           {/* New Verified Complaints Queue for PA */}
           <Card title="Grievance Dispatch Board" subtitle="Verified complaints from office staff awaiting department assignment">
              <div className="space-y-4 mt-6">
                 {[
                   { id: 'CMP-8821', citizen: 'Aman Varma', cat: 'Water Supply', urgency: 'High' },
                   { id: 'CMP-9122', citizen: 'Suresh Raina', cat: 'Electricity', urgency: 'Med' }
                 ].map((comp, i) => (
                   <div key={i} className="group p-5 bg-white border border-slate-100 rounded-[2rem] hover:border-indigo-200 transition-all flex flex-col md:flex-row justify-between items-center gap-4">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                            <ShieldCheck className="w-6 h-6" />
                         </div>
                         <div>
                            <div className="flex items-center gap-2">
                               <p className="text-[10px] font-black text-slate-400 uppercase">{comp.id}</p>
                               <span className={`text-[8px] px-1.5 py-0.5 rounded font-black uppercase ${comp.urgency === 'High' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>{comp.urgency}</span>
                            </div>
                            <p className="font-black text-slate-900 leading-tight mt-0.5">{comp.citizen}</p>
                            <p className="text-xs text-slate-500 font-medium">{comp.cat}</p>
                         </div>
                      </div>
                      <Button size="sm" className="rounded-xl px-5 h-10 w-full md:w-auto" onClick={() => navigate('/pa/complaints')}>
                         <Building2 className="w-3 h-3 mr-2" /> Dispatch Dept
                      </Button>
                   </div>
                 ))}
                 <Button variant="ghost" fullWidth className="text-slate-400 text-xs font-bold" onClick={() => navigate('/pa/complaints')}>Manage All Dispatches</Button>
              </div>
           </Card>

          <Card title="Today's Schedule" subtitle="MP Rahul Kumar's Minute-by-Minute Timeline">
             <div className="space-y-8 mt-6">
                {[
                  { time: '09:00 AM', event: 'Briefing Session', sub: 'Internal Office', type: 'Office' },
                  { time: '10:30 AM', event: 'School Inauguration', sub: 'Shyampur Village', type: 'Public' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 relative group">
                    <div className="w-20 text-right">
                       <p className="text-sm font-black text-slate-900">{item.time}</p>
                    </div>
                    <div className="flex flex-col items-center">
                       <div className={`w-3 h-3 rounded-full border-2 border-white ring-4 ring-indigo-50 z-10 ${i === 0 ? 'bg-indigo-600' : 'bg-slate-300'}`} />
                       <div className="w-0.5 flex-1 bg-slate-100 group-last:bg-transparent my-2" />
                    </div>
                    <div className="flex-1 pb-8">
                       <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 group-hover:bg-white group-hover:shadow-md transition-all">
                          <div className="flex justify-between items-start">
                             <div>
                                <h5 className="font-bold text-slate-900">{item.event}</h5>
                                <p className="text-xs text-slate-500 mt-1">{item.sub}</p>
                             </div>
                             <span className="text-[8px] font-black uppercase px-2 py-1 bg-white border border-slate-200 rounded-lg">{item.type}</span>
                          </div>
                       </div>
                    </div>
                  </div>
                ))}
             </div>
          </Card>
        </div>

        {/* Action List */}
        <div className="space-y-6">
           <Card title="Approval Queue" subtitle="MP Signatures Required">
              <div className="space-y-4 mt-4">
                 {[
                   { id: 'REC-102', target: 'Ministry of Railways', type: 'Recommendation' },
                   { id: 'OFF-441', target: 'District Magistrate', type: 'Enquiry' },
                 ].map((letter, i) => (
                   <div key={i} className="p-4 rounded-2xl border border-slate-100 hover:border-indigo-100 transition-colors flex justify-between items-center group">
                      <div>
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{letter.id}</p>
                         <p className="text-sm font-black text-slate-900 mt-0.5">{letter.target}</p>
                         <p className="text-[10px] text-indigo-600 font-bold uppercase">{letter.type}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="rounded-lg opacity-0 group-hover:opacity-100"><ArrowRight className="w-4 h-4" /></Button>
                   </div>
                 ))}
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
};
