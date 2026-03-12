
import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Trash2, 
  Pencil, 
  X, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Map as MapIcon,
  Info
} from 'lucide-react';
import { Button } from '../../components/UI/Button';
import { Card } from '../../components/UI/Card';
import { useMockData } from '../../context/MockDataContext';
import { useAuth } from '../../context/AuthContext';
import { planTodayApi } from '../../hooks/usePlanToday';
import { PlanTodayEvent, PlanTodayAttendee } from '../../types';

type PlanEventType = 'MEETING' | 'VISIT' | 'INSPECTION' | 'TOUR' | 'OTHER';
const EVENT_TYPES: PlanEventType[] = ['MEETING', 'VISIT', 'INSPECTION', 'TOUR', 'OTHER'];

const typeToEventType = (t: PlanEventType): PlanTodayEvent['type'] => {
  const map: Record<PlanEventType, PlanTodayEvent['type']> = {
    MEETING: 'Meeting', VISIT: 'Visit', INSPECTION: 'Inspection', TOUR: 'Tour', OTHER: 'Other'
  };
  return map[t];
};
const eventTypeToType = (t: PlanTodayEvent['type']): PlanEventType => {
  const map: Record<PlanTodayEvent['type'], PlanEventType> = {
    Meeting: 'MEETING', Visit: 'VISIT', Inspection: 'INSPECTION', Tour: 'TOUR', Other: 'OTHER'
  };
  return map[t] ?? 'OTHER';
};

const TYPE_COLORS: Record<PlanEventType, string> = {
  MEETING: 'border-blue-500 bg-blue-50 text-blue-700',
  VISIT: 'border-emerald-500 bg-emerald-50 text-emerald-700',
  INSPECTION: 'border-amber-500 bg-amber-50 text-amber-700',
  TOUR: 'border-purple-500 bg-purple-50 text-purple-700',
  OTHER: 'border-slate-500 bg-slate-50 text-slate-700',
};

const HOURS = Array.from({ length: 18 }, (_, i) => i + 6); // 6 AM to 11 PM

const parseMinsFromDuration = (d: string): number => {
  let mins = 0;
  if (d.includes('h')) mins += (parseInt(d.split('h')[0]) || 0) * 60;
  if (d.includes('m')) {
    const part = d.split(' ').find(p => p.includes('m'));
    mins += parseInt(part?.replace('m','') || '0') || 0;
  }
  return mins || 60;
};

// Use local date (not UTC) to avoid timezone-shift bugs in UTC+ zones like IST
const toLocalDateStr = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;

export const PlanTodayPage: React.FC = () => {
  const { events, addEvent, updateEvent } = useMockData();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<PlanTodayEvent | null>(null);
  const [isFinalized, setIsFinalized] = useState(false);
  const [showFinalizeConfirm, setShowFinalizeConfirm] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const timelineRef = useRef<HTMLDivElement>(null);

  const selectedDateStr = toLocalDateStr(selectedDate);
  const todayStr = toLocalDateStr(new Date());

  const dayEvents = useMemo(() =>
    [...events.filter(e => e.date === selectedDateStr)]
      .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [events, selectedDateStr]
  );

  const eventDates = useMemo(() => new Set(events.map(e => e.date).filter(Boolean)), [events]);

  const calYear = calendarMonth.getFullYear();
  const calMonthIdx = calendarMonth.getMonth();
  const calendarDays = useMemo((): (number | null)[] => {
    const dim = new Date(calYear, calMonthIdx + 1, 0).getDate();
    const fdow = new Date(calYear, calMonthIdx, 1).getDay();
    return [...Array(fdow).fill(null), ...Array.from({ length: dim }, (_, i) => i + 1)];
  }, [calYear, calMonthIdx]);

  const formattedDate = selectedDate.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  });

  const handleSaveEvent = async (
    eventData: { title: string; type: PlanEventType; scheduledTime: string; duration: number; locationName: string; address: string; purpose: string; people: PlanTodayAttendee[]; date: string; },
    shouldClose: boolean = true
  ) => {
    try {
    const hours = Math.floor(eventData.duration / 60);
    const mins = eventData.duration % 60;
    const durationStr = hours > 0 ? `${hours}h${mins > 0 ? ` ${mins}m` : ''}` : `${mins}m`;

    if (editingEvent) {
      const updated: PlanTodayEvent = {
        ...editingEvent,
        title: eventData.title,
        type: typeToEventType(eventData.type),
        date: eventData.date,
        startTime: eventData.scheduledTime,
        duration: durationStr,
        location: { name: eventData.locationName, address: eventData.address },
        attendees: eventData.people,
        purpose: eventData.purpose,
      };
      await updateEvent(updated);
      // Navigate to the event's date (use noon to avoid UTC offset issues)
      setSelectedDate(new Date(eventData.date + 'T12:00:00'));
    } else {
      const newEvent: PlanTodayEvent = {
        id: `e-${Date.now()}`,
        title: eventData.title,
        type: typeToEventType(eventData.type),
        date: eventData.date,
        startTime: eventData.scheduledTime,
        duration: durationStr,
        location: { name: eventData.locationName, address: eventData.address },
        attendees: eventData.people,
        purpose: eventData.purpose,
        status: 'Scheduled',
        createdAt: new Date().toISOString(),
        createdBy: 'pa',
      };
      addEvent(newEvent); // optimistic — resolves instantly locally
      setSelectedDate(new Date(eventData.date + 'T12:00:00'));
    }
    if (shouldClose) {
      setIsModalOpen(false);
      setEditingEvent(null);
    }
    } catch (err) {
      console.error('Failed to save event:', err);
      // Still close the modal so the user isn't stuck
      if (shouldClose) {
        setIsModalOpen(false);
        setEditingEvent(null);
      }
    }
  };

  const handleDeleteEvent = async (event: PlanTodayEvent) => {
    // Mark as Cancelled (soft delete)
    await updateEvent({ ...event, status: 'Cancelled' });
  };

  const handleFinalize = async () => {
    // Lock the UI immediately — never block on DB
    setIsFinalized(true);
    setShowFinalizeConfirm(false);
    // Mark the day as finalized in the DB so staff daybook can see it
    if (user?.id) {
      void planTodayApi.finalizeDay(selectedDateStr, user.id);
    }
    // Persist final status for each active event (fire-and-forget)
    dayEvents
      .filter(e => e.status !== 'Cancelled')
      .forEach(e => { void updateEvent({ ...e }); });
  };

  const navigateDay = (delta: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + delta);
    setSelectedDate(d);
    setIsFinalized(false);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header Bar */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{formattedDate}</h1>
          <p className="text-slate-500 mt-1">Daily Schedule Planning for Hon'ble MP</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setEditingEvent(null);
              setIsModalOpen(true);
            }}
            disabled={isFinalized}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const tomorrow = new Date(selectedDate);
              tomorrow.setDate(tomorrow.getDate() + 1);
              setSelectedDate(tomorrow);
              setEditingEvent(null);
              setIsModalOpen(true);
            }}
            disabled={isFinalized}
          >
            <Plus className="w-4 h-4 mr-2" />
            Plan Tomorrow
          </Button>
          <Button
            onClick={() => setShowFinalizeConfirm(true)}
            disabled={isFinalized || dayEvents.filter(e => e.status !== 'Cancelled').length === 0}
            className={isFinalized ? 'bg-emerald-600 hover:bg-emerald-600' : ''}
          >
            {isFinalized ? (
              <><CheckCircle2 className="w-4 h-4 mr-2" /> Day Finalized ✓</>
            ) : (
              'Finalize Day Plan'
            )}
          </Button>
        </div>
      </header>

      {/* Date Navigation */}
      <div className="relative mb-6">
        <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
          <Button variant="ghost" size="sm" onClick={() => navigateDay(-1)}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <div className="flex flex-col items-center gap-1">
            <button
              onClick={() => { setCalendarMonth(new Date(selectedDate)); setShowCalendar(v => !v); }}
              className="flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-indigo-600 transition-colors"
            >
              <Calendar className="w-4 h-4" />
              {selectedDateStr === todayStr ? "Today's Schedule" : formattedDate}
            </button>
            {selectedDateStr !== todayStr && (
              <button
                onClick={() => { setSelectedDate(new Date()); setIsFinalized(false); setShowCalendar(false); }}
                className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-0.5 rounded-full hover:bg-indigo-100 transition-colors"
              >
                ← Back to Today
              </button>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigateDay(1)}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Mini Calendar Dropdown */}
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
                const dStr = `${calYear}-${String(calMonthIdx + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                const isSel = dStr === selectedDateStr;
                const isToday = dStr === todayStr;
                const hasDot = eventDates.has(dStr);
                return (
                  <button
                    key={dStr}
                    onClick={() => { setSelectedDate(new Date(calYear, calMonthIdx, day)); setIsFinalized(false); setShowCalendar(false); }}
                    className={`relative aspect-square flex items-center justify-center rounded-xl text-sm font-bold transition-all ${
                      isSel ? 'bg-indigo-600 text-white shadow-md' :
                      isToday ? 'ring-2 ring-indigo-400 text-indigo-700 bg-indigo-50' :
                      'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    {day}
                    {hasDot && !isSel && (
                      <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[500px] flex flex-col">
        {dayEvents.filter(e => e.status !== 'Cancelled').length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-300">
              <Calendar className="w-12 h-12" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No events planned yet</h3>
            <p className="text-slate-500 max-w-xs mx-auto mb-8">
              Start building your day by adding meetings, visits, or inspections.
            </p>
            <Button onClick={() => { setEditingEvent(null); setIsModalOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Start Building Day
            </Button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 relative" ref={timelineRef}>
            <div className="relative ml-16 min-h-[1080px]">
              {HOURS.map(hour => (
                <div
                  key={hour}
                  className="absolute w-full border-t border-slate-100 flex items-center"
                  style={{ top: `${(hour - 6) * 80}px`, height: '1px' }}
                >
                  <span className="absolute -left-16 w-12 text-right text-xs font-medium text-slate-400">
                    {hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
                  </span>
                </div>
              ))}

              {dayEvents.filter(e => e.status !== 'Cancelled').map(event => {
                const [h, m] = event.startTime.split(':').map(Number);
                const top = ((h - 6) * 80) + (m / 60 * 80);
                const durationMins = parseMinsFromDuration(event.duration);
                const height = (durationMins / 60) * 80;
                const colorClass = TYPE_COLORS[eventTypeToType(event.type)];

                return (
                  <motion.div
                    id={`event-${event.id}`}
                    key={event.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`absolute left-4 right-4 rounded-xl border-l-4 shadow-sm p-4 group transition-all hover:shadow-md ${colorClass}`}
                    style={{ top: `${top}px`, height: `${Math.max(height, 80)}px` }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="overflow-hidden">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">{event.type}</span>
                          <span className="text-xs opacity-60">•</span>
                          <span className="text-xs font-medium opacity-80">{event.startTime} ({event.duration})</span>
                        </div>
                        <h4 className="font-bold text-slate-900 truncate">{event.title}</h4>
                        <div className="flex items-center gap-3 mt-2 text-xs opacity-70">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate max-w-[150px]">{event.location?.name || '—'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>{event.attendees?.length || 0} People</span>
                          </div>
                        </div>
                      </div>
                      {!isFinalized && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => { setEditingEvent(event); setIsModalOpen(true); }}
                            className="p-1.5 hover:bg-black/5 rounded-lg transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(event)}
                            className="p-1.5 hover:bg-red-500/10 text-red-600 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Event Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-xl bg-white shadow-2xl z-[70] flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {editingEvent ? 'Edit Event' : 'Add New Event'}
                  </h2>
                  <p className="text-sm text-slate-500">Fill in the details for the MP's schedule</p>
                </div>
                <button
                  onClick={() => { setIsModalOpen(false); setEditingEvent(null); }}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                <EventForm
                  initialData={editingEvent || undefined}
                  defaultDate={selectedDateStr}
                  onSave={handleSaveEvent}
                  onCancel={() => { setIsModalOpen(false); setEditingEvent(null); }}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Finalize Confirmation Dialog */}
      <AnimatePresence>
        {showFinalizeConfirm && (
          <div className="fixed inset-0 flex items-center justify-center z-[100] p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setShowFinalizeConfirm(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative z-10 text-center"
            >
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Info className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Finalize Day Plan?</h3>
              <p className="text-slate-500 mb-8">
                All {dayEvents.filter(e => e.status !== 'Cancelled').length} events will be pushed to the MP's Daybook and shared with the security detail. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowFinalizeConfirm(false)}>Cancel</Button>
                <Button className="flex-1" onClick={handleFinalize}>Confirm & Push</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface EventFormProps {
  initialData?: PlanTodayEvent;
  defaultDate: string;
  onSave: (data: { title: string; type: PlanEventType; scheduledTime: string; duration: number; locationName: string; address: string; purpose: string; people: PlanTodayAttendee[]; date: string; }, shouldClose?: boolean) => void;
  onCancel: () => void;
}

const EventForm: React.FC<EventFormProps> = ({ initialData, defaultDate, onSave, onCancel }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [type, setType] = useState<PlanEventType>(initialData ? eventTypeToType(initialData.type) : 'MEETING');
  const [eventDate, setEventDate] = useState(initialData?.date || defaultDate);
  const [time, setTime] = useState(initialData?.startTime || '09:00');
  const [duration, setDuration] = useState(initialData ? parseMinsFromDuration(initialData.duration) : 60);
  const [locationName, setLocationName] = useState(initialData?.location?.name || '');
  const [address, setAddress] = useState(initialData?.location?.address || '');
  const [purpose, setPurpose] = useState(initialData?.purpose || '');
  const [people, setPeople] = useState<PlanTodayAttendee[]>(initialData?.attendees || []);

  const [personName, setPersonName] = useState('');
  const [personDesignation, setPersonDesignation] = useState('');
  const [personContact, setPersonContact] = useState('');
  const [formError, setFormError] = useState('');

  const todayStr = toLocalDateStr(new Date());
  const tomorrowStr = (() => { const d = new Date(); d.setDate(d.getDate() + 1); return toLocalDateStr(d); })();

  const handleAddPerson = () => {
    if (personName.trim()) {
      const newPerson: PlanTodayAttendee = {
        id: Math.random().toString(36).substr(2, 9),
        name: personName.trim(),
        designation: personDesignation.trim(),
        contact: personContact.trim(),
      };
      setPeople([...people, newPerson]);
      setPersonName(''); setPersonDesignation(''); setPersonContact('');
    }
  };

  const removePerson = (id: string) => setPeople(people.filter(p => p.id !== id));

  const getPayload = () => ({ title, type, scheduledTime: time, duration, locationName, address, purpose, people, date: eventDate });

  const handleSave = (shouldClose = true) => {
    if (!title.trim()) {
      setFormError('Event Title is required.');
      return;
    }
    if (!time) {
      setFormError('Scheduled Time is required.');
      return;
    }
    setFormError('');
    onSave(getPayload(), shouldClose);
  };

  return (
    <form onSubmit={e => { e.preventDefault(); handleSave(true); }} className="space-y-6">

      {/* Event Date */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Event Date *</label>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={eventDate}
            onChange={e => setEventDate(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all font-semibold"
          />
          <button type="button" onClick={() => setEventDate(todayStr)}
            className="px-3 py-3 text-[10px] font-black uppercase tracking-widest bg-slate-100 hover:bg-indigo-100 hover:text-indigo-700 text-slate-500 rounded-xl transition-colors">
            Today
          </button>
          <button type="button" onClick={() => setEventDate(tomorrowStr)}
            className="px-3 py-3 text-[10px] font-black uppercase tracking-widest bg-slate-100 hover:bg-indigo-100 hover:text-indigo-700 text-slate-500 rounded-xl transition-colors">
            Tomorrow
          </button>
        </div>
      </div>

      {/* Event Title */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Event Title *</label>
        <div className="relative">
          <input
            type="text"
            maxLength={100}
            value={title}
            onChange={e => { setTitle(e.target.value); setFormError(''); }}
            placeholder="e.g. Meeting with Resident Welfare Association"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
          <span className="absolute right-3 bottom-3 text-[10px] text-slate-400 font-medium">{title.length}/100</span>
        </div>
      </div>

      {/* Event Type */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Event Type</label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {EVENT_TYPES.map(t => (
            <button key={t} type="button" onClick={() => setType(t)}
              className={`px-2 py-2 rounded-lg text-[10px] font-bold transition-all border-2 ${
                type === t ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-500 border-slate-100 hover:border-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Time and Duration */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Scheduled Time *</label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="time" value={time} onChange={e => { setTime(e.target.value); setFormError(''); }}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Duration (mins)</label>
          <div className="relative">
            <input
              type="number" min={5} step={5} value={duration} onChange={e => setDuration(parseInt(e.target.value))}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">mins</span>
          </div>
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Location Name</label>
        <input
          type="text" value={locationName} onChange={e => setLocationName(e.target.value)}
          placeholder="e.g. Community Center, Sector 5"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
        />
      </div>
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Full Address</label>
        <textarea
          rows={2} value={address} onChange={e => setAddress(e.target.value)}
          placeholder="Enter complete address for navigation..."
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
        />
      </div>

      {/* Purpose / Agenda */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Purpose / Agenda</label>
        <textarea
          rows={4} value={purpose} onChange={e => setPurpose(e.target.value)}
          placeholder="What is the main goal of this event?"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
        />
      </div>

      {/* People Involved */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">People Involved</label>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2 mb-4">
            {people.map(p => (
              <div key={p.id} className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200 group">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-700">{p.name}</span>
                  {p.designation && <span className="text-[9px] text-slate-500 leading-none">{p.designation}</span>}
                </div>
                <button type="button" onClick={() => removePerson(p.id)}
                  className="p-0.5 hover:bg-slate-200 rounded-full text-slate-400 hover:text-red-500 transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {people.length === 0 && <p className="text-xs text-slate-400 italic">No people added yet</p>}
          </div>
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <input
              type="text" value={personName} onChange={e => setPersonName(e.target.value)}
              placeholder="Name"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-blue-500"
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddPerson())}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text" value={personDesignation} onChange={e => setPersonDesignation(e.target.value)}
                placeholder="Designation"
                className="px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-blue-500"
              />
              <input
                type="text" value={personContact} onChange={e => setPersonContact(e.target.value)}
                placeholder="Contact Info"
                className="px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <Button type="button" variant="outline" size="sm" className="w-full" onClick={handleAddPerson}>
              <Plus className="w-3 h-3 mr-1" /> Add Person
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      {formError && (
        <p className="text-red-600 text-sm font-medium bg-red-50 border border-red-200 rounded-lg px-4 py-2">
          ⚠ {formError}
        </p>
      )}
      <div className="pt-6 border-t border-slate-100 flex flex-wrap gap-3">
        <Button type="button" variant="outline" className="flex-1 min-w-[120px]" onClick={onCancel}>Cancel</Button>
        {!initialData && (
          <Button
            type="button" variant="outline" className="flex-1 min-w-[160px]"
            onClick={() => {
              if (!title.trim() || !time) {
                setFormError('Event Title and Time are required.');
                return;
              }
              setFormError('');
              onSave(getPayload(), false);
              setTitle(''); setType('MEETING'); setTime('09:00'); setDuration(60);
              setLocationName(''); setAddress(''); setPurpose(''); setPeople([]);
            }}
          >
            Save & Add Another
          </Button>
        )}
        <Button type="button" className="flex-1 min-w-[120px]" onClick={() => handleSave(true)}>
          {initialData ? 'Update Event' : 'Save & Done'}
        </Button>
      </div>
    </form>
  );
};
