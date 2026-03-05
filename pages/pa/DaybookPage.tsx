
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Mic, 
  Play, 
  Pause, 
  CheckCircle2, 
  XCircle, 
  MoreVertical,
  ChevronRight,
  RotateCcw,
  Check,
  X,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Button } from '../../components/UI/Button';
import { Card } from '../../components/UI/Card';
import { PlanEvent, PlanEventStatus, PersonInvolved, NotificationType } from '../../types';
import { useNotifications } from '../../context/NotificationContext';

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

const STATUS_COLORS: Record<PlanEventStatus, string> = {
  SCHEDULED: 'border-blue-500',
  IN_PROGRESS: 'border-orange-500',
  VISITED: 'border-emerald-500',
  CANCELLED: 'border-red-500',
  DRAFT: 'border-slate-300'
};

const STATUS_BADGES: Record<PlanEventStatus, string> = {
  SCHEDULED: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-orange-100 text-orange-700',
  VISITED: 'bg-emerald-100 text-emerald-700',
  CANCELLED: 'bg-red-100 text-red-700',
  DRAFT: 'bg-slate-100 text-slate-700'
};

export const DaybookPage: React.FC = () => {
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState<'today' | 'past'>('today');
  const [events, setEvents] = useState<PlanEvent[]>(MOCK_EVENTS);
  const [selectedEvent, setSelectedEvent] = useState<PlanEvent | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const completedCount = useMemo(() => 
    events.filter(e => e.status === 'VISITED' || e.status === 'CANCELLED').length, 
  [events]);

  const totalCount = events.length;
  const progressPercentage = (completedCount / totalCount) * 100;

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpdateDetails = (id: string, updates: Partial<PlanEvent>) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    const event = events.find(e => e.id === id);
    if (event) {
      addNotification({
        eventId: id,
        eventName: event.title,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'UPDATE',
        notes: updates.notes || updates.transcript,
        voiceNoteUrl: updates.voiceNoteUrl
      });
      showToast(`Staff notified of update to ${event.title}`);
    }
  };

  const handleMarkStatus = (id: string, status: 'VISITED' | 'CANCELLED', finalData: Partial<PlanEvent>) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, status, ...finalData } : e));
    const event = events.find(e => e.id === id);
    if (event) {
      addNotification({
        eventId: id,
        eventName: event.title,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: status as NotificationType,
        notes: finalData.finalNotes || finalData.cancellationReason
      });
      showToast(`Staff notified — ${event.title} marked as ${status}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-xl shadow-xl flex items-center gap-3 border ${
              toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header & Tabs */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Daybook</h1>
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button 
              onClick={() => setActiveTab('today')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'today' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Today
            </button>
            <button 
              onClick={() => setActiveTab('past')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'past' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Past Days
            </button>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-slate-700">{completedCount} of {totalCount} events completed today</span>
            <span className="text-sm font-black text-indigo-600">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              className="h-full bg-indigo-600 rounded-full"
            />
          </div>
        </div>

        {/* Event List */}
        <div className="space-y-4">
          {events.map((event) => (
            <EventCard 
              key={event.id} 
              event={event} 
              onUpdate={() => {
                setSelectedEvent(event);
                setIsUpdateModalOpen(true);
              }}
              onMarkStatus={() => {
                setSelectedEvent(event);
                setIsStatusModalOpen(true);
              }}
            />
          ))}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isUpdateModalOpen && selectedEvent && (
          <UpdateDetailsModal 
            event={selectedEvent} 
            onClose={() => setIsUpdateModalOpen(false)}
            onSave={(updates) => {
              handleUpdateDetails(selectedEvent.id, updates);
              setIsUpdateModalOpen(false);
            }}
          />
        )}
        {isStatusModalOpen && selectedEvent && (
          <MarkStatusModal 
            event={selectedEvent} 
            onClose={() => setIsStatusModalOpen(false)}
            onConfirm={(status, finalData) => {
              handleMarkStatus(selectedEvent.id, status, finalData);
              setIsStatusModalOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const EventCard: React.FC<{ 
  event: PlanEvent; 
  onUpdate: () => void; 
  onMarkStatus: () => void;
}> = ({ event, onUpdate, onMarkStatus }) => {
  const isFinished = event.status === 'VISITED' || event.status === 'CANCELLED';

  return (
    <Card className={`border-l-4 transition-all hover:shadow-md ${STATUS_COLORS[event.status]}`}>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${STATUS_BADGES[event.status]}`}>
              {event.status}
            </span>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Clock className="w-3 h-3" />
              {event.displayTime}
            </div>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">{event.title}</h3>
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
            <MapPin className="w-4 h-4 text-slate-400" />
            {event.locationName}
          </div>

          <div className="flex items-center gap-4">
            {/* People Avatars */}
            <div className="flex -space-x-2">
              {event.people.slice(0, 3).map((p, i) => (
                <div key={p.id} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600" title={p.name}>
                  {p.name.charAt(0)}
                </div>
              ))}
              {event.people.length > 3 && (
                <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-400">
                  +{event.people.length - 3}
                </div>
              )}
            </div>

            {/* Voice Note Indicator */}
            {event.voiceNoteUrl && (
              <div className="flex items-center gap-1.5 text-indigo-600 text-xs font-bold cursor-pointer hover:underline">
                <Mic className="w-3.5 h-3.5" />
                Play Recording
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 min-w-[140px]">
          {!isFinished ? (
            <>
              <Button variant="outline" size="sm" onClick={onUpdate}>
                Update Details
              </Button>
              <Button size="sm" onClick={onMarkStatus}>
                Mark Final Status
              </Button>
            </>
          ) : (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Final Summary</p>
              <p className="text-xs text-slate-600 line-clamp-2 italic">
                {event.status === 'VISITED' ? event.finalNotes || 'Completed as planned.' : event.cancellationReason || 'Event cancelled.'}
              </p>
              <button className="text-indigo-600 text-[10px] font-bold mt-2 hover:underline flex items-center gap-0.5">
                View Details <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

const UpdateDetailsModal: React.FC<{ 
  event: PlanEvent; 
  onClose: () => void; 
  onSave: (updates: Partial<PlanEvent>) => void;
}> = ({ event, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState<'text' | 'voice'>('text');
  const [notes, setNotes] = useState(event.notes || '');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingComplete, setRecordingComplete] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState('');

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordingComplete(false);
    // Simulate recording for 3 seconds
    setTimeout(() => {
      setIsRecording(false);
      setRecordingComplete(true);
    }, 3000);
  };

  const handleUseRecording = () => {
    setIsTranscribing(true);
    // Simulate transcription
    setTimeout(() => {
      setIsTranscribing(false);
      setTranscript("Hon'ble MP inspected the pillar construction. Pillar 4 is nearing completion. Contractor requested additional labor for the next phase.");
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative z-10"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Update Event Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
            <button 
              onClick={() => setActiveTab('text')}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'text' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              Text Notes
            </button>
            <button 
              onClick={() => setActiveTab('voice')}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'voice' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
              }`}
            >
              Voice Recording
            </button>
          </div>

          {activeTab === 'text' ? (
            <div className="space-y-4">
              <textarea 
                rows={6}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Enter real-time updates or notes here..."
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
              />
              <Button fullWidth onClick={() => onSave({ notes })}>
                Save & Notify Staff
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center py-8">
              {!recordingComplete ? (
                <>
                  <motion.button
                    animate={isRecording ? { scale: [1, 1.1, 1] } : {}}
                    transition={isRecording ? { repeat: Infinity, duration: 1.5 } : {}}
                    onClick={handleStartRecording}
                    disabled={isRecording}
                    className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                      isRecording ? 'bg-red-500 shadow-lg shadow-red-200' : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200'
                    }`}
                  >
                    {isRecording ? (
                      <div className="flex gap-1">
                        {[1, 2, 3].map(i => (
                          <motion.div 
                            key={i}
                            animate={{ height: [10, 30, 10] }}
                            transition={{ repeat: Infinity, duration: 0.5, delay: i * 0.1 }}
                            className="w-1 bg-white rounded-full"
                          />
                        ))}
                      </div>
                    ) : (
                      <Mic className="w-10 h-10 text-white" />
                    )}
                  </motion.button>
                  <p className="mt-6 font-bold text-slate-900">
                    {isRecording ? 'Recording...' : 'Start Recording'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Tap to capture a voice briefing</p>
                </>
              ) : (
                <div className="w-full space-y-6">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center gap-4">
                    <button className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                      <Play className="w-5 h-5 fill-current" />
                    </button>
                    <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-600 w-1/3" />
                    </div>
                    <span className="text-xs font-mono text-slate-500">0:12 / 0:45</span>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={() => setRecordingComplete(false)}>
                      <RotateCcw className="w-4 h-4 mr-2" /> Re-record
                    </Button>
                    <Button className="flex-1" onClick={handleUseRecording} disabled={isTranscribing}>
                      {isTranscribing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                      Use This Recording
                    </Button>
                  </div>

                  {isTranscribing && (
                    <div className="flex flex-col items-center py-4">
                      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
                      <p className="text-sm font-bold text-slate-600">Transcribing...</p>
                    </div>
                  )}

                  {transcript && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl"
                    >
                      <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-2">Transcript</p>
                      <p className="text-sm text-indigo-900 italic leading-relaxed">"{transcript}"</p>
                    </motion.div>
                  )}

                  {transcript && (
                    <Button fullWidth onClick={() => onSave({ transcript, voiceNoteUrl: 'mock-url' })}>
                      Save & Notify Staff
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const MarkStatusModal: React.FC<{ 
  event: PlanEvent; 
  onClose: () => void; 
  onConfirm: (status: 'VISITED' | 'CANCELLED', data: Partial<PlanEvent>) => void;
}> = ({ event, onClose, onConfirm }) => {
  const [selection, setSelection] = useState<'attended' | 'not-attended' | null>(null);
  const [notes, setNotes] = useState('');

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative z-10"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Mark Final Status</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-8">
          {!selection ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button 
                onClick={() => setSelection('attended')}
                className="p-6 rounded-2xl border-2 border-emerald-100 bg-emerald-50 hover:border-emerald-500 transition-all text-center group"
              >
                <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform">
                  <Check className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-emerald-900">I Attended This Event</h3>
                <p className="text-xs text-emerald-600 mt-1">Mark as visited</p>
              </button>

              <button 
                onClick={() => setSelection('not-attended')}
                className="p-6 rounded-2xl border-2 border-red-100 bg-red-50 hover:border-red-500 transition-all text-center group"
              >
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-red-200 group-hover:scale-110 transition-transform">
                  <X className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-red-900">I Did Not Attend</h3>
                <p className="text-xs text-red-600 mt-1">Mark as cancelled</p>
              </button>
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  {selection === 'attended' ? 'Final notes about the event (optional)' : 'Reason for not attending (optional)'}
                </label>
                <textarea 
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={selection === 'attended' ? "Summarize the outcome..." : "Why was the event skipped?"}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
                />
              </div>

              {selection === 'attended' && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mic className="w-5 h-5 text-slate-400" />
                    <span className="text-sm font-medium text-slate-600">Add final voice note?</span>
                  </div>
                  <button className="text-indigo-600 text-xs font-bold hover:underline">Start Recording</button>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setSelection(null)}>
                  Back
                </Button>
                <Button 
                  className={`flex-1 ${selection === 'attended' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}`}
                  onClick={() => onConfirm(selection === 'attended' ? 'VISITED' : 'CANCELLED', selection === 'attended' ? { finalNotes: notes } : { cancellationReason: notes })}
                >
                  {selection === 'attended' ? 'Submit Final Details' : 'Confirm Cancellation'}
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
