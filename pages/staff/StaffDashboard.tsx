
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { useMockData } from '../../context/MockDataContext';
import {
  FilePlus,
  MessageSquare,
  Layers,
  Plus,
  Search,
  ArrowUpRight,
  TrendingUp,
  Activity,
  Settings,
  Users as UsersIcon,
  Upload,
  Calendar,
  MapPin
} from 'lucide-react';

export const StaffDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { complaints, letters, tours, works } = useMockData();

  const resolvedComplaintsPct = complaints.length
    ? Math.round((complaints.filter((complaint) => complaint.status === 'Resolved').length / complaints.length) * 100)
    : 0;
  const activeWorksCount = works.filter((work) => work.status === 'Ongoing').length;
  const pendingLettersCount = letters.filter((letter) => letter.status === 'Pending' || letter.status === 'In Progress').length;
  const upcomingToursCount = tours.filter((tour) => tour.status === 'Scheduled').length;

  const recentUpdates = useMemo(() => {
    const items = [
      ...works.slice(0, 3).map((work) => ({
        id: `work-${work.id}`,
        title: work.name,
        cat: 'Works',
        time: work.startDate || 'No date',
        by: work.village || work.zilla || 'Field Team',
        path: '/staff/entry',
      })),
      ...complaints.slice(0, 3).map((complaint) => ({
        id: `complaint-${complaint.id}`,
        title: complaint.description.length > 48 ? `${complaint.description.slice(0, 48)}...` : complaint.description,
        cat: 'Complaint',
        time: complaint.createdAt,
        by: complaint.citizenName,
        path: '/staff/complaints',
      })),
      ...letters.slice(0, 2).map((letter) => ({
        id: `letter-${letter.id}`,
        title: letter.title,
        cat: 'Letter',
        time: letter.updatedAt || letter.createdAt,
        by: letter.department,
        path: '/staff/letters',
      })),
      ...tours.slice(0, 2).map((tour) => ({
        id: `tour-${tour.id}`,
        title: tour.title,
        cat: 'Tour',
        time: tour.startDate,
        by: tour.location.name,
        path: '/staff/tours',
      })),
    ];

    return items
      .filter((item) => item.title)
      .sort((left, right) => right.time.localeCompare(left.time))
      .slice(0, 6);
  }, [complaints, letters, tours, works]);

  const pendingTasks = useMemo(() => {
    const tasks = [] as Array<{
      id: string;
      task: string;
      due: string;
      priority: 'High' | 'Med';
      path: string;
    }>;

    const verifiedComplaints = complaints.filter((complaint) => complaint.status === 'Verified').length;
    const inProgressLetters = letters.filter((letter) => letter.status === 'Pending' || letter.status === 'In Progress').length;
    const scheduledTours = tours.filter((tour) => tour.status === 'Scheduled').length;
    const plannedWorks = works.filter((work) => work.status === 'Planned').length;

    if (verifiedComplaints > 0) {
      tasks.push({
        id: 'dispatch-complaints',
        task: `${verifiedComplaints} verified complaint${verifiedComplaints > 1 ? 's' : ''} awaiting action`,
        due: 'Today',
        priority: 'High',
        path: '/staff/complaints',
      });
    }

    if (inProgressLetters > 0) {
      tasks.push({
        id: 'pending-letters',
        task: `${inProgressLetters} official letter${inProgressLetters > 1 ? 's' : ''} need follow-up`,
        due: 'Today',
        priority: 'High',
        path: '/staff/letters',
      });
    }

    if (scheduledTours > 0) {
      tasks.push({
        id: 'scheduled-tours',
        task: `${scheduledTours} scheduled tour${scheduledTours > 1 ? 's' : ''} need coordination`,
        due: 'Tomorrow',
        priority: 'Med',
        path: '/staff/tours',
      });
    }

    if (plannedWorks > 0) {
      tasks.push({
        id: 'planned-works',
        task: `${plannedWorks} planned work item${plannedWorks > 1 ? 's' : ''} pending entry review`,
        due: 'This Week',
        priority: 'Med',
        path: '/staff/entry',
      });
    }

    return tasks.slice(0, 4);
  }, [complaints, letters, tours, works]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Staff Operations</h2>
          <p className="text-slate-500 font-medium">Consolidated command center for constituency ops.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl" onClick={() => navigate('/staff/contacts')}><Settings className="w-4 h-4 mr-2" /> Master Data</Button>
          <Button variant="outline" className="rounded-xl" onClick={() => navigate('/development-works')}><Search className="w-4 h-4 mr-2" /> Global Search</Button>
        </div>
      </header>

      {/* Action Hub */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Plan Today', icon: Calendar, color: 'bg-blue-500', sub: 'Daily Events', path: '/staff/plan-today' },
          { label: 'Tour Hub', icon: MapPin, color: 'bg-indigo-500', sub: 'Program Log', path: '/staff/tours' },
          { label: 'Project Data', icon: FilePlus, color: 'bg-indigo-600', sub: 'Infrastructure Entry', path: '/staff/entry' },
          { label: 'Work Upload', icon: Upload, color: 'bg-blue-600', sub: '6-Step Wizard', path: '/staff/works/upload' },
          { label: 'Contact Book', icon: UsersIcon, color: 'bg-green-600', sub: 'Directory & Search', path: '/staff/contacts' },
          { label: 'Grievance Ops', icon: MessageSquare, color: 'bg-orange-600', sub: 'Complaint Handling', path: '/staff/complaints' },
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
            {recentUpdates.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <p className="text-sm font-bold text-slate-500">No recent operational updates found yet.</p>
              </div>
            ) : recentUpdates.map((update) => (
              <div key={update.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-md transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-indigo-600">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 leading-tight">{update.title}</h5>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">{update.cat} • {update.time} by {update.by}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 rounded-lg" onClick={() => navigate(update.path)}><ArrowUpRight className="w-4 h-4" /></Button>
              </div>
            ))}
          </div>
          <Button variant="outline" fullWidth className="mt-8 rounded-2xl font-black text-xs uppercase tracking-widest py-4" onClick={() => navigate('/staff/audit')}>View All System Logs</Button>
        </Card>

        <div className="space-y-6">
          <Card title="Operational Health" className="border-slate-200 rounded-[2.5rem]">
            <div className="space-y-6 mt-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Complaints Resolved</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{resolvedComplaintsPct}%</p>
                </div>
                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Media Coverage</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{activeWorksCount + upcomingToursCount}</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Active works + tours</p>
                </div>
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                  <Activity className="w-6 h-6" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pending Letters</p>
                  <p className="text-2xl font-black text-slate-900 mt-1">{pendingLettersCount}</p>
                </div>
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                  <FilePlus className="w-6 h-6" />
                </div>
              </div>
            </div>
          </Card>

          <Card title="Pending Tasks" className="border-slate-200 rounded-[2.5rem]">
            <div className="space-y-4 mt-2">
              {pendingTasks.length === 0 ? (
                <div className="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-sm font-bold text-slate-500">No pending tasks right now.</p>
                </div>
              ) : pendingTasks.map((task) => (
                <div key={task.id} className="p-4 rounded-2xl border-2 border-slate-50 hover:border-indigo-100 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${task.priority === 'High' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                      }`}>{task.priority} Priority</span>
                    <span className="text-[10px] font-bold text-slate-400">Due {task.due}</span>
                  </div>
                  <p className="text-sm font-black text-slate-900">{task.task}</p>
                  <button className="text-[10px] font-black text-indigo-600 uppercase mt-3 hover:underline" onClick={() => navigate(task.path)}>Open Task</button>
                </div>
              ))}
              <Button variant="outline" fullWidth className="border-dashed rounded-2xl py-3 text-xs font-bold uppercase tracking-widest" onClick={() => navigate('/staff/letters')}><Plus className="w-3 h-3 mr-2" /> Custom Task</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
