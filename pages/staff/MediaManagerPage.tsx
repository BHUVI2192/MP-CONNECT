
import React, { useState } from 'react';
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
  Package
} from 'lucide-react';

export const MediaManagerPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'clippings' | 'photos'>('photos');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Simulated list of packages to link to
  const packages = [
    { id: 'pkg-1', name: 'Flood Relief Visit' },
    { id: 'pkg-2', name: 'School Inauguration' },
    { id: 'pkg-3', name: 'RWA Public Meeting' }
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Media Library</h2>
          <p className="text-slate-500 font-medium">Manage news clippings, event photos, and public relations assets.</p>
        </div>
        <Button onClick={() => setShowUploadModal(true)} className="rounded-2xl shadow-lg shadow-indigo-100 px-8">
          <Upload className="w-5 h-5 mr-2" /> Upload Asset
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
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'clippings' ? (
          <motion.div key="clippings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
            {[1, 2].map((i) => (
              <Card key={i} className="group hover:border-indigo-300 transition-colors">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-full md:w-48 h-32 bg-slate-100 rounded-xl overflow-hidden flex-shrink-0 relative">
                    <img src={`https://picsum.photos/seed/news${i}/400/300`} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                       <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">The Daily Times</span>
                       <span className="text-[10px] text-slate-400 font-bold uppercase">• May 20, 2024</span>
                    </div>
                    <h4 className="text-xl font-black text-slate-900 leading-tight mb-2">MP Inaugurates New Hospital Wing</h4>
                  </div>
                </div>
              </Card>
            ))}
          </motion.div>
        ) : (
          <motion.div key="photos" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="group relative bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all">
                <div className="aspect-[4/3] bg-slate-100 overflow-hidden">
                   <img src={`https://picsum.photos/seed/event${i}/600/450`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="p-5">
                   <div className="flex items-center gap-2 mb-2">
                      <Package className="w-3 h-3 text-indigo-600" />
                      <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Linked: Flood Relief Visit</p>
                   </div>
                   <h5 className="font-bold text-slate-900 truncate">Interaction with RWA Members</h5>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Upload Modal with Tour Package Linking */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setShowUploadModal(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden">
               <div className="p-10">
                  <div className="flex justify-between items-center mb-8">
                     <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">Upload & Link Asset</h3>
                        <p className="text-sm text-slate-500 font-medium">Add photos for Tour Packages or News</p>
                     </div>
                     <button onClick={() => setShowUploadModal(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X className="w-6 h-6" /></button>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="p-10 border-2 border-dashed border-slate-200 rounded-[2rem] text-center space-y-4 hover:border-indigo-300 transition-colors cursor-pointer bg-slate-50">
                       <Upload className="w-10 h-10 text-slate-300 mx-auto" />
                       <p className="text-sm font-bold text-slate-900">Drag high-res photos here</p>
                    </div>

                    <div className="space-y-4">
                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Asset Description</label>
                          <input type="text" placeholder="Headline / Caption" className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                       </div>

                       <div className="space-y-1.5">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Link to Tour Package (Optional)</label>
                          <select className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                             <option value="">No Link (General News)</option>
                             {packages.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                          <p className="text-[9px] text-slate-400 mt-1 pl-2">Linking will make this photo visible in the MP & PA Tour Briefings.</p>
                       </div>
                    </div>

                    <Button fullWidth size="lg" className="rounded-2xl" onClick={() => setShowUploadModal(false)}>Process & Publish</Button>
                  </div>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
