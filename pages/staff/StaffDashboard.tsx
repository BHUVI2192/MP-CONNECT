
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  Settings,
  Clock,
  MapPin,
  Users,
  Calendar,
  FileUp,
  RefreshCw,
  X
} from 'lucide-react';
import { useNotifications } from '../../context/NotificationContext';
import { PlanEvent, PlanEventStatus } from '../../types';

// Mock data for initial state
const MOCK_EVENTS: PlanEvent[] = [
  {
    id: '1',
    title: 'Morning Briefing with Security Detail',
    type: 'MEETING',
    scheduledTime: '08:00',
    displayTime: '8:00 AM',
    duration: 30,
    locationName: 'MP Residence Office',
    address: '12, Ashoka Road, New Delhi',
    purpose: 'Review security protocols for the day',
    people: [
      { id: 'p1', name: 'Inspector Sharma', designation: 'Security Head', contact: '9876543210' }
    ],
    status: 'VISITED',
    finalNotes: 'All protocols reviewed. No issues found.'
  },
  {
    id: '2',
    title: 'Site Inspection: New Flyover Project',
    type: 'INSPECTION',
    scheduledTime: '10:30',
    displayTime: '10:30 AM',
    duration: 90,
    locationName: 'Sarita Vihar Crossing',
    address: 'Sarita Vihar, New Delhi',
    purpose: 'Check progress of the pillar construction',
    people: [
      { id: 'p2', name: 'Er. Amit Kumar', designation: 'Project Manager', contact: '9876543211' },
      { id: 'p3', name: 'Sanjay Singh', designation: 'Local Contractor', contact: '9876543212' }
    ],
    status: 'IN_PROGRESS',
    notes: 'Pillar 4 and 5 are 80% complete. Need to speed up the girder placement.'
  },
  {
    id: '3',
    title: 'Meeting with RWA Representatives',
    type: 'MEETING',
    scheduledTime: '14:00',
    displayTime: '2:00 PM',
    duration: 60,
    locationName: 'Community Center, Sector 7',
    address: 'Sector 7, Rohini, New Delhi',
    purpose: 'Discuss water supply issues in the area',
    people: [
      { id: 'p4', name: 'Mrs. Gupta', designation: 'RWA President', contact: '9876543213' }
    ],
    status: 'SCHEDULED'
  },
  {
    id: '4',
    title: 'Public Visit: Government School #4',
    type: 'VISIT',
    scheduledTime: '16:30',
    displayTime: '4:30 PM',
    duration: 45,
    locationName: 'Govt Boys Sr Sec School',
    address: 'Dwarka Sector 3, New Delhi',
    purpose: 'Inaugurate new computer lab',
    people: [],
    status: 'SCHEDULED'
  }
];

const STATUS_BADGES: Record<PlanEventStatus, string> = {
  SCHEDULED: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-orange-100 text-orange-700',
  VISITED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-red-100 text-red-700',
  DRAFT: 'bg-slate-100 text-slate-700'
};

export const StaffDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { lastUpdatedEventId } = useNotifications();
  const [activeTab, setActiveTab] = useState<'ops' | 'schedule'>('ops');
  const [events, setEvents] = useState<PlanEvent[]>(MOCK_EVENTS);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<PlanEvent | null>(null);

  // Simulate real-time updates when lastUpdatedEventId changes
  useEffect(() => {
    if (lastUpdatedEventId) {
      // In a real app, we'd fetch the latest data for this event
      // Here we'll just simulate a status change or update
      const timer = setTimeout(() => {
        setEvents(prev => prev.map(e => {
          if (e.id === lastUpdatedEventId) {
            // Randomly update status for demo if it's scheduled
            if (e.status === 'SCHEDULED') return { ...e, status: 'IN_PROGRESS' };
            return e;
          }
          return e;
        }));
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [lastUpdatedEventId]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Staff Operations</h2>
          <p className="text-slate-500 font-medium">Consolidated command center for constituency ops.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-2xl">
          <button 
            onClick={() => setActiveTab('ops')}
            className={`px-6 py-2 rounded-xl text-sm font-black transition-all ${
              activeTab === 'ops' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Operations Hub
          </button>
          <button 
            onClick={() => setActiveTab('schedule')}
            className={`px-6 py-2 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${
              activeTab === 'schedule' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Today's Schedule
            {lastUpdatedEventId && (
              <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
            )}
          </button>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {activeTab === 'ops' ? (
          <motion.div
            key="ops"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
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
          </motion.div>
        ) : (
          <motion.div
            key="schedule"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card title="Today's Schedule" subtitle="Real-time tracking of PA's activities" className="border-slate-200 rounded-[2.5rem]">
              <div className="overflow-x-auto mt-4">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b border-slate-100">
                      <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Time</th>
                      <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Event Title</th>
                      <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</th>
                      <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">People</th>
                      <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {events.map((event) => (
                      <motion.tr 
                        key={event.id}
                        animate={lastUpdatedEventId === event.id ? { backgroundColor: ['#ffffff', '#f0f9ff', '#ffffff'] } : {}}
                        transition={{ duration: 1, repeat: 2 }}
                        className="group hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="py-5 text-sm font-bold text-slate-600">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {event.displayTime}
                          </div>
                        </td>
                        <td className="py-5">
                          <div className="font-black text-slate-900 text-sm">{event.title}</div>
                          <div className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter mt-0.5">{event.type}</div>
                        </td>
                        <td className="py-5">
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            {event.locationName}
                          </div>
                        </td>
                        <td className="py-5">
                          <div className="flex -space-x-2">
                            {event.people.slice(0, 3).map((p) => (
                              <div key={p.id} className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[8px] font-black text-slate-600" title={p.name}>
                                {p.name.charAt(0)}
                              </div>
                            ))}
                            {event.people.length > 3 && (
                              <div className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] font-black text-slate-400">
                                +{event.people.length - 3}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-5">
                          <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg ${STATUS_BADGES[event.status]}`}>
                            {event.status}
                          </span>
                        </td>
                        <td className="py-5 text-right">
                          <div className="flex justify-end gap-2">
                            {event.status === 'VISITED' && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 text-[10px] font-black uppercase tracking-widest px-3"
                                onClick={() => {
                                  setSelectedEvent(event);
                                  setShowUploadModal(true);
                                }}
                              >
                                <FileUp className="w-3 h-3 mr-1" /> Doc
                              </Button>
                            )}
                            {event.status === 'CANCELLED' && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 text-[10px] font-black uppercase tracking-widest px-3 text-orange-600 border-orange-200 hover:bg-orange-50"
                              >
                                <RefreshCw className="w-3 h-3 mr-1" /> Reschedule
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg">
                              <ArrowUpRight className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Post-Event Doc Upload Modal */}
      <AnimatePresence>
        {showUploadModal && selectedEvent && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setShowUploadModal(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden relative z-10"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Add Post-Event Doc</h2>
                  <p className="text-sm text-slate-500 font-medium">Upload reports, photos, or documents for {selectedEvent.title}</p>
                </div>
                <button onClick={() => setShowUploadModal(false)} className="p-2 hover:bg-slate-100 rounded-full">
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="p-8">
                <div className="border-2 border-dashed border-slate-200 rounded-3xl p-12 flex flex-col items-center text-center group hover:border-indigo-400 transition-colors cursor-pointer">
                  <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <FileUp className="w-8 h-8" />
                  </div>
                  <h4 className="font-black text-slate-900">Drop files here</h4>
                  <p className="text-xs text-slate-400 mt-1">or click to browse from your computer</p>
                  <p className="text-[10px] text-slate-300 mt-4 uppercase font-black tracking-widest">PDF, JPG, PNG, DOCX (Max 10MB)</p>
                </div>

                <div className="mt-8 flex gap-3">
                  <Button variant="outline" fullWidth className="rounded-2xl py-4" onClick={() => setShowUploadModal(false)}>Cancel</Button>
                  <Button fullWidth className="rounded-2xl py-4" onClick={() => setShowUploadModal(false)}>Upload & Finalize</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
