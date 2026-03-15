import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Calendar, 
  Users, 
  IndianRupee, 
  MapPin, 
  ChevronDown, 
  ChevronUp, 
  Download, 
  Share2, 
  Edit3, 
  Trash2, 
  Maximize2, 
  X, 
  ChevronLeft, 
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Play,
  Layers,
  Globe,
  CheckCircle2
} from 'lucide-react';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { devWorksApi } from '../hooks/useDevelopmentWorks';
import { Project } from '../types';

const Accordion: React.FC<{ title: string; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-6 text-left group"
      >
        <h4 className="text-lg font-black text-slate-900 tracking-tight group-hover:text-indigo-600 transition-colors">{title}</h4>
        <div className={`w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown className="w-4 h-4" />
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pb-8 text-slate-600 font-medium leading-relaxed">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isPa = location.pathname.includes('/pa/');
  const [project, setProject] = useState<Project | null>(null);
  useEffect(() => {
    if (!id) return;
    devWorksApi.getById(id).then(({ data }: any) => {
      if (data) {
        const statusMap: Record<string, Project['status']> = {
          PLANNED: 'Planned', PROPOSED: 'Planned', SANCTIONED: 'Planned', ONGOING: 'Ongoing',
          COMPLETED: 'Completed', ON_HOLD: 'On Hold',
        };
        setProject({
          id: data.work_id, name: data.work_title, category: data.sector ?? 'Other',
          status: statusMap[data.status] ?? 'Planned', progress: data.progress_pct ?? 0,
          budget: data.budget ?? data.sanctioned_amount ?? data.estimated_cost ?? 0,
          zilla: data.zilla ?? '', taluk: data.taluk ?? '', gp: data.gram_panchayat ?? '',
          village: data.village ?? '', sanctionOrderNo: data.funding_source ?? data.scheme_name ?? '',
          startDate: data.start_date ?? '', completionDate: data.completion_date ?? data.target_date ?? undefined,
          description: data.description ?? '', beneficiaries: data.beneficiaries ?? 0, fundingSource: data.funding_source ?? data.scheme_name ?? 'MPLADS',
          photos: (data.development_work_media ?? []).filter((m: any) => m.media_type === 'PHOTO').map((m: any) => ({
            url: m.resolved_url ?? devWorksApi.resolveMediaUrl(m.storage_path), caption: m.file_name ?? '',
          })),
        });
      }
    });
  }, [id]);

  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [mapMode, setMapMode] = useState<'satellite' | 'terrain'>('terrain');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'Escape') setLightboxIndex(null);
      if (e.key === 'ArrowLeft') setLightboxIndex(prev => (prev! > 0 ? prev! - 1 : project!.photos!.length - 1));
      if (e.key === 'ArrowRight') setLightboxIndex(prev => (prev! < project!.photos!.length - 1 ? prev! + 1 : 0));
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, project]);

  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <h2 className="text-2xl font-black text-slate-900">Project not found</h2>
        <Button onClick={() => navigate(-1)} className="mt-4">Go Back</Button>
      </div>
    );
  }

  const statusColors = {
    Completed: 'bg-green-100 text-green-700',
    Ongoing: 'bg-orange-100 text-orange-700',
    Planned: 'bg-blue-100 text-blue-700',
    'On Hold': 'bg-slate-100 text-slate-500',
  };

  const progressValue = Math.max(0, Math.min(project.progress ?? 0, 100));
  const beneficiaryLabel = project.beneficiaries && project.beneficiaries > 0
    ? project.beneficiaries.toLocaleString()
    : 'Not set';
  const budgetLabel = project.budget > 0
    ? `₹${(project.budget / 10000000).toFixed(1)} Cr`
    : 'Not set';

  return (
    <div className="max-w-7xl mx-auto pb-20 space-y-8">
      {/* Breadcrumb & Header */}
      <div className="space-y-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-black text-xs uppercase tracking-widest transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Browse
        </button>

        <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
          <div className="space-y-4 flex-1">
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                {project.category}
              </span>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${statusColors[project.status]}`}>
                {project.status}
              </span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tighter leading-none">
              {project.name}
            </h1>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-slate-500 font-bold text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{project.zilla} &gt; {project.taluk} &gt; {project.gp} &gt; {project.village}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Started: {project.startDate}</span>
              </div>
              {project.completionDate && (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span>Completed: {project.completionDate}</span>
                </div>
              )}
            </div>
          </div>

          {isPa && (
            <div className="flex flex-wrap gap-3 w-full lg:w-auto">
              <Button variant="outline" className="rounded-2xl flex-1 lg:flex-none">
                <Edit3 className="w-4 h-4 mr-2" /> Edit
              </Button>
              <Button variant="outline" className="rounded-2xl flex-1 lg:flex-none">
                <Share2 className="w-4 h-4 mr-2" /> Share
              </Button>
              <Button variant="outline" className="rounded-2xl flex-1 lg:flex-none">
                <Download className="w-4 h-4 mr-2" /> Report
              </Button>
              <Button variant="outline" className="rounded-2xl flex-1 lg:flex-none text-red-600 hover:bg-red-50 hover:border-red-200">
                <Trash2 className="w-4 h-4 mr-2" /> Delete
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          {/* Photo Gallery */}
          <section className="space-y-6">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Photo Gallery</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {project.photos?.map((photo, idx) => (
                <motion.div 
                  key={idx}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setLightboxIndex(idx)}
                  className="aspect-square rounded-3xl overflow-hidden cursor-zoom-in relative group bg-slate-100"
                >
                  <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Maximize2 className="w-8 h-8 text-white" />
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Video Gallery */}
          {project.videos && project.videos.length > 0 && (
            <section className="space-y-6">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Video Documentation</h3>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {project.videos.map((video, idx) => (
                  <Card key={idx} className="flex-shrink-0 w-80 !p-0 overflow-hidden group cursor-pointer border-slate-200">
                    <div className="aspect-video relative">
                      <img src={video.thumbnail} alt={video.caption} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center text-indigo-600 shadow-lg group-hover:scale-110 transition-transform">
                          <Play className="w-6 h-6 fill-current" />
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-white">
                      <p className="text-sm font-bold text-slate-900 line-clamp-1">{video.caption}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Accordions */}
          <section className="bg-white border border-slate-200 rounded-[2.5rem] px-10 overflow-hidden shadow-sm">
            <Accordion title="Project Description" defaultOpen>
              <p>{project.description}</p>
            </Accordion>
            <Accordion title="History & Background">
              <p>{project.history || 'Information not available.'}</p>
            </Accordion>
            <Accordion title="Development Work Done">
              <p>{project.workDone || 'Information not available.'}</p>
            </Accordion>
            <Accordion title="Project Metrics">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Budget</p>
                  <p className="text-xl font-black text-slate-900">₹{(project.budget / 10000000).toFixed(2)} Cr</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Beneficiaries</p>
                  <p className="text-xl font-black text-slate-900">{project.beneficiaries?.toLocaleString() || '0'}+ Citizens</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Funding Source</p>
                  <p className="text-xl font-black text-slate-900">{project.fundingSource}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sanction No.</p>
                  <p className="text-xl font-black text-slate-900">{project.sanctionOrderNo}</p>
                </div>
              </div>
            </Accordion>
          </section>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-8">
          {/* Map Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Location Map</h3>
              <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
                <button 
                  onClick={() => setMapMode('terrain')}
                  className={`p-1.5 rounded-lg transition-all ${mapMode === 'terrain' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                >
                  <Globe className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setMapMode('satellite')}
                  className={`p-1.5 rounded-lg transition-all ${mapMode === 'satellite' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400'}`}
                >
                  <Layers className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="aspect-square bg-slate-100 rounded-[2.5rem] border-4 border-white shadow-xl overflow-hidden relative">
              <iframe
                title="Project location"
                className="absolute inset-0 w-full h-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.google.com/maps?q=${encodeURIComponent(
                  [project.village, project.gp, project.taluk, project.zilla, 'India']
                    .filter(Boolean)
                    .join(', ')
                )}&t=${mapMode === 'satellite' ? 'k' : 'm'}&output=embed`}
              />
              <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Coordinates</p>
                <p className="text-xs font-bold text-slate-900">
                  {project.coordinates
                    ? `${project.coordinates.lat.toFixed(4)}° N, ${project.coordinates.lng.toFixed(4)}° E`
                    : 'Coordinates not captured'}
                </p>
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  [project.village, project.gp, project.taluk, project.zilla, 'India']
                    .filter(Boolean)
                    .join(', ')
                )}`}
                target="_blank"
                rel="noreferrer"
                className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-700 shadow-sm border border-white"
              >
                Open in Google Maps
              </a>
            </div>
          </section>

          {/* Quick Stats */}
          <Card className="border-slate-200 rounded-[2.5rem] bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white shadow-[0_24px_70px_-28px_rgba(15,23,42,0.8)]">
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.24em]">Project Progress</p>
                  <div className="mt-3 flex items-end gap-3">
                    <span className="text-5xl font-black leading-none">{progressValue}%</span>
                    <span className="mb-1 rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-200">
                      {project.status}
                    </span>
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-right">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/45">Funding</p>
                  <p className="mt-1 text-sm font-black text-white">{project.fundingSource || 'Not set'}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.18em] text-white/45">
                  <span>Execution</span>
                  <span>{progressValue === 100 ? 'Completed' : `${100 - progressValue}% remaining`}</span>
                </div>
                <div className="h-3 rounded-full bg-white/10 p-0.5 shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progressValue}%` }}
                    className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-indigo-400 to-violet-300"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">Beneficiaries</p>
                  <p className="mt-2 text-xl font-black text-white">{beneficiaryLabel}</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">Budget</p>
                  <p className="mt-2 text-xl font-black text-white">{budgetLabel}</p>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/45">Project Brief</p>
                    <p className="mt-1 text-sm font-bold text-white/75">Download a snapshot with location, budget, and execution details.</p>
                  </div>
                  <Button variant="outline" className="shrink-0 rounded-2xl border-white/25 text-white hover:bg-white/10 hover:text-white">
                    <Download className="w-4 h-4 mr-2" /> Download Brief
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-6"
          >
            <div className="absolute top-8 right-8 flex gap-4">
              <button onClick={() => setZoom(z => Math.min(z + 0.5, 3))} className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
                <ZoomIn className="w-6 h-6" />
              </button>
              <button onClick={() => setZoom(z => Math.max(z - 0.5, 1))} className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
                <ZoomOut className="w-6 h-6" />
              </button>
              <button className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
                <Download className="w-6 h-6" />
              </button>
              <button onClick={() => setLightboxIndex(null)} className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <button 
              onClick={() => setLightboxIndex(prev => (prev! > 0 ? prev! - 1 : project!.photos!.length - 1))}
              className="absolute left-8 p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>

            <motion.div 
              key={lightboxIndex}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: zoom, opacity: 1 }}
              className="max-w-5xl w-full aspect-video relative"
            >
              <img 
                src={project.photos![lightboxIndex].url} 
                alt={project.photos![lightboxIndex].caption} 
                className="w-full h-full object-contain"
              />
            </motion.div>

            <button 
              onClick={() => setLightboxIndex(prev => (prev! < project!.photos!.length - 1 ? prev! + 1 : 0))}
              className="absolute right-8 p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            >
              <ChevronRight className="w-8 h-8" />
            </button>

            <div className="absolute bottom-12 text-center space-y-2">
              <p className="text-xl font-black text-white">{project.photos![lightboxIndex].caption}</p>
              <p className="text-sm font-bold text-white/40 uppercase tracking-widest">
                Photo {lightboxIndex + 1} of {project.photos!.length} • {project.photos![lightboxIndex].date || 'No Date'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
