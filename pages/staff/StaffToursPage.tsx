import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import {
    Calendar,
    MapPin,
    Clock,
    CheckCircle2,
    FileText,
    Upload,
    X,
    Search,
    Filter,
    AlertCircle
} from 'lucide-react';
import { TourProgram } from '../../types';

import { useMockData } from '../../context/MockDataContext';

export const StaffToursPage: React.FC = () => {
    const { tours, updateTour } = useMockData();
    const [selectedTour, setSelectedTour] = useState<TourProgram | null>(null);
    const [showDocModal, setShowDocModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'Pending' | 'Completed'>('Pending');

    // Documentation State
    const [documentation, setDocumentation] = useState({
        startTime: '',
        endTime: '',
        summary: '',
        outcomes: '',
        attendance: {} as Record<string, boolean> // participantId -> boolean
    });

    const handleOpenDoc = (tour: TourProgram) => {
        setSelectedTour(tour);
        // Initialize attendance
        const initialAttendance: Record<string, boolean> = {};
        tour.participants.forEach(p => initialAttendance[p.id] = true);

        setDocumentation({
            startTime: tour.startTime,
            endTime: '',
            summary: '',
            outcomes: '',
            attendance: initialAttendance
        });
        setShowDocModal(true);
    };

    const handleSubmitDocumentation = () => {
        if (!selectedTour) return;

        const updatedTour: TourProgram = {
            ...selectedTour,
            status: 'Completed',
            actualAttributes: {
                startTime: documentation.startTime,
                endTime: documentation.endTime,
                summary: documentation.summary,
                outcomes: documentation.outcomes,
                attachments: ['https://picsum.photos/seed/doc/800/600'] // Mock attachment
            }
            // Update participant attendance in a real app
        };

        updateTour(updatedTour);
        setShowDocModal(false);
        setSelectedTour(null);
    };

    const filteredTours = tours.filter(t =>
        activeTab === 'Pending' ? t.status === 'Scheduled' || t.status === 'In Progress' : t.status === 'Completed'
    );

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Tour Documentation</h2>
                    <p className="text-slate-500 font-medium mt-1">Record outcomes and attendance for official tours.</p>
                </div>
            </header>

            {/* Tabs */}
            <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit">
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

            <div className="grid gap-6">
                {filteredTours.length === 0 && (
                    <div className="text-center py-20 text-slate-400">
                        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Calendar className="w-8 h-8 opacity-50" />
                        </div>
                        <p className="font-bold">No tours found in this category.</p>
                    </div>
                )}

                {filteredTours.map((tour) => (
                    <motion.div key={tour.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="hover:shadow-md transition-shadow group border-slate-200">
                            <div className="flex flex-col lg:flex-row gap-8">
                                <div className="lg:w-48 flex flex-row lg:flex-col gap-4 items-center lg:items-start lg:border-r border-slate-100 pr-6 shrink-0">
                                    <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex flex-col items-center justify-center text-indigo-600 shrink-0">
                                        <span className="text-[10px] font-black uppercase">{new Date(tour.startDate).toLocaleString('default', { month: 'short' })}</span>
                                        <span className="text-2xl font-black">{new Date(tour.startDate).getDate()}</span>
                                    </div>
                                    <div className="space-y-1">
                                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full block w-fit ${tour.status === 'Scheduled' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                                            }`}>{tour.status}</span>
                                        <p className="text-xs font-bold text-slate-400 mt-1 flex items-center gap-1"><Clock className="w-3 h-3" /> {tour.startTime}</p>
                                    </div>
                                </div>

                                <div className="flex-1 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="text-xl font-black text-slate-900 tracking-tight">{tour.title}</h4>
                                            <p className="text-sm font-medium text-slate-500 flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" /> {tour.location.name}, {tour.location.address}</p>
                                        </div>
                                        {activeTab === 'Pending' && (
                                            <Button onClick={() => handleOpenDoc(tour)} className="rounded-xl shadow-lg shadow-indigo-200">
                                                <FileText className="w-4 h-4 mr-2" /> Document Event
                                            </Button>
                                        )}
                                    </div>

                                    {activeTab === 'Completed' && tour.actualAttributes && (
                                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                                            <p className="font-bold text-slate-900 mb-1">Outcomes:</p>
                                            <p className="text-slate-600 italic">"{tour.actualAttributes.outcomes}"</p>
                                            {tour.actualAttributes.attachments && (
                                                <div className="mt-3 pt-3 border-t border-slate-200 flex gap-2">
                                                    <span className="font-bold text-indigo-600 flex items-center gap-1"><Upload className="w-3 h-3" /> {tour.actualAttributes.attachments.length} Files Uploaded</span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex flex-wrap gap-2">
                                        {tour.participants?.map((p, i) => (
                                            <div key={i} className="flex items-center gap-2 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
                                                <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
                                                    {p.name[0]}
                                                </div>
                                                <span className="text-[10px] font-bold text-slate-600">{p.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Documentation Modal */}
            <AnimatePresence>
                {showDocModal && selectedTour && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" onClick={() => setShowDocModal(false)} />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900">Document Event</h3>
                                    <p className="text-xs text-slate-500 font-bold mt-1">{selectedTour.title}</p>
                                </div>
                                <button onClick={() => setShowDocModal(false)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5 text-slate-400" /></button>
                            </div>

                            <div className="space-y-6">
                                {/* Time Tracking */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Actual Start Time</label>
                                        <input
                                            type="time"
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs outline-none"
                                            value={documentation.startTime}
                                            onChange={(e) => setDocumentation({ ...documentation, startTime: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Actual End Time</label>
                                        <input
                                            type="time"
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs outline-none"
                                            value={documentation.endTime}
                                            onChange={(e) => setDocumentation({ ...documentation, endTime: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {/* Attendance */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Attendance</label>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {selectedTour.participants.map((p) => (
                                            <label key={p.id} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${documentation.attendance[p.id] ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-200'
                                                }`}>
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${documentation.attendance[p.id] ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'
                                                        }`}>{p.name[0]}</div>
                                                    <div>
                                                        <p className="text-xs font-bold text-slate-900">{p.name}</p>
                                                        <p className="text-[10px] text-slate-500">{p.role}</p>
                                                    </div>
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 accent-indigo-600"
                                                    checked={documentation.attendance[p.id] || false}
                                                    onChange={(e) => setDocumentation({
                                                        ...documentation,
                                                        attendance: { ...documentation.attendance, [p.id]: e.target.checked }
                                                    })}
                                                />
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Outcomes */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Key Outcomes / Decisions</label>
                                    <textarea
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl font-medium text-xs outline-none resize-none"
                                        rows={4}
                                        placeholder="Summarize the main points discussed and decisions made..."
                                        value={documentation.outcomes}
                                        onChange={(e) => setDocumentation({ ...documentation, outcomes: e.target.value })}
                                    />
                                </div>

                                {/* File Upload Simulation */}
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Attachments</label>
                                    <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-slate-400 bg-slate-50">
                                        <Upload className="w-8 h-8 mb-2 opacity-50" />
                                        <p className="text-xs font-bold">Click to upload photos or minutes</p>
                                    </div>
                                </div>

                                <Button fullWidth size="lg" className="rounded-xl mt-4" onClick={handleSubmitDocumentation}>
                                    <CheckCircle2 className="w-4 h-4 mr-2" /> Mark as Complete
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
