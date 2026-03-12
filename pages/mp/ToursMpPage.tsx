
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../../components/UI/Card';
import { Calendar, MapPin, CheckCircle2, Clock, Users, Loader2 } from 'lucide-react';
import { toursApi } from '../../hooks/useTours';

type Tour = {
  id: string;
  title: string;
  type: string;
  start_date: string;
  start_time?: string;
  duration?: string;
  location_name?: string;
  location_address?: string;
  status: string;
  participants: Array<{ id: string; name: string; role?: string; contact?: string }>;
  instructions?: string;
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
};

export const ToursMpPage: React.FC = () => {
  const [tours, setTours] = useState<Tour[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    toursApi.getTours().then(({ data }) => {
      setTours((data ?? []) as Tour[]);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      <header>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Tours & Visits</h2>
        <p className="text-slate-500 font-medium">Track itinerary and reference media for constituency visits.</p>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
        </div>
      ) : tours.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-slate-200">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No tours scheduled yet.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {tours.map((tour, idx) => (
            <motion.div
              key={tour.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Card className="relative overflow-visible border-slate-200">
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Date Side */}
                  <div className="md:w-56 flex-shrink-0 space-y-4">
                    <div>
                      <div className="flex items-center gap-2 text-indigo-600 font-black mb-1">
                        <Calendar className="w-4 h-4" />
                        {formatDate(tour.start_date)}
                      </div>
                      {tour.start_time && (
                        <div className="flex items-center gap-1 text-slate-400 text-xs font-bold mb-2">
                          <Clock className="w-3 h-3" />
                          {tour.start_time}{tour.duration ? ` · ${tour.duration}` : ''}
                        </div>
                      )}
                      <div className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                        tour.status === 'Completed' ? 'bg-slate-100 text-slate-600' :
                        tour.status === 'Cancelled' ? 'bg-red-100 text-red-600' :
                        'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                      }`}>
                        {tour.status}
                      </div>
                    </div>

                    {/* Participants */}
                    {tour.participants && tour.participants.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <Users className="w-3 h-3" /> Team ({tour.participants.length})
                        </p>
                        {tour.participants.slice(0, 3).map((p) => (
                          <div key={p.id} className="text-xs text-slate-600 font-medium truncate">
                            {p.name}{p.role ? ` · ${p.role}` : ''}
                          </div>
                        ))}
                        {tour.participants.length > 3 && (
                          <div className="text-xs text-indigo-500 font-bold">+{tour.participants.length - 3} more</div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Content Side */}
                  <div className="flex-1 space-y-5">
                    <div>
                      <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">{tour.type}</p>
                      <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2 tracking-tighter">
                        <MapPin className="w-5 h-5 text-slate-300" />
                        {tour.location_name ?? 'Location TBD'}
                      </h3>
                      {tour.location_address && (
                        <p className="text-xs text-slate-400 font-medium mt-1 ml-7">{tour.location_address}</p>
                      )}
                    </div>

                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-4 h-4" /> {tour.title}
                      </h4>
                      {tour.instructions && (
                        <p className="text-sm text-slate-600 bg-slate-50 rounded-xl p-3 border border-slate-100">{tour.instructions}</p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
