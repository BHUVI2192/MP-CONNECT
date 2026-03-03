
import React, { useState, useMemo, useRef, useEffect } from 'react';
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
  Map as MapIcon,
  Info
} from 'lucide-react';
import { Button } from '../../components/UI/Button';
import { Card } from '../../components/UI/Card';
import { PlanEvent, PlanEventType, PersonInvolved } from '../../types';

const EVENT_TYPES: PlanEventType[] = ['MEETING', 'VISIT', 'INSPECTION', 'TOUR', 'OTHER'];

const TYPE_COLORS: Record<PlanEventType, string> = {
  MEETING: 'border-blue-500 bg-blue-50 text-blue-700',
  VISIT: 'border-emerald-500 bg-emerald-50 text-emerald-700',
  INSPECTION: 'border-amber-500 bg-amber-50 text-amber-700',
  TOUR: 'border-purple-500 bg-purple-50 text-purple-700',
  OTHER: 'border-slate-500 bg-slate-50 text-slate-700',
};

const HOURS = Array.from({ length: 18 }, (_, i) => i + 6); // 6 AM to 11 PM

export const PlanTodayPage: React.FC = () => {
  const [events, setEvents] = useState<PlanEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<PlanEvent | null>(null);
  const [isFinalized, setIsFinalized] = useState(false);
  const [showFinalizeConfirm, setShowFinalizeConfirm] = useState(false);
  
  const timelineRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime));
  }, [events]);

  const handleSaveEvent = (eventData: Omit<PlanEvent, 'id' | 'status'>, shouldClose: boolean = true) => {
    if (editingEvent) {
      setEvents(prev => prev.map(e => e.id === editingEvent.id ? { ...eventData, id: e.id, status: e.status } : e));
    } else {
      const newEvent: PlanEvent = {
        ...eventData,
        id: Math.random().toString(36).substr(2, 9),
        status: 'DRAFT'
      };
      setEvents(prev => [...prev, newEvent]);
      
      // Scroll to new event after a short delay to allow render
      setTimeout(() => {
        const element = document.getElementById(`event-${newEvent.id}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
    
    if (shouldClose) {
      setIsModalOpen(false);
      setEditingEvent(null);
    }
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  const handleFinalize = () => {
    setEvents(prev => prev.map(e => ({ ...e, status: 'SCHEDULED' })));
    setIsFinalized(true);
    setShowFinalizeConfirm(false);
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
            onClick={() => setShowFinalizeConfirm(true)}
            disabled={isFinalized || events.length === 0}
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

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Timeline View */}
        <div className="lg:col-span-12 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
          {events.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-300">
                <Calendar className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">No events planned yet</h3>
              <p className="text-slate-500 max-w-xs mx-auto mb-8">
                Start building your day by adding meetings, visits, or inspections.
              </p>
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Start Building Day
              </Button>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-6 relative" ref={timelineRef}>
              <div className="relative ml-16 min-h-[1080px]">
                {/* Time Axis Grid Lines */}
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

                {/* Event Cards */}
                {events.map(event => {
                  const [h, m] = event.scheduledTime.split(':').map(Number);
                  const top = ((h - 6) * 80) + (m / 60 * 80);
                  const height = (event.duration / 60) * 80;

                  return (
                    <motion.div
                      id={`event-${event.id}`}
                      key={event.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`absolute left-4 right-4 rounded-xl border-l-4 shadow-sm p-4 group transition-all hover:shadow-md ${TYPE_COLORS[event.type]}`}
                      style={{ top: `${top}px`, height: `${height}px`, minHeight: '80px' }}
                    >
                      <div className="flex justify-between items-start">
                        <div className="overflow-hidden">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">{event.type}</span>
                            <span className="text-xs opacity-60">•</span>
                            <span className="text-xs font-medium opacity-80">{event.displayTime} ({event.duration}m)</span>
                          </div>
                          <h4 className="font-bold text-slate-900 truncate">{event.title}</h4>
                          <div className="flex items-center gap-3 mt-2 text-xs opacity-70">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              <span className="truncate max-w-[150px]">{event.locationName}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              <span>{event.people.length} People</span>
                            </div>
                          </div>
                        </div>
                        
                        {!isFinalized && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => {
                                setEditingEvent(event);
                                setIsModalOpen(true);
                              }}
                              className="p-1.5 hover:bg-black/5 rounded-lg transition-colors"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteEvent(event.id)}
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
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-8">
                <EventForm 
                  initialData={editingEvent || undefined} 
                  onSave={handleSaveEvent}
                  onCancel={() => setIsModalOpen(false)}
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setShowFinalizeConfirm(false)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative z-10 text-center"
            >
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Info className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">Finalize Day Plan?</h3>
              <p className="text-slate-500 mb-8">
                All {events.length} events will be pushed to the MP's Daybook and shared with the security detail. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setShowFinalizeConfirm(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleFinalize}>
                  Confirm & Push
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface EventFormProps {
  initialData?: PlanEvent;
  onSave: (data: Omit<PlanEvent, 'id' | 'status'>, shouldClose?: boolean) => void;
  onCancel: () => void;
}

const EventForm: React.FC<EventFormProps> = ({ initialData, onSave, onCancel }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [type, setType] = useState<PlanEventType>(initialData?.type || 'MEETING');
  const [time, setTime] = useState(initialData?.scheduledTime || '09:00');
  const [duration, setDuration] = useState(initialData?.duration || 60);
  const [locationName, setLocationName] = useState(initialData?.locationName || '');
  const [address, setAddress] = useState(initialData?.address || '');
  const [coordinates, setCoordinates] = useState(initialData?.coordinates || { lat: 28.6139, lng: 77.2090 });
  const [purpose, setPurpose] = useState(initialData?.purpose || '');
  const [people, setPeople] = useState<PersonInvolved[]>(initialData?.people || []);
  
  const [personName, setPersonName] = useState('');
  const [personDesignation, setPersonDesignation] = useState('');
  const [personContact, setPersonContact] = useState('');

  const handleAddPerson = (e: React.KeyboardEvent | React.MouseEvent) => {
    if (personName.trim()) {
      const newPerson: PersonInvolved = {
        id: Math.random().toString(36).substr(2, 9),
        name: personName.trim(),
        designation: personDesignation.trim(),
        contact: personContact.trim()
      };
      setPeople([...people, newPerson]);
      setPersonName('');
      setPersonDesignation('');
      setPersonContact('');
    }
  };

  const removePerson = (id: string) => {
    setPeople(people.filter(p => p.id !== id));
  };

  const formatDisplayTime = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      type,
      scheduledTime: time,
      displayTime: formatDisplayTime(time),
      duration,
      locationName,
      address,
      coordinates,
      purpose,
      people
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Event Title */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Event Title *</label>
        <div className="relative">
          <input 
            type="text" 
            required
            maxLength={100}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Meeting with Resident Welfare Association"
            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
          <span className="absolute right-3 bottom-3 text-[10px] text-slate-400 font-medium">
            {title.length}/100
          </span>
        </div>
      </div>

      {/* Event Type */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Event Type</label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {EVENT_TYPES.map(t => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={`px-2 py-2 rounded-lg text-[10px] font-bold transition-all border-2 ${
                type === t 
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md' 
                  : 'bg-white text-slate-500 border-slate-100 hover:border-slate-200'
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
              type="time" 
              required
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Duration (mins)</label>
          <div className="relative">
            <input 
              type="number" 
              min={5}
              step={5}
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-medium">
              mins
            </span>
          </div>
        </div>
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Location Name</label>
        <input 
          type="text" 
          value={locationName}
          onChange={(e) => setLocationName(e.target.value)}
          placeholder="e.g. Community Center, Sector 5"
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Full Address</label>
        <textarea 
          rows={2}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter complete address for navigation..."
          className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
        />
      </div>

      {/* Map Placeholder */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Map Coordinates</label>
        <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50 h-32 flex items-center justify-center group cursor-crosshair">
          <img 
            src="https://picsum.photos/seed/map/600/300?grayscale" 
            alt="Map Placeholder" 
            className="absolute inset-0 w-full h-full object-cover opacity-40"
            referrerPolicy="no-referrer"
          />
          <div className="relative z-10 flex flex-col items-center text-slate-400 group-hover:text-blue-500 transition-colors">
            <MapIcon className="w-8 h-8 mb-1" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Click to drop pin</span>
          </div>
          <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-[10px] font-mono text-slate-600 border border-slate-200">
            {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <input 
            type="number" 
            step="0.0001"
            value={coordinates.lat}
            onChange={(e) => setCoordinates({ ...coordinates, lat: parseFloat(e.target.value) })}
            placeholder="Latitude"
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-blue-500"
          />
          <input 
            type="number" 
            step="0.0001"
            value={coordinates.lng}
            onChange={(e) => setCoordinates({ ...coordinates, lng: parseFloat(e.target.value) })}
            placeholder="Longitude"
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Purpose / Agenda */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">Purpose / Agenda</label>
        <textarea 
          rows={4}
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
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
                <button 
                  type="button"
                  onClick={() => removePerson(p.id)}
                  className="p-0.5 hover:bg-slate-200 rounded-full text-slate-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {people.length === 0 && <p className="text-xs text-slate-400 italic">No people added yet</p>}
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <input 
              type="text" 
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              placeholder="Name"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-blue-500"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddPerson(e))}
            />
            <div className="grid grid-cols-2 gap-2">
              <input 
                type="text" 
                value={personDesignation}
                onChange={(e) => setPersonDesignation(e.target.value)}
                placeholder="Designation"
                className="px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-blue-500"
              />
              <input 
                type="text" 
                value={personContact}
                onChange={(e) => setPersonContact(e.target.value)}
                placeholder="Contact Info"
                className="px-3 py-2 text-sm rounded-lg border border-slate-200 outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={handleAddPerson}
            >
              <Plus className="w-3 h-3 mr-1" /> Add Person
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-6 border-t border-slate-100 flex flex-wrap gap-3">
        <Button 
          type="button" 
          variant="outline" 
          className="flex-1 min-w-[120px]"
          onClick={onCancel}
        >
          Cancel
        </Button>
        {!initialData && (
          <Button 
            type="button" 
            variant="outline"
            className="flex-1 min-w-[160px]"
            onClick={(e) => {
              // Trigger validation manually or just call save and reset
              if (title && time) {
                onSave({
                  title,
                  type,
                  scheduledTime: time,
                  displayTime: formatDisplayTime(time),
                  duration,
                  locationName,
                  address,
                  coordinates,
                  purpose,
                  people
                }, false);
                // Reset form
                setTitle('');
                setType('MEETING');
                setTime('09:00');
                setDuration(60);
                setLocationName('');
                setAddress('');
                setPurpose('');
                setPeople([]);
              } else {
                // Simple alert for required fields if using manual button
                alert('Please fill in Title and Time');
              }
            }}
          >
            Save & Add Another
          </Button>
        )}
        <Button type="submit" className="flex-1 min-w-[120px]">
          {initialData ? 'Update Event' : 'Save & Done'}
        </Button>
      </div>
    </form>
  );
};
