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
    Filter,
    Pencil,
    Trash2
} from 'lucide-react';
import { PlanTodayEvent, PlanTodayAttendee } from '../../types';

import { useMockData } from '../../context/MockDataContext';

const HOURS = Array.from({ length: 18 }, (_, i) => i + 6); // 6 AM to 11 PM
const HOUR_HEIGHT = 80;

const parseTimeToMinutes = (timeStr: string) => {
    if (!timeStr) return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + (minutes || 0);
};

const parseDurationToMinutes = (durationStr: string) => {
    let mins = 0;
    if (durationStr.includes('h')) {
        const hours = parseInt(durationStr.split('h')[0]) || 0;
        mins += hours * 60;
    }
    if (durationStr.includes('m')) {
        const parts = durationStr.split(' ');
        const mPart = parts.find(p => p.includes('m'));
        const minutes = parseInt(mPart?.replace('m', '') || '0') || 0;
        mins += minutes;
    }
    return mins || 60;
};

export const PlanTodayPaPage: React.FC = () => {
    const { events, addEvent, updateEvent } = useMockData();
    const [view, setView] = useState<'list' | 'create'>('list');
    const [selectedDate, setSelectedDate] = useState(new Date());

    const [isDayFinalized, setIsDayFinalized] = useState(false);
    const [showFinalizeModal, setShowFinalizeModal] = useState(false);

    const [newEvent, setNewEvent] = useState<Partial<PlanTodayEvent>>({
        type: 'Visit',
        attendees: [],
    });
    const [durationMinutes, setDurationMinutes] = useState(60);
    const [tempAttendee, setTempAttendee] = useState<Partial<PlanTodayAttendee>>({});

    const selectedDateStr = selectedDate.toISOString().split('T')[0];
    const dayEvents = events.filter(e => e.date === selectedDateStr);

    const handleFinalizeDay = () => {
        dayEvents.forEach(e => {
            updateEvent({ ...e, status: 'Scheduled' });
        });
        setIsDayFinalized(true);
        setShowFinalizeModal(false);
    };

    const handleCreateEvent = (addAnother = false) => {
        if (!newEvent.title || !newEvent.startTime) return;

        const hours = Math.floor(durationMinutes / 60);
        const mins = durationMinutes % 60;
        const durationStr = hours > 0 ? `${hours}h${mins > 0 ? ` ${mins}m` : ''}` : `${mins}m`;

        const event: PlanTodayEvent = {
            id: `e-${Date.now()}`,
            title: newEvent.title!,
            type: newEvent.type as any,
            date: newEvent.date || selectedDateStr,
            startTime: newEvent.startTime!,
            duration: durationStr,
            location: newEvent.location || { name: '', address: '' },
            attendees: newEvent.attendees || [],
            purpose: newEvent.purpose || '',
            status: isDayFinalized ? 'Scheduled' : 'Scheduled',
            createdAt: new Date().toISOString(),
            createdBy: 'u-pa-1'
        };

        addEvent(event);

        setNewEvent({ type: 'Visit', attendees: [] });
        setDurationMinutes(60);
        if (!addAnother) {
            setView('list');
        }
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

    const getEventStyle = (event: PlanTodayEvent) => {
        const startMins = parseTimeToMinutes(event.startTime);
        const durationMins = parseDurationToMinutes(event.duration);
        const topOffset = ((startMins - 6 * 60) / 60) * HOUR_HEIGHT;
        const height = (durationMins / 60) * HOUR_HEIGHT;

        return {
            top: `${Math.max(0, topOffset)}px`,
            height: `${height}px`,
        };
    };

    const format12Hour = (hour24: number) => {
        const ampm = hour24 >= 12 ? 'PM' : 'AM';
        const h = hour24 % 12 || 12;
        return `${h} ${ampm}`;
    };

    const getEventColor = (type: string) => {
        switch (type) {
            case 'Visit': return 'border-indigo-500 bg-indigo-50 text-indigo-900 border-l-indigo-500';
            case 'Meeting': return 'border-orange-500 bg-orange-50 text-orange-900 border-l-orange-500';
            case 'Inspection': return 'border-red-500 bg-red-50 text-red-900 border-l-red-500';
            case 'Tour': return 'border-emerald-500 bg-emerald-50 text-emerald-900 border-l-emerald-500';
            default: return 'border-blue-500 bg-blue-50 text-blue-900 border-l-blue-500';
        }
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-20 relative">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Plan Today</h2>
                    <p className="text-slate-500 font-medium mt-1">Schedule and manage daily events and visits.</p>
                </div>
                {view === 'list' && (
                    <div className="flex gap-3">
                        <Button
                            onClick={() => setShowFinalizeModal(true)}
                            disabled={isDayFinalized || dayEvents.length === 0}
                            variant={isDayFinalized ? "secondary" : "primary"}
                            className={!isDayFinalized ? "shadow-lg shadow-blue-200 bg-blue-600 hover:bg-blue-700" : ""}
                        >
                            {isDayFinalized ? 'Day Finalized ✓' : 'Finalize Day Plan'}
                        </Button>
                        <Button onClick={() => setView('create')} className="shadow-lg shadow-indigo-200">
                            <Plus className="w-5 h-5 mr-2" />
                            Plan New Event
                        </Button>
                    </div>
                )}
            </div>

            <AnimatePresence mode="wait">
                {view === 'list' && (
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

                        {/* Timeline / Events List */}
                        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden min-h-[600px] relative">
                            {dayEvents.length === 0 ? (
                                <div className="p-16 text-center h-full flex flex-col items-center justify-center min-h-[400px]">
                                    <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-300 shadow-inner">
                                        <CalendarIcon className="w-12 h-12" />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900">No events planned yet.</h3>
                                    <p className="text-slate-500 text-lg mt-2">Start building your day by adding events.</p>
                                    <Button onClick={() => setView('create')} className="mt-8 shadow-lg shadow-indigo-200">
                                        <Plus className="w-5 h-5 mr-2" />
                                        Add Event
                                    </Button>
                                </div>
                            ) : (
                                <div className="relative w-full overflow-y-auto" style={{ height: '700px' }}>
                                    <div className="relative min-h-[1440px] w-full p-4">
                                        {/* Time Axis */}
                                        <div className="absolute left-0 top-0 bottom-0 w-20 border-r border-slate-100 flex flex-col">
                                            {HOURS.map(hour => (
                                                <div key={hour} className="relative w-full border-b border-slate-100" style={{ height: `${HOUR_HEIGHT}px` }}>
                                                    <span className="absolute -top-3 right-4 text-xs font-bold text-slate-400">
                                                        {format12Hour(hour)}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Events Container */}
                                        <div className="absolute left-24 right-4 top-4 bottom-4">
                                            {/* Half Hour Lines Context */}
                                            <div className="absolute inset-0 z-0 pointer-events-none">
                                                {HOURS.map(hour => (
                                                    <div key={hour} className="w-full border-b border-slate-50 border-dashed" style={{ height: `${HOUR_HEIGHT}px` }} />
                                                ))}
                                            </div>

                                            {dayEvents.map((event) => {
                                                const style = getEventStyle(event);
                                                const colorClass = getEventColor(event.type);
                                                return (
                                                    <div
                                                        key={event.id}
                                                        className={`absolute left-0 right-0 rounded-xl border border-l-4 p-3 shadow-sm hover:shadow-md transition-all group z-10 ${colorClass}`}
                                                        style={style}
                                                    >
                                                        <div className="h-full flex flex-col overflow-hidden">
                                                            <div className="flex justify-between items-start">
                                                                <div>
                                                                    <h4 className="font-bold text-sm leading-tight text-slate-900">{event.title}</h4>
                                                                    <div className="flex items-center gap-2 mt-1 text-[10px] font-bold opacity-80 uppercase uppercase tracking-widest text-slate-600">
                                                                        <span>{parseTimeToMinutes(event.startTime) >= 12 * 60 ? event.startTime + ' PM' : event.startTime + ' AM'} ({event.duration})</span>
                                                                        <span>•</span>
                                                                        <span className="flex items-center gap-0.5 truncate max-w-[120px]">
                                                                            {event.location?.name || 'No location'}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                                {/* Hover Actions */}
                                                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                                                    <button className="p-1 hover:bg-white/50 rounded-md text-slate-600">
                                                                        <Pencil className="w-4 h-4" />
                                                                    </button>
                                                                    <button className="p-1 hover:bg-red-100 rounded-md text-red-600">
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            {event.attendees && event.attendees.length > 0 && parseFloat(style.height) >= 60 && (
                                                                <div className="flex items-center gap-1.5 mt-2 opacity-75">
                                                                    <Users className="w-3 h-3" />
                                                                    <span className="text-[10px] font-bold text-slate-600">{event.attendees.length} people involved</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Finalize Dialog */}
                        <AnimatePresence>
                            {showFinalizeModal && (
                                <>
                                    <motion.div
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 transition-opacity"
                                        onClick={() => setShowFinalizeModal(false)}
                                    />
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-3xl shadow-2xl z-50 overflow-hidden"
                                    >
                                        <div className="p-6 text-center">
                                            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-6 mx-auto">
                                                <CalendarIcon className="w-8 h-8 text-blue-600" />
                                            </div>
                                            <h3 className="text-2xl font-black text-slate-900 mb-2">Finalize Day Plan</h3>
                                            <p className="text-slate-500 mb-8 font-medium">
                                                All {dayEvents.length} events will be pushed to Daybook. Confirm?
                                            </p>
                                            <div className="flex gap-3">
                                                <Button variant="ghost" className="flex-1" onClick={() => setShowFinalizeModal(false)}>Cancel</Button>
                                                <Button className="flex-1 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200" onClick={handleFinalizeDay}>Confirm</Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Modal Overlay & Slide-over */}
            <AnimatePresence>
                {view === 'create' && (
                    <>
                        {/* Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-30"
                            onClick={() => setView('list')}
                        />
                        {/* Slide-over */}
                        <motion.div
                            initial={{ opacity: 0, x: '100%' }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-white shadow-2xl border-l border-slate-100 z-40 flex flex-col"
                        >
                            <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-slate-100 p-6 flex justify-between items-center z-10 shrink-0">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900">Add Event</h3>
                                    <p className="text-xs text-slate-500 uppercase font-bold tracking-widest mt-1">Fill details below</p>
                                </div>
                                <button onClick={() => setView('list')} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-6 space-y-8 flex-1 overflow-y-auto">
                                {/* Title */}
                                <div className="space-y-1">
                                    <div className="flex justify-between items-end mb-2">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Event Title <span className="text-red-500">*</span></label>
                                        <span className="text-[10px] font-bold text-slate-400">{newEvent.title?.length || 0}/100</span>
                                    </div>
                                    <input
                                        type="text"
                                        maxLength={100}
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 focus:bg-white font-bold text-slate-900 outline-none transition-all"
                                        placeholder="e.g. Project Inauguration"
                                        value={newEvent.title || ''}
                                        onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                                    />
                                </div>

                                {/* Type */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest block">Event Type</label>
                                    <div className="flex flex-wrap gap-2">
                                        {['Meeting', 'Visit', 'Inspection', 'Tour', 'Other'].map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setNewEvent({ ...newEvent, type: type as any })}
                                                className={`px-4 py-2 rounded-lg text-sm font-bold border transition-colors ${newEvent.type === type
                                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200'
                                                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    {/* Time format 12h */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Scheduled Time <span className="text-red-500">*</span></label>
                                        <input
                                            type="time"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 font-bold text-slate-900 outline-none"
                                            value={newEvent.startTime || ''}
                                            onChange={e => setNewEvent({ ...newEvent, startTime: e.target.value })}
                                        />
                                    </div>
                                    {/* Duration */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Estimated Duration</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                min="15"
                                                step="15"
                                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 font-bold text-slate-900 outline-none pr-20"
                                                value={durationMinutes}
                                                onChange={e => setDurationMinutes(parseInt(e.target.value) || 0)}
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">minutes</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Location */}
                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <h4 className="text-sm font-bold text-slate-900">Location Details</h4>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Location Name</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 font-bold text-slate-900 outline-none"
                                            placeholder="e.g. Village Panchayat HQ"
                                            value={newEvent.location?.name || ''}
                                            onChange={e => setNewEvent({ ...newEvent, location: { ...newEvent.location!, name: e.target.value, address: newEvent.location?.address || '' } })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Full Address</label>
                                        <textarea
                                            rows={2}
                                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 font-medium text-slate-700 outline-none resize-none"
                                            placeholder="e.g. Main road, Sector 5..."
                                            value={newEvent.location?.address || ''}
                                            onChange={e => setNewEvent({ ...newEvent, location: { ...newEvent.location!, address: e.target.value, name: newEvent.location?.name || '' } })}
                                        />
                                    </div>

                                    {/* Map Mock */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Map Coordinates</label>
                                        <div className="w-full h-32 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center relative overflow-hidden group cursor-pointer">
                                            <div className="absolute inset-0 bg-[url('https://maps.googleapis.com/maps/api/staticmap?center=28.6139,77.2090&zoom=14&size=600x300&key=MOCK_KEY')] bg-cover bg-center opacity-30 grayscale" />
                                            <div className="absolute inset-0 bg-blue-50/60 backdrop-blur-sm" />
                                            <div className="z-10 flex flex-col items-center">
                                                <MapPin className="w-8 h-8 text-blue-500 mb-2" />
                                                <span className="text-xs font-bold text-blue-700 group-hover:text-blue-800 bg-white/80 px-3 py-1 rounded-full shadow-sm">Click to drop a pin</span>
                                                <span className="text-[10px] text-slate-500 mt-1">or enter lat/lng manually</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Purpose */}
                                <div className="space-y-2 pt-4 border-t border-slate-100">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Purpose / Agenda</label>
                                    <textarea
                                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 font-medium text-slate-700 outline-none resize-none min-h-[100px]"
                                        placeholder="Agenda details..."
                                        value={newEvent.purpose || ''}
                                        onChange={e => setNewEvent({ ...newEvent, purpose: e.target.value })}
                                    />
                                </div>

                                {/* People Involved (Attendees) */}
                                <div className="space-y-3 pt-4 border-t border-slate-100">
                                    <h4 className="text-sm font-bold text-slate-900">People Involved</h4>

                                    <div className="space-y-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                        <div className="gap-3 flex flex-col relative">
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Name"
                                                    className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 flex-1 outline-none focus:border-indigo-400"
                                                    value={tempAttendee.name || ''}
                                                    onChange={e => setTempAttendee({ ...tempAttendee, name: e.target.value })}
                                                    onKeyDown={e => { if (e.key === 'Enter') addAttendee() }}
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Designation"
                                                    className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 flex-1 outline-none focus:border-indigo-400"
                                                    value={tempAttendee.designation || ''}
                                                    onChange={e => setTempAttendee({ ...tempAttendee, designation: e.target.value })}
                                                    onKeyDown={e => { if (e.key === 'Enter') addAttendee() }}
                                                />
                                            </div>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Contact"
                                                    className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 flex-1 outline-none focus:border-indigo-400"
                                                    value={tempAttendee.contact || ''}
                                                    onChange={e => setTempAttendee({ ...tempAttendee, contact: e.target.value })}
                                                    onKeyDown={e => { if (e.key === 'Enter') addAttendee() }}
                                                />
                                                <Button size="sm" className="px-6 rounded-xl" onClick={addAttendee} disabled={!tempAttendee.name}>Add Tag</Button>
                                            </div>
                                        </div>

                                        {/* Chips */}
                                        {newEvent.attendees && newEvent.attendees.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-200 border-dashed">
                                                {newEvent.attendees.map((att) => (
                                                    <div key={att.id} className="inline-flex items-center bg-white pl-3 pr-1 py-1.5 rounded-lg border border-slate-200 shadow-sm gap-2">
                                                        <div>
                                                            <span className="text-xs font-bold text-slate-800">{att.name}</span>
                                                            {att.designation && <span className="text-[10px] text-slate-500 ml-1">({att.designation})</span>}
                                                        </div>
                                                        <button onClick={() => removeAttendee(att.id)} className="text-slate-400 hover:text-red-500 rounded-md hover:bg-red-50 p-1 transition-colors">
                                                            <X className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Footer Buttons */}
                            <div className="bg-white border-t border-slate-100 p-6 flex justify-end gap-3 shrink-0">
                                <Button variant="secondary" onClick={() => handleCreateEvent(true)}>Save & Add Another</Button>
                                <Button onClick={() => handleCreateEvent(false)} disabled={!newEvent.title || !newEvent.startTime} className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200">
                                    Save & Done
                                </Button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

