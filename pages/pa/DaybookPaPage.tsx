import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { useMockData } from '../../context/MockDataContext';
import { PlanTodayEvent } from '../../types';
import {
    Calendar as CalendarIcon,
    Search,
    History,
    CheckCircle2,
    XCircle,
    Mic,
    Play,
    Pause,
    FileText,
    ChevronLeft,
    ChevronRight,
    MapPin,
    Users,
    X,
    MessageSquare,
    Loader2
} from 'lucide-react';

export const DaybookPaPage: React.FC = () => {
    const { events, updateEvent } = useMockData();
    const [activeTab, setActiveTab] = useState<'today' | 'past'>('today');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [showCalendar, setShowCalendar] = useState(false);
    const [calendarMonth, setCalendarMonth] = useState(new Date());

    // Modals state
    const [activeUpdateEvent, setActiveUpdateEvent] = useState<PlanTodayEvent | null>(null);
    const [activeStatusEvent, setActiveStatusEvent] = useState<PlanTodayEvent | null>(null);

    // Toast state
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const showToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 4000);
    };

    // Filter events for the selected date
    const dateStr = selectedDate.toISOString().split('T')[0];
    let displayEvents = events.filter(e => e.date === dateStr);

    const todayStr = new Date().toISOString().split('T')[0];
    const eventDates = useMemo(() => new Set(events.map(e => e.date).filter(Boolean)), [events]);
    const calYear = calendarMonth.getFullYear();
    const calMonthIdx = calendarMonth.getMonth();
    const calendarDays = useMemo((): (number | null)[] => {
        const dim = new Date(calYear, calMonthIdx + 1, 0).getDate();
        const fdow = new Date(calYear, calMonthIdx, 1).getDay();
        return [...Array(fdow).fill(null), ...Array.from({ length: dim }, (_, i) => i + 1)];
    }, [calYear, calMonthIdx]);

    // Sort chronologically
    displayEvents.sort((a, b) => {
        const timeA = a.startTime.split(':').map(Number);
        const timeB = b.startTime.split(':').map(Number);
        return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
    });

    const completedCount = displayEvents.filter(e => e.status === 'Visited' || e.status === 'Cancelled').length;
    const progressPercent = displayEvents.length > 0 ? (completedCount / displayEvents.length) * 100 : 0;

    const navigateDate = (days: number) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + days);
        setSelectedDate(newDate);
        setActiveTab(newDate.toDateString() === new Date().toDateString() ? 'today' : 'past');
    };

    const StatusBadge = ({ status }: { status: PlanTodayEvent['status'] }) => {
        const config = {
            Scheduled: { bg: 'bg-blue-100', text: 'text-blue-700' },
            In_Progress: { bg: 'bg-orange-100', text: 'text-orange-700' },
            Visited: { bg: 'bg-green-100', text: 'text-green-700' },
            Completed: { bg: 'bg-green-100', text: 'text-green-700' },
            Cancelled: { bg: 'bg-red-100', text: 'text-red-700' }
        }[status] || { bg: 'bg-slate-100', text: 'text-slate-700' };

        return (
            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${config.bg} ${config.text}`}>
                {status.replace('_', ' ')}
            </span>
        );
    };

    const getBorderColor = (status: string) => {
        switch (status) {
            case 'Scheduled': return 'bg-blue-500';
            case 'In_Progress': return 'bg-orange-500';
            case 'Visited':
            case 'Completed': return 'bg-green-500';
            case 'Cancelled': return 'bg-red-500';
            default: return 'bg-slate-300';
        }
    };

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-20 relative">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Daybook</h2>
                    <p className="text-slate-500 font-medium mt-1">Real-time event execution tracker.</p>
                </div>
            </header>

            {/* Tabs & Progress */}
            <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                <div className="flex gap-1 p-1.5 bg-slate-100 rounded-2xl w-fit">
                    <button
                        onClick={() => {
                            setActiveTab('today');
                            setSelectedDate(new Date());
                        }}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'today' ? 'bg-white text-indigo-600 shadow-sm' : 'bg-white text-black border border-slate-200 hover:bg-slate-100'} `}
                    >
                        <CalendarIcon className="w-4 h-4" /> Today
                    </button>
                    <button
                        onClick={() => setActiveTab('past')}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'past' ? 'bg-white text-indigo-600 shadow-sm' : 'bg-white text-black border border-slate-200 hover:bg-slate-100'} `}
                    >
                        <History className="w-4 h-4" /> Past Days
                    </button>
                </div>

                <div className="flex-1 max-w-md w-full">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-bold text-slate-700">
                            {completedCount} of {displayEvents.length} events completed {activeTab === 'today' ? 'today' : 'on selected date'}
                        </span>
                        <span className="text-xs font-black text-slate-400">{Math.round(progressPercent)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <motion.div
                            className="bg-indigo-500 h-full rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                </div>
            </div>

            {/* Date Navigation */}
            {activeTab === 'past' && (
                <div className="relative">
                    <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200">
                        <Button variant="ghost" size="sm" onClick={() => navigateDate(-1)}>
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                        <div className="flex flex-col items-center gap-1">
                            <button
                                onClick={() => { setCalendarMonth(new Date(selectedDate)); setShowCalendar(v => !v); }}
                                className="text-center hover:opacity-75 transition-opacity"
                            >
                                <h3 className="text-lg font-black text-slate-900">
                                    {selectedDate.toLocaleDateString('default', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                </h3>
                                <p className="text-xs text-indigo-500 font-bold uppercase tracking-widest">Tap to pick date</p>
                            </button>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => navigateDate(1)}>
                            <ChevronRight className="w-5 h-5" />
                        </Button>
                    </div>

                    {showCalendar && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl z-20 p-4">
                            <div className="flex items-center justify-between mb-3">
                                <button
                                    onClick={() => { const d = new Date(calendarMonth); d.setMonth(d.getMonth() - 1); setCalendarMonth(d); }}
                                    className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4 text-slate-600" />
                                </button>
                                <span className="text-sm font-black text-slate-900">
                                    {calendarMonth.toLocaleDateString('default', { month: 'long', year: 'numeric' })}
                                </span>
                                <button
                                    onClick={() => { const d = new Date(calendarMonth); d.setMonth(d.getMonth() + 1); setCalendarMonth(d); }}
                                    className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                    <ChevronRight className="w-4 h-4 text-slate-600" />
                                </button>
                            </div>
                            <div className="grid grid-cols-7 gap-1 mb-2">
                                {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                                    <div key={d} className="text-center text-[10px] font-black text-slate-400 py-1">{d}</div>
                                ))}
                            </div>
                            <div className="grid grid-cols-7 gap-1">
                                {calendarDays.map((day, i) => {
                                    if (!day) return <div key={`blank-${i}`} />;
                                    const dStr = `${calYear}-${String(calMonthIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                                    const isSel = dStr === dateStr;
                                    const isToday = dStr === todayStr;
                                    const hasDot = eventDates.has(dStr);
                                    return (
                                        <button
                                            key={dStr}
                                            onClick={() => {
                                                const d = new Date(calYear, calMonthIdx, day);
                                                setSelectedDate(d);
                                                setActiveTab(d.toDateString() === new Date().toDateString() ? 'today' : 'past');
                                                setShowCalendar(false);
                                            }}
                                            className={`relative aspect-square flex items-center justify-center rounded-xl text-sm font-bold transition-all ${
                                                isSel ? 'bg-indigo-600 text-white shadow-md' :
                                                isToday ? 'ring-2 ring-indigo-400 text-indigo-700 bg-indigo-50' :
                                                'hover:bg-slate-100 text-slate-700'
                                            }`}
                                        >
                                            {day}
                                            {hasDot && !isSel && (
                                                <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Event List */}
            <div className="space-y-4">
                {displayEvents.length === 0 ? (
                    <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                            <CalendarIcon className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">No events found</h3>
                        <p className="text-slate-500 text-sm mt-1">There are no events scheduled for this date.</p>
                    </div>
                ) : (
                    displayEvents.map((evt, idx) => (
                        <Card key={evt.id} className="relative overflow-hidden group border-slate-200" delay={idx * 0.05}>
                            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${getBorderColor(evt.status)}`} />

                            <div className="p-2 sm:p-4 ml-2 flex flex-col md:flex-row gap-6">
                                {/* Time Column */}
                                <div className="md:w-32 flex flex-col items-start border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-4">
                                    <span className="text-2xl font-black text-slate-900 leading-none">{evt.startTime}</span>
                                    <span className="text-xs font-bold text-slate-500 mt-1">{evt.duration}</span>
                                    <div className="mt-3">
                                        <StatusBadge status={evt.status} />
                                    </div>
                                </div>

                                {/* Content Column */}
                                <div className="flex-1 space-y-3">
                                    <h4 className="text-xl font-black text-slate-900">{evt.title}</h4>

                                    <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-600">
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="w-4 h-4 text-slate-400" />
                                            {evt.location.name}
                                        </div>
                                        {evt.attendees.length > 0 && (
                                            <div className="flex items-center gap-1.5">
                                                <Users className="w-4 h-4 text-slate-400" />
                                                <div className="flex flex-wrap gap-1">
                                                    {evt.attendees.map(a => (
                                                        <span key={a.id} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                                            {a.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons & Docs */}
                                    <div className="pt-3 mt-3 border-t border-slate-100 flex flex-wrap gap-3 items-center justify-between">
                                        <div className="flex gap-2">
                                            {evt.status === 'Scheduled' || evt.status === 'In_Progress' ? (
                                                <>
                                                    <Button variant="outline" size="sm" onClick={() => setActiveUpdateEvent(evt)}>
                                                        <MessageSquare className="w-4 h-4 mr-1.5" /> Update Details
                                                    </Button>
                                                    <Button size="sm" onClick={() => setActiveStatusEvent(evt)}>
                                                        <CheckCircle2 className="w-4 h-4 mr-1.5" /> Mark Final Status
                                                    </Button>
                                                </>
                                            ) : (
                                                <div className="flex items-center gap-4 w-full">
                                                    <div className="flex-1 bg-slate-50 rounded-lg p-3 border border-slate-100">
                                                        <p className="text-xs font-medium text-slate-600 italic">
                                                            {evt.documentation?.textNotes || "No final notes provided."}
                                                        </p>
                                                    </div>
                                                    <Button variant="ghost" size="sm" className="text-indigo-600 hover:bg-indigo-50">
                                                        View Details
                                                    </Button>
                                                </div>
                                            )}
                                        </div>

                                        {evt.documentation?.hasVoiceNote && (
                                            <button className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-full transition-colors">
                                                <Mic className="w-3.5 h-3.5" />
                                                Play Recording ({evt.documentation.voiceNoteDuration || '0:00'})
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            {/* Toast Notification */}
            <AnimatePresence>
                {toastMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl font-medium text-sm z-[100] flex items-center gap-3"
                    >
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        {toastMessage}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Update Details Modal */}
            <UpdateDetailsModal
                event={activeUpdateEvent}
                onClose={() => setActiveUpdateEvent(null)}
                onSave={(updates) => {
                    if (activeUpdateEvent) {
                        const updatedEvent = {
                            ...activeUpdateEvent,
                            documentation: {
                                ...activeUpdateEvent.documentation,
                                ...updates
                            }
                        };
                        updateEvent(updatedEvent);
                        setActiveUpdateEvent(null);
                        showToast(`Staff notified of update to ${activeUpdateEvent.title}`);
                    }
                }}
            />

            {/* Mark Final Status Modal */}
            <MarkStatusModal
                event={activeStatusEvent}
                onClose={() => setActiveStatusEvent(null)}
                onSave={(status, notes) => {
                    if (activeStatusEvent) {
                        const updatedEvent = {
                            ...activeStatusEvent,
                            status: status as any,
                            documentation: {
                                ...activeStatusEvent.documentation,
                                textNotes: notes
                            }
                        };
                        updateEvent(updatedEvent);
                        setActiveStatusEvent(null);
                        showToast(`Staff notified — ${activeStatusEvent.title} marked as ${status.toUpperCase()}`);
                    }
                }}
            />
        </div>
    );
};

// --- Subcomponents ---

const UpdateDetailsModal = ({ event, onClose, onSave }: { event: PlanTodayEvent | null, onClose: () => void, onSave: (docs: any) => void }) => {
    const [tab, setTab] = useState<'text' | 'voice'>('text');
    const [notes, setNotes] = useState('');

    // Voice recording states
    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [transcript, setTranscript] = useState('');

    useEffect(() => {
        if (event) {
            setNotes(event.documentation?.textNotes || '');
            setTranscript('');
            setIsRecording(false);
            setIsTranscribing(false);
        }
    }, [event]);

    if (!event) return null;

    const handleToggleRecording = () => {
        if (isRecording) {
            setIsRecording(false);
            setIsTranscribing(true);
            setTimeout(() => {
                setIsTranscribing(false);
                setTranscript("Mock transcription completed successfully capturing key points about the delayed material supply at the venue.");
            }, 2500);
        } else {
            setIsRecording(true);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
            >
                <div className="p-6 border-b border-slate-100 flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-black text-slate-900">Update Details</h3>
                        <p className="text-sm font-bold text-indigo-600 mt-1">{event.title}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="border-b border-slate-100 flex">
                    <button
                        onClick={() => setTab('text')}
                        className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors ${tab === 'text' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                    >
                        <FileText className="w-4 h-4 inline mr-2" /> Text Notes
                    </button>
                    <button
                        onClick={() => setTab('voice')}
                        className={`flex-1 py-4 text-sm font-bold border-b-2 transition-colors ${tab === 'voice' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
                    >
                        <Mic className="w-4 h-4 inline mr-2" /> Voice Recording
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {tab === 'text' ? (
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Event Notes</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Details about this event..."
                                className="w-full h-40 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none resize-none font-medium text-slate-700"
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col items-center py-8">
                            <button
                                onClick={handleToggleRecording}
                                disabled={isTranscribing}
                                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${isTranscribing ? 'bg-slate-100 text-slate-400' :
                                        isRecording ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-200' :
                                            'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                                    }`}
                            >
                                {isTranscribing ? <Loader2 className="w-8 h-8 animate-spin" /> : <Mic className="w-10 h-10" />}
                            </button>
                            <p className="mt-6 font-bold text-slate-700">
                                {isTranscribing ? 'Transcribing...' : isRecording ? 'Recording... click to stop' : transcript ? 'Recorded Successfully' : 'Tap to Start Recording'}
                            </p>

                            {transcript && (
                                <div className="mt-8 w-full">
                                    <div className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Transcript</div>
                                    <div className="p-4 bg-indigo-50 text-indigo-900 border border-indigo-100 rounded-xl text-sm font-medium leading-relaxed">
                                        {transcript}
                                    </div>
                                    <Button variant="ghost" size="sm" className="mt-2 w-full text-slate-500" onClick={() => { setTranscript(''); setIsRecording(true); }}>
                                        Re-record
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-6 border-t border-slate-100 bg-slate-50">
                    <Button
                        fullWidth
                        size="lg"
                        onClick={() => onSave({
                            textNotes: tab === 'text' ? notes : (notes + (transcript ? '\n\nTranscript:\n' + transcript : '')),
                            hasVoiceNote: !!transcript,
                            voiceNoteDuration: '0:25'
                        })}
                    >
                        Save & Notify Staff
                    </Button>
                </div>
            </motion.div>
        </div>
    );
};

const MarkStatusModal = ({ event, onClose, onSave }: { event: PlanTodayEvent | null, onClose: () => void, onSave: (status: string, notes: string) => void }) => {
    const [selection, setSelection] = useState<'attended' | 'not_attended' | null>(null);
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (event) {
            setSelection(null);
            setNotes('');
        }
    }, [event]);

    if (!event) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
            >
                <div className="p-6 border-b border-slate-100 flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-black text-slate-900">Mark Final Status</h3>
                        <p className="text-sm font-bold text-slate-500 mt-1">{event.title}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={() => setSelection('attended')}
                            className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${selection === 'attended' ? 'border-green-500 bg-green-50 text-green-700 shadow-md shadow-green-100' : 'border-slate-200 text-slate-600 hover:border-green-200 hover:bg-green-50/50'
                                }`}
                        >
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${selection === 'attended' ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <span className="font-bold">I Attended</span>
                        </button>

                        <button
                            onClick={() => setSelection('not_attended')}
                            className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${selection === 'not_attended' ? 'border-red-500 bg-red-50 text-red-700 shadow-md shadow-red-100' : 'border-slate-200 text-slate-600 hover:border-red-200 hover:bg-red-50/50'
                                }`}
                        >
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${selection === 'not_attended' ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                <XCircle className="w-6 h-6" />
                            </div>
                            <span className="font-bold">Did Not Attend</span>
                        </button>
                    </div>

                    <AnimatePresence mode="wait">
                        {selection && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="space-y-4 pt-4 border-t border-slate-100"
                            >
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                        {selection === 'attended' ? 'Final notes about the event (optional)' : 'Reason for not attending'}
                                    </label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        className="w-full h-24 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none resize-none font-medium text-slate-700"
                                    />
                                </div>

                                <Button
                                    fullWidth
                                    size="lg"
                                    className={selection === 'attended' ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500 shadow-green-200' : 'bg-red-600 hover:bg-red-700 focus:ring-red-500 shadow-red-200'}
                                    onClick={() => onSave(selection === 'attended' ? 'Visited' : 'Cancelled', notes)}
                                >
                                    {selection === 'attended' ? 'Submit Final Details' : 'Confirm Cancellation'}
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
};
