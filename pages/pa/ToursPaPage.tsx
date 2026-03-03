
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Plus,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  X,
  Search,
  Filter,
  Trash2,
  Send,
  MessageSquare
} from 'lucide-react';
import { TourProgram, TourParticipant } from '../../types';

import { useMockData } from '../../context/MockDataContext';

export const ToursPaPage: React.FC = () => {
  const navigate = useNavigate();
  const { tours, addTour } = useMockData();
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'Scheduled' | 'Completed'>('Scheduled');

  // Form State
  const [newTour, setNewTour] = useState<Partial<TourProgram>>({
    title: '',
    type: 'Official Visit',
    startDate: '',
    startTime: '',
    duration: '',
    location: { name: '', address: '' },
    participants: [],
    instructions: ''
  });

  const [newParticipant, setNewParticipant] = useState({ name: '', role: '', contact: '' });

  const handleAddParticipant = () => {
    if (newParticipant.name && newParticipant.contact) {
      const participant: TourParticipant = {
        id: Math.random().toString(),
        ...newParticipant,
        notified: false
      };
      setNewTour({ ...newTour, participants: [...(newTour.participants || []), participant] });
      setNewParticipant({ name: '', role: '', contact: '' });
    }
  };

  const handleCreateTour = () => {
    const tour: TourProgram = {
      id: `TOUR-2024-${Math.floor(Math.random() * 1000)}`,
      ...newTour as any,
      status: 'Scheduled',
      notificationLog: [],
      createdAt: new Date().toISOString(),
      createdBy: 'PA-001'
    };

    // Simulate Notification
    const logs = tour.participants.map(p => ({
      recipientName: p.name,
      channel: 'WhatsApp' as const,
      status: 'Sent' as const,
      timestamp: new Date().toLocaleString()
    }));
    tour.notificationLog = logs;
    tour.participants.forEach(p => p.notified = true);

    addTour(tour);
    setShowScheduleForm(false);
    setNewTour({ title: '', type: 'Official Visit', startDate: '', startTime: '', duration: '', location: { name: '', address: '' }, participants: [], instructions: '' });
  };

  const filteredTours = tours.filter(t => activeTab === 'Scheduled' ? t.status === 'Scheduled' : t.status === 'Completed');

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Tour Program</h2>
          <p className="text-slate-500 font-medium mt-1">Plan upcoming visits and automate notifications.</p>
        </div>
        <Button onClick={() => navigate('/pa/tours/new')} className="rounded-xl shadow-lg shadow-indigo-200">
          <Plus className="w-5 h-5 mr-2" /> Schedule New Tour
        </Button>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit">
        {['Scheduled', 'Completed'].map((tab) => (
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
                    <p className="text-xs font-bold text-slate-400 mt-1 flex items-center gap-1"><Clock className="w-3 h-3" /> {tour.startTime} ({tour.duration})</p>
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xl font-black text-slate-900 tracking-tight">{tour.title}</h4>
                      <p className="text-sm font-medium text-slate-500 flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" /> {tour.location.name}, {tour.location.address}</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">People Involved</p>
                      <div className="flex flex-wrap gap-2">
                        {tour.participants?.map((p, i) => (
                          <div key={i} className="flex items-center gap-2 bg-white px-2 py-1 rounded-lg border border-slate-200 shadow-sm">
                            <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-bold">
                              {p.name[0]}
                            </div>
                            <div className="text-xs">
                              <p className="font-bold text-slate-700">{p.name}</p>
                              <p className="text-[10px] text-slate-400">{p.role}</p>
                            </div>
                            {p.notified && <CheckCircle2 className="w-3 h-3 text-green-500 ml-1" />}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Instructions</p>
                      <p className="text-xs text-slate-600 italic bg-white p-2 rounded-lg border border-slate-200">"{tour.instructions}"</p>
                    </div>
                  </div>

                  <div className="flex gap-2 items-center text-[10px] font-bold text-slate-400 bg-slate-50 w-fit px-3 py-1 rounded-lg">
                    <MessageSquare className="w-3 h-3" /> Notifications Sent automatically to {tour.participants.length} participants via WhatsApp.
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Schedule Modal */}
      <AnimatePresence>
        {showScheduleForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" onClick={() => setShowScheduleForm(false)} />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black text-slate-900">Schedule New Tour</h3>
                <button onClick={() => setShowScheduleForm(false)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5 text-slate-400" /></button>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tour Title</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="e.g. Village Inspection - Rampur"
                    value={newTour.title}
                    onChange={(e) => setNewTour({ ...newTour, title: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</label>
                    <select
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs outline-none"
                      value={newTour.type}
                      onChange={(e) => setNewTour({ ...newTour, type: e.target.value as any })}
                    >
                      <option>Official Visit</option>
                      <option>Inspection</option>
                      <option>Community Engagement</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs outline-none"
                      value={newTour.startDate}
                      onChange={(e) => setNewTour({ ...newTour, startDate: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Start Time</label>
                    <input
                      type="time"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs outline-none"
                      value={newTour.startTime}
                      onChange={(e) => setNewTour({ ...newTour, startTime: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs outline-none"
                      placeholder="e.g. 2h"
                      value={newTour.duration}
                      onChange={(e) => setNewTour({ ...newTour, duration: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</label>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs outline-none"
                      placeholder="Venue Name"
                      value={newTour.location?.name}
                      onChange={(e) => setNewTour({ ...newTour, location: { ...newTour.location!, name: e.target.value } })}
                    />
                    <input
                      type="text"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs outline-none"
                      placeholder="Address"
                      value={newTour.location?.address}
                      onChange={(e) => setNewTour({ ...newTour, location: { ...newTour.location!, address: e.target.value } })}
                    />
                  </div>
                </div>

                <div className="space-y-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Add Participants</label>
                  <div className="flex gap-2">
                    <input
                      type="text" placeholder="Name" className="flex-1 px-2 py-1 text-xs rounded-lg border border-slate-200"
                      value={newParticipant.name} onChange={e => setNewParticipant({ ...newParticipant, name: e.target.value })}
                    />
                    <input
                      type="text" placeholder="Role" className="w-24 px-2 py-1 text-xs rounded-lg border border-slate-200"
                      value={newParticipant.role} onChange={e => setNewParticipant({ ...newParticipant, role: e.target.value })}
                    />
                    <input
                      type="text" placeholder="Contact" className="w-24 px-2 py-1 text-xs rounded-lg border border-slate-200"
                      value={newParticipant.contact} onChange={e => setNewParticipant({ ...newParticipant, contact: e.target.value })}
                    />
                    <button onClick={handleAddParticipant} className="p-1 bg-indigo-600 text-white rounded-lg"><Plus className="w-4 h-4" /></button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {newTour.participants?.map((p, i) => (
                      <span key={i} className="text-[10px] font-bold bg-white border border-slate-200 px-2 py-1 rounded-lg flex items-center gap-1">
                        {p.name} ({p.role}) <Trash2 className="w-3 h-3 text-red-400 cursor-pointer" />
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Instructions / Notes</label>
                  <textarea
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl font-medium text-xs outline-none resize-none"
                    rows={3}
                    placeholder="Special instructions for the team..."
                    value={newTour.instructions}
                    onChange={(e) => setNewTour({ ...newTour, instructions: e.target.value })}
                  />
                </div>

                <Button fullWidth size="lg" className="rounded-xl mt-4" onClick={handleCreateTour}>
                  <Send className="w-4 h-4 mr-2" /> Schedule & Notify All
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
