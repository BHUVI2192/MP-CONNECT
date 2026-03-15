import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Calendar, MapPin, Clock, ArrowLeft, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface TourProgram {
  id: string;
  title: string;
  type: string;
  start_date: string;
  start_time: string | null;
  duration: string | null;
  location_name: string | null;
  location_address: string | null;
  status: string;
  participants: Array<{ name: string; role?: string }>;
}

const TYPE_COLORS: Record<string, string> = {
  'Official Visit': 'bg-indigo-50 text-indigo-700',
  'Constituency Meeting': 'bg-emerald-50 text-emerald-700',
  'Inauguration': 'bg-amber-50 text-amber-700',
  'Public Meeting': 'bg-purple-50 text-purple-700',
};

export const PublicTourSchedulePage: React.FC = () => {
  const navigate = useNavigate();
  const [tours, setTours] = useState<TourProgram[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const today = new Date().toISOString().split('T')[0];
      try {
        const { data, error } = await supabase
          .from('tour_programs')
          .select('id, title, type, start_date, start_time, duration, location_name, location_address, status, participants')
          .gte('start_date', today)
          .in('status', ['Scheduled', 'SCHEDULED'])
          .order('start_date', { ascending: true })
          .limit(30);

        if (error) throw error;

        setTours((data as TourProgram[]) ?? []);
        setErrorMessage(null);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load public schedule.';
        setErrorMessage(message);
        setTours([]);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  // Group tours by date
  const grouped = tours.reduce<Record<string, TourProgram[]>>((acc, t) => {
    if (!acc[t.start_date]) acc[t.start_date] = [];
    acc[t.start_date].push(t);
    return acc;
  }, {});

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/citizen')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">MP's Public Schedule</h2>
          <p className="text-slate-500 text-sm font-medium">Upcoming tours and constituency visits by Hon. MP.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : errorMessage ? (
        <Card>
          <div className="py-12 text-center">
            <Calendar className="w-12 h-12 text-rose-300 mx-auto mb-4" />
            <p className="font-bold text-rose-600">Unable to load public events right now.</p>
            <p className="text-xs text-slate-400 mt-1">{errorMessage}</p>
          </div>
        </Card>
      ) : Object.keys(grouped).length === 0 ? (
        <Card>
          <div className="py-12 text-center">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="font-bold text-slate-500">No upcoming public events scheduled.</p>
            <p className="text-xs text-slate-400 mt-1">Check back soon for updates to the MP's schedule.</p>
          </div>
        </Card>
      ) : (
        Object.entries(grouped).map(([date, items]) => {
          const d = new Date(date + 'T00:00:00');
          const label = d.toLocaleDateString('en-IN', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
          return (
            <div key={date} className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs font-black text-slate-500 uppercase tracking-widest whitespace-nowrap px-2">
                  {label}
                </span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>

              {items.map((tour) => {
                const participantCount = Array.isArray(tour.participants) ? tour.participants.length : 0;
                return (
                  <Card key={tour.id} className="hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center shrink-0">
                        <Calendar className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase ${TYPE_COLORS[tour.type] ?? 'bg-slate-100 text-slate-600'}`}>
                            {tour.type}
                          </span>
                        </div>
                        <h4 className="font-black text-slate-900 text-base leading-snug">{tour.title}</h4>

                        {(tour.location_name || tour.location_address) && (
                          <div className="flex items-center gap-1 mt-1.5 text-xs text-slate-500">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span className="truncate">
                              {tour.location_name}
                              {tour.location_address ? ` — ${tour.location_address}` : ''}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-4 mt-1 text-xs text-slate-400">
                          {tour.start_time && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {tour.start_time}
                            </span>
                          )}
                          {tour.duration && <span>Duration: {tour.duration}</span>}
                          {participantCount > 0 && (
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {participantCount} participants
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          );
        })
      )}
    </div>
  );
};
