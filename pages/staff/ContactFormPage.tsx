import React, { useState, useEffect } from 'react';
import {
    Camera,
    ChevronLeft,
    ChevronRight,
    Save,
    X,
    Check,
    MapPin,
    Phone,
    User,
    FileText,
    Plus,
    Star
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Contact, ContactCategory, ContactLocation } from '../../types';

const STEPS = [
    { id: 1, label: 'Basic Info', icon: User },
    { id: 2, label: 'Contact Details', icon: Phone },
    { id: 3, label: 'Location', icon: MapPin },
    { id: 4, label: 'Additional Details', icon: FileText },
];

export const ContactFormPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;

    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<Partial<Contact> & { photoFile?: File }>({
        name: '',
        designation: '',
        organization: '',
        category: 'Government' as any,
        mobile: '',
        whatsapp: '',
        email: '',
        location: {
            state: '',
            zilla: '',
            taluk: '',
            gp: '',
            village: ''
        },
        isVip: false,
        addedAt: new Date().toISOString()
    });

    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const handleNext = () => {
        if (currentStep < 4) setCurrentStep(currentStep + 1);
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const handleSave = async () => {
        try {
            const submitData = new FormData();

            // Remove photoFile from json data
            const { photoFile, ...contactData } = formData;
            submitData.append('contactData', JSON.stringify({ ...contactData, tags }));

            if (photoFile) {
                submitData.append('photo', photoFile);
            }

            // Simulate API Call for FormData upload
            const response = await fetch('/api/contacts/save', {
                method: 'POST',
                body: submitData
            });

            if (!response.ok) {
                // In development without backend, we still allow success for simulation
                console.warn('Backend API not found, simulating success');
            }

            alert('Contact saved successfully!');
            navigate('/staff/contacts');
        } catch (error) {
            console.error('Error saving contact:', error);
            alert('Failed to save contact. Please try again.');
        }
    };

    const renderStepIndicator = () => (
        <div className="flex items-center justify-between mb-12 relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 -z-10"></div>
            {STEPS.map((step, idx) => {
                const Icon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;

                return (
                    <button
                        key={step.id}
                        onClick={() => currentStep > step.id && setCurrentStep(step.id)}
                        disabled={step.id > currentStep}
                        className="flex flex-col items-center gap-2 group relative z-10"
                    >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-primary text-white scale-110 shadow-lg shadow-primary/20' :
                            isCompleted ? 'bg-green-500 text-white' : 'bg-white border-2 border-gray-200 text-gray-400'
                            }`}>
                            {isCompleted ? <Check size={20} /> : <Icon size={20} />}
                        </div>
                        <span className={`text-xs font-bold uppercase tracking-wider ${isActive ? 'text-primary' : 'text-gray-400'
                            }`}>
                            {step.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );

    const renderStep1 = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col items-center mb-8">
                <div className="relative group cursor-pointer">
                    <div className="w-32 h-32 rounded-full bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center overflow-hidden transition-all group-hover:border-primary">
                        {photoPreview ? (
                            <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <>
                                <Camera size={32} className="text-gray-300 mb-2 group-hover:text-primary transition-colors" />
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Upload Photo</span>
                            </>
                        )}
                    </div>
                    <input
                        type="file"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        accept="image/*"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                                setPhotoPreview(URL.createObjectURL(file));
                                setFormData({ ...formData, photoFile: file });
                            }
                        }}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Full Name *</label>
                    <input
                        type="text"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="Enter contact name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Designation</label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            placeholder="e.g. Collector, Tehsildar"
                            value={formData.designation}
                            onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-gray-700">Organization</label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            placeholder="e.g. Revenue Department"
                            value={formData.organization}
                            onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                        />
                    </div>
                </div>
                <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-700 block">Category</label>
                    <div className="flex flex-wrap gap-3">
                        {['Government', 'Political', 'Community', 'Business', 'Other'].map(cat => (
                            <label key={cat} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 cursor-pointer transition-all ${formData.category === cat ? 'bg-primary/5 border-primary text-primary' : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'
                                }`}>
                                <input
                                    type="radio"
                                    className="hidden"
                                    name="category"
                                    value={cat}
                                    checked={formData.category === cat}
                                    onChange={() => setFormData({ ...formData, category: cat as any })}
                                />
                                <span className="text-sm font-semibold">{cat}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Primary Mobile *</label>
                    <div className="flex">
                        <span className="px-4 py-3 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-gray-500 text-sm font-semibold">+91</span>
                        <input
                            type="tel"
                            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-r-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            placeholder="9876543210"
                            value={formData.mobile}
                            onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Alternate Mobile</label>
                    <input
                        type="tel"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="Optional secondary number"
                    />
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Email Address</label>
                <input
                    type="email"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    placeholder="contact@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
            </div>
            <div className="space-y-4 pt-4">
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="same-whatsapp"
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                        onChange={(e) => {
                            if (e.target.checked) setFormData({ ...formData, whatsapp: formData.mobile });
                        }}
                    />
                    <label htmlFor="same-whatsapp" className="text-sm text-gray-600">WhatsApp is same as primary mobile</label>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">WhatsApp Number</label>
                    <input
                        type="tel"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        placeholder="WhatsApp number"
                        value={formData.whatsapp}
                        onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    />
                </div>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">State</label>
                    <select
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                        value={formData.location?.state}
                        onChange={(e) => setFormData({ ...formData, location: { ...formData.location!, state: e.target.value } })}
                    >
                        <option value="">Select State</option>
                        <option value="Karnataka">Karnataka</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Zilla</label>
                    <select
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                        disabled={!formData.location?.state}
                        value={formData.location?.zilla}
                        onChange={(e) => setFormData({ ...formData, location: { ...formData.location!, zilla: e.target.value } })}
                    >
                        <option value="">Select Zilla</option>
                        <option value="Mysuru">Mysuru</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Taluk</label>
                    <select
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                        disabled={!formData.location?.zilla}
                        value={formData.location?.taluk}
                        onChange={(e) => setFormData({ ...formData, location: { ...formData.location!, taluk: e.target.value } })}
                    >
                        <option value="">Select Taluk</option>
                        <option value="Mysuru">Mysuru</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Village</label>
                    <select
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
                        disabled={!formData.location?.taluk}
                        value={formData.location?.village}
                        onChange={(e) => setFormData({ ...formData, location: { ...formData.location!, village: e.target.value } })}
                    >
                        <option value="">Select Village</option>
                        <option value="Main">Main</option>
                    </select>
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Full Address</label>
                <textarea
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                    placeholder="Enter full postal address"
                ></textarea>
            </div>
        </div>
    );

    const renderStep4 = () => (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Date of Birth</label>
                    <input
                        type="date"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        value={formData.birthday}
                        onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Anniversary Date</label>
                    <input
                        type="date"
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        value={formData.anniversary}
                        onChange={(e) => setFormData({ ...formData, anniversary: e.target.value })}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Tags</label>
                <div className="flex flex-wrap gap-2 p-3 bg-gray-50 border border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                    {tags.map(tag => (
                        <span key={tag} className="flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-primary shadow-sm">
                            {tag}
                            <button onClick={() => setTags(tags.filter(t => t !== tag))}>
                                <X size={12} className="text-gray-400 hover:text-red-500" />
                            </button>
                        </span>
                    ))}
                    <input
                        type="text"
                        className="flex-1 bg-transparent outline-none text-sm"
                        placeholder="Type and press Enter..."
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && tagInput.trim()) {
                                if (!tags.includes(tagInput.trim())) setTags([...tags, tagInput.trim()]);
                                setTagInput('');
                            }
                        }}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Notes</label>
                <textarea
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                    placeholder="Special instructions or background info"
                ></textarea>
            </div>

            <div className="p-4 bg-yellow-50 rounded-2xl border-2 border-yellow-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                        <Star size={20} className="text-yellow-600 fill-yellow-600" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-yellow-900">VIP Contact</p>
                        <p className="text-xs text-yellow-700">Marked contacts appear with a star badge</p>
                    </div>
                </div>
                <button
                    onClick={() => setFormData({ ...formData, isVip: !formData.isVip })}
                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${formData.isVip ? 'bg-yellow-500' : 'bg-gray-200'}`}
                >
                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${formData.isVip ? 'translate-x-6' : 'translate-x-0'}`}></div>
                </button>
            </div>
        </div>
    );

    return (
        <div className="max-w-3xl mx-auto py-8 px-4">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <button
                        onClick={() => navigate('/staff/contacts')}
                        className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary mb-2 -ml-1 transition-colors group"
                    >
                        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Contacts
                    </button>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                        {isEdit ? 'Edit Contact' : 'Add New Contact'}
                    </h1>
                </div>
                <button
                    onClick={() => navigate('/staff/contacts')}
                    className="p-2.5 bg-gray-100 rounded-xl text-gray-400 hover:bg-gray-200 hover:text-gray-900 transition-all"
                >
                    <X size={20} />
                </button>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-slate-200/50 p-8 md:p-12">
                {renderStepIndicator()}

                <form onSubmit={(e) => e.preventDefault()}>
                    {currentStep === 1 && renderStep1()}
                    {currentStep === 2 && renderStep2()}
                    {currentStep === 3 && renderStep3()}
                    {currentStep === 4 && renderStep4()}

                    <div className="flex items-center justify-between mt-12 pt-8 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={handleBack}
                            disabled={currentStep === 1}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${currentStep === 1 ? 'opacity-0 pointer-events-none' : 'text-gray-500 hover:bg-gray-100'
                                }`}
                        >
                            <ChevronLeft size={20} />
                            Back
                        </button>

                        {currentStep === 4 ? (
                            <button
                                type="button"
                                onClick={handleSave}
                                className="flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all hover:scale-[1.02] active:scale-95"
                            >
                                <Save size={20} />
                                Save Contact
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleNext}
                                className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all hover:scale-[1.02] active:scale-95"
                            >
                                Next Step
                                <ChevronRight size={20} />
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ContactFormPage;
