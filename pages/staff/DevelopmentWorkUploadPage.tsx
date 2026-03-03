import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Info, 
  FileText, 
  MapPin, 
  BarChart3, 
  Image as ImageIcon, 
  Eye, 
  Plus, 
  X, 
  Check, 
  ChevronDown, 
  ChevronUp,
  HardHat,
  Droplets,
  BookOpen,
  Stethoscope,
  Sprout,
  Zap,
  Hammer,
  RefreshCw,
  Wrench,
  TrendingUp,
  Upload,
  GripVertical,
  Calendar,
  IndianRupee,
  Users,
  Globe,
  Star,
  Play,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { Button } from '../../components/UI/Button';

// --- Types ---

type WorkStatus = 'Planned' | 'Ongoing' | 'Completed';
type WorkType = 'New Construction' | 'Renovation' | 'Maintenance' | 'Upgrade';
type FundingSource = 'MPLADS' | 'State Government' | 'Central Government' | 'Other';

interface MediaFile {
  id: string;
  file: File;
  preview: string;
  caption: string;
  date?: string;
  progress: number;
  type: 'photo' | 'video';
}

const SECTORS = [
  { id: 'Roads', label: 'Roads & Transport', icon: Zap, color: 'text-orange-600', bg: 'bg-orange-50' },
  { id: 'Healthcare', label: 'Healthcare', icon: Stethoscope, color: 'text-red-600', bg: 'bg-red-50' },
  { id: 'Education', label: 'Education', icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'Water', label: 'Water Resources', icon: Droplets, color: 'text-teal-600', bg: 'bg-teal-50' },
  { id: 'Agriculture', label: 'Agriculture', icon: Sprout, color: 'text-green-600', bg: 'bg-green-50' },
  { id: 'Energy', label: 'Energy & Power', icon: Zap, color: 'text-yellow-600', bg: 'bg-yellow-50' },
];

const WORK_TYPES: { id: WorkType; label: string; icon: any }[] = [
  { id: 'New Construction', label: 'New Construction', icon: Plus },
  { id: 'Renovation', label: 'Renovation', icon: RefreshCw },
  { id: 'Maintenance', label: 'Maintenance', icon: Wrench },
  { id: 'Upgrade', label: 'Upgrade', icon: TrendingUp },
];

const STATUS_OPTIONS: { id: WorkStatus; label: string; color: string; bg: string }[] = [
  { id: 'Planned', label: 'Planned', color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'Ongoing', label: 'Ongoing', color: 'text-orange-600', bg: 'bg-orange-50' },
  { id: 'Completed', label: 'Completed', color: 'text-green-600', bg: 'bg-green-50' },
];

// --- Components ---

const TabButton: React.FC<{ 
  id: string; 
  label: string; 
  icon: any; 
  isActive: boolean; 
  hasError?: boolean;
  onClick: () => void;
}> = ({ id, label, icon: Icon, isActive, hasError, onClick }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all relative ${
      isActive 
        ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30' 
        : 'border-transparent text-slate-400 hover:text-slate-600 hover:bg-slate-50'
    }`}
  >
    <Icon className="w-4 h-4" />
    <span className="text-sm font-black uppercase tracking-widest whitespace-nowrap">{label}</span>
    {hasError && (
      <div className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
    )}
  </button>
);

const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-6">
    <h3 className="text-xl font-black text-slate-900 tracking-tight border-b border-slate-100 pb-4">{title}</h3>
    {children}
  </div>
);

const CollapsibleEditor: React.FC<{ 
  label: string; 
  value: string; 
  onChange: (val: string) => void;
  placeholder?: string;
}> = ({ label, value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between bg-slate-50/50 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <FileText className="w-4 h-4 text-slate-400" />
          <span className="text-sm font-black text-slate-900 uppercase tracking-widest">{label}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{value.length} characters</span>
          {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-6">
              <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full h-40 bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-xl p-4 outline-none transition-all font-medium text-slate-700 resize-none"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const DevelopmentWorkUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('basic');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // --- Form State ---
  const [formData, setFormData] = useState({
    title: '',
    sector: '',
    workType: '' as WorkType | '',
    status: 'Planned' as WorkStatus,
    description: '',
    history: '',
    workDone: '',
    location: {
      zilla: '',
      taluk: '',
      gp: '',
      village: '',
      address: '',
      lat: 12.9716,
      lng: 77.5946
    },
    metrics: {
      beneficiaries: '',
      budget: '',
      fundingSource: '' as FundingSource | '',
      otherFunding: '',
      startDate: '',
      completionDate: ''
    },
    visibility: {
      public: true,
      featured: false
    }
  });

  const [media, setMedia] = useState<MediaFile[]>([]);

  // --- Validation Logic ---
  const tabErrors = useMemo(() => {
    return {
      basic: !formData.title || !formData.sector || !formData.workType,
      location: !formData.location.zilla || !formData.location.taluk,
      metrics: !formData.metrics.budget || !formData.metrics.fundingSource
    };
  }, [formData]);

  // --- Handlers ---
  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'video') => {
    const files = Array.from(e.target.files || []);
    const newMedia: MediaFile[] = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      caption: '',
      progress: 100, // Simulated
      type
    }));
    setMedia([...media, ...newMedia]);
  };

  const removeMedia = (id: string) => {
    setMedia(media.filter(m => m.id !== id));
  };

  const updateMediaCaption = (id: string, caption: string) => {
    setMedia(media.map(m => m.id === id ? { ...m, caption } : m));
  };

  const formatCurrency = (val: string) => {
    const num = val.replace(/\D/g, '');
    if (!num) return '';
    return new Intl.NumberFormat('en-IN').format(parseInt(num));
  };

  // --- Render Tabs ---

  const renderBasicInfo = () => (
    <FormSection title="Core Project Details">
      <div className="space-y-8">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Project Title*</label>
          <input 
            type="text" 
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            placeholder="e.g. Construction of New Bridge over Hemavathi River"
            className="w-full text-2xl font-black text-slate-900 bg-white border-2 border-slate-100 rounded-2xl px-6 py-4 focus:border-indigo-500 outline-none transition-all tracking-tight"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sector*</label>
            <div className="grid grid-cols-2 gap-3">
              {SECTORS.map(sector => (
                <button
                  key={sector.id}
                  onClick={() => setFormData({...formData, sector: sector.id})}
                  className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${
                    formData.sector === sector.id 
                      ? 'border-indigo-500 bg-indigo-50/50' 
                      : 'border-slate-100 bg-white hover:border-slate-200'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl ${sector.bg} ${sector.color} flex items-center justify-center flex-shrink-0`}>
                    <sector.icon className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-black text-slate-900 uppercase tracking-tight">{sector.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Work Type*</label>
              <div className="grid grid-cols-2 gap-3">
                {WORK_TYPES.map(type => (
                  <button
                    key={type.id}
                    onClick={() => setFormData({...formData, workType: type.id})}
                    className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${
                      formData.workType === type.id 
                        ? 'border-indigo-500 bg-indigo-50/50' 
                        : 'border-slate-100 bg-white hover:border-slate-200'
                    }`}
                  >
                    <type.icon className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-bold text-slate-700">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Status*</label>
              <div className="flex gap-3">
                {STATUS_OPTIONS.map(status => (
                  <button
                    key={status.id}
                    onClick={() => setFormData({...formData, status: status.id})}
                    className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                      formData.status === status.id 
                        ? `border-indigo-500 ${status.bg} ${status.color}` 
                        : 'border-slate-100 bg-white text-slate-400 hover:border-slate-200'
                    }`}
                  >
                    <span className="text-xs font-black uppercase tracking-widest">{status.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </FormSection>
  );

  const renderDescription = () => (
    <FormSection title="Project Narrative">
      <div className="space-y-6">
        <CollapsibleEditor 
          label="Project Description" 
          value={formData.description} 
          onChange={(val) => setFormData({...formData, description: val})}
          placeholder="Describe the overall project scope and objectives..."
        />
        <CollapsibleEditor 
          label="History & Background" 
          value={formData.history} 
          onChange={(val) => setFormData({...formData, history: val})}
          placeholder="Why was this project needed? What were the previous conditions?"
        />
        <CollapsibleEditor 
          label="Development Work Done" 
          value={formData.workDone} 
          onChange={(val) => setFormData({...formData, workDone: val})}
          placeholder="What specific technical improvements were made?"
        />
      </div>
    </FormSection>
  );

  const renderLocation = () => (
    <FormSection title="Geographic Targeting">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Zilla / District*</label>
              <select 
                value={formData.location.zilla}
                onChange={(e) => setFormData({...formData, location: { ...formData.location, zilla: e.target.value }})}
                className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-xl outline-none focus:border-indigo-500 font-bold text-slate-700"
              >
                <option value="">Select Zilla</option>
                <option value="Mysuru">Mysuru</option>
                <option value="Mandya">Mandya</option>
                <option value="Hassan">Hassan</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Taluk*</label>
              <select 
                value={formData.location.taluk}
                onChange={(e) => setFormData({...formData, location: { ...formData.location, taluk: e.target.value }})}
                className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-xl outline-none focus:border-indigo-500 font-bold text-slate-700"
              >
                <option value="">Select Taluk</option>
                <option value="Hunsur">Hunsur</option>
                <option value="Periyapatna">Periyapatna</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gram Panchayat</label>
              <input 
                type="text"
                value={formData.location.gp}
                onChange={(e) => setFormData({...formData, location: { ...formData.location, gp: e.target.value }})}
                placeholder="Enter GP"
                className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-xl outline-none focus:border-indigo-500 font-bold text-slate-700"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Village</label>
              <input 
                type="text"
                value={formData.location.village}
                onChange={(e) => setFormData({...formData, location: { ...formData.location, village: e.target.value }})}
                placeholder="Enter Village"
                className="w-full px-4 py-3 bg-white border-2 border-slate-100 rounded-xl outline-none focus:border-indigo-500 font-bold text-slate-700"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Specific Location Address</label>
            <textarea 
              value={formData.location.address}
              onChange={(e) => setFormData({...formData, location: { ...formData.location, address: e.target.value }})}
              placeholder="Enter detailed address or landmarks..."
              className="w-full h-32 bg-white border-2 border-slate-100 rounded-xl p-4 outline-none focus:border-indigo-500 font-medium text-slate-700 resize-none"
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Map Pin Selection</label>
          <div className="aspect-square bg-slate-100 rounded-[2.5rem] border-4 border-white shadow-inner relative overflow-hidden group">
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
              <MapPin className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-sm font-bold">Interactive Map Simulation</p>
              <p className="text-xs mt-2 opacity-60">Click on map to mark exact location</p>
            </div>
            {/* Simulated Pin */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full">
              <MapPin className="w-8 h-8 text-red-600 drop-shadow-lg" />
            </div>
          </div>
          <div className="flex items-center justify-between px-4 py-3 bg-slate-900 rounded-2xl text-white">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                <Globe className="w-4 h-4 text-indigo-400" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Coordinates</span>
            </div>
            <span className="text-xs font-mono font-bold">{formData.location.lat.toFixed(4)}, {formData.location.lng.toFixed(4)}</span>
          </div>
        </div>
      </div>
    </FormSection>
  );

  const renderMetrics = () => (
    <FormSection title="Financials & Impact">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Project Budget (INR)*</label>
            <div className="relative">
              <IndianRupee className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                value={formData.metrics.budget}
                onChange={(e) => setFormData({...formData, metrics: { ...formData.metrics, budget: formatCurrency(e.target.value) }})}
                placeholder="0.00"
                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 font-black text-slate-900 text-xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Funding Source*</label>
            <select 
              value={formData.metrics.fundingSource}
              onChange={(e) => setFormData({...formData, metrics: { ...formData.metrics, fundingSource: e.target.value as FundingSource }})}
              className="w-full px-4 py-4 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 font-bold text-slate-700"
            >
              <option value="">Select Source</option>
              <option value="MPLADS">MPLADS</option>
              <option value="State Government">State Government</option>
              <option value="Central Government">Central Government</option>
              <option value="Other">Other</option>
            </select>
            {formData.metrics.fundingSource === 'Other' && (
              <input 
                type="text"
                value={formData.metrics.otherFunding}
                onChange={(e) => setFormData({...formData, metrics: { ...formData.metrics, otherFunding: e.target.value }})}
                placeholder="Specify funding source..."
                className="w-full mt-2 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-bold"
              />
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Number of Beneficiaries</label>
            <div className="relative">
              <Users className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                value={formData.metrics.beneficiaries}
                onChange={(e) => setFormData({...formData, metrics: { ...formData.metrics, beneficiaries: formatCurrency(e.target.value) }})}
                placeholder="e.g. 5,000"
                className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 font-black text-slate-900 text-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Start Date</label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="date"
                  value={formData.metrics.startDate}
                  onChange={(e) => setFormData({...formData, metrics: { ...formData.metrics, startDate: e.target.value }})}
                  className="w-full pl-11 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 font-bold text-slate-700"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Completion Date</label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="date"
                  value={formData.metrics.completionDate}
                  onChange={(e) => setFormData({...formData, metrics: { ...formData.metrics, completionDate: e.target.value }})}
                  className="w-full pl-11 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-indigo-500 font-bold text-slate-700"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </FormSection>
  );

  const renderMedia = () => (
    <FormSection title="Visual Documentation">
      <div className="space-y-12">
        {/* Photos Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <ImageIcon className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-black text-slate-900 tracking-tight">Project Photos</h4>
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {media.filter(m => m.type === 'photo').length} / 50 Photos
            </span>
          </div>

          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-4 border-dashed border-slate-100 rounded-[2.5rem] p-12 flex flex-col items-center text-center group hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer"
          >
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8" />
            </div>
            <p className="text-lg font-black text-slate-900">Drag photos here or click to browse</p>
            <p className="text-xs text-slate-500 mt-1 font-medium">Supports JPG, PNG, WEBP (Max 20MB each)</p>
            <input 
              type="file" 
              ref={fileInputRef} 
              multiple 
              accept="image/*" 
              className="hidden" 
              onChange={(e) => handleMediaUpload(e, 'photo')} 
            />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {media.filter(m => m.type === 'photo').map((m) => (
              <div key={m.id} className="group relative aspect-square rounded-2xl overflow-hidden border-2 border-slate-100 bg-white">
                <img src={m.preview} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-between">
                  <div className="flex justify-end">
                    <button onClick={() => removeMedia(m.id)} className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <input 
                    type="text" 
                    value={m.caption}
                    onChange={(e) => updateMediaCaption(m.id, e.target.value)}
                    placeholder="Add caption..."
                    className="w-full bg-white/20 border border-white/30 rounded-lg px-2 py-1 text-[10px] text-white placeholder:text-white/60 outline-none"
                  />
                </div>
                <div className="absolute top-2 left-2 p-1 bg-white/80 backdrop-blur-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
                  <GripVertical className="w-3 h-3 text-slate-600" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Videos Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Play className="w-5 h-5" />
              </div>
              <h4 className="text-lg font-black text-slate-900 tracking-tight">Project Videos</h4>
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {media.filter(m => m.type === 'video').length} / 10 Videos
            </span>
          </div>

          <div 
            onClick={() => videoInputRef.current?.click()}
            className="border-4 border-dashed border-slate-100 rounded-[2.5rem] p-12 flex flex-col items-center text-center group hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer"
          >
            <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Play className="w-8 h-8" />
            </div>
            <p className="text-lg font-black text-slate-900">Drag videos here or click to browse</p>
            <p className="text-xs text-slate-500 mt-1 font-medium">Supports MP4, MOV, AVI (Max 500MB each)</p>
            <input 
              type="file" 
              ref={videoInputRef} 
              multiple 
              accept="video/*" 
              className="hidden" 
              onChange={(e) => handleMediaUpload(e, 'video')} 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {media.filter(m => m.type === 'video').map((m) => (
              <div key={m.id} className="bg-white border-2 border-slate-100 rounded-3xl p-4 flex gap-4 items-center">
                <div className="w-32 aspect-video bg-slate-900 rounded-xl flex items-center justify-center relative overflow-hidden">
                  <Play className="w-8 h-8 text-white opacity-40" />
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-500" style={{ width: `${m.progress}%` }} />
                </div>
                <div className="flex-1 space-y-3">
                  <div className="flex justify-between items-start">
                    <h5 className="text-sm font-black text-slate-900 truncate">{m.file.name}</h5>
                    <button onClick={() => removeMedia(m.id)} className="text-slate-400 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <input 
                    type="text" 
                    value={m.caption}
                    onChange={(e) => updateMediaCaption(m.id, e.target.value)}
                    placeholder="Video caption..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-xs font-medium outline-none focus:border-indigo-500"
                  />
                  <div className="flex gap-2">
                    <button className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-colors">
                      Choose Thumbnail
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </FormSection>
  );

  const renderVisibility = () => (
    <FormSection title="Publishing & Visibility">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="p-8 bg-white border-2 border-slate-100 rounded-[2.5rem] space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900">Public Visibility</h4>
                  <p className="text-xs text-slate-500 font-medium">Make visible to citizens on public portal</p>
                </div>
              </div>
              <button
                onClick={() => setFormData({...formData, visibility: { ...formData.visibility, public: !formData.visibility.public }})}
                className={`w-14 h-8 rounded-full relative transition-all ${
                  formData.visibility.public ? 'bg-emerald-500' : 'bg-slate-200'
                }`}
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm ${
                  formData.visibility.public ? 'left-7' : 'left-1'
                }`} />
              </button>
            </div>

            <div className="flex items-center justify-between pt-6 border-t border-slate-50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                  <Star className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-black text-slate-900">Featured Project</h4>
                  <p className="text-xs text-slate-500 font-medium">Showcase this project on the homepage</p>
                </div>
              </div>
              <input 
                type="checkbox"
                checked={formData.visibility.featured}
                onChange={(e) => setFormData({...formData, visibility: { ...formData.visibility, featured: e.target.checked }})}
                className="w-6 h-6 rounded-lg border-2 border-slate-200 text-indigo-600 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="p-6 bg-indigo-900 rounded-3xl text-white flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <p className="text-xs font-black text-indigo-400 uppercase tracking-widest">Publishing Note</p>
              <p className="text-sm font-medium text-indigo-100">Once published, this project will be indexed for search and visible to all constituency members.</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Public Portal Preview</label>
          <div className="bg-slate-100 rounded-[2.5rem] p-8 border-4 border-white shadow-inner">
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden max-w-sm mx-auto">
              <div className="aspect-video bg-slate-200 relative">
                {media.find(m => m.type === 'photo') ? (
                  <img src={media.find(m => m.type === 'photo')?.preview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <ImageIcon className="w-10 h-10 opacity-20" />
                  </div>
                )}
                <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-[10px] font-black uppercase tracking-widest text-indigo-600">
                  {formData.sector || 'Sector'}
                </div>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[8px] font-black uppercase tracking-widest">
                    {formData.status}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {formData.location.village || 'Village'}
                  </span>
                </div>
                <h4 className="text-lg font-black text-slate-900 leading-tight tracking-tight">
                  {formData.title || 'Project Title Placeholder'}
                </h4>
                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-600" />
                    <span className="text-[10px] font-bold text-slate-500">MP Connect</span>
                  </div>
                  <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">View Details</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </FormSection>
  );

  return (
    <div className="max-w-7xl mx-auto pb-32">
      <header className="mb-8">
        <button 
          onClick={() => navigate('/staff/entry')}
          className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-black text-xs uppercase tracking-widest mb-4 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Works
        </button>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Upload Development Work</h1>
            <p className="text-slate-500 font-medium">Add a new project to the constituency development tracker.</p>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden mb-8">
        <div className="flex overflow-x-auto no-scrollbar">
          <TabButton 
            id="basic" 
            label="Basic Info" 
            icon={Info} 
            isActive={activeTab === 'basic'} 
            hasError={tabErrors.basic}
            onClick={() => setActiveTab('basic')} 
          />
          <TabButton 
            id="description" 
            label="Description" 
            icon={FileText} 
            isActive={activeTab === 'description'} 
            onClick={() => setActiveTab('description')} 
          />
          <TabButton 
            id="location" 
            label="Location" 
            icon={MapPin} 
            isActive={activeTab === 'location'} 
            hasError={tabErrors.location}
            onClick={() => setActiveTab('location')} 
          />
          <TabButton 
            id="metrics" 
            label="Metrics" 
            icon={BarChart3} 
            isActive={activeTab === 'metrics'} 
            hasError={tabErrors.metrics}
            onClick={() => setActiveTab('metrics')} 
          />
          <TabButton 
            id="media" 
            label="Media" 
            icon={ImageIcon} 
            isActive={activeTab === 'media'} 
            onClick={() => setActiveTab('media')} 
          />
          <TabButton 
            id="visibility" 
            label="Visibility" 
            icon={Eye} 
            isActive={activeTab === 'visibility'} 
            onClick={() => setActiveTab('visibility')} 
          />
        </div>

        <div className="p-8 md:p-12 min-h-[600px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'basic' && renderBasicInfo()}
              {activeTab === 'description' && renderDescription()}
              {activeTab === 'location' && renderLocation()}
              {activeTab === 'metrics' && renderMetrics()}
              {activeTab === 'media' && renderMedia()}
              {activeTab === 'visibility' && renderVisibility()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-6 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${Object.values(tabErrors).some(v => v) ? 'bg-red-500' : 'bg-emerald-500'}`} />
              <span className="text-xs font-black text-slate-500 uppercase tracking-widest">
                {Object.values(tabErrors).filter(v => v).length > 0 
                  ? `${Object.values(tabErrors).filter(v => v).length} tabs require attention` 
                  : 'All required fields complete'}
              </span>
            </div>
          </div>
          <div className="flex gap-4 w-full sm:w-auto">
            <Button variant="outline" className="flex-1 sm:flex-none rounded-2xl px-10 py-4">
              <Eye className="w-4 h-4 mr-2" /> Preview
            </Button>
            <Button 
              className="flex-1 sm:flex-none rounded-2xl px-12 py-4 shadow-xl shadow-indigo-100"
              onClick={() => {
                if (Object.values(tabErrors).some(v => v)) {
                  alert('Please complete all required fields before uploading.');
                  return;
                }
                console.log('Uploading project:', formData);
                navigate('/staff/entry');
              }}
            >
              <Upload className="w-4 h-4 mr-2" /> Upload Project
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
