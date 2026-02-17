
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { 
  Camera, 
  FilePlus, 
  MessageSquare, 
  Layers, 
  CheckCircle2, 
  Plus, 
  Search,
  ArrowUpRight,
  TrendingUp,
  Activity,
  Settings
} from 'lucide-react';

export const StaffDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Staff Operations</h2>
          <p className="text-slate-500 font-medium">Consolidated command center for constituency ops.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl"><Settings className="w-4 h-4 mr-2" /> Master Data</Button>
          <Button variant="outline" className="rounded-xl"><Search className="w-4 h-4 mr-2" /> Global Search</Button>
        </div>
      </header>

      {/* Action Hub */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Project Data', icon: FilePlus, color: 'bg-indigo-600', sub: 'Infrastructure Entry', path: '/staff/entry' },
          { label: 'Media Library', icon: Camera, color: 'bg-blue-600', sub: 'Photos & News', path: '/staff/media' },
          { label: 'Grievance Ops', icon: MessageSquare, color: 'bg-green-600', sub: 'Complaint Handling', path: '/staff/complaints' },
          { label: 'Operational Logs', icon: CheckCircle2, color: 'bg-orange-600', sub: 'Activity Audit', path: '/staff/audit' },
        ].map((action, i) => (
          <motion.button
            key={action.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => navigate(action.path)}
            className="group flex flex-col p-6 bg-white rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:border-indigo-300 transition-all text-left relative overflow-hidden"
          >
            <div className={`w-12 h-12 ${action.color} text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-100 group-hover:scale-110 transition-transform`}>
              <action.icon className="w-6 h-6" />
            </div>
            <h4 className="font-black text-slate-900 tracking-tight text-lg">{action.label}</h4>
            <p className="text-[10px] text-slate-400 mt-1 uppercase font-black tracking-widest">{action.sub}</p>
            <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
               <ArrowUpRight className="w-5 h-5 text-indigo-600" />
            </div>
          </motion.button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <Card title="Recent Updates" subtitle="Track latest data entries by office team" className="lg:col-span-2 border-slate-200 rounded-[2.5rem]">
           <div className="space-y-4 mt-4">
              {[
                { title: 'NH-24 Progress Update', cat: 'Works', time: '12 mins ago', staff: 'Mohit' },
                { title: 'News Clipping: Hospital Wing', cat: 'Media', time: '1h ago', staff: 'Sarah' },
                { title: 'Response: Water Shortage', cat: 'Complaint', time: '2h ago', staff: 'Mohit' },
                { title: 'Rampur Village Tour Photos', cat: 'Media', time: '1d ago', staff: 'Anand' }
              ].map((update, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-md transition-all">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-indigo-600">
                        <Layers className="w-5 h-5" />
                     </div>
                     <div>
                        <h5 className="font-bold text-slate-900 leading-tight">{update.title}</h5>
                        <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">{update.cat} • {update.time} by {update.staff}</p>
                     </div>
                  </div>
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 rounded-lg"><ArrowUpRight className="w-4 h-4" /></Button>
                </div>
              ))}
           </div>
           <Button variant="outline" fullWidth className="mt-8 rounded-2xl font-black text-xs uppercase tracking-widest py-4">View All System Logs</Button>
        </Card>

        <div className="space-y-6">
           <Card title="Operational Health" className="border-slate-200 rounded-[2.5rem]">
              <div className="space-y-6 mt-2">
                 <div className="flex items-center justify-between">
                    <div>
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Complaints Resolved</p>
                       <p className="text-2xl font-black text-slate-900 mt-1">82%</p>
                    </div>
                    <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
                       <TrendingUp className="w-6 h-6" />
                    </div>
                 </div>
                 <div className="flex items-center justify-between">
                    <div>
                       <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Media Coverage</p>
                       <p className="text-2xl font-black text-slate-900 mt-1">+14%</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                       <Activity className="w-6 h-6" />
                    </div>
                 </div>
              </div>
           </Card>

           <Card title="Pending Tasks" className="border-slate-200 rounded-[2.5rem]">
              <div className="space-y-4 mt-2">
                 {[
                   { task: 'Verify Sanction Letters', due: 'Today', priority: 'High' },
                   { task: 'Upload Media May 24 Tour', due: 'Tomorrow', priority: 'Med' }
                 ].map((task, i) => (
                   <div key={i} className="p-4 rounded-2xl border-2 border-slate-50 hover:border-indigo-100 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                         <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                           task.priority === 'High' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                         }`}>{task.priority} Priority</span>
                         <span className="text-[10px] font-bold text-slate-400">Due {task.due}</span>
                      </div>
                      <p className="text-sm font-black text-slate-900">{task.task}</p>
                      <button className="text-[10px] font-black text-indigo-600 uppercase mt-3 hover:underline">Mark as done</button>
                   </div>
                 ))}
                 <Button variant="outline" fullWidth className="border-dashed rounded-2xl py-3 text-xs font-bold uppercase tracking-widest"><Plus className="w-3 h-3 mr-2" /> Custom Task</Button>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
};
