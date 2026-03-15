
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Mic, 
  Play, 
  CheckCircle2, 
  ChevronRight,
  RotateCcw,
  Check,
  X,
  AlertCircle,
  Loader2,
  ChevronDown
} from 'lucide-react';
import { Button } from '../../components/UI/Button';
import { Card } from '../../components/UI/Card';
import { PlanTodayEvent, PlanTodayAttendee, NotificationType } from '../../types';
import { useMockData } from '../../context/MockDataContext';
import { useNotifications } from '../../context/NotificationContext';
import { planTodayApi } from '../../hooks/usePlanToday';

type DaybookStatus = PlanTodayEvent['status'];

const STATUS_COLORS: Record<DaybookStatus, string> = {
  Scheduled: 'border-blue-500',
  In_Progress: 'border-orange-500',
  Visited: 'border-emerald-500',
  Completed: 'border-emerald-500',
  Cancelled: 'border-red-500',
};

const STATUS_BADGES: Record<DaybookStatus, string> = {
  Scheduled: 'bg-blue-100 text-blue-700',
  In_Progress: 'bg-orange-100 text-orange-700',
  Visited: 'bg-emerald-100 text-emerald-700',
  Completed: 'bg-emerald-100 text-emerald-700',
  Cancelled: 'bg-red-100 text-red-700',
};

const STATUS_LABELS: Record<DaybookStatus, string> = {
  Scheduled: 'Scheduled',
  In_Progress: 'In Progress',
  Visited: 'Visited',
  Completed: 'Completed',
  Cancelled: 'Cancelled',
};

const formatTime = (time: string): string => {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
};

const toLocalDateString = (d: Date = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const DaybookPage: React.FC = () => {
  const { events, updateEvent } = useMockData();
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState<'today' | 'past'>('today');
  const [selectedEvent, setSelectedEvent] = useState<PlanTodayEvent | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const todayStr = toLocalDateString();

  const todayEvents = useMemo(() =>
    events
      .filter(e => e.date === todayStr)
      .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [events, todayStr]
  );

  const pastEventsByDate = useMemo(() => {
    const past = events.filter(e => e.date < todayStr).sort((a, b) =>
      b.date.localeCompare(a.date) || a.startTime.localeCompare(b.startTime)
    );
    const grouped: Record<string, PlanTodayEvent[]> = {};
    past.forEach(e => { grouped[e.date] = [...(grouped[e.date] || []), e]; });
    return grouped;
  }, [events, todayStr]);

  const completedCount = useMemo(() =>
    todayEvents.filter(e => e.status === 'Visited' || e.status === 'Completed' || e.status === 'Cancelled').length,
    [todayEvents]
  );

  const totalCount = todayEvents.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpdateDetails = async (event: PlanTodayEvent, textNotes: string) => {
    try {
      const updated: PlanTodayEvent = {
        ...event,
        documentation: { ...event.documentation, textNotes },
      };
      updateEvent(updated);
      addNotification({
        eventId: event.id,
        eventName: event.title,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'UPDATE',
        notes: textNotes,
      });
      showToast(`Staff notified of update to ${event.title}`);
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save update.';
      showToast(message, 'error');
      return false;
    }
  };

  const handleMarkStatus = async (event: PlanTodayEvent, status: 'Visited' | 'Cancelled', notes: string) => {
    try {
      const attended = status === 'Visited';
      const { error } = await planTodayApi.markFinalStatus(event.id, attended, notes);
      if (error) {
        throw new Error(error.message);
      }

      const updated: PlanTodayEvent = {
        ...event,
        status,
        documentation: { ...event.documentation, summary: notes },
      };
      updateEvent(updated);

      addNotification({
        eventId: event.id,
        eventName: event.title,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: status === 'Visited' ? 'VISITED' : 'CANCELLED',
        notes,
      });
      showToast(`Staff notified — ${event.title} marked as ${status}`);
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update status.';
      showToast(message, 'error');
      return false;
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
        <div className="portal-pa-hero mb-6">
          <div className="absolute inset-y-0 right-0 w-72 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.16),transparent_60%)]" />
          <div className="relative flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.28em] text-slate-700 mb-3">PA Daybook</p>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Daybook</h1>
              <p className="text-slate-700 font-medium mt-2">Track live events, field notes, and completed visits.</p>
            </div>
            <div className="portal-pa-tabset">
            <button 
              onClick={() => setActiveTab('today')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'today' ? 'bg-white text-indigo-600 shadow-sm' : 'bg-white text-black border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Today
            </button>
            <button 
              onClick={() => setActiveTab('past')}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${
                activeTab === 'past' ? 'bg-white text-indigo-600 shadow-sm' : 'bg-white text-black border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Past Days
            </button>
          </div>
        </div>
        </div>

        {/* Progress Indicator (today tab only) */}
        {activeTab === 'today' && (
          <div className="portal-pa-shell p-6 rounded-2xl mb-8">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-slate-900">{completedCount} of {totalCount} events completed today</span>
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
        )}

        {/* Event List - Today */}
        {activeTab === 'today' && (
          <div className="space-y-4">
            {todayEvents.length === 0 ? (
              <div className="portal-pa-shell text-center py-16 rounded-2xl">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900 mb-1">No events planned for today</h3>
                <p className="text-slate-700 text-sm">Use the Plan Today page to add events to the schedule.</p>
              </div>
            ) : (
              todayEvents.map((event) => (
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
              ))
            )}
          </div>
        )}

        {/* Past Events grouped by date */}
        {activeTab === 'past' && (
          <div className="space-y-6">
            {Object.keys(pastEventsByDate).length === 0 ? (
              <div className="portal-pa-shell text-center py-16 rounded-2xl">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900 mb-1">No past events</h3>
                <p className="text-slate-500 text-sm">Events from previous days will appear here.</p>
              </div>
            ) : (
              Object.entries(pastEventsByDate).map(([date, dateEvents]) => (
                <div key={date}>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
                    {new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </h3>
                  <div className="space-y-3">
                    {dateEvents.map(event => (
                      <EventCard key={event.id} event={event} onUpdate={() => {}} onMarkStatus={() => {}} readOnly />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isUpdateModalOpen && selectedEvent && (
          <UpdateDetailsModal 
            event={selectedEvent} 
            onClose={() => setIsUpdateModalOpen(false)}
            onSave={async (textNotes) => {
              const success = await handleUpdateDetails(selectedEvent, textNotes);
              if (success) {
                setIsUpdateModalOpen(false);
              }
            }}
          />
        )}
        {isStatusModalOpen && selectedEvent && (
          <MarkStatusModal 
            event={selectedEvent} 
            onClose={() => setIsStatusModalOpen(false)}
            onConfirm={async (status, notes) => {
              const success = await handleMarkStatus(selectedEvent, status, notes);
              if (success) {
                setIsStatusModalOpen(false);
              }
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const EventCard: React.FC<{ 
  event: PlanTodayEvent; 
  onUpdate: () => void; 
  onMarkStatus: () => void;
  readOnly?: boolean;
}> = ({ event, onUpdate, onMarkStatus, readOnly }) => {
  const isFinished = event.status === 'Visited' || event.status === 'Completed' || event.status === 'Cancelled';

  return (
    <Card className={`border-l-4 transition-all hover:shadow-md ${STATUS_COLORS[event.status]}`}>
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${STATUS_BADGES[event.status]}`}>
              {STATUS_LABELS[event.status]}
            </span>
            <div className="flex items-center gap-1 text-xs text-slate-700">
              <Clock className="w-3 h-3" />
              {formatTime(event.startTime)}
            </div>
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">{event.title}</h3>
          <div className="flex items-center gap-2 text-sm text-slate-700 mb-4">
            <MapPin className="w-4 h-4 text-slate-400" />
            {event.location?.name || '—'}
          </div>

          <div className="flex items-center gap-4">
            {/* Attendee Avatars */}
            <div className="flex -space-x-2">
              {(event.attendees || []).slice(0, 3).map((p) => (
                <div key={p.id} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600" title={p.name}>
                  {p.name.charAt(0)}
                </div>
              ))}
              {(event.attendees || []).length > 3 && (
                <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-700">
                  +{(event.attendees || []).length - 3}
                </div>
              )}
            </div>

            {/* Voice Note Indicator */}
            {event.documentation?.hasVoiceNote && (
              <div className="flex items-center gap-1.5 text-indigo-600 text-xs font-bold cursor-pointer hover:underline">
                <Mic className="w-3.5 h-3.5" />
                Play Recording
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-2 min-w-[140px]">
          {(!isFinished && !readOnly) ? (
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
              <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest mb-1">Final Summary</p>
              <p className="text-xs text-slate-600 line-clamp-2 italic">
                {event.documentation?.summary || (event.status === 'Cancelled' ? 'Event cancelled.' : 'Completed as planned.')}
              </p>
              {event.documentation?.textNotes && (
                <p className="text-xs text-slate-700 mt-1 line-clamp-1 italic">"{event.documentation.textNotes}"</p>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

const UpdateDetailsModal: React.FC<{ 
  event: PlanTodayEvent; 
  onClose: () => void; 
  onSave: (textNotes: string) => Promise<void>;
}> = ({ event, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState<'text' | 'voice'>('text');
  const [notes, setNotes] = useState(event.documentation?.textNotes || '');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingComplete, setRecordingComplete] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceError, setVoiceError] = useState('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      if (audioPreviewUrl) {
        URL.revokeObjectURL(audioPreviewUrl);
      }
      mediaStreamRef.current?.getTracks().forEach(track => track.stop());
    };
  }, [audioPreviewUrl]);

  const cleanupAudioPreview = () => {
    if (audioPreviewUrl) {
      URL.revokeObjectURL(audioPreviewUrl);
      setAudioPreviewUrl(null);
    }
  };

  const handleStartRecording = async () => {
    setVoiceError('');
    setTranscript('');
    cleanupAudioPreview();
    setAudioBlob(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      chunksRef.current = [];

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (ev: BlobEvent) => {
        if (ev.data.size > 0) {
          chunksRef.current.push(ev.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        setAudioBlob(blob);
        const previewUrl = URL.createObjectURL(blob);
        setAudioPreviewUrl(previewUrl);
        setRecordingComplete(true);
        setIsRecording(false);
        mediaStreamRef.current?.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
      };

      recorder.start();
      setIsRecording(true);
      setRecordingComplete(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to access microphone.';
      setVoiceError(message);
      setIsRecording(false);
      setRecordingComplete(false);
      mediaStreamRef.current?.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const handleUseRecording = async () => {
    if (!audioBlob) {
      setVoiceError('Please record audio before transcription.');
      return;
    }

    setVoiceError('');
    setIsTranscribing(true);
    try {
      const transcription = await planTodayApi.uploadVoiceNote(event.id, audioBlob);
      setTranscript(transcription);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Transcription failed.';
      setVoiceError(message);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleSaveNotes = async (text: string) => {
    setIsSaving(true);
    try {
      await onSave(text);
    } finally {
      setIsSaving(false);
    }
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
              <Button fullWidth onClick={() => handleSaveNotes(notes)} disabled={isSaving}>
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
                    onClick={isRecording ? handleStopRecording : () => { void handleStartRecording(); }}
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
                    {isRecording ? 'Recording... Tap to Stop' : 'Start Recording'}
                  </p>
                  <p className="text-xs text-slate-700 mt-1">Tap to capture a voice briefing</p>
                </>
              ) : (
                <div className="w-full space-y-6">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    {audioPreviewUrl ? (
                      <audio controls src={audioPreviewUrl} className="w-full" />
                    ) : (
                      <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <Play className="w-4 h-4" />
                        No recording available
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setRecordingComplete(false);
                        setTranscript('');
                        setVoiceError('');
                        cleanupAudioPreview();
                        setAudioBlob(null);
                      }}
                    >
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

                  {voiceError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                      {voiceError}
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
                    <Button fullWidth onClick={() => handleSaveNotes(transcript)} disabled={isSaving}>
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
  event: PlanTodayEvent; 
  onClose: () => void; 
  onConfirm: (status: 'Visited' | 'Cancelled', notes: string) => void;
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
                  onClick={() => onConfirm(selection === 'attended' ? 'Visited' : 'Cancelled', notes)}
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
