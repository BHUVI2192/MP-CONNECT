
import React, { useState, useEffect } from 'react';
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
  Zap,
  TrendingUp,
  RefreshCw
} from 'lucide-react';

interface AreaContext {
  id: string;
  name: string;
  completedWorks: string[];
  ongoingProjects: string[];
  resolvedIssues: number;
  sentiment: 'Positive' | 'Neutral' | 'Mixed';
}

const mockAreaBriefs: Record<string, AreaContext> = {
  'seelampur': {
    id: '1',
    name: 'Seelampur Zone',
    completedWorks: ['Solar Grid Phase I', 'Water Treatment Plant'],
    ongoingProjects: ['Community Center Renovation'],
    resolvedIssues: 124,
    sentiment: 'Positive'
  },
  'yamuna-vihar': {
    id: '2',
    name: 'Yamuna Vihar',
    completedWorks: ['NH-24 Service Road', 'Public Library'],
    ongoingProjects: ['Park Beautification'],
    resolvedIssues: 89,
    sentiment: 'Mixed'
  },
  'dilshad-garden': {
    id: '3',
    name: 'Dilshad Garden',
    completedWorks: ['Hospital Emergency Wing', 'Metro Bridge Lift'],
    ongoingProjects: ['Rainwater Harvesting Units'],
    resolvedIssues: 210,
    sentiment: 'Positive'
  }
};

export const LiveLocationPage: React.FC = () => {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [activeArea, setActiveArea] = useState<AreaContext | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate initial location fetch
    const timer = setTimeout(() => {
      // Starting coordinates (approx Northeast Delhi)
      setLocation({ lat: 28.6942, lng: 77.2737 });
      setActiveArea(mockAreaBriefs['seelampur']);
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Simulate movement or area switching for demo purposes
  const switchArea = (areaKey: string) => {
    setLoading(true);
    setTimeout(() => {
      setActiveArea(mockAreaBriefs[areaKey]);
      setLoading(false);
    }, 800);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto h-[calc(100vh-120px)] flex flex-col">
      <header className="flex justify-between items-center flex-shrink-0">
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
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Signal Strength</p>
              <div className="flex gap-0.5 mt-1">
                 {[1,1,1,1,0.5].map((v, i) => (
                   <div key={i} className={`w-1 h-3 rounded-full ${v === 1 ? 'bg-green-500' : 'bg-slate-300'}`} />
                 ))}
              </div>
           </div>
           <button 
            onClick={() => switchArea('yamuna-vihar')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors"
           >
             <RefreshCw className="w-4 h-4 text-slate-400" /> Simulate Move
           </button>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-0">
        {/* Map View */}
        <div className="lg:col-span-8 bg-slate-200 rounded-[2.5rem] relative overflow-hidden shadow-inner border-4 border-white">
          {/* Simulated Map Interface */}
          <div className="absolute inset-0 bg-slate-50">
             <div className="absolute inset-0 opacity-20 grayscale" 
                  style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
             
             {/* Dynamic Location Marker */}
             <motion.div 
               animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.2, 0.5] }}
               transition={{ repeat: Infinity, duration: 2 }}
               className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-indigo-500/20 rounded-full"
             />
             <motion.div 
               layoutId="mp-marker"
               className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10"
             >
                <div className="relative">
                   <div className="w-6 h-6 bg-indigo-600 rounded-full border-4 border-white shadow-xl" />
                   <div className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg">
                      Rahul Kumar (MP)
                   </div>
                </div>
             </motion.div>

             {/* Map Labels (Simulated) */}
             <div className="absolute top-1/4 left-1/4 text-slate-300 font-bold uppercase text-[10px] tracking-widest">Northeast Block A</div>
             <div className="absolute bottom-1/3 right-1/4 text-slate-300 font-bold uppercase text-[10px] tracking-widest">East Industrial Area</div>

             {/* UI Overlays on Map */}
             <div className="absolute top-6 left-6 space-y-2">
                <div className="bg-white/90 backdrop-blur-sm p-3 rounded-2xl border border-slate-200 shadow-lg flex items-center gap-3">
                   <Target className="w-5 h-5 text-indigo-600" />
                   <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase">Current Destination</p>
                      <p className="text-sm font-black text-slate-900">{activeArea?.name || 'Acquiring...'}</p>
                   </div>
                </div>
             </div>

             <div className="absolute bottom-6 left-6">
                <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl border border-slate-200 shadow-lg flex items-center gap-4 text-xs font-bold text-slate-600">
                   <div className="flex items-center gap-2 border-r pr-4 border-slate-200">
                      <Zap className="w-4 h-4 text-orange-500" /> 4.2 km/h
                   </div>
                   <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" /> ETA Seelampur: 12:45 PM
                   </div>
                </div>
             </div>
          </div>
        </div>

        {/* Briefing Panel */}
        <div className="lg:col-span-4 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
           <AnimatePresence mode="wait">
             {loading ? (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center flex-1 bg-white rounded-[2rem] border border-slate-200"
                >
                   <RefreshCw className="w-10 h-10 text-indigo-200 animate-spin mb-4" />
                   <p className="text-sm font-bold text-slate-400">Updating Area Context...</p>
                </motion.div>
             ) : (
                <motion.div 
                  key={activeArea?.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6 flex-1"
                >
                   {/* Context Card 1: Summary */}
                   <Card className="border-indigo-100 bg-indigo-50/20">
                      <div className="flex items-start gap-4 mb-4">
                         <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center flex-shrink-0">
                            <Info className="w-6 h-6" />
                         </div>
                         <div>
                            <h4 className="text-xl font-black text-slate-900">{activeArea?.name}</h4>
                            <p className="text-xs text-slate-500 font-medium">Zone Briefing & Statistics</p>
                         </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="p-3 bg-white rounded-xl border border-indigo-100 shadow-sm">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resolved</p>
                            <p className="text-lg font-black text-indigo-600">{activeArea?.resolvedIssues}</p>
                         </div>
                         <div className="p-3 bg-white rounded-xl border border-indigo-100 shadow-sm">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sentiment</p>
                            <div className="flex items-center gap-1 text-green-600 font-black text-sm">
                               <TrendingUp className="w-3 h-3" /> {activeArea?.sentiment}
                            </div>
                         </div>
                      </div>
                   </Card>

                   {/* Context Card 2: Accomplishments */}
                   <Card title="Accomplishments" subtitle="Works completed in this zone">
                      <div className="space-y-3 mt-2">
                         {activeArea?.completedWorks.map((work, i) => (
                           <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                              <span className="text-xs font-bold text-slate-700">{work}</span>
                           </div>
                         ))}
                      </div>
                   </Card>

                   {/* Context Card 3: Ongoing Projects */}
                   <Card title="Ongoing Projects" subtitle="Currently in progress">
                      <div className="space-y-3 mt-2">
                         {activeArea?.ongoingProjects.map((proj, i) => (
                           <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 shadow-sm">
                              <Clock className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                              <div className="flex-1">
                                 <p className="text-xs font-bold text-slate-700">{proj}</p>
                                 <div className="w-full bg-slate-100 h-1 rounded-full mt-2 overflow-hidden">
                                    <div className="bg-indigo-600 h-full w-[45%]" />
                                 </div>
                              </div>
                           </div>
                         ))}
                      </div>
                   </Card>

                   {/* Context Card 4: Critical Issues */}
                   <Card title="Local Issues" className="border-orange-100 bg-orange-50/20">
                      <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-orange-100 shadow-sm">
                         <AlertCircle className="w-4 h-4 text-orange-500" />
                         <p className="text-xs font-bold text-slate-700">Drainage complaints spiked in West Sector B last week.</p>
                      </div>
                   </Card>
                </motion.div>
             )}
           </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
