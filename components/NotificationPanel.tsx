
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  X, 
  Check, 
  Trash2, 
  MessageSquare, 
  Mic, 
  Play, 
  FileUp, 
  Calendar,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { Button } from './UI/Button';
import { NotificationType } from '../types';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const { notifications, markAsRead, clearAll, updateInternalNote } = useNotifications();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-[110] flex flex-col"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                  <Bell className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Notifications</h2>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={clearAll}
                  className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                  title="Clear All"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-900 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-200">
                    <Bell className="w-10 h-10" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">All caught up!</h3>
                  <p className="text-sm text-slate-500">No new notifications from the PA at the moment.</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <NotificationCard 
                    key={notification.id} 
                    notification={notification} 
                    onMarkRead={() => markAsRead(notification.id)}
                    onAddNote={(note) => updateInternalNote(notification.id, note)}
                  />
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const NotificationCard: React.FC<{ 
  notification: any; 
  onMarkRead: () => void;
  onAddNote: (note: string) => void;
}> = ({ notification, onMarkRead, onAddNote }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [internalNote, setInternalNote] = useState(notification.internalNotes || '');
  const [showNoteInput, setShowNoteInput] = useState(false);

  const typeColors: Record<NotificationType, string> = {
    UPDATE: 'text-blue-600 bg-blue-50',
    VISITED: 'text-emerald-600 bg-emerald-50',
    CANCELLED: 'text-red-600 bg-red-50'
  };

  return (
    <motion.div 
      layout
      className={`p-4 rounded-2xl border transition-all ${
        notification.isRead ? 'bg-white border-slate-100' : 'bg-indigo-50/30 border-indigo-100 shadow-sm'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${typeColors[notification.type as NotificationType]}`}>
          {notification.type}
        </span>
        <span className="text-[10px] font-bold text-slate-400">{notification.timestamp}</span>
      </div>
      
      <h4 className="font-black text-slate-900 text-sm mb-1">{notification.eventName}</h4>
      
      {notification.notes && (
        <div className="mt-2">
          <p className={`text-xs text-slate-600 leading-relaxed ${!isExpanded ? 'line-clamp-3' : ''}`}>
            {notification.notes}
          </p>
          {notification.notes.length > 100 && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-[10px] font-bold text-indigo-600 mt-1 flex items-center gap-0.5 hover:underline"
            >
              {isExpanded ? 'Show less' : 'Show more'}
              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}
        </div>
      )}

      {notification.voiceNoteUrl && (
        <div className="mt-3 p-3 bg-white rounded-xl border border-slate-100 flex items-center gap-3">
          <button className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
            <Play className="w-4 h-4 fill-current" />
          </button>
          <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-600 w-1/3" />
          </div>
          <Mic className="w-3 h-3 text-slate-400" />
        </div>
      )}

      {notification.internalNotes && (
        <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Internal Note</p>
          <p className="text-xs text-slate-700 italic">"{notification.internalNotes}"</p>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {!notification.isRead && (
          <button 
            onClick={onMarkRead}
            className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 hover:bg-emerald-50 px-2 py-1 rounded-lg transition-colors"
          >
            <Check className="w-3 h-3" /> Mark as read
          </button>
        )}
        <button 
          onClick={() => setShowNoteInput(!showNoteInput)}
          className="text-[10px] font-bold text-slate-500 flex items-center gap-1 hover:bg-slate-100 px-2 py-1 rounded-lg transition-colors"
        >
          <MessageSquare className="w-3 h-3" /> {notification.internalNotes ? 'Edit Note' : 'Add Note'}
        </button>
        
        {notification.type === 'VISITED' && (
          <button className="text-[10px] font-bold text-indigo-600 flex items-center gap-1 hover:bg-indigo-50 px-2 py-1 rounded-lg transition-colors">
            <FileUp className="w-3 h-3" /> Add Post-Event Doc
          </button>
        )}
        
        {notification.type === 'CANCELLED' && (
          <button className="text-[10px] font-bold text-orange-600 flex items-center gap-1 hover:bg-orange-50 px-2 py-1 rounded-lg transition-colors">
            <Calendar className="w-3 h-3" /> Reschedule
          </button>
        )}
      </div>

      {showNoteInput && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 pt-3 border-t border-slate-100"
        >
          <textarea 
            value={internalNote}
            onChange={(e) => setInternalNote(e.target.value)}
            placeholder="Add internal staff note..."
            className="w-full p-3 text-xs rounded-xl border border-slate-200 outline-none focus:ring-1 focus:ring-indigo-500 resize-none h-20"
          />
          <div className="flex justify-end gap-2 mt-2">
            <Button variant="ghost" size="sm" onClick={() => setShowNoteInput(false)}>Cancel</Button>
            <Button size="sm" onClick={() => {
              onAddNote(internalNote);
              setShowNoteInput(false);
            }}>Save Note</Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
