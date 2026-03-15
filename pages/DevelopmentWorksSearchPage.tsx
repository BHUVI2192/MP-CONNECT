import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Zap, 
  Stethoscope, 
  BookOpen, 
  Droplets, 
  Sprout, 
  ArrowRight,
  Calendar,
  Users,
  IndianRupee,
  MapPin,
  ChevronLeft,
  SlidersHorizontal,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  LayoutGrid,
  List
} from 'lucide-react';
import { Card } from '../components/UI/Card';
import { Button } from '../components/UI/Button';
import { devWorksApi } from '../hooks/useDevelopmentWorks';
import { Project } from '../types';

const SECTORS = [
  { id: 'Roads', label: 'Roads', icon: Zap, color: 'text-orange-600', bg: 'bg-orange-50' },
  { id: 'Healthcare', label: 'Healthcare', icon: Stethoscope, color: 'text-red-600', bg: 'bg-red-50' },
  { id: 'Education', label: 'Education', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'Water', label: 'Water', icon: Droplets, color: 'text-teal-600', bg: 'bg-teal-50' },
  { id: 'Agriculture', label: 'Agriculture', icon: Sprout, color: 'text-green-600', bg: 'bg-green-50' },
];

const FUNDING_SOURCES = ['MPLADS', 'State Government', 'Central Government', 'Local Body', 'CSR'];

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
            <Zap className="w-12 h-12 opacity-20" />
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
              <IndianRupee className="w-3 h-3" />
              <span className="text-[10px] font-black">₹{(project.budget / 10000000).toFixed(1)} Cr</span>
            </div>
          </div>
          <button className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </Card>
  );
};

export const DevelopmentWorksSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isPublic = location.pathname === '/development-works';
  const isPa = location.pathname.includes('/pa/');
  const [allProjects, setAllProjects] = useState<Project[]>([]);
  useEffect(() => {
    devWorksApi.list({ is_public: isPublic ? true : undefined }).then(({ data }: any) => {
      if (data) {
        const statusMap: Record<string, Project['status']> = {
          PLANNED: 'Planned', PROPOSED: 'Planned', SANCTIONED: 'Planned', ONGOING: 'Ongoing',
          COMPLETED: 'Completed', ON_HOLD: 'On Hold',
        };
        setAllProjects(data.map((r: any) => ({
          id: r.work_id, name: r.work_title, category: r.sector ?? 'Other',
          status: statusMap[r.status] ?? 'Planned', progress: r.progress_pct ?? 0,
          budget: r.budget ?? r.sanctioned_amount ?? r.estimated_cost ?? 0,
          zilla: r.zilla ?? '', taluk: r.taluk ?? '', gp: r.gram_panchayat ?? '',
          village: r.village ?? '', sanctionOrderNo: r.funding_source ?? r.scheme_name ?? '',
          startDate: r.start_date ?? '', completionDate: r.completion_date ?? r.target_date ?? undefined,
          beneficiaries: r.beneficiaries ?? 0, description: r.description ?? '',
          fundingSource: r.funding_source ?? r.scheme_name ?? 'MPLADS',
          photos: (r.development_work_media ?? []).filter((m: any) => m.media_type === 'PHOTO').map((m: any) => ({
            url: m.resolved_url ?? devWorksApi.resolveMediaUrl(m.storage_path), caption: m.file_name ?? '',
          })),
        })));
      }
    });
  }, [isPublic]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [sortBy, setSortBy] = useState('recent');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // Filters
  const [filters, setFilters] = useState({
    sectors: [] as string[],
    status: 'All',
    zilla: '',
    taluk: '',
    gp: '',
    village: '',
    dateFrom: '',
    dateTo: '',
    budgetMin: 0,
    budgetMax: 100000000, // 10 Cr
    fundingSources: [] as string[],
  });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredProjects = useMemo(() => {
    const results = allProjects.filter(p => {
      const matchesQuery = debouncedQuery === '' || 
        p.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        p.village.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(debouncedQuery.toLowerCase());

      const matchesSector = filters.sectors.length === 0 || filters.sectors.includes(p.category);
      const matchesStatus = filters.status === 'All' || filters.status === p.status;
      const matchesZilla = !filters.zilla || p.zilla === filters.zilla;
      const matchesTaluk = !filters.taluk || p.taluk === filters.taluk;
      const matchesGP = !filters.gp || p.gp === filters.gp;
      const matchesVillage = !filters.village || p.village === filters.village;
      const matchesBudget = p.budget >= filters.budgetMin && p.budget <= filters.budgetMax;
      const matchesFunding = filters.fundingSources.length === 0 || (p.fundingSource && filters.fundingSources.includes(p.fundingSource));
      const matchesDate = (!filters.dateFrom || new Date(p.startDate) >= new Date(filters.dateFrom)) &&
                          (!filters.dateTo || new Date(p.startDate) <= new Date(filters.dateTo));

      return matchesQuery && matchesSector && matchesStatus && matchesZilla && matchesTaluk && matchesGP && matchesVillage && matchesBudget && matchesFunding && matchesDate;
    });

    results.sort((a, b) => {
      if (sortBy === 'recent') return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
      if (sortBy === 'oldest') return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
      if (sortBy === 'budgetHigh') return b.budget - a.budget;
      if (sortBy === 'beneficiariesHigh') return (b.beneficiaries || 0) - (a.beneficiaries || 0);
      if (sortBy === 'alpha') return a.name.localeCompare(b.name);
      return 0;
    });

    return results;
  }, [allProjects, debouncedQuery, filters, sortBy]);

  const paginatedProjects = filteredProjects.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);

  const stats = useMemo(() => {
    return {
      completed: allProjects.filter(p => p.status === 'Completed').length,
      totalBudget: allProjects.reduce((acc, p) => acc + (p.budget ?? 0), 0),
      beneficiaries: allProjects.reduce((acc: number, p: any) => acc + (p.beneficiaries || 0), 0)
    };
  }, [allProjects]);

  const removeFilter = (key: keyof typeof filters, value?: string) => {
    if (Array.isArray(filters[key])) {
      setFilters(prev => ({ ...prev, [key]: (prev[key] as string[]).filter(v => v !== value) }));
    } else if (typeof filters[key] === 'string') {
      setFilters(prev => ({ ...prev, [key]: key === 'status' ? 'All' : '' }));
    } else if (key === 'budgetMin') {
      setFilters(prev => ({ ...prev, budgetMin: 0 }));
    } else if (key === 'budgetMax') {
      setFilters(prev => ({ ...prev, budgetMax: 100000000 }));
    }
  };

  const activeFilterChips = useMemo(() => {
    const chips: { label: string; key: keyof typeof filters; value?: string }[] = [];
    filters.sectors.forEach(s => chips.push({ label: s, key: 'sectors', value: s }));
    if (filters.status !== 'All') chips.push({ label: `Status: ${filters.status}`, key: 'status' });
    if (filters.zilla) chips.push({ label: `Zilla: ${filters.zilla}`, key: 'zilla' });
    if (filters.taluk) chips.push({ label: `Taluk: ${filters.taluk}`, key: 'taluk' });
    if (filters.gp) chips.push({ label: `GP: ${filters.gp}`, key: 'gp' });
    if (filters.village) chips.push({ label: `Village: ${filters.village}`, key: 'village' });
    if (filters.dateFrom) chips.push({ label: `From: ${filters.dateFrom}`, key: 'dateFrom' });
    if (filters.dateTo) chips.push({ label: `To: ${filters.dateTo}`, key: 'dateTo' });
    if (filters.budgetMin > 0) chips.push({ label: `Min: ₹${(filters.budgetMin / 10000000).toFixed(1)} Cr`, key: 'budgetMin' });
    if (filters.budgetMax < 100000000) chips.push({ label: `Max: ₹${(filters.budgetMax / 10000000).toFixed(1)} Cr`, key: 'budgetMax' });
    filters.fundingSources.forEach(f => chips.push({ label: f, key: 'fundingSources', value: f }));
    return chips;
  }, [filters]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      {isPublic && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-indigo-600 text-white border-none p-8 rounded-[2.5rem] relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <CheckCircle2 className="w-24 h-24" />
            </div>
            <p className="text-indigo-200 text-[10px] font-black uppercase tracking-widest">Projects Completed</p>
            <h4 className="text-4xl font-black mt-2">{stats.completed}</h4>
            <p className="text-indigo-300 text-xs mt-2 font-bold">Across all sectors</p>
          </Card>
          <Card className="bg-slate-900 text-white border-none p-8 rounded-[2.5rem] relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
              <IndianRupee className="w-24 h-24" />
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Total Budget Invested</p>
            <h4 className="text-4xl font-black mt-2">₹{(stats.totalBudget / 10000000).toFixed(1)} Cr</h4>
            <p className="text-slate-500 text-xs mt-2 font-bold">Infrastructure & welfare</p>
          </Card>
          <Card className="bg-white border-slate-200 p-8 rounded-[2.5rem] relative overflow-hidden shadow-sm">
             <div className="absolute top-0 right-0 p-4 opacity-5">
              <Users className="w-24 h-24" />
            </div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Total Beneficiaries</p>
            <h4 className="text-4xl font-black mt-2 text-slate-900">{(stats.beneficiaries / 1000).toFixed(1)}K+</h4>
            <p className="text-slate-500 text-xs mt-2 font-bold">Direct impact on lives</p>
          </Card>
        </div>
      )}

      <header className="space-y-6">
        <div className="relative">
          <Search className="w-6 h-6 absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by sector, location, keyword, or project name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-16 pr-6 py-6 bg-white border-2 border-slate-100 rounded-[2rem] focus:border-indigo-500 outline-none transition-all font-bold text-lg shadow-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`rounded-xl px-4 py-2 ${isFilterOpen ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : ''}`}
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" /> 
            {isFilterOpen ? 'Hide Filters' : 'Show Filters'}
          </Button>
          
          <div className="h-6 w-px bg-slate-200 mx-2" />

          {activeFilterChips.map((chip, idx) => (
            <span key={idx} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-indigo-100">
              {chip.label}
              <button onClick={() => removeFilter(chip.key, chip.value)} className="hover:text-indigo-800">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          
          {activeFilterChips.length > 0 && (
            <button 
              onClick={() => setFilters({ sectors: [], status: 'All', zilla: '', taluk: '', gp: '', village: '', dateFrom: '', dateTo: '', budgetMin: 0, budgetMax: 100000000, fundingSources: [] })}
              className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-red-500 transition-colors ml-2"
            >
              Clear All
            </button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Filter Panel */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.aside 
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 'auto', opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="lg:col-span-1 space-y-8 overflow-hidden"
            >
              <div className="space-y-6">
                {/* Sector Filter */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sector</h4>
                  <div className="space-y-2">
                    {SECTORS.map(sector => (
                      <label key={sector.id} className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={filters.sectors.includes(sector.id)}
                          onChange={(e) => {
                            if (e.target.checked) setFilters(prev => ({ ...prev, sectors: [...prev.sectors, sector.id] }));
                            else setFilters(prev => ({ ...prev, sectors: prev.sectors.filter(s => s !== sector.id) }));
                          }}
                          className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <div className={`p-1.5 rounded-lg ${sector.bg} ${sector.color}`}>
                          <sector.icon className="w-3 h-3" />
                        </div>
                        <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">{sector.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Status Filter */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</h4>
                  <div className="space-y-2">
                    {['All', 'Completed', 'Ongoing', 'Planned'].map(status => (
                      <label key={status} className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="radio" 
                          name="status"
                          checked={filters.status === status}
                          onChange={() => setFilters(prev => ({ ...prev, status }))}
                          className="w-4 h-4 border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">{status}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Location Filter */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</h4>
                  <div className="space-y-3">
                    <select 
                      value={filters.zilla} 
                      onChange={(e) => setFilters(prev => ({ ...prev, zilla: e.target.value, taluk: '', gp: '', village: '' }))}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select Zilla</option>
                      <option value="Mysuru">Mysuru</option>
                    </select>
                    <select 
                      value={filters.taluk} 
                      onChange={(e) => setFilters(prev => ({ ...prev, taluk: e.target.value, gp: '', village: '' }))}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select Taluk</option>
                      <option value="Hunsur">Hunsur</option>
                      <option value="Mysuru">Mysuru</option>
                    </select>
                    <select 
                      value={filters.gp} 
                      onChange={(e) => setFilters(prev => ({ ...prev, gp: e.target.value, village: '' }))}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select GP</option>
                      <option value="Rampur">Rampur</option>
                      <option value="City">City</option>
                    </select>
                  </div>
                </div>

                {/* Date Range */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Range</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <input 
                      type="date" 
                      value={filters.dateFrom}
                      onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
                    />
                    <input 
                      type="date" 
                      value={filters.dateTo}
                      onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none"
                    />
                  </div>
                </div>

                {/* Budget Range */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Budget Range</h4>
                    <span className="text-[10px] font-black text-indigo-600">₹{(filters.budgetMax / 10000000).toFixed(1)} Cr</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100000000" 
                    step="1000000"
                    value={filters.budgetMax}
                    onChange={(e) => setFilters(prev => ({ ...prev, budgetMax: parseInt(e.target.value) }))}
                    className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-widest">
                    <span>0</span>
                    <span>10 Cr</span>
                  </div>
                </div>

                {/* Funding Source */}
                <div className="space-y-3">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Funding Source</h4>
                  <div className="space-y-2">
                    {FUNDING_SOURCES.map(source => (
                      <label key={source} className="flex items-center gap-3 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          checked={filters.fundingSources.includes(source)}
                          onChange={(e) => {
                            if (e.target.checked) setFilters(prev => ({ ...prev, fundingSources: [...prev.fundingSources, source] }));
                            else setFilters(prev => ({ ...prev, fundingSources: prev.fundingSources.filter(s => s !== source) }));
                          }}
                          className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900 transition-colors">{source}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Results Section */}
        <div className={`space-y-8 ${isFilterOpen ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <p className="text-sm font-bold text-slate-500">
              Showing <span className="text-slate-900 font-black">{filteredProjects.length}</span> projects
            </p>
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sort By:</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="recent">Most Recent</option>
                <option value="oldest">Oldest First</option>
                <option value="budgetHigh">Budget (High-Low)</option>
                <option value="beneficiariesHigh">Beneficiaries (High-Low)</option>
                <option value="alpha">Alphabetical</option>
              </select>
            </div>
          </div>

          {paginatedProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {paginatedProjects.map(project => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  onClick={() => navigate(`${isPublic ? '/development-works' : isPa ? '/pa/works' : '/mp/works'}/${project.id}`)} 
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-24 bg-slate-50 rounded-[3rem] border-4 border-dashed border-slate-200">
              <div className="w-24 h-24 bg-white rounded-[2.5rem] shadow-sm flex items-center justify-center text-slate-300 mb-8">
                <Search className="w-12 h-12" />
              </div>
              <h4 className="text-2xl font-black text-slate-900 tracking-tight">No projects found</h4>
              <p className="text-slate-500 mt-2 max-w-sm mx-auto font-medium">No projects matching your search criteria. Try adjusting your filters or search keywords.</p>
              <Button 
                variant="outline" 
                className="mt-8 rounded-2xl"
                onClick={() => {
                  setSearchQuery('');
                  setFilters({ sectors: [], status: 'All', zilla: '', taluk: '', gp: '', village: '', dateFrom: '', dateTo: '', budgetMin: 0, budgetMax: 100000000, fundingSources: [] });
                }}
              >
                Clear All Filters
              </Button>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-12">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-30 transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {[...Array(totalPages)].map((_, idx) => (
                <button 
                  key={idx}
                  onClick={() => setCurrentPage(idx + 1)}
                  className={`w-10 h-10 rounded-xl text-sm font-black transition-all ${
                    currentPage === idx + 1 ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="p-2 rounded-xl border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-30 transition-all"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
