
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { 
  Camera, 
  Newspaper, 
  Plus, 
  Search, 
  Filter, 
  Tag, 
  Calendar,
  Image as ImageIcon,
  Share2,
  Trash2,
  ExternalLink,
  Upload,
  X,
  MoreVertical,
  Package,
  Lock,
  Globe,
  Star,
  CheckCircle2,
  Edit2,
  GripVertical,
  ChevronRight,
  Download,
  Eye,
  MapPin
} from 'lucide-react';
import { photoGalleryApi } from '../../hooks/usePhotoGallery';
import { Album, Photo } from '../../types';

export const MediaManagerPage: React.FC = () => {
  const [albums, setAlbums] = useState<Album[]>([]);
  useEffect(() => {
    photoGalleryApi.listAlbums().then(({ data }: any) => {
      if (data) {
        setAlbums(data.map((a: any) => ({
          id: a.gallery_id, name: a.title, description: a.description ?? '',
          eventDate: a.event_date ?? '', eventType: 'Event', location: a.location ?? '',
          tags: [], isPublic: a.is_public ?? false,
          coverPhotoUrl: a.cover_photo_url ||
            (a.photo_gallery_photos?.[0] ? photoGalleryApi.getPhotoUrl(a.photo_gallery_photos[0].storage_path) : ''),
          photoCount: a.photo_gallery_photos?.length ?? 0, viewCount: 0, downloadCount: 0,
          createdAt: a.created_at?.split('T')[0] ?? '',
          photos: (a.photo_gallery_photos ?? []).map((p: any) => ({
            id: p.photo_id,
            url: photoGalleryApi.getPhotoUrl(p.storage_path),
            thumbnailUrl: photoGalleryApi.getPhotoUrl(p.storage_path),
            caption: p.caption ?? '', photographer: '', dateTaken: '', isCover: p.display_order === 0,
          })),
        })));
      }
    });
  }, []);
  const [activeTab, setActiveTab] = useState<'clippings' | 'photos'>('photos');
  const [showCreateAlbum, setShowCreateAlbum] = useState(false);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Simulated list of packages to link to
  const packages = [
    { id: 'pkg-1', name: 'Flood Relief Visit' },
    { id: 'pkg-2', name: 'School Inauguration' },
    { id: 'pkg-3', name: 'RWA Public Meeting' }
  ];

  const handleCreateAlbum = () => {
    setShowCreateAlbum(false);
    // In a real app, this would redirect to the upload page for the new album
    // For now, we'll just simulate selecting an album
    setSelectedAlbum(albums[0] ?? null);
  };

  if (selectedAlbum) {
    return (
      <div className="space-y-8 max-w-6xl mx-auto pb-20">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => setSelectedAlbum(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
              <X className="w-6 h-6" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter">{selectedAlbum.name}</h2>
                <button className="p-1 text-slate-400 hover:text-indigo-600"><Edit2 className="w-4 h-4" /></button>
              </div>
              <p className="text-slate-500 font-medium">{selectedAlbum.location} ΓÇó {selectedAlbum.eventDate}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="rounded-xl"><Share2 className="w-4 h-4 mr-2" /> Share Link</Button>
            <Button className="rounded-xl shadow-lg shadow-indigo-100 px-8">Publish Album</Button>
          </div>
        </header>

        {/* Upload Zone */}
        <div 
          className="p-16 border-4 border-dashed border-slate-200 rounded-[3rem] text-center space-y-4 hover:border-indigo-300 transition-all cursor-pointer bg-slate-50 group"
          onClick={() => setIsUploading(true)}
        >
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 transition-transform">
            <Camera className="w-10 h-10 text-indigo-600" />
          </div>
          <div>
            <p className="text-xl font-black text-slate-900">Drag high-res photos here</p>
            <p className="text-sm text-slate-400 font-medium">JPG, PNG, WEBP supported. Max 20MB per file.</p>
          </div>
          <Button variant="outline" className="rounded-xl">Browse Files</Button>
        </div>

        {/* Photo Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {selectedAlbum.photos.map((photo, idx) => (
            <div key={photo.id} className="group relative aspect-square bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition-all">
              <img src={photo.thumbnailUrl} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button className={`p-2 rounded-lg ${photo.isCover ? 'bg-yellow-400 text-white' : 'bg-white/20 text-white hover:bg-white/40'}`}>
                  <Star className="w-4 h-4" />
                </button>
                <button className="p-2 bg-white/20 text-white hover:bg-white/40 rounded-lg">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button className="p-2 bg-white/20 text-red-400 hover:bg-red-400/20 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="absolute top-2 left-2">
                <div className="p-1 bg-black/20 backdrop-blur-sm rounded cursor-grab active:cursor-grabbing">
                  <GripVertical className="w-3 h-3 text-white/70" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bulk Actions Bar */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40">
          <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-6 border border-slate-800">
            <p className="text-sm font-bold border-r border-slate-700 pr-6">12 Photos Selected</p>
            <div className="flex gap-4">
              <button className="text-sm font-bold hover:text-indigo-400 transition-colors">Edit Captions</button>
              <button className="text-sm font-bold hover:text-indigo-400 transition-colors">Move to Album</button>
              <button className="text-sm font-bold text-red-400 hover:text-red-300 transition-colors">Delete Selected</button>
            </div>
          </motion.div>
        </div>

        {/* Upload Progress Modal (Simulated) */}
        <AnimatePresence>
          {isUploading && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" />
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden">
                <div className="p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black text-slate-900">Uploading 12 Photos</h3>
                    <button onClick={() => setIsUploading(false)} className="text-slate-400 hover:text-slate-600"><X className="w-6 h-6" /></button>
                  </div>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="w-12 h-12 bg-slate-200 rounded-lg overflow-hidden">
                          <img src={`https://picsum.photos/seed/up${i}/100/100`} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <p className="text-xs font-bold text-slate-700 truncate">IMG_20240520_{i}.jpg</p>
                            <p className="text-[10px] font-black text-indigo-600 uppercase">85%</p>
                          </div>
                          <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                            <div className="bg-indigo-600 h-full w-[85%]" />
                          </div>
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      </div>
                    ))}
                  </div>
                  <Button fullWidth className="mt-8 rounded-xl" onClick={() => setIsUploading(false)}>Done</Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Media Library</h2>
          <p className="text-slate-500 font-medium">Manage news clippings, event photos, and public relations assets.</p>
        </div>
        <Button onClick={() => setShowCreateAlbum(true)} className="rounded-2xl shadow-lg shadow-indigo-100 px-8">
          <Plus className="w-5 h-5 mr-2" /> Create Album
        </Button>
      </header>

      <div className="flex gap-1 p-1.5 bg-slate-100 rounded-2xl w-fit">
        <button onClick={() => setActiveTab('clippings')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'clippings' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:bg-white/50'}`}>
          <Newspaper className="w-4 h-4" /> Newspaper Clippings
        </button>
        <button onClick={() => setActiveTab('photos')} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'photos' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:bg-white/50'}`}>
          <Camera className="w-4 h-4" /> Photo Gallery
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search by headline, tag or event..." className="w-full pl-11 pr-4 py-3 text-sm bg-white border border-slate-200 rounded-2xl focus:border-indigo-500 outline-none transition-all shadow-sm" />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="rounded-xl"><Filter className="w-4 h-4 mr-2" /> Filter</Button>
          <Button variant="outline" size="sm" className="rounded-xl"><Download className="w-4 h-4 mr-2" /> Export</Button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'clippings' ? (
          <motion.div key="clippings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="group hover:border-indigo-300 transition-colors cursor-pointer">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-40 h-28 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 relative">
                    <img src={`https://picsum.photos/seed/news${i}/400/300`} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                       <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">The Daily Times</span>
                       <span className="text-[10px] text-slate-400 font-bold uppercase">ΓÇó May 20, 2024</span>
                    </div>
                    <h4 className="text-lg font-black text-slate-900 leading-tight mb-2">MP Inaugurates New Hospital Wing in Northeast Delhi</h4>
                    <div className="flex gap-2">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-bold uppercase">Health</span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-bold uppercase">Inauguration</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </motion.div>
        ) : (
          <motion.div key="photos" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {albums.map((album) => (
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
                   <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                      <Button variant="outline" className="w-full bg-white/20 border-white/30 text-white hover:bg-white/40 rounded-xl">Manage Album</Button>
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Album Modal */}
      <AnimatePresence>
        {showCreateAlbum && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setShowCreateAlbum(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden">
               <div className="p-10">
                  <div className="flex justify-between items-center mb-8">
                     <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Create New Album</h3>
                        <p className="text-sm text-slate-500 font-medium">Group photos by event or location</p>
                     </div>
                     <button onClick={() => setShowCreateAlbum(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X className="w-6 h-6" /></button>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Album Name</label>
                          <input type="text" placeholder="e.g. Rampur Relief Drive" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Event Date</label>
                          <input type="date" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                       </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Event Type</label>
                          <select className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                             <option>Public Service</option>
                             <option>Inauguration</option>
                             <option>Internal Meeting</option>
                             <option>Press Conference</option>
                          </select>
                       </div>
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</label>
                          <input type="text" placeholder="e.g. Rampur Village" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                       </div>
                    </div>

                    <div className="space-y-1.5">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Description</label>
                       <textarea rows={3} placeholder="Brief details about the event..." className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-medium text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
                    </div>

                    <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                             <Globe className="w-5 h-5" />
                          </div>
                          <div>
                             <p className="text-sm font-black text-slate-900">Make Public</p>
                             <p className="text-[10px] text-slate-400 font-bold uppercase">Visible to citizens on public portal</p>
                          </div>
                       </div>
                       <button className="w-12 h-6 bg-indigo-600 rounded-full relative p-1 transition-colors">
                          <div className="w-4 h-4 bg-white rounded-full absolute right-1" />
                       </button>
                    </div>

                    <Button fullWidth size="lg" className="rounded-2xl" onClick={handleCreateAlbum}>Create Album & Continue</Button>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
