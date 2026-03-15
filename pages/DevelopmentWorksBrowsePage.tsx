import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, 
  LayoutGrid, 
  MapPin, 
  ChevronRight, 
  ChevronDown, 
  Zap, 
  Stethoscope, 
  BookOpen, 
  Droplets, 
  Sprout, 
  Folder, 
  ArrowLeft,
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  SearchIcon
} from 'lucide-react';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { devWorksApi } from '../hooks/useDevelopmentWorks';
import { Project } from '../types';

const SECTORS = [
  { id: 'Roads', label: 'Roads & Infrastructure', icon: Zap, color: 'text-orange-600', bg: 'bg-orange-50' },
  { id: 'Healthcare', label: 'Healthcare', icon: Stethoscope, color: 'text-red-600', bg: 'bg-red-50' },
  { id: 'Education', label: 'Education', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'Water', label: 'Water Resources', icon: Droplets, color: 'text-teal-600', bg: 'bg-teal-50' },
  { id: 'Agriculture', label: 'Agriculture', icon: Sprout, color: 'text-green-600', bg: 'bg-green-50' },
  { id: 'Energy', label: 'Energy & Power', icon: Zap, color: 'text-yellow-600', bg: 'bg-yellow-50' },
];

const normalizeSector = (value: string) => {
  const v = value.trim().toLowerCase();
  if (v.includes('road') || v.includes('bridge') || v.includes('infrastructure')) return 'Roads';
  if (v.includes('health')) return 'Healthcare';
  if (v.includes('educat') || v.includes('school')) return 'Education';
  if (v.includes('water') || v.includes('irrigation')) return 'Water';
  if (v.includes('agri') || v.includes('farm')) return 'Agriculture';
  if (v.includes('energy') || v.includes('electric')) return 'Energy';
  return 'Roads';
};

const ProjectCard: React.FC<{ project: Project; onClick: () => void }> = ({ project, onClick }) => {
  const statusColors = {
    Completed: 'bg-green-100 text-green-700',
    Ongoing: 'bg-orange-100 text-orange-700',
    Planned: 'bg-blue-100 text-blue-700',
    'On Hold': 'bg-slate-100 text-slate-500',
  };

  return (
    <Card 
      onClick={onClick}
      className="group cursor-pointer hover:shadow-xl transition-all border-slate-200 overflow-hidden !p-0"
    >
      <div className="aspect-video bg-slate-100 relative overflow-hidden">
        {project.photos && project.photos.length > 0 ? (
          <img src={project.photos[0].url} alt={project.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <Folder className="w-12 h-12 opacity-20" />
          </div>
        )}
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="px-2 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-[10px] font-black uppercase tracking-widest text-indigo-600 shadow-sm">
            {project.category}
          </span>
          <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm ${statusColors[project.status]}`}>
            {project.status}
          </span>
        </div>
      </div>
      <div className="p-6 space-y-4">
        <div>
          <h4 className="text-lg font-black text-slate-900 leading-tight tracking-tight group-hover:text-indigo-600 transition-colors">
            {project.name}
          </h4>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
            {project.zilla} &gt; {project.taluk} &gt; {project.village}
          </p>
        </div>
        
        <p className="text-sm text-slate-500 line-clamp-2 font-medium">
          {project.description || 'No description available for this project.'}
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 text-slate-400">
              <Users className="w-3 h-3" />
              <span className="text-[10px] font-black">{project.beneficiaries?.toLocaleString() || '0'}</span>
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <Calendar className="w-3 h-3" />
              <span className="text-[10px] font-black">{project.completionDate || project.startDate}</span>
            </div>
          </div>
          <button className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Card>
  );
};

export const DevelopmentWorksBrowsePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isPa = location.pathname.includes('/pa/');
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  useEffect(() => {
    devWorksApi.list().then(({ data }: any) => {
      if (data) {
        const statusMap: Record<string, Project['status']> = {
          PLANNED: 'Planned', PROPOSED: 'Planned', SANCTIONED: 'Planned', ONGOING: 'Ongoing',
          COMPLETED: 'Completed', ON_HOLD: 'On Hold',
        };
        setAllProjects(data.map((r: any) => ({
          id: r.work_id, name: r.work_title, category: normalizeSector(r.sector ?? ''),
          status: statusMap[r.status] ?? 'Planned', progress: r.progress_pct ?? 0,
          budget: r.budget ?? r.sanctioned_amount ?? r.estimated_cost ?? 0,
          zilla: r.zilla ?? '', taluk: r.taluk ?? '', gp: r.gram_panchayat ?? '',
          village: r.village ?? '', sanctionOrderNo: r.funding_source ?? r.scheme_name ?? '',
          startDate: r.start_date ?? '', completionDate: r.completion_date ?? r.target_date ?? undefined,
          beneficiaries: r.beneficiaries ?? 0, description: r.description ?? '', fundingSource: r.funding_source ?? r.scheme_name ?? 'MPLADS',
          photos: (r.development_work_media ?? []).filter((m: any) => m.media_type === 'PHOTO').map((m: any) => ({
            url: m.resolved_url ?? devWorksApi.resolveMediaUrl(m.storage_path), caption: m.file_name ?? '',
          })),
        })));
      }
    });
  }, []);
  const [browseMode, setBrowseMode] = useState<'sector' | 'location'>('sector');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<string[]>([]);

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => 
      prev.includes(nodeId) ? prev.filter(id => id !== nodeId) : [...prev, nodeId]
    );
  };

  const filteredProjects = useMemo(() => {
    return allProjects.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.village.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allProjects, searchQuery]);

  const sectorProjects = useMemo(() => {
    if (!selectedSector) return [];
    return filteredProjects.filter(p => p.category === selectedSector);
  }, [selectedSector, filteredProjects]);

  const handleProjectClick = (id: string) => {
    const basePath = isPa ? '/pa/works' : '/mp/works';
    navigate(`${basePath}/${id}`);
  };

  // Location Tree Data Construction
  const locationTree = useMemo(() => {
    const tree: any = {};
    filteredProjects.forEach(p => {
      if (!tree[p.zilla]) tree[p.zilla] = { count: 0, taluks: {} };
      tree[p.zilla].count++;
      if (!tree[p.zilla].taluks[p.taluk]) tree[p.zilla].taluks[p.taluk] = { count: 0, gps: {} };
      tree[p.zilla].taluks[p.taluk].count++;
      if (!tree[p.zilla].taluks[p.taluk].gps[p.gp]) tree[p.zilla].taluks[p.taluk].gps[p.gp] = { count: 0, villages: {} };
      tree[p.zilla].taluks[p.taluk].gps[p.gp].count++;
      if (!tree[p.zilla].taluks[p.taluk].gps[p.gp].villages[p.village]) tree[p.zilla].taluks[p.taluk].gps[p.gp].villages[p.village] = { count: 0, projects: [] };
      tree[p.zilla].taluks[p.taluk].gps[p.gp].villages[p.village].count++;
      tree[p.zilla].taluks[p.taluk].gps[p.gp].villages[p.village].projects.push(p);
    });
    return tree;
  }, [filteredProjects]);

  const [selectedVillage, setSelectedVillage] = useState<{name: string, projects: Project[]} | null>(null);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      <header className="flex flex-col gap-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Development Works</h2>
            <p className="text-slate-500 font-medium mt-1">Browse and track infrastructure projects across the constituency.</p>
          </div>
          <Button onClick={() => navigate(isPa ? '/pa/works/search' : '/mp/works/search')} className="rounded-2xl">
            <SearchIcon className="w-4 h-4 mr-2" /> Advanced Search
          </Button>
        </div>

        <div className="space-y-4">
          <div className="relative max-w-2xl">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search projects by name, village or keyword..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none transition-all font-bold shadow-sm"
            />
          </div>

          <div className="flex gap-1 p-1.5 bg-slate-100 rounded-2xl w-fit">
            <button
              onClick={() => { setBrowseMode('sector'); setSelectedSector(null); setSelectedVillage(null); }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${
                browseMode === 'sector' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:bg-white/50'
              }`}
            >
              <LayoutGrid className="w-4 h-4" /> Browse by Sector
            </button>
            <button
              onClick={() => { setBrowseMode('location'); setSelectedSector(null); setSelectedVillage(null); }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all ${
                browseMode === 'location' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:bg-white/50'
              }`}
            >
              <MapPin className="w-4 h-4" /> Browse by Location
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {browseMode === 'sector' ? (
          <motion.div 
            key="sector"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {!selectedSector ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {SECTORS.map((sector) => {
                  const count = allProjects.filter(p => p.category === sector.id).length;
                  return (
                    <Card 
                      key={sector.id}
                      onClick={() => setSelectedSector(sector.id)}
                      className="group cursor-pointer hover:shadow-xl transition-all border-slate-200 flex flex-col items-center text-center p-10"
                    >
                      <div className={`w-20 h-20 rounded-[2rem] ${sector.bg} ${sector.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                        <sector.icon className="w-10 h-10" />
                      </div>
                      <h4 className="text-xl font-black text-slate-900 tracking-tight">{sector.label}</h4>
                      <div className="mt-4 px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-black uppercase tracking-widest">
                        {count} Projects
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-6">
                <button 
                  onClick={() => setSelectedSector(null)}
                  className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-black text-xs uppercase tracking-widest transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Sectors
                </button>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl ${SECTORS.find(s => s.id === selectedSector)?.bg} ${SECTORS.find(s => s.id === selectedSector)?.color} flex items-center justify-center`}>
                    {React.createElement(SECTORS.find(s => s.id === selectedSector)?.icon || Folder, { className: 'w-6 h-6' })}
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                    Development Works &gt; {SECTORS.find(s => s.id === selectedSector)?.label}
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {sectorProjects.map(project => (
                    <ProjectCard key={project.id} project={project} onClick={() => handleProjectClick(project.id)} />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="location"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-12"
          >
            <div className="lg:col-span-1 space-y-4">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6">Location Hierarchy</h3>
              <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                {Object.keys(locationTree).map(zilla => (
                  <div key={zilla} className="border-b border-slate-100 last:border-0">
                    <button 
                      onClick={() => toggleNode(zilla)}
                      className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`transition-transform ${expandedNodes.includes(zilla) ? 'rotate-90' : ''}`}>
                          <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>
                        <span className="font-black text-slate-900">{zilla}</span>
                      </div>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-black">{locationTree[zilla].count}</span>
                    </button>
                    
                    <AnimatePresence>
                      {expandedNodes.includes(zilla) && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="bg-slate-50/50 overflow-hidden"
                        >
                          {Object.keys(locationTree[zilla].taluks).map(taluk => (
                            <div key={taluk} className="pl-6">
                              <button 
                                onClick={() => toggleNode(`${zilla}-${taluk}`)}
                                className="w-full flex items-center justify-between p-3 hover:bg-slate-100 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`transition-transform ${expandedNodes.includes(`${zilla}-${taluk}`) ? 'rotate-90' : ''}`}>
                                    <ChevronRight className="w-3 h-3 text-slate-400" />
                                  </div>
                                  <span className="text-sm font-bold text-slate-700">{taluk}</span>
                                </div>
                                <span className="px-2 py-0.5 bg-white border border-slate-200 text-slate-400 rounded text-[10px] font-bold">{locationTree[zilla].taluks[taluk].count}</span>
                              </button>

                              <AnimatePresence>
                                {expandedNodes.includes(`${zilla}-${taluk}`) && (
                                  <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="pl-6 overflow-hidden"
                                  >
                                    {Object.keys(locationTree[zilla].taluks[taluk].gps).map(gp => (
                                      <div key={gp}>
                                        <button 
                                          onClick={() => toggleNode(`${zilla}-${taluk}-${gp}`)}
                                          className="w-full flex items-center justify-between p-2 hover:bg-slate-200/50 transition-colors"
                                        >
                                          <div className="flex items-center gap-3">
                                            <div className={`transition-transform ${expandedNodes.includes(`${zilla}-${taluk}-${gp}`) ? 'rotate-90' : ''}`}>
                                              <ChevronRight className="w-3 h-3 text-slate-400" />
                                            </div>
                                            <span className="text-xs font-bold text-slate-600">{gp}</span>
                                          </div>
                                          <span className="text-[10px] font-bold text-slate-400">{locationTree[zilla].taluks[taluk].gps[gp].count}</span>
                                        </button>

                                        <AnimatePresence>
                                          {expandedNodes.includes(`${zilla}-${taluk}-${gp}`) && (
                                            <motion.div 
                                              initial={{ height: 0, opacity: 0 }}
                                              animate={{ height: 'auto', opacity: 1 }}
                                              exit={{ height: 0, opacity: 0 }}
                                              className="pl-6 overflow-hidden"
                                            >
                                              {Object.keys(locationTree[zilla].taluks[taluk].gps[gp].villages).map(village => (
                                                <button 
                                                  key={village}
                                                  onClick={() => setSelectedVillage({ name: village, projects: locationTree[zilla].taluks[taluk].gps[gp].villages[village].projects })}
                                                  className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors ${
                                                    selectedVillage?.name === village ? 'bg-indigo-600 text-white' : 'hover:bg-indigo-50 text-slate-500'
                                                  }`}
                                                >
                                                  <span className="text-xs font-medium">{village}</span>
                                                  <span className={`text-[10px] font-black ${selectedVillage?.name === village ? 'text-indigo-200' : 'text-slate-400'}`}>
                                                    {locationTree[zilla].taluks[taluk].gps[gp].villages[village].count}
                                                  </span>
                                                </button>
                                              ))}
                                            </motion.div>
                                          )}
                                        </AnimatePresence>
                                      </div>
                                    ))}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              {selectedVillage ? (
                <>
                  <div className="flex items-center justify-between">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Projects in {selectedVillage.name}</h3>
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-black uppercase tracking-widest">
                      {selectedVillage.projects.length} Works
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {selectedVillage.projects.map(project => (
                      <ProjectCard key={project.id} project={project} onClick={() => handleProjectClick(project.id)} />
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-200">
                  <div className="w-20 h-20 bg-white rounded-[2rem] shadow-sm flex items-center justify-center text-slate-300 mb-6">
                    <MapPin className="w-10 h-10" />
                  </div>
                  <h4 className="text-xl font-black text-slate-900 tracking-tight">Select a Village</h4>
                  <p className="text-slate-500 mt-2 max-w-xs mx-auto">Choose a location from the tree on the left to see development works in that area.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
