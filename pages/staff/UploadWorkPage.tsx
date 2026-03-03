import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Building2,
    FileText,
    MapPin,
    BarChart3,
    Image as ImageIcon,
    Eye,
    Plus,
    ChevronRight,
    ChevronLeft,
    X,
    Upload,
    IndianRupee,
    Users,
    Calendar,
    CheckCircle2,
    AlertCircle,
    Video,
    Type,
    LayoutGrid,
    Map as MapIcon,
    Search,
    Check,
    Globe,
    Home,
    Trash2,
    MoreVertical,
    ChevronDown,
    Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/UI/Button';
import { Card } from '../../components/UI/Card';
import { DevelopmentWork, WorkSector, WorkType, WorkStatus, WorkMedia } from '../../types';

const SECTORS: { id: WorkSector; label: string; icon: any; color: string }[] = [
    { id: 'Roads', label: 'Roads', icon: MapIcon, color: 'bg-orange-500' },
    { id: 'Healthcare', label: 'Healthcare', icon: AlertCircle, color: 'bg-red-500' },
    { id: 'Education', label: 'Education', icon: Building2, color: 'bg-blue-500' },
    { id: 'Water', label: 'Water', icon: Globe, color: 'bg-teal-500' },
    { id: 'Agriculture', label: 'Agriculture', icon: LayoutGrid, color: 'bg-green-500' },
    { id: 'Electricity', label: 'Electricity', icon: Info, color: 'bg-yellow-500' },
    { id: 'Other', label: 'Other', icon: Plus, color: 'bg-gray-500' },
];

const WORK_TYPES: { id: WorkType; label: string; icon: any }[] = [
    { id: 'New Construction', label: 'New Construction', icon: Building2 },
    { id: 'Renovation', label: 'Renovation', icon: FileText },
    { id: 'Maintenance', label: 'Maintenance', icon: CheckCircle2 },
    { id: 'Upgrade', label: 'Upgrade', icon: Plus },
];

export const UploadWorkPage: React.FC = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(0);

    // Form State
    const [formData, setFormData] = useState<DevelopmentWork>({
        id: '',
        title: '',
        sector: 'Roads',
        type: 'New Construction',
        status: 'Ongoing',
        description: { project: '', history: '', workDone: '' },
        location: { zilla: 'Mysuru', taluk: '', gp: '', village: '', address: '', coordinates: { lat: 12.2958, lng: 76.6394 } },
        metrics: { beneficiaries: 0, budget: 0, fundingSource: 'MPLADS', startDate: '', completionDate: '' },
        media: { photos: [], videos: [] },
        visibility: { publicPortal: true, featureOnHomepage: false },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    });

    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    const tabs = [
        { id: 'basic', label: 'Basic Info', icon: Info },
        { id: 'description', label: 'Description', icon: Type },
        { id: 'location', label: 'Location', icon: MapPin },
        { id: 'metrics', label: 'Metrics', icon: BarChart3 },
        { id: 'media', label: 'Media', icon: ImageIcon },
        { id: 'visibility', label: 'Visibility', icon: Eye },
    ];

    // Completion Check Logic (Simplistic for now)
    const isTabIncomplete = (tabId: string) => {
        if (tabId === 'basic') return !formData.title || !formData.sector;
        if (tabId === 'location') return !formData.location.village || !formData.location.address;
        return false;
    };

    const handleUpload = () => {
        setUploading(true);
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            setUploadProgress(progress);
            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    setUploading(false);
                    navigate('/staff/works'); // Redirect to works list
                }, 500);
            }
        }, 300);
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 0: // Basic Info
                return (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Project Title</label>
                            <input
                                type="text"
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[2rem] font-black text-xl outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                                placeholder="Enter project title..."
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sector</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {SECTORS.map(sector => (
                                    <button
                                        key={sector.id}
                                        onClick={() => setFormData({ ...formData, sector: sector.id })}
                                        className={`p-4 rounded-[1.5rem] border-2 transition-all text-left flex items-start gap-4 ${formData.sector === sector.id ? 'bg-white border-primary shadow-lg shadow-primary/5' : 'bg-slate-50 border-transparent hover:border-slate-100'}`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl ${sector.color} flex items-center justify-center text-white shrink-0`}>
                                            <sector.icon size={20} />
                                        </div>
                                        <div>
                                            <p className={`font-black text-sm tracking-tight ${formData.sector === sector.id ? 'text-gray-900' : 'text-gray-400'}`}>{sector.label}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Work Type</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {WORK_TYPES.map(type => (
                                        <button
                                            key={type.id}
                                            onClick={() => setFormData({ ...formData, type: type.id })}
                                            className={`p-3 rounded-xl border transition-all text-center space-y-2 ${formData.type === type.id ? 'bg-primary/5 border-primary text-primary' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                                        >
                                            <type.icon size={20} className="mx-auto" />
                                            <p className="text-[10px] font-black uppercase tracking-tight">{type.label}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Status</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {[
                                        { id: 'Planned', label: 'Planned', color: 'blue' },
                                        { id: 'Ongoing', label: 'Ongoing', color: 'orange' },
                                        { id: 'Completed', label: 'Completed', color: 'green' }
                                    ].map(status => (
                                        <button
                                            key={status.id}
                                            onClick={() => setFormData({ ...formData, status: status.id as any })}
                                            className={`p-3 rounded-xl border transition-all text-center font-black text-[10px] uppercase tracking-widest ${formData.status === status.id ? `bg-${status.color}-500 border-${status.color}-500 text-white shadow-lg` : 'bg-white border-slate-100 text-slate-300'}`}
                                        >
                                            {status.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );
            case 1: // Description
                return (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        {[
                            { key: 'project', label: 'Project Description', sub: 'What is this project about?' },
                            { key: 'history', label: 'History & Background', sub: 'Why was this needed?' },
                            { key: 'workDone', label: 'Development Work Done', sub: 'Technical specs and improvements' }
                        ].map(field => (
                            <div key={field.key} className="bg-slate-50 border border-slate-100 rounded-[2rem] overflow-hidden">
                                <div className="p-6 flex justify-between items-center bg-white border-b border-slate-100">
                                    <div>
                                        <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">{field.label}</p>
                                        <p className="text-xs font-medium text-slate-400">{field.sub}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">Character Count</p>
                                        <p className="text-sm font-black text-slate-900">{(formData.description as any)[field.key].length} / 2000</p>
                                    </div>
                                </div>
                                <textarea
                                    className="w-full p-8 bg-transparent outline-none font-medium text-slate-600 leading-relaxed resize-none"
                                    rows={6}
                                    placeholder="Start typing here..."
                                    value={(formData.description as any)[field.key]}
                                    onChange={e => setFormData({
                                        ...formData,
                                        description: { ...formData.description, [field.key]: e.target.value }
                                    })}
                                />
                            </div>
                        ))}
                    </motion.div>
                );
            case 2: // Location
                return (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {[
                                { label: 'Zilla', value: formData.location.zilla },
                                { label: 'Taluk', value: formData.location.taluk, type: 'taluk' },
                                { label: 'GP', value: formData.location.gp, type: 'gp' },
                                { label: 'Village', value: formData.location.village, type: 'village' }
                            ].map((loc, i) => (
                                <div key={i} className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{loc.label}</label>
                                    <select
                                        className="w-full px-4 py-3 bg-white border border-slate-100 rounded-xl font-bold text-xs outline-none focus:border-primary transition-all"
                                        value={loc.value}
                                        onChange={e => setFormData({
                                            ...formData,
                                            location: { ...formData.location, [loc.type || 'zilla']: e.target.value }
                                        })}
                                    >
                                        <option value="">Select {loc.label}</option>
                                        {i === 0 && <option value="Mysuru">Mysuru</option>}
                                        {i === 1 && <option value="Nanjangud">Nanjangud</option>}
                                        {i === 1 && <option value="Hunsur">Hunsur</option>}
                                        {i === 2 && <option value="GP-01">GP-01</option>}
                                        {i === 3 && <option value="Village-A">Village-A</option>}
                                    </select>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Specific Location Address</label>
                            <textarea
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-4 focus:ring-primary/10 transition-all"
                                rows={2}
                                placeholder="Enter specific landmarks or address..."
                                value={formData.location.address}
                                onChange={e => setFormData({ ...formData, location: { ...formData.location, address: e.target.value } })}
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Geo Tagging</label>
                                    <p className="text-xs font-medium text-slate-400">Click on the map to mark exact location</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">Coordinates</p>
                                    <p className="text-xs font-black text-slate-900">{formData.location.coordinates?.lat.toFixed(4)}, {formData.location.coordinates?.lng.toFixed(4)}</p>
                                </div>
                            </div>
                            <div className="h-64 bg-slate-100 rounded-[2rem] border-4 border-white shadow-inner flex items-center justify-center relative overflow-hidden group">
                                <MapPin className="text-primary animate-bounce z-10" size={32} />
                                <div className="absolute inset-0 bg-slate-200 opacity-20 group-hover:opacity-40 transition-opacity" />
                                <p className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-600 shadow-sm border border-white">Interactive Map Placeholder</p>
                            </div>
                        </div>
                    </motion.div>
                );
            case 3: // Metrics
                return (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Number of Beneficiaries</label>
                                    <div className="relative">
                                        <Users className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                                        <input
                                            type="number"
                                            className="w-full pl-16 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xl outline-none"
                                            placeholder="0"
                                            value={formData.metrics.beneficiaries || ''}
                                            onChange={e => setFormData({ ...formData, metrics: { ...formData.metrics, beneficiaries: parseInt(e.target.value) } })}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Project Budget (INR)</label>
                                    <div className="relative">
                                        <IndianRupee className="absolute left-6 top-1/2 -translate-y-1/2 text-primary" size={20} />
                                        <input
                                            type="number"
                                            className="w-full pl-16 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-xl outline-none text-primary"
                                            placeholder="0"
                                            value={formData.metrics.budget || ''}
                                            onChange={e => setFormData({ ...formData, metrics: { ...formData.metrics, budget: parseInt(e.target.value) } })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Funding Source</label>
                                    <select
                                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-black text-sm outline-none"
                                        value={formData.metrics.fundingSource}
                                        onChange={e => setFormData({ ...formData, metrics: { ...formData.metrics, fundingSource: e.target.value as any } })}
                                    >
                                        <option value="MPLADS">MPLADS</option>
                                        <option value="State Government">State Government</option>
                                        <option value="Central Government">Central Government</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Start Date</label>
                                        <input type="date" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs" value={formData.metrics.startDate} onChange={e => setFormData({ ...formData, metrics: { ...formData.metrics, startDate: e.target.value } })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Completion Date</label>
                                        <input type="date" className="w-full px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs" value={formData.metrics.completionDate} onChange={e => setFormData({ ...formData, metrics: { ...formData.metrics, completionDate: e.target.value } })} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );
            case 4: // Media
                return (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                        {/* Photos Section */}
                        <div className="space-y-6">
                            <div className="flex justify-between items-end">
                                <div>
                                    <h4 className="text-xl font-black text-slate-900 tracking-tight">Photos</h4>
                                    <p className="text-xs font-medium text-slate-400">Upload up to 50 photos (Max 20MB per file)</p>
                                </div>
                                <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-3 py-1 rounded-full">{formData.media.photos.length} / 50</span>
                            </div>
                            <div className="border-4 border-dashed border-slate-100 rounded-[2.5rem] p-12 text-center space-y-4 hover:border-primary/20 hover:bg-primary/5 transition-all cursor-pointer group">
                                <div className="w-20 h-20 bg-white shadow-lg rounded-2xl flex items-center justify-center mx-auto text-slate-300 group-hover:text-primary group-hover:scale-110 transition-all">
                                    <Upload size={32} />
                                </div>
                                <div>
                                    <p className="text-lg font-black text-slate-900 tracking-tight">Drag photos here</p>
                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest italic">or click to browse from device</p>
                                </div>
                            </div>
                        </div>

                        {/* Videos Section */}
                        <div className="space-y-6">
                            <div className="flex justify-between items-end">
                                <div>
                                    <h4 className="text-xl font-black text-slate-900 tracking-tight">Videos</h4>
                                    <p className="text-xs font-medium text-slate-400">Upload up to 10 videos (Max 500MB per file)</p>
                                </div>
                                <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-3 py-1 rounded-full">{formData.media.videos.length} / 10</span>
                            </div>
                            <div className="border-4 border-dashed border-slate-100 rounded-[2.5rem] p-12 text-center space-y-4 hover:border-primary/20 hover:bg-primary/5 transition-all cursor-pointer group">
                                <div className="w-20 h-20 bg-white shadow-lg rounded-2xl flex items-center justify-center mx-auto text-slate-300 group-hover:text-primary group-hover:scale-110 transition-all">
                                    <Video size={32} />
                                </div>
                                <div>
                                    <p className="text-lg font-black text-slate-900 tracking-tight">Drag videos here</p>
                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest italic">Supports MP4, AVI, MOV, MKV</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );
            case 5: // Visibility
                return (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                            <div className="space-y-6">
                                <div className="p-8 bg-slate-900 rounded-[2.5rem] text-white space-y-8">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-primary uppercase tracking-widest">Privacy Settings</p>
                                            <h4 className="text-2xl font-black tracking-tight">Public Visibility</h4>
                                        </div>
                                        <Globe size={32} className="text-primary opacity-50" />
                                    </div>

                                    <div className="space-y-4">
                                        <label className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/10 cursor-pointer hover:bg-white/10 transition-all">
                                            <div className="flex gap-4 items-center">
                                                <div className="w-10 h-10 rounded-xl bg-green-500/20 text-green-500 flex items-center justify-center">
                                                    <Globe size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-black text-sm tracking-tight">Visible on Portal</p>
                                                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Citizen Access</p>
                                                </div>
                                            </div>
                                            <div className={`w-12 h-6 rounded-full relative transition-all ${formData.visibility.publicPortal ? 'bg-green-500' : 'bg-white/20'}`}>
                                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.visibility.publicPortal ? 'right-1' : 'left-1'}`} />
                                            </div>
                                            <input type="checkbox" className="hidden" checked={formData.visibility.publicPortal} onChange={e => setFormData({ ...formData, visibility: { ...formData.visibility, publicPortal: e.target.checked } })} />
                                        </label>

                                        <label className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/10 cursor-pointer hover:bg-white/10 transition-all">
                                            <div className="flex gap-4 items-center">
                                                <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-500 flex items-center justify-center">
                                                    <Home size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-black text-sm tracking-tight">Feature on Home</p>
                                                    <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Main Landing Page</p>
                                                </div>
                                            </div>
                                            <div className={`w-12 h-6 rounded-full relative transition-all ${formData.visibility.featureOnHomepage ? 'bg-orange-500' : 'bg-white/20'}`}>
                                                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${formData.visibility.featureOnHomepage ? 'right-1' : 'left-1'}`} />
                                            </div>
                                            <input type="checkbox" className="hidden" checked={formData.visibility.featureOnHomepage} onChange={e => setFormData({ ...formData, visibility: { ...formData.visibility, featureOnHomepage: e.target.checked } })} />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Public Portal Preview</p>
                                <div className="max-w-sm mx-auto">
                                    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden relative group">
                                        <div className="h-48 bg-slate-100 relative overflow-hidden">
                                            <ImageIcon className="absolute inset-0 m-auto text-slate-200" size={48} />
                                            <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur rounded-full flex items-center gap-2 text-[10px] font-black uppercase text-slate-800 shadow-sm border border-white">
                                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                                Visible Now
                                            </div>
                                        </div>
                                        <div className="p-6 space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h5 className="font-black text-xl text-slate-900 tracking-tight leading-tight">{formData.title || 'Untitled Project'}</h5>
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">{formData.sector}</p>
                                                </div>
                                                <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shrink-0">
                                                    <ChevronRight size={20} />
                                                </div>
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                <span className="px-2 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-400">{formData.location.village || 'Location'}</span>
                                                <span className="px-2 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[9px] font-black uppercase tracking-widest text-slate-400">{formData.metrics.budget ? `₹${(formData.metrics.budget / 100000).toFixed(1)} L` : 'Budget'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="max-w-[1200px] mx-auto py-8 px-4 flex flex-col gap-8 min-h-screen relative">
            <header className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter">New Development Work</h2>
                    <p className="text-slate-500 font-medium mt-1">Populate project metadata for official records and public portal.</p>
                </div>
                <button onClick={() => navigate('/staff/works')} className="p-4 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-red-500 transition-all flex items-center gap-2 font-bold text-sm">
                    <X size={20} /> Discard
                </button>
            </header>

            {/* Sticky Tab Navigation */}
            <div className="sticky top-4 z-40 bg-white/80 backdrop-blur-xl p-3 border border-slate-100 rounded-[2.5rem] shadow-xl shadow-slate-200/50">
                <div className="flex gap-2 overflow-x-auto custom-scrollbar no-scrollbar">
                    {tabs.map((tab, i) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(i)}
                            className={`flex items-center gap-3 px-6 py-3.5 rounded-[1.5rem] transition-all whitespace-nowrap relative ${activeTab === i ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-transparent text-slate-400 hover:bg-slate-50'}`}
                        >
                            <tab.icon size={18} />
                            <span className="font-black text-xs uppercase tracking-widest">{tab.label}</span>
                            {isTabIncomplete(tab.id) && (
                                <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            <main className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/20 flex-1 flex flex-col mb-32 overflow-hidden">
                <div className="flex-1 p-8 md:p-16">
                    {renderTabContent()}
                </div>
            </main>

            {/* Bottom Actions Footer */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-4xl px-4 z-50">
                <div className="bg-slate-900 border border-white/10 backdrop-blur-xl p-4 rounded-[2.5rem] shadow-2xl flex justify-between items-center text-white">
                    <div className="flex items-center gap-6 px-6">
                        <div className="text-left hidden sm:block">
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest">Progress</p>
                            <p className="text-sm font-bold text-white/70">Step {activeTab + 1} of 6</p>
                        </div>
                        <div className="h-8 w-[1px] bg-white/10 hidden sm:block" />
                        <button
                            className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all group"
                            onClick={() => setActiveTab(Math.max(0, activeTab - 1))}
                            disabled={activeTab === 0}
                        >
                            <ChevronLeft size={24} className={activeTab === 0 ? 'opacity-20' : 'group-active:-translate-x-1 transition-transform'} />
                        </button>
                        <button
                            className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-all group"
                            onClick={() => setActiveTab(Math.min(5, activeTab + 1))}
                            disabled={activeTab === 5}
                        >
                            <ChevronRight size={24} className={activeTab === 5 ? 'opacity-20' : 'group-active:translate-x-1 transition-transform'} />
                        </button>
                    </div>

                    <div className="flex gap-3">
                        <Button variant="ghost" className="text-white hover:bg-white/10 rounded-2xl hidden md:flex font-black text-xs uppercase tracking-widest px-8">
                            <Eye className="w-4 h-4 mr-2" /> Portal Preview
                        </Button>
                        <Button className="bg-primary hover:bg-primary/90 text-white shadow-xl shadow-primary/20 rounded-2xl font-black text-sm px-10 py-6" onClick={handleUpload}>
                            <Upload className="w-5 h-5 mr-3" /> {activeTab === 5 ? 'Finish & Upload' : 'Check & Upload'}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Upload Overlay */}
            <AnimatePresence>
                {uploading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-2xl p-6">
                        <Card className="max-w-md w-full p-12 text-center space-y-8 bg-white/95 border-white shadow-[0_32px_128px_-16px_rgba(0,0,0,0.3)] rounded-[3rem]">
                            <div className="relative w-32 h-32 mx-auto">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={364} strokeDashoffset={364 - (364 * uploadProgress) / 100} className="text-primary transition-all duration-300" />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <p className="text-3xl font-black text-slate-900">{uploadProgress}%</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h3 className="text-3xl font-black text-slate-900 tracking-tighter italic">Broadcasting to Portal...</h3>
                                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest px-8">Synchronizing media assets and optimizing metadata for public access.</p>
                            </div>
                            <div className="flex gap-2 justify-center">
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <motion.div key={i} animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.2 }} className="w-2 h-2 bg-primary rounded-full" />
                                ))}
                            </div>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};


