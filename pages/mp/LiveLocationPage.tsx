
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../../components/UI/Card';
import {
  Navigation,
  MapPin,
  Info,
  CheckCircle2,
  Clock,
  AlertCircle,
  Target,
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface LiveStats {
  resolvedComplaints: number;
  activeComplaints: number;
  completedWorks: { work_title: string }[];
  ongoingWorks: { work_title: string; progress_pct: number }[];
}

export const LiveLocationPage: React.FC = () => {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [stats, setStats] = useState<LiveStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadStats = useCallback(async () => {
    setLoading(true);
    const [{ count: resolved }, { count: active }, { data: completed }, { data: ongoing }] =
      await Promise.all([
        supabase
          .from('complaints')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'Resolved'),
        supabase
          .from('complaints')
          .select('*', { count: 'exact', head: true })
          .in('status', ['New', 'In Progress', 'Verified', 'Dispatched']),
        supabase
          .from('development_works')
          .select('work_title')
          .eq('status', 'COMPLETED')
          .order('updated_at', { ascending: false })
          .limit(4),
        supabase
          .from('development_works')
          .select('work_title, progress_pct')
          .eq('status', 'ONGOING')
          .order('updated_at', { ascending: false })
          .limit(3),
      ]);
    setStats({
      resolvedComplaints: resolved ?? 0,
      activeComplaints: active ?? 0,
      completedWorks: (completed ?? []) as { work_title: string }[],
      ongoingWorks: (ongoing ?? []) as { work_title: string; progress_pct: number }[],
    });
    setLastUpdated(new Date());
    setLoading(false);
  }, []);

  // Real browser GPS
  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation not supported by this browser.');
      loadStats();
      return;
    }
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoError(null);
      },
      (err) => {
        setGeoError(err.message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
    loadStats();
    return () => navigator.geolocation.clearWatch(watchId);
  }, [loadStats]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto h-[calc(100vh-120px)] flex flex-col">
      <header className="flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white">
              <Navigation className="w-6 h-6 animate-pulse" />
            </div>
            Live Briefing
          </h2>
          <p className="text-slate-500 font-medium mt-1">Real-time contextual intelligence as you travel.</p>
        </div>
        <div className="flex gap-4">
          <div className="hidden md:flex flex-col items-end">
            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">GPS Status</p>
            <p className={`text-xs font-bold mt-0.5 ${coords ? 'text-green-600' : geoError ? 'text-red-400' : 'text-slate-400'}`}>
              {coords ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : geoError ? 'Unavailable' : 'Acquiring...'}
            </p>
          </div>
          <button
            onClick={loadStats}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-slate-400" /> Refresh
          </button>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0">
        {/* Map View */}
        <div className="lg:col-span-8 bg-slate-200 rounded-[2.5rem] relative overflow-hidden shadow-inner border-4 border-white">
          <div className="absolute inset-0 bg-slate-50">
            <div
              className="absolute inset-0 opacity-20"
              style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '24px 24px' }}
            />

            {/* GPS marker — animate only when we have real coordinates */}
            {coords && (
              <>
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.15, 0.5] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-indigo-500/20 rounded-full"
                />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                  <div className="relative">
                    <div className="w-6 h-6 bg-indigo-600 rounded-full border-4 border-white shadow-xl" />
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg">
                      MP (Live)
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* GPS acquiring / error state */}
            {!coords && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                {geoError ? (
                  <>
                    <AlertCircle className="w-10 h-10 text-orange-400" />
                    <p className="text-xs font-bold text-slate-500 text-center max-w-xs">{geoError}</p>
                    <p className="text-[10px] text-slate-400">Enable location access to show live position.</p>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-10 h-10 text-indigo-200 animate-spin" />
                    <p className="text-xs font-bold text-slate-400">Acquiring GPS signal...</p>
                  </>
                )}
              </div>
            )}

            {/* Coordinate overlay */}
            {coords && (
              <div className="absolute top-6 left-6">
                <div className="bg-white/90 backdrop-blur-sm p-3 rounded-2xl border border-slate-200 shadow-lg flex items-center gap-3">
                  <Target className="w-5 h-5 text-indigo-600" />
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase">Current Position</p>
                    <p className="text-sm font-black text-slate-900 font-mono">
                      {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {lastUpdated && (
              <div className="absolute bottom-6 left-6">
                <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl border border-slate-200 shadow-lg flex items-center gap-2 text-xs font-bold text-slate-600">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Stats last refreshed: {lastUpdated.toLocaleTimeString('en-IN')}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Briefing Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2">
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center flex-1 bg-white rounded-[2rem] border border-slate-200 py-12"
              >
                <RefreshCw className="w-10 h-10 text-indigo-200 animate-spin mb-4" />
                <p className="text-sm font-bold text-slate-400">Loading constituency data...</p>
              </motion.div>
            ) : (
              <motion.div
                key="live-stats"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6 flex-1"
              >
                {/* Summary Card */}
                <Card className="border-indigo-100 bg-indigo-50/20">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shrink-0">
                      <Info className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-slate-900">Constituency Overview</h4>
                      <p className="text-xs text-slate-500 font-medium">Live stats from Supabase</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white rounded-xl border border-indigo-100 shadow-sm">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resolved</p>
                      <p className="text-lg font-black text-indigo-600">{stats?.resolvedComplaints ?? 0}</p>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-orange-100 shadow-sm">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active</p>
                      <div className="flex items-center gap-1 text-orange-600 font-black text-lg">
                        <TrendingUp className="w-4 h-4" /> {stats?.activeComplaints ?? 0}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Completed Works */}
                <Card title="Completed Works" subtitle="Most recently closed projects">
                  <div className="space-y-3 mt-2">
                    {(stats?.completedWorks ?? []).length === 0 ? (
                      <p className="text-xs text-slate-400 font-medium py-2">No completed works recorded yet.</p>
                    ) : (stats?.completedWorks ?? []).map((w, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                        <span className="text-xs font-bold text-slate-700 leading-snug">{w.work_title}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Ongoing Works */}
                <Card title="Ongoing Projects" subtitle="Currently in progress">
                  <div className="space-y-3 mt-2">
                    {(stats?.ongoingWorks ?? []).length === 0 ? (
                      <p className="text-xs text-slate-400 font-medium py-2">No ongoing works found.</p>
                    ) : (stats?.ongoingWorks ?? []).map((w, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                        <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-slate-700 leading-snug truncate">{w.work_title}</p>
                          <div className="w-full bg-slate-100 h-1 rounded-full mt-2 overflow-hidden">
                            <div
                              className="bg-indigo-600 h-full transition-all"
                              style={{ width: `${w.progress_pct ?? 0}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5">{w.progress_pct ?? 0}% complete</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Active grievances notice */}
                {(stats?.activeComplaints ?? 0) > 0 && (
                  <Card title="Open Grievances" className="border-orange-100 bg-orange-50/20">
                    <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-orange-100 shadow-sm mt-2">
                      <AlertCircle className="w-4 h-4 text-orange-500 shrink-0" />
                      <p className="text-xs font-bold text-slate-700">
                        {stats!.activeComplaints} complaint{stats!.activeComplaints !== 1 ? 's' : ''} require attention across the constituency.
                      </p>
                    </div>
                  </Card>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
