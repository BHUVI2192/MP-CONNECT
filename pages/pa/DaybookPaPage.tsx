import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import {
    Calendar as CalendarIcon,
    Plus,
    Clock,
    Users,
    CheckCircle2,
    Mic,
    Search,
    History,
    MoreVertical,
    Play,
    Pause,
    FileText,
    AlertCircle,
    X,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

// Types
interface Task {
    id: string;
    title: string;
    description: string;
    type: 'Meeting' | 'Visit' | 'Call' | 'Event' | 'Reminder';
    startTime: string; // HH:MM AM/PM
    duration: string;
    participants?: string[];
    status: 'Pending' | 'In_Progress' | 'Completed';
    priority: 'High' | 'Medium' | 'Low';
    hasVoiceNote?: boolean;
}

interface LogEntry {
    id: string;
    date: string;
    action: string;
    user: string;
    details: string;
}

// Mock Data
const initialTasks: Task[] = [
    {
        id: 't-1',
        title: 'Morning Briefing with MP',
        description: 'Review schedule for the week and discuss pending files.',
        type: 'Meeting',
        startTime: '09:00 AM',
        duration: '30m',
        participants: ['MP Rahul Kumar', 'PA Anand'],
        status: 'Completed',
        priority: 'High'
    },
    {
        id: 't-2',
        title: 'Flood Relief Inspection',
        description: 'Visit the affected areas in North Block.',
        type: 'Visit',
        startTime: '10:30 AM',
        duration: '2h',
        participants: ['District Magistrate', 'Relief Team'],
        status: 'In_Progress',
        priority: 'High',
        hasVoiceNote: true
    },
    {
        id: 't-3',
        title: 'Call with Party Office',
        description: 'Coordinate for upcoming rally.',
        type: 'Call',
        startTime: '02:00 PM',
        duration: '45m',
        status: 'Pending',
        priority: 'Medium'
    }
];

const mockLogs: LogEntry[] = [
    { id: 'l-1', date: '2026-01-28', action: 'Task Created', user: 'PA Anand', details: 'Created task "Flood Relief Inspection"' },
    { id: 'l-2', date: '2026-01-28', action: 'Status Update', user: 'Staff Sarah', details: 'Marked "Morning Briefing" as Completed' },
    { id: 'l-3', date: '2026-01-27', action: 'Voice Note', user: 'PA Anand', details: 'Added voice note to "Site Visit"' }
];

export const DaybookPaPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'daybook' | 'logs'>('daybook');
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [isRecording, setIsRecording] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Task Form State
    const [newTask, setNewTask] = useState<Partial<Task>>({
        title: '',
        description: '',
        type: 'Meeting',
        priority: 'Medium',
        startTime: '09:00 AM',
        duration: '30m'
    });

    const handleCreateTask = () => {
        if (!newTask.title) return;

        const task: Task = {
            id: `t-${Date.now()}`,
            title: newTask.title!,
            description: newTask.description || '',
            type: newTask.type as any,
            priority: newTask.priority as any,
            startTime: newTask.startTime!,
            duration: newTask.duration!,
            participants: newTask.participants || [],
            status: 'Pending',
            hasVoiceNote: false // in a real app, we'd handle the recorded audio here
        };

        setTasks([...tasks, task]);
        setShowTaskForm(false);
        setNewTask({
            title: '',
            description: '',
            type: 'Meeting',
            priority: 'Medium',
            startTime: '09:00 AM',
            duration: '30m'
        });
    };

    const toggleRecording = () => {
        setIsRecording(!isRecording);
        // Mock transcription delay
        if (!isRecording) {
            setTimeout(() => {
                // In a real app, this would be the transcription result
                console.log("Mock text transcribed");
            }, 2000);
        }
    };

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Daybook</h2>
                    <p className="text-slate-500 font-medium mt-1">Manage daily tasks, schedules, and logs.</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline"><Search className="w-4 h-4 mr-2" /> Search</Button>
                    <Button onClick={() => setShowTaskForm(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        New Entry
                    </Button>
                </div>
            </header>

            {/* Tabs */}
            <div className="flex gap-1 p-1.5 bg-slate-100 rounded-2xl w-fit">
                {[
                    { id: 'daybook', label: 'Daily Planner', icon: CalendarIcon },
                    { id: 'logs', label: 'Historical Logs', icon: History },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id
                                ? 'bg-white text-indigo-600 shadow-sm border border-slate-200'
                                : 'text-slate-500 hover:bg-white/50'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        <span className="hidden md:inline">{tab.label}</span>
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {activeTab === 'daybook' && (
                    <motion.div
                        key="daybook"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        {/* Date Strip */}
                        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
                            <Button variant="ghost" size="sm" onClick={() => setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() - 1)))}>
                                <ChevronLeft className="w-5 h-5" />
                            </Button>
                            <div className="text-center">
                                <h3 className="text-lg font-black text-slate-900">
                                    {selectedDate.toLocaleDateString('default', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                </h3>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Today's Schedule</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() + 1)))}>
                                <ChevronRight className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Task List */}
                        <div className="grid gap-4">
                            {tasks.map((task, idx) => (
                                <Card key={task.id} className="hover:shadow-md transition-shadow group border-slate-200" delay={idx * 0.05}>
                                    <div className="flex flex-col md:flex-row gap-6 relative">
                                        {/* Status Strip */}
                                        <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl ${task.priority === 'High' ? 'bg-red-500' : task.priority === 'Medium' ? 'bg-orange-500' : 'bg-blue-500'
                                            }`} />

                                        <div className="md:w-32 flex flex-row md:flex-col gap-4 items-center md:items-start md:border-r border-slate-100 pr-6 pl-4">
                                            <div className="space-y-1 text-center md:text-left">
                                                <span className="text-2xl font-black text-slate-900 block">{task.startTime}</span>
                                                <span className="text-xs font-bold text-slate-500 block">{task.duration}</span>
                                            </div>
                                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full block w-fit ${task.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                                    task.status === 'In_Progress' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                                                }`}>{task.status.replace('_', ' ')}</span>
                                        </div>

                                        <div className="flex-1 space-y-3 pl-2">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="text-xl font-black text-slate-900">{task.title}</h4>
                                                    <span className="text-[10px] font-bold uppercase px-2 py-1 bg-slate-100 text-slate-600 rounded-md mt-2 inline-block">
                                                        {task.type}
                                                    </span>
                                                </div>
                                                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <MoreVertical className="w-4 h-4" />
                                                </Button>
                                            </div>

                                            <p className="text-sm text-slate-600 leading-relaxed">{task.description}</p>

                                            {task.participants && task.participants.length > 0 && (
                                                <div className="flex items-center gap-2 mt-2">
                                                    <Users className="w-3 h-3 text-slate-400" />
                                                    <span className="text-xs font-bold text-slate-500">{task.participants.join(', ')}</span>
                                                </div>
                                            )}

                                            {task.hasVoiceNote && (
                                                <div className="mt-4 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 flex items-center gap-3 w-fit">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                                        <Play className="w-3 h-3 ml-0.5" />
                                                    </div>
                                                    <div>
                                                        <div className="text-[10px] font-black uppercase text-indigo-400">Voice Note</div>
                                                        <div className="w-32 h-1 bg-indigo-200 rounded-full mt-1 overflow-hidden">
                                                            <div className="w-1/3 h-full bg-indigo-500 rounded-full" />
                                                        </div>
                                                    </div>
                                                    <span className="text-xs font-bold text-indigo-900">0:45</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            ))}

                            {tasks.length === 0 && (
                                <div className="p-12 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                        <CalendarIcon className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900">No tasks for this day</h3>
                                    <p className="text-slate-500 text-sm mt-1">Click "New Entry" to add a task.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'logs' && (
                    <motion.div key="logs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                        <Card title="Audit Logs" subtitle="History of all daybook activities">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left mt-4">
                                    <thead className="bg-slate-50/50 text-slate-400 uppercase text-[10px] font-black tracking-widest border-b border-slate-100">
                                        <tr>
                                            <th className="px-6 py-4">Date</th>
                                            <th className="px-6 py-4">Action</th>
                                            <th className="px-6 py-4">User</th>
                                            <th className="px-6 py-4">Details</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {mockLogs.map((log) => (
                                            <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-6 py-4 text-xs font-bold text-slate-500">{log.date}</td>
                                                <td className="px-6 py-4">
                                                    <span className="text-[10px] font-black uppercase px-2 py-1 bg-slate-100 rounded-md text-slate-700">
                                                        {log.action}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-xs font-bold text-indigo-600">{log.user}</td>
                                                <td className="px-6 py-4 text-sm text-slate-700">{log.details}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* New Task Modal Overlay */}
            <AnimatePresence>
                {showTaskForm && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900">New Daybook Entry</h3>
                                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Create a new task or event</p>
                                </div>
                                <button onClick={() => setShowTaskForm(false)} className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center transition-colors">
                                    <X className="w-4 h-4 text-slate-500" />
                                </button>
                            </div>

                            <div className="p-6 space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Entry Title</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-900"
                                        placeholder="e.g. Visit to North School"
                                        value={newTask.title}
                                        onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Type</label>
                                        <select
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none transition-all text-sm font-bold"
                                            value={newTask.type}
                                            onChange={(e) => setNewTask({ ...newTask, type: e.target.value as any })}
                                        >
                                            <option value="Meeting">Meeting</option>
                                            <option value="Visit">Visit</option>
                                            <option value="Call">Call</option>
                                            <option value="Event">Event</option>
                                            <option value="Reminder">Reminder</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Priority</label>
                                        <select
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none transition-all text-sm font-bold"
                                            value={newTask.priority}
                                            onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                                        >
                                            <option value="High">Fast Track (High)</option>
                                            <option value="Medium">Standard (Medium)</option>
                                            <option value="Low">Low Priority</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Start Time</label>
                                        <input
                                            type="time"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none transition-all text-sm font-bold"
                                            value={newTask.startTime?.replace(' AM', '').replace(' PM', '')} // Simple implementation
                                            onChange={(e) => setNewTask({ ...newTask, startTime: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Duration</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 1h 30m"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none transition-all text-sm font-bold"
                                            value={newTask.duration}
                                            onChange={(e) => setNewTask({ ...newTask, duration: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Description / Notes</label>
                                    <textarea
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white outline-none transition-all min-h-[100px] text-sm font-medium resize-none"
                                        placeholder="Add detailed notes or instructions..."
                                        value={newTask.description}
                                        onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                                    />
                                </div>

                                <div className="pt-2">
                                    <Button
                                        variant="outline"
                                        className={`w-full justify-center border-dashed border-2 py-8 transition-all ${isRecording ? 'border-red-400 bg-red-50 text-red-600' : 'border-slate-300 text-slate-400 hover:border-indigo-400 hover:text-indigo-600'}`}
                                        onClick={toggleRecording}
                                    >
                                        <div className="flex flex-col items-center gap-2">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isRecording ? 'bg-red-100 animate-pulse' : 'bg-slate-100'}`}>
                                                <Mic className="w-5 h-5" />
                                            </div>
                                            <span className="text-xs font-bold uppercase tracking-widest">{isRecording ? 'Recording... (Click to Stop)' : 'Click to Record Voice Note'}</span>
                                        </div>
                                    </Button>
                                </div>
                            </div>

                            <div className="p-6 border-t border-slate-100 bg-slate-50">
                                <Button fullWidth size="lg" className="rounded-xl shadow-lg shadow-indigo-200" onClick={handleCreateTask}>
                                    Save Daybook Entry
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
