import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import {
    Calendar as CalendarIcon,
    FileText,
    UploadCloud,
    CheckCircle2,
    Clock,
    Camera,
    MapPin
} from 'lucide-react';
import { PlanTodayEvent } from '../../types';

// Mock Data (Shared with PA for demo purposes)
const initialEvents: PlanTodayEvent[] = [
    {
        id: 'e-1',
        title: 'Site Inspection at Green Park',
        type: 'Inspection',
        date: new Date().toISOString().split('T')[0],
        startTime: '10:00',
        duration: '1h 00m',
        location: {
            name: 'Green Park, Block A',
            address: 'Sector 4, City Center',
        },
        attendees: [
            { id: 'a-1', name: 'Ramesh Gupta', designation: 'Civil Engineer', contact: '9876543210' }
        ],
        purpose: 'Inspect the ongoing construction of the community center.',
        status: 'Scheduled',
        createdAt: new Date().toISOString(),
        createdBy: 'u-pa-1'
    }
];

export const PlanTodayStaffPage: React.FC = () => {
    const [events, setEvents] = useState<PlanTodayEvent[]>(initialEvents);
    const [selectedEvent, setSelectedEvent] = useState<PlanTodayEvent | null>(null);
    const [docForm, setDocForm] = useState({
        actualStartTime: '',
        actualEndTime: '',
        summary: '',
        outcomes: ''
    });

    const handleSaveDocumentation = () => {
        if (!selectedEvent) return;

        const updatedEvent: PlanTodayEvent = {
            ...selectedEvent,
            status: 'Completed',
            documentation: {
                ...docForm
            }
        };

        setEvents(events.map(e => e.id === selectedEvent.id ? updatedEvent : e));
        setSelectedEvent(null);
        // Reset form
        setDocForm({ actualStartTime: '', actualEndTime: '', summary: '', outcomes: '' });
    };

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-20">
            <header>
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Event Documentation</h2>
                <p className="text-slate-500 font-medium mt-1">Update event status and upload proofs/documents.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Event List Column */}
                <div className="lg:col-span-1 space-y-4">
                    <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest pl-1">Scheduled Events</h3>
                    <div className="space-y-3">
                        {events.map((event) => (
                            <div
                                key={event.id}
                                onClick={() => setSelectedEvent(event)}
                                className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedEvent?.id === event.id
                                        ? 'bg-indigo-50 border-indigo-200 shadow-sm ring-1 ring-indigo-200'
                                        : 'bg-white border-slate-200 hover:border-indigo-200 hover:shadow-sm'
                                    }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${event.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                        }`}>
                                        {event.status}
                                    </span>
                                    <span className="text-xs font-bold text-slate-400">{event.startTime}</span>
                                </div>
                                <h4 className="font-bold text-slate-900 leading-tight">{event.title}</h4>
                                <p className="text-xs text-slate-500 mt-1 truncate">{event.location.name}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Documentation Form Column */}
                <div className="lg:col-span-2">
                    <AnimatePresence mode="wait">
                        {selectedEvent ? (
                            <motion.div
                                key={selectedEvent.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden"
                            >
                                {/* Event Summary Header */}
                                <div className="bg-slate-50 p-6 border-b border-slate-100">
                                    <h3 className="text-2xl font-black text-slate-900">{selectedEvent.title}</h3>
                                    <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-600">
                                        <div className="flex items-center gap-1">
                                            <CalendarIcon className="w-4 h-4 text-indigo-500" />
                                            <span className="font-bold">{selectedEvent.date}</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <MapPin className="w-4 h-4 text-indigo-500" />
                                            <span>{selectedEvent.location.name}</span>
                                        </div>
                                    </div>
                                    <p className="mt-3 text-slate-500 text-sm border-l-2 border-indigo-200 pl-3 italic">
                                        "{selectedEvent.purpose}"
                                    </p>
                                </div>

                                <div className="p-8 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Actual Start Time</label>
                                            <input
                                                type="time"
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 font-bold text-slate-900 outline-none"
                                                value={docForm.actualStartTime}
                                                onChange={e => setDocForm({ ...docForm, actualStartTime: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Actual End Time</label>
                                            <input
                                                type="time"
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 font-bold text-slate-900 outline-none"
                                                value={docForm.actualEndTime}
                                                onChange={e => setDocForm({ ...docForm, actualEndTime: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Event Summary & Outcomes</label>
                                        <textarea
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 font-medium text-slate-700 outline-none min-h-[120px]"
                                            placeholder="Describe what happened during the event, any key decisions made, etc."
                                            value={docForm.summary}
                                            onChange={e => setDocForm({ ...docForm, summary: e.target.value })}
                                        />
                                    </div>

                                    {/* Upload Placeholder */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Documentation</label>
                                        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer group">
                                            <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                                <UploadCloud className="w-6 h-6 text-indigo-500" />
                                            </div>
                                            <p className="text-sm font-bold text-slate-900">Click to upload photos or documents</p>
                                            <p className="text-xs text-slate-400 mt-1">Supports JPG, PNG, PDF</p>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-slate-100 flex justify-end">
                                        <Button
                                            size="lg"
                                            onClick={handleSaveDocumentation}
                                            className="shadow-lg shadow-green-200 bg-green-600 hover:bg-green-700 text-white"
                                        >
                                            <CheckCircle2 className="w-5 h-5 mr-2" />
                                            Mark Complete & Save
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                                <FileText className="w-16 h-16 text-slate-300 mb-4" />
                                <h3 className="text-lg font-bold text-slate-400">Select an event to document</h3>
                                <p className="text-sm text-slate-400 mt-1 max-w-xs">Choose a scheduled event from the list to add actual timings and upload photos.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
