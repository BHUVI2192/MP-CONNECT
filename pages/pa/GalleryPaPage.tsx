import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  Image as ImageIcon, 
  ChevronRight,
  Download,
  Share2,
  Play,
  ArrowLeft,
  Lock,
  Eye,
  MoreVertical,
  Plus,
  BarChart3,
  TrendingUp,
  ArrowUpRight
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { mockAlbums } from '../../mockGallery';
import { Album } from '../../types';
import { Lightbox } from '../../components/Lightbox';
import { Button } from '../../components/UI/Button';

const analyticsData = [
  { date: '01 May', views: 450 },
  { date: '05 May', views: 890 },
  { date: '10 May', views: 1200 },
  { date: '15 May', views: 1100 },
  { date: '20 May', views: 1800 },
  { date: '25 May', views: 1600 },
  { date: '30 May', views: 2400 },
];

export const GalleryPaPage: React.FC = () => {
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [initialPhotoIndex, setInitialPhotoIndex] = useState(0);

  const filteredAlbums = useMemo(() => {
    return mockAlbums.filter(album => {
      return album.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             album.location.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [searchQuery]);

  if (selectedAlbum) {
    return (
      <div className="space-y-8 max-w-7xl mx-auto pb-20">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setSelectedAlbum(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter">{selectedAlbum.name}</h2>
                {!selectedAlbum.isPublic && <Lock className="w-5 h-5 text-orange-500" />}
              </div>
              <p className="text-slate-500 font-medium">{selectedAlbum.location} ΓÇó {selectedAlbum.eventDate}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="rounded-xl"><Download className="w-4 h-4 mr-2" /> Download All</Button>
          </div>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {selectedAlbum.photos.map((photo, idx) => (
            <motion.div 
              key={photo.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="aspect-square rounded-2xl overflow-hidden cursor-pointer group relative border border-slate-200"
              onClick={() => {
                setInitialPhotoIndex(idx);
                setLightboxOpen(true);
              }}
            >
              <img src={photo.thumbnailUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          ))}
        </div>

        <Lightbox 
          photos={selectedAlbum.photos}
          initialIndex={initialPhotoIndex}
          isOpen={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-7xl mx-auto pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Photo Gallery</h2>
          <p className="text-slate-500 font-medium">Review all event albums and media engagement analytics.</p>
        </div>
      </header>

      {/* Analytics Panel */}
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-xl font-black text-slate-900">Gallery Engagement</h3>
              <p className="text-sm text-slate-500 font-medium">Total views across all public albums (Last 30 Days)</p>
            </div>
            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-black">+24%</span>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 800, color: '#1e293b' }}
                />
                <Area type="monotone" dataKey="views" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white">
          <h3 className="text-xl font-black mb-6">Top Performing</h3>
          <div className="space-y-6">
            {[
              { name: 'Flood Relief Drive', views: '2.4k', growth: '+12%' },
              { name: 'School Inauguration', views: '1.8k', growth: '+8%' },
              { name: 'Public Meeting', views: '1.2k', growth: '+15%' }
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                <div>
                  <p className="text-sm font-black mb-1">{item.name}</p>
                  <p className="text-xs text-white/50 font-medium">{item.views} Views</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-emerald-400">{item.growth}</p>
                  <ArrowUpRight className="w-4 h-4 text-white/30 ml-auto mt-1" />
                </div>
              </div>
            ))}
          </div>
          <Button fullWidth variant="outline" className="mt-8 border-white/20 text-white hover:bg-white/10 rounded-xl">View Full Report</Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search albums..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 text-sm bg-white border border-slate-200 rounded-2xl focus:border-indigo-500 outline-none transition-all shadow-sm" 
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="rounded-xl"><Filter className="w-4 h-4 mr-2" /> Filter</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredAlbums.map((album) => (
          <div 
            key={album.id} 
            className="group relative bg-white rounded-[2rem] overflow-hidden border border-slate-200 shadow-sm hover:shadow-2xl transition-all cursor-pointer"
            onClick={() => setSelectedAlbum(album)}
          >
            <div className="aspect-[16/9] bg-slate-100 overflow-hidden relative">
               <img src={album.coverPhotoUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
               <div className="absolute top-4 right-4 flex gap-2">
                  <div className="px-3 py-1 bg-black/50 backdrop-blur-md rounded-full text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" /> {album.photoCount}
                  </div>
                  {!album.isPublic && (
                    <div className="p-1.5 bg-orange-500 rounded-full text-white shadow-lg">
                      <Lock className="w-3 h-3" />
                    </div>
                  )}
               </div>
            </div>
            <div className="p-6">
               <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{album.eventDate}</p>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400">
                    <div className="flex items-center gap-1 text-[10px] font-bold"><Eye className="w-3 h-3" /> {album.viewCount}</div>
                    <div className="flex items-center gap-1 text-[10px] font-bold"><Download className="w-3 h-3" /> {album.downloadCount}</div>
                  </div>
               </div>
               <h5 className="text-xl font-black text-slate-900 leading-tight mb-2 group-hover:text-indigo-600 transition-colors">{album.name}</h5>
               <p className="text-xs text-slate-500 font-medium flex items-center gap-1"><MapPin className="w-3 h-3" /> {album.location}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
