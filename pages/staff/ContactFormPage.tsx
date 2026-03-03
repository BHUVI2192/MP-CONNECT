import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Camera, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Tag, 
  Calendar, 
  Star, 
  X,
  Loader2,
  Upload,
  MessageCircle
} from 'lucide-react';
import { Button } from '../../components/UI/Button';
import { Contact } from '../../types';

// --- Types & Constants ---

interface ContactFormData extends Partial<Contact> {
  whatsappSameAsPrimary?: boolean;
}

const STEPS = [
  { id: 1, label: 'Basic Info' },
  { id: 2, label: 'Contact Details' },
  { id: 3, label: 'Location' },
  { id: 4, label: 'Additional Details' },
];

const CATEGORIES = ['Government', 'Political', 'Community', 'Business', 'Other'];

// --- Mock Data for Cascading Dropdowns ---
const LOCATIONS = {
  states: ['Karnataka'],
  zillas: {
    'Karnataka': ['Mysuru', 'Bengaluru Urban', 'Mandya', 'Hassan']
  },
  taluks: {
    'Mysuru': ['Mysuru', 'Hunsur', 'Nanjangud', 'T.Narasipura'],
    'Mandya': ['Mandya', 'Maddur', 'Malavalli']
  },
  gps: {
    'Hunsur': ['Rampur', 'Bilikere', 'Dharmapura'],
    'Mysuru': ['City', 'Chamundi Hill', 'Kadakola']
  },
  villages: {
    'Rampur': ['Rampur Village', 'Hosahalli', 'Koppa'],
    'City': ['Mysuru City']
  }
};

export const ContactFormPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    designation: '',
    organization: '',
    category: '',
    mobile: '',
    altMobile: '',
    email: '',
    whatsapp: '',
    whatsappSameAsPrimary: true,
    state: 'Karnataka',
    zilla: '',
    taluk: '',
    gp: '',
    village: '',
    fullAddress: '',
    dob: '',
    anniversary: '',
    tags: [],
    notes: '',
    isVip: false,
    photoUrl: ''
  });

  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [tagInput, setTagInput] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // --- Step Validation ---
  const validateStep = (step: number) => {
    const newErrors: Record<string, string> = {};
    if (step === 1) {
      if (!formData.name) newErrors.name = 'Full Name is required';
    }
    if (step === 2) {
      if (!formData.mobile) newErrors.mobile = 'Primary Mobile is required';
      if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleStepClick = (stepId: number) => {
    if (stepId < currentStep) {
      setCurrentStep(stepId);
    } else if (stepId > currentStep) {
      // Can only skip forward if current and intermediate steps are valid
      let canSkip = true;
      for (let i = currentStep; i < stepId; i++) {
        if (!validateStep(i)) {
          canSkip = false;
          break;
        }
      }
      if (canSkip) setCurrentStep(stepId);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
        setFormData({ ...formData, photoUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLocationChange = (level: string, value: string) => {
    setIsLoadingLocation(level);
    // Simulate API delay
    setTimeout(() => {
      const updates: any = { [level]: value };
      // Reset children
      if (level === 'state') { updates.zilla = ''; updates.taluk = ''; updates.gp = ''; updates.village = ''; }
      if (level === 'zilla') { updates.taluk = ''; updates.gp = ''; updates.village = ''; }
      if (level === 'taluk') { updates.gp = ''; updates.village = ''; }
      if (level === 'gp') { updates.village = ''; }
      
      setFormData(prev => ({ ...prev, ...updates }));
      setIsLoadingLocation(null);
    }, 400);
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags?.includes(tagInput.trim())) {
        setFormData({ ...formData, tags: [...(formData.tags || []), tagInput.trim()] });
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData({ ...formData, tags: formData.tags?.filter(t => t !== tagToRemove) });
  };

  const handleSave = () => {
    if (validateStep(4)) {
      console.log('Saving Contact:', formData);
      // Success logic
      navigate('/staff/contacts');
    }
  };

  // --- Render Helpers ---

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-12 px-4">
      {STEPS.map((step, idx) => (
        <React.Fragment key={step.id}>
          <div 
            className="flex flex-col items-center gap-2 cursor-pointer group"
            onClick={() => handleStepClick(step.id)}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm transition-all border-2 ${
              currentStep === step.id 
                ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' 
                : currentStep > step.id 
                  ? 'bg-emerald-500 border-emerald-500 text-white' 
                  : 'bg-white border-slate-200 text-slate-400 group-hover:border-indigo-300'
            }`}>
              {currentStep > step.id ? <Check className="w-5 h-5" /> : step.id}
            </div>
            <span className={`text-[10px] font-black uppercase tracking-widest ${
              currentStep === step.id ? 'text-indigo-600' : 'text-slate-400'
            }`}>
              {step.label}
            </span>
          </div>
          {idx < STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 mx-4 transition-colors ${
              currentStep > step.id ? 'bg-emerald-500' : 'bg-slate-100'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <header className="mb-12 flex items-center justify-between">
        <div>
          <button 
            onClick={() => navigate('/staff/contacts')}
            className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-black text-xs uppercase tracking-widest mb-4 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Back to Contacts
          </button>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">
            {isEdit ? 'Edit Contact' : 'Add New Contact'}
          </h1>
          <p className="text-slate-500 font-medium">Fill in the details to {isEdit ? 'update' : 'create'} a constituency contact.</p>
        </div>
      </header>

      {renderStepIndicator()}

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 md:p-12">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex flex-col items-center mb-8">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-full bg-slate-100 border-4 border-white shadow-xl flex items-center justify-center overflow-hidden">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-12 h-12 text-slate-300" />
                      )}
                    </div>
                    <label className="absolute bottom-0 right-0 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:bg-indigo-700 transition-colors border-4 border-white">
                      <Camera className="w-5 h-5" />
                      <input type="file" className="hidden" onChange={handlePhotoChange} accept="image/*" />
                    </label>
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-4">Profile Photo</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name *</label>
                    <input 
                      type="text" 
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Dr. Rajesh Kumar"
                      className={`w-full px-6 py-4 bg-slate-50 border rounded-2xl outline-none font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all ${
                        errors.name ? 'border-red-500' : 'border-slate-100'
                      }`}
                    />
                    {errors.name && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Designation</label>
                    <input 
                      type="text" 
                      value={formData.designation}
                      onChange={e => setFormData({ ...formData, designation: e.target.value })}
                      placeholder="e.g. District Magistrate"
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Organization</label>
                    <input 
                      type="text" 
                      value={formData.organization}
                      onChange={e => setFormData({ ...formData, organization: e.target.value })}
                      placeholder="e.g. District Administration"
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                    <div className="relative">
                      <select 
                        value={formData.category}
                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all appearance-none"
                      >
                        <option value="">Select Category</option>
                        {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        <ChevronRight className="w-4 h-4 rotate-90" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Primary Mobile *</label>
                    <div className="relative">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">+91</div>
                      <input 
                        type="tel" 
                        value={formData.mobile}
                        onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                        placeholder="98765 43210"
                        className={`w-full pl-16 pr-6 py-4 bg-slate-50 border rounded-2xl outline-none font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all ${
                          errors.mobile ? 'border-red-500' : 'border-slate-100'
                        }`}
                      />
                    </div>
                    {errors.mobile && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.mobile}</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Alternate Mobile</label>
                    <div className="relative">
                      <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm">+91</div>
                      <input 
                        type="tel" 
                        value={formData.altMobile}
                        onChange={e => setFormData({ ...formData, altMobile: e.target.value })}
                        placeholder="98765 43211"
                        className="w-full pl-16 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input 
                        type="email" 
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        placeholder="example@gov.in"
                        className={`w-full pl-14 pr-6 py-4 bg-slate-50 border rounded-2xl outline-none font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all ${
                          errors.email ? 'border-red-500' : 'border-slate-100'
                        }`}
                      />
                    </div>
                    {errors.email && <p className="text-[10px] text-red-500 font-bold ml-1">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">WhatsApp Number</label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={formData.whatsappSameAsPrimary}
                          onChange={e => {
                            const checked = e.target.checked;
                            setFormData({ 
                              ...formData, 
                              whatsappSameAsPrimary: checked,
                              whatsapp: checked ? formData.mobile : formData.whatsapp
                            });
                          }}
                          className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-[10px] font-bold text-slate-500">Same as primary</span>
                      </label>
                    </div>
                    <div className="relative">
                      <MessageCircle className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input 
                        type="tel" 
                        value={formData.whatsappSameAsPrimary ? formData.mobile : formData.whatsapp}
                        onChange={e => !formData.whatsappSameAsPrimary && setFormData({ ...formData, whatsapp: e.target.value })}
                        disabled={formData.whatsappSameAsPrimary}
                        placeholder="98765 43210"
                        className={`w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all ${
                          formData.whatsappSameAsPrimary ? 'opacity-50' : ''
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Cascading Dropdowns */}
                  {[
                    { label: 'State', key: 'state', options: LOCATIONS.states, disabled: false },
                    { label: 'Zilla', key: 'zilla', options: LOCATIONS.zillas[formData.state as keyof typeof LOCATIONS.zillas] || [], disabled: !formData.state },
                    { label: 'Taluk', key: 'taluk', options: LOCATIONS.taluks[formData.zilla as keyof typeof LOCATIONS.taluks] || [], disabled: !formData.zilla },
                    { label: 'Gram Panchayat', key: 'gp', options: LOCATIONS.gps[formData.taluk as keyof typeof LOCATIONS.gps] || [], disabled: !formData.taluk },
                    { label: 'Village', key: 'village', options: LOCATIONS.villages[formData.gp as keyof typeof LOCATIONS.villages] || [], disabled: !formData.gp },
                  ].map((field) => (
                    <div key={field.key} className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{field.label}</label>
                      <div className="relative">
                        <select 
                          value={formData[field.key as keyof ContactFormData] as string}
                          onChange={e => handleLocationChange(field.key, e.target.value)}
                          disabled={field.disabled || isLoadingLocation === field.key}
                          className={`w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all appearance-none ${
                            field.disabled ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <option value="">Select {field.label}</option>
                          {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                          {isLoadingLocation === field.key ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <ChevronRight className="w-4 h-4 rotate-90" />
                          )}
                        </div>
                      </div>
                      {field.options.length === 0 && !field.disabled && (
                        <p className="text-[8px] text-slate-400 font-bold ml-1 italic">No options available for this selection</p>
                      )}
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-6 top-6 text-slate-400 w-4 h-4" />
                    <textarea 
                      value={formData.fullAddress}
                      onChange={e => setFormData({ ...formData, fullAddress: e.target.value })}
                      placeholder="e.g. #12, Ashoka Road, New Delhi"
                      rows={3}
                      className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date of Birth</label>
                    <div className="relative">
                      <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input 
                        type="date" 
                        value={formData.dob}
                        onChange={e => setFormData({ ...formData, dob: e.target.value })}
                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Anniversary Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <input 
                        type="date" 
                        value={formData.anniversary}
                        onChange={e => setFormData({ ...formData, anniversary: e.target.value })}
                        className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tags (Press Enter to add)</label>
                  <div className="relative">
                    <Tag className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input 
                      type="text" 
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      placeholder="e.g. Influencer, Donor, Volunteer"
                      className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.tags?.map(tag => (
                      <span key={tag} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black flex items-center gap-2 border border-indigo-100">
                        {tag}
                        <button onClick={() => removeTag(tag)} className="hover:text-indigo-800">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Internal Notes</label>
                  <textarea 
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Add any additional context or background about this contact..."
                    rows={4}
                    className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                  />
                </div>

                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                      formData.isVip ? 'bg-amber-100 text-amber-600' : 'bg-slate-200 text-slate-400'
                    }`}>
                      <Star className={`w-6 h-6 ${formData.isVip ? 'fill-current' : ''}`} />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 tracking-tight">Mark as VIP Contact</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Prioritize this contact in greetings and tours</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setFormData({ ...formData, isVip: !formData.isVip })}
                    className={`w-14 h-8 rounded-full relative transition-all ${
                      formData.isVip ? 'bg-indigo-600' : 'bg-slate-300'
                    }`}
                  >
                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm ${
                      formData.isVip ? 'left-7' : 'left-1'
                    }`} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="p-8 md:p-12 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={handleBack}
            disabled={currentStep === 1}
            className="rounded-2xl px-8 py-4 font-black text-xs uppercase tracking-widest"
          >
            <ChevronLeft className="w-4 h-4 mr-2" /> Back
          </Button>

          {currentStep < STEPS.length ? (
            <Button 
              onClick={handleNext}
              className="rounded-2xl px-10 py-4 font-black text-xs uppercase tracking-widest"
            >
              Next Step <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button 
              onClick={handleSave}
              className="rounded-2xl px-12 py-4 font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100"
            >
              <Check className="w-4 h-4 mr-2" /> Save Contact
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
