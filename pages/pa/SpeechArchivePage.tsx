import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  Mic, 
  Video, 
  FileText, 
  ChevronRight, 
  ArrowLeft,
  Download,
  Share2,
  Play,
  Pause,
  Volume2,
  Maximize2,
  Printer,
  Copy,
  ExternalLink,
  Clock,
  Globe,
  Tag,
  X
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Speech, SpeechType } from '../../types';
import { Button } from '../../components/UI/Button';
import { Card } from '../../components/UI/Card';

export const SpeechArchivePage: React.FC = () => {
  const [speeches, setSpeeches] = useState<Speech[]>([]);
  useEffect(() => {
    supabase.from('speech_storage').select('*').order('speech_date', { ascending: false })
      .then(({ data }: any) => {
        if (data) setSpeeches(data.map((r: any) => ({
          id: r.speech_id, title: r.title, type: (r.type ?? 'Other') as SpeechType,
          eventName: r.event_name ?? '', date: r.speech_date ?? '',
          location: r.location ?? '', occasion: r.occasion ?? '',
          language: r.language ?? 'Hindi', description: r.description ?? '',
          keyTopics: r.key_topics ?? [], keyPoints: r.key_points ?? [],
          audioUrl: r.audio_url ?? undefined, videoUrl: r.video_url ?? undefined,
          videoThumbnail: r.video_thumbnail ?? undefined, transcript: r.transcript ?? undefined,
          duration: r.duration ?? '', relatedProjectIds: [],
          isImportant: r.is_important ?? false, isPublic: r.is_public ?? false,
          createdAt: r.created_at?.split('T')[0] ?? '',
        })));
      });
  }, []);
  const [selectedSpeech, setSelectedSpeech] = useState<Speech | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<SpeechType | 'All'>('All');
  const [mediaFilter, setMediaFilter] = useState<'All' | 'Audio' | 'Video' | 'Transcript'>('All');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const waveformHeights = [
    30, 45, 60, 20, 80, 40, 90, 30, 50, 70, 40, 60, 80, 20, 40, 90, 30, 50, 70, 40,
    60, 80, 20, 40, 90, 30, 50, 70, 40, 60, 80, 20, 40, 90, 30, 50, 70, 40, 60, 80,
    20, 40, 90, 30, 50, 70, 40, 60, 80, 20, 40, 90, 30, 50, 70, 40, 60, 80, 20, 40
  ];

  const filteredSpeeches = useMemo(() => {
    return speeches.filter(speech => {
      const matchesSearch = speech.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          speech.transcript?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          speech.keyTopics.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesType = typeFilter === 'All' || speech.type === typeFilter;
      const matchesMedia = mediaFilter === 'All' || 
                          (mediaFilter === 'Audio' && speech.audioUrl) ||
                          (mediaFilter === 'Video' && speech.videoUrl) ||
                          (mediaFilter === 'Transcript' && speech.transcript);
      return matchesSearch && matchesType && matchesMedia;
    });
  }, [speeches, searchQuery, typeFilter, mediaFilter]);

  const handleFilterChange = (filter: string) => {
    if (activeFilters.includes(filter)) {
      setActiveFilters(prev => prev.filter(f => f !== filter));
    } else {
      setActiveFilters(prev => [...prev, filter]);
    }
  };

  if (selectedSpeech) {
    return (
      <div className="max-w-6xl mx-auto pb-20">
        <button 
          onClick={() => setSelectedSpeech(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold mb-8 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back to Archive
        </button>

        <div className="space-y-10">
          <header className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                selectedSpeech.type === 'Parliament' ? 'bg-blue-100 text-blue-600' :
                selectedSpeech.type === 'Public Address' ? 'bg-emerald-100 text-emerald-600' :
                'bg-slate-100 text-slate-600'
              }`}>
                {selectedSpeech.type}
              </span>
              <span className="text-slate-400 text-sm font-bold flex items-center gap-2">
                <Calendar className="w-4 h-4" /> {selectedSpeech.date}
              </span>
              <span className="text-slate-400 text-sm font-bold flex items-center gap-2">
                <Globe className="w-4 h-4" /> {selectedSpeech.language}
              </span>
            </div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter leading-tight">
              {selectedSpeech.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-slate-500">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-500" />
                <span className="font-bold">{selectedSpeech.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-indigo-500" />
                <span className="font-bold">{selectedSpeech.occasion}</span>
              </div>
            </div>
          </header>

          <div className="grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-10">
              {/* Media Players */}
              {selectedSpeech.videoUrl && (
                <div className="aspect-video bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl relative group">
                  <video 
                    src={selectedSpeech.videoUrl} 
                    className="w-full h-full object-cover"
                    poster={selectedSpeech.videoThumbnail}
                    controls
                  />
                </div>
              )}

              {selectedSpeech.audioUrl && (
                <Card className="p-8 rounded-[2rem] bg-slate-900 text-white border-none shadow-xl">
                  <div className="flex items-center gap-6">
                    <button className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20">
                      <Play className="w-8 h-8 fill-current" />
                    </button>
                    <div className="flex-1 space-y-4">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-white/50">
                        <span>Audio Recording</span>
                        <span>{selectedSpeech.duration}</span>
                      </div>
                      <div className="h-12 flex items-end gap-1">
                        {waveformHeights.map((height, i) => (
                          <div key={i} className="flex-1 bg-indigo-500/30 rounded-full" style={{ height: `${height}%` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Transcript */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Transcript</h3>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Printer className="w-5 h-5" /></button>
                    <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Download className="w-5 h-5" /></button>
                    <button className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"><Copy className="w-5 h-5" /></button>
                  </div>
                </div>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search within transcript..." 
                    className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="p-10 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm space-y-6">
                  {selectedSpeech.transcript?.split('\n').map((para, i) => (
                    <p key={i} className="text-slate-600 font-medium leading-relaxed">
                      {para}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-10">
              {/* Key Points */}
              <div className="p-8 bg-indigo-50 rounded-[2.5rem] border border-indigo-100">
                <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-6">Key Points</h4>
                <ul className="space-y-4">
                  {selectedSpeech.keyPoints.map((point, i) => (
                    <li key={i} className="flex gap-4 text-sm font-bold text-slate-700 leading-snug">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full mt-1.5 flex-shrink-0" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Topics */}
              <div className="space-y-4">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Topics</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedSpeech.keyTopics.map(topic => (
                    <span key={topic} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-4">
                <Button fullWidth size="lg" className="rounded-2xl shadow-lg shadow-indigo-100">
                  <Download className="w-5 h-5 mr-2" /> Download Package
                </Button>
                <Button fullWidth variant="outline" size="lg" className="rounded-2xl">
                  <Share2 className="w-5 h-5 mr-2" /> Share Archive Link
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <header className="mb-12">
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Speech Archive</h2>
        <p className="text-slate-500 font-medium">Full-text searchable database of all official addresses and briefings.</p>
      </header>

      {/* Advanced Search & Filters */}
      <div className="space-y-6 mb-12">
        <div className="relative">
          <Search className="w-6 h-6 absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by title, transcript content, or topics..." 
            className="w-full pl-16 pr-6 py-6 bg-white border border-slate-200 rounded-[2rem] text-lg font-bold outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl">
            <Filter className="w-4 h-4 text-slate-400" />
            <select 
              className="bg-transparent text-xs font-black uppercase tracking-widest text-slate-600 outline-none cursor-pointer"
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value as any)}
            >
              <option value="All">All Types</option>
              <option value="Parliament">Parliament</option>
              <option value="Public Address">Public Address</option>
              <option value="Press Conference">Press Conference</option>
            </select>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl">
            <Play className="w-4 h-4 text-slate-400" />
            <select 
              className="bg-transparent text-xs font-black uppercase tracking-widest text-slate-600 outline-none cursor-pointer"
              value={mediaFilter}
              onChange={e => setMediaFilter(e.target.value as any)}
            >
              <option value="All">All Media</option>
              <option value="Audio">Has Audio</option>
              <option value="Video">Has Video</option>
              <option value="Transcript">Has Transcript</option>
            </select>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-600">Date Range</span>
          </div>
        </div>
      </div>

      {/* Archive List */}
      <div className="space-y-4">
        {filteredSpeeches.map((speech, idx) => (
          <motion.div
            key={speech.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => setSelectedSpeech(speech)}
            className="group bg-white p-6 rounded-[2rem] border border-slate-200 hover:border-indigo-300 hover:shadow-xl transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center gap-8"
          >
            <div className="w-full md:w-64 space-y-3">
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  speech.type === 'Parliament' ? 'bg-blue-100 text-blue-600' :
                  speech.type === 'Public Address' ? 'bg-emerald-100 text-emerald-600' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {speech.type}
                </span>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{speech.date}</span>
              </div>
              <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">
                {speech.title}
              </h3>
            </div>

            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-4 text-slate-500 text-xs font-bold">
                <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-indigo-500" /> {speech.location}</div>
                <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-indigo-500" /> {speech.duration}</div>
              </div>
              <div className="flex flex-wrap gap-2">
                {speech.keyTopics.slice(0, 3).map(topic => (
                  <span key={topic} className="px-3 py-1 bg-slate-50 text-slate-400 rounded-lg text-[10px] font-black uppercase tracking-widest">
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {speech.audioUrl && <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Mic className="w-5 h-5" /></div>}
              {speech.videoUrl && <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Video className="w-5 h-5" /></div>}
              {speech.transcript && <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><FileText className="w-5 h-5" /></div>}
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-slate-300 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all">
                <ChevronRight className="w-6 h-6" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
