import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import {
    Calendar as CalendarIcon,
    Plus,
    Clock,
    MapPin,
    Users,
    AlignLeft,
    CheckCircle2,
    X,
    ChevronLeft,
    ChevronRight,
    Search,
    Filter
} from 'lucide-react';
import { PlanTodayEvent, PlanTodayAttendee } from '../../types';

import { useMockData } from '../../context/MockDataContext';

export const PlanTodayPaPage: React.FC = () => {
    const { events, addEvent } = useMockData();
    const [view, setView] = useState<'list' | 'create'>('list');
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Form State
    const [newEvent, setNewEvent] = useState<Partial<PlanTodayEvent>>({
        type: 'Visit',
        attendees: []
    });
    const [tempAttendee, setTempAttendee] = useState<Partial<PlanTodayAttendee>>({});

    const handleCreateEvent = () => {
        if (!newEvent.title || !newEvent.date || !newEvent.startTime) return;

        const event: PlanTodayEvent = {
            id: `e-${Date.now()}`,
            title: newEvent.title!,
            type: newEvent.type as any,
            date: newEvent.date!,
            startTime: newEvent.startTime!,
            duration: newEvent.duration || '1h',
            location: newEvent.location || { name: '', address: '' },
            attendees: newEvent.attendees || [],
            purpose: newEvent.purpose || '',
            status: 'Scheduled',
            createdAt: new Date().toISOString(),
            createdBy: 'u-pa-1'
        };

        addEvent(event);
        setView('list');
        setNewEvent({ type: 'Visit', attendees: [] });
    };

    const addAttendee = () => {
        if (!tempAttendee.name) return;
        const attendee: PlanTodayAttendee = {
            id: `a-${Date.now()}`,
            name: tempAttendee.name!,
            designation: tempAttendee.designation || '',
            contact: tempAttendee.contact || ''
        };
        setNewEvent({ ...newEvent, attendees: [...(newEvent.attendees || []), attendee] });
        setTempAttendee({});
    };

    const removeAttendee = (id: string) => {
        setNewEvent({ ...newEvent, attendees: newEvent.attendees?.filter(a => a.id !== id) });
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Plan Today</h2>
                    <p className="text-slate-500 font-medium mt-1">Schedule and manage daily events and visits.</p>
                </div>
                {view === 'list' && (
                    <Button onClick={() => setView('create')} className="shadow-lg shadow-indigo-200">
                        <Plus className="w-5 h-5 mr-2" />
                        Plan New Event
                    </Button>
                )}
            </div>

            <AnimatePresence mode="wait">
                {view === 'list' ? (
                    <motion.div
                        key="list"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        {/* Date Navigation */}
                        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                            <Button variant="ghost" size="sm" onClick={() => setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() - 1)))}>
                                <ChevronLeft className="w-5 h-5" />
                            </Button>
                            <div className="text-center">
                                <h3 className="text-lg font-black text-slate-900">
                                    {selectedDate.toLocaleDateString('default', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                </h3>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                                    {selectedDate.toDateString() === new Date().toDateString() ? "Today's Schedule" : "Selected Date"}
                                </p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() + 1)))}>
                                <ChevronRight className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Events List */}
                        <div className="grid gap-4">
                            {events.filter(e => e.date === selectedDate.toISOString().split('T')[0]).length === 0 ? (
                                <div className="p-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 shadow-sm">
                                        <CalendarIcon className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900">No events scheduled</h3>
                                    <p className="text-slate-500 text-sm mt-1">Click "Plan New Event" to add to the schedule.</p>
                                </div>
                            ) : (
                                events.filter(e => e.date === selectedDate.toISOString().split('T')[0]).map((event, idx) => (
                                    <Card key={event.id} className="hover:shadow-md transition-shadow group border-slate-200 overflow-hidden" delay={idx * 0.05}>
                                        <div className="flex flex-col md:flex-row gap-6 relative">
                                            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${event.type === 'Visit' ? 'bg-indigo-500' :
                                                event.type === 'Meeting' ? 'bg-orange-500' :
                                                    event.type === 'Inspection' ? 'bg-red-500' : 'bg-blue-500'
                                                }`} />

                                            {/* Time Column */}
                                            <div className="md:w-32 flex flex-row md:flex-col gap-2 items-center md:items-start md:border-r border-slate-100 pr-6 pl-4 py-2">
                                                <div className="text-center md:text-left">
                                                    <span className="text-2xl font-black text-slate-900 block">{event.startTime}</span>
                                                    <span className="text-xs font-bold text-slate-400 block">{event.duration}</span>
                                                </div>
                                                <span className={`mt-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full block w-fit ${event.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                                                    }`}>
                                                    {event.status}
                                                </span>
                                            </div>

                                            {/* Content Column */}
                                            <div className="flex-1 space-y-3 py-1">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h4 className="text-xl font-black text-slate-900">{event.title}</h4>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                                                                {event.type}
                                                            </span>
                                                            <span className="text-xs text-slate-500 flex items-center gap-1">
                                                                <MapPin className="w-3 h-3" /> {event.location.name}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <p className="text-sm text-slate-600 line-clamp-2">{event.purpose}</p>

                                                {event.attendees.length > 0 && (
                                                    <div className="flex items-center gap-2 pt-2 border-t border-slate-50">
                                                        <Users className="w-3 h-3 text-slate-400" />
                                                        <span className="text-xs font-bold text-slate-500">
                                                            {event.attendees.map(a => a.name).join(', ')}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                ))
                            )}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="create"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden"
                    >
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-black text-slate-900">New Event Details</h3>
                                <p className="text-xs text-slate-500 uppercase font-bold tracking-widest">Enter comprehensive event information</p>
                            </div>
                            <Button variant="ghost" onClick={() => setView('list')}>Cancel</Button>
                        </div>

                        <div className="p-8 space-y-8">
                            {/* Basic Info Section */}
                            <section className="space-y-4">
                                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">1</div>
                                    Basic Information
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-8">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Event Title</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 font-bold text-slate-900 outline-none"
                                            placeholder="e.g. Inauguration Ceremony"
                                            value={newEvent.title || ''}
                                            onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Event Type</label>
                                        <select
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 font-bold text-slate-900 outline-none"
                                            value={newEvent.type}
                                            onChange={e => setNewEvent({ ...newEvent, type: e.target.value as any })}
                                        >
                                            <option value="Visit">Visit</option>
                                            <option value="Meeting">Meeting</option>
                                            <option value="Inspection">Inspection</option>
                                            <option value="Tour">Tour</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Date</label>
                                        <input
                                            type="date"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 font-bold text-slate-900 outline-none"
                                            value={newEvent.date || ''}
                                            onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Start Time</label>
                                            <input
                                                type="time"
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 font-bold text-slate-900 outline-none"
                                                value={newEvent.startTime || ''}
                                                onChange={e => setNewEvent({ ...newEvent, startTime: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Duration</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. 1h 30m"
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 font-bold text-slate-900 outline-none"
                                                value={newEvent.duration || ''}
                                                onChange={e => setNewEvent({ ...newEvent, duration: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <div className="h-px bg-slate-100 w-full" />

                            {/* Location Section */}
                            <section className="space-y-4">
                                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">2</div>
                                    Location Details
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-8">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Location Name</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 font-bold text-slate-900 outline-none"
                                            placeholder="e.g. Community Hall"
                                            value={newEvent.location?.name || ''}
                                            onChange={e => setNewEvent({ ...newEvent, location: { ...newEvent.location!, name: e.target.value, address: newEvent.location?.address || '' } })}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Address / Coordinates</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 font-bold text-slate-900 outline-none"
                                            placeholder="e.g. Sector 12, Main Road"
                                            value={newEvent.location?.address || ''}
                                            onChange={e => setNewEvent({ ...newEvent, location: { ...newEvent.location!, address: e.target.value, name: newEvent.location?.name || '' } })}
                                        />
                                    </div>
                                </div>
                            </section>

                            <div className="h-px bg-slate-100 w-full" />

                            {/* Attendees Section */}
                            <section className="space-y-4">
                                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">3</div>
                                    Attendees & Purpose
                                </h4>
                                <div className="pl-8 space-y-6">
                                    {/* Purpose */}
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Purpose / Description</label>
                                        <textarea
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 font-medium text-slate-700 outline-none resize-none min-h-[80px]"
                                            placeholder="Briefly describe the purpose of this event..."
                                            value={newEvent.purpose || ''}
                                            onChange={e => setNewEvent({ ...newEvent, purpose: e.target.value })}
                                        />
                                    </div>

                                    {/* Attendees List */}
                                    <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <h5 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Key Attendees</h5>

                                        {/* Add Attendee Inputs */}
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            <input
                                                type="text"
                                                placeholder="Name"
                                                className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                                                value={tempAttendee.name || ''}
                                                onChange={e => setTempAttendee({ ...tempAttendee, name: e.target.value })}
                                            />
                                            <input
                                                type="text"
                                                placeholder="Designation"
                                                className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                                                value={tempAttendee.designation || ''}
                                                onChange={e => setTempAttendee({ ...tempAttendee, designation: e.target.value })}
                                            />
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Contact"
                                                    className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm flex-1"
                                                    value={tempAttendee.contact || ''}
                                                    onChange={e => setTempAttendee({ ...tempAttendee, contact: e.target.value })}
                                                />
                                                <Button size="sm" onClick={addAttendee} disabled={!tempAttendee.name}>Add</Button>
                                            </div>
                                        </div>

                                        {/* List */}
                                        <div className="space-y-2 mt-2">
                                            {newEvent.attendees?.map((att) => (
                                                <div key={att.id} className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-slate-100 shadow-sm">
                                                    <div>
                                                        <span className="text-sm font-bold text-slate-900">{att.name}</span>
                                                        <span className="text-xs text-slate-500 ml-2">({att.designation})</span>
                                                    </div>
                                                    <button onClick={() => removeAttendee(att.id)} className="text-slate-400 hover:text-red-500">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                            <Button variant="ghost" onClick={() => setView('list')}>Cancel</Button>
                            <Button onClick={handleCreateEvent} className="shadow-lg shadow-indigo-200">
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Confirm & Schedule
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
