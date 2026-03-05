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
  ArrowLeft
} from 'lucide-react';
import { mockAlbums } from '../mockGallery';
import { Album } from '../types';
import { Lightbox } from '../components/Lightbox';

export const PhotoGalleryPage: React.FC = () => {
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('All');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [initialPhotoIndex, setInitialPhotoIndex] = useState(0);

  const publicAlbums = useMemo(() => mockAlbums.filter(a => a.isPublic), []);

  const filteredAlbums = useMemo(() => {
    return publicAlbums.filter(album => {
      const matchesSearch = album.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          album.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = eventTypeFilter === 'All' || album.eventType === eventTypeFilter;
      return matchesSearch && matchesType;
    });
  }, [publicAlbums, searchQuery, eventTypeFilter]);

  const eventTypes = ['All', ...new Set(publicAlbums.map(a => a.eventType))];

  if (selectedAlbum) {
    return (
      <div className="min-h-screen bg-white pb-20">
        <div className="max-w-7xl mx-auto px-6 pt-12">
          <button 
            onClick={() => setSelectedAlbum(null)}
            className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold mb-8 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back to Albums
          </button>

          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                  {selectedAlbum.eventType}
                </span>
                <span className="text-slate-400 text-sm font-medium">{selectedAlbum.eventDate}</span>
              </div>
              <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-6 leading-tight">
                {selectedAlbum.name}
              </h1>
              <p className="text-xl text-slate-600 font-medium leading-relaxed mb-8">
                {selectedAlbum.description}
              </p>
              <div className="flex items-center gap-6 text-slate-500">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-indigo-500" />
                  <span className="font-bold">{selectedAlbum.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-indigo-500" />
                  <span className="font-bold">{selectedAlbum.photoCount} Photos</span>
                </div>
              </div>
            </div>
            <div className="flex flex-col justify-end gap-4">
              <div className="flex gap-4">
                <button className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors">
                  <Download className="w-5 h-5" /> Download Album
                </button>
                <button className="flex-1 bg-white border-2 border-slate-200 text-slate-900 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:border-indigo-500 hover:text-indigo-600 transition-all">
                  <Share2 className="w-5 h-5" /> Share Album
                </button>
              </div>
              <button className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100">
                <Play className="w-5 h-5" /> Start Slideshow
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {selectedAlbum.photos.map((photo, idx) => (
              <motion.div 
                key={photo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="aspect-square rounded-3xl overflow-hidden cursor-pointer group relative"
                onClick={() => {
                  setInitialPhotoIndex(idx);
                  setLightboxOpen(true);
                }}
              >
                <img 
                  src={photo.thumbnailUrl} 
                  alt={photo.caption} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}
          </div>
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
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Hero Section */}
      <div className="bg-white border-b border-slate-200 pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8">
            <div className="max-w-2xl">
              <h1 className="text-6xl font-black text-slate-900 tracking-tighter mb-4">
                Photo Gallery
              </h1>
              <p className="text-xl text-slate-500 font-medium leading-relaxed">
                Explore the latest events, initiatives, and developmental works in our constituency through our official photo archives.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="relative flex-1 sm:w-80">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search albums..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium transition-all"
                />
              </div>
              <div className="relative">
                <Filter className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <select 
                  value={eventTypeFilter}
                  onChange={(e) => setEventTypeFilter(e.target.value)}
                  className="pl-12 pr-10 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-700 appearance-none cursor-pointer transition-all"
                >
                  {eventTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Album Grid */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        {filteredAlbums.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredAlbums.map((album, idx) => (
              <motion.div 
                key={album.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="group cursor-pointer"
                onClick={() => setSelectedAlbum(album)}
              >
                <div className="relative aspect-[16/10] rounded-[2.5rem] overflow-hidden shadow-sm group-hover:shadow-2xl transition-all duration-500 mb-6">
                  <img 
                    src={album.coverPhotoUrl} 
                    alt={album.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white rounded-full text-[10px] font-black uppercase tracking-widest border border-white/30">
                        {album.eventType}
                      </span>
                      <span className="text-white/70 text-xs font-bold">{album.eventDate}</span>
                    </div>
                    <h3 className="text-2xl font-black text-white leading-tight tracking-tight group-hover:text-indigo-300 transition-colors">
                      {album.name}
                    </h3>
                  </div>
                  <div className="absolute top-6 right-6 px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl text-white font-black text-xs border border-white/20">
                    {album.photoCount} Photos
                  </div>
                </div>
                <div className="px-4 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-slate-400">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm font-bold">{album.location}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all" />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ImageIcon className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">No albums found</h3>
            <p className="text-slate-500 font-medium">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};
