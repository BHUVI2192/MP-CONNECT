import React, { useState, useMemo, useEffect } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Check,
    Search,
    UserPlus,
    X,
    Phone,
    Mail,
    MessageCircle,
    Calendar,
    Clock,
    MapPin,
    Star,
    Plus,
    ArrowRight,
    Info,
    ShieldCheck,
    Send,
    AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Mock Contacts for Search
const MOCK_CONTACTS = [
    {
        id: '1',
        name: 'Rajesh Kumar',
        designation: 'Collector',
        organization: 'District Administration',
        location: { village: 'Nazarbad', taluk: 'Mysuru' },
        mobile: '+91 98765 43210',
        email: 'rajesh.kumar@example.com',
        photo: null
    },
    {
        id: '2',
        name: 'Priya Sharma',
        designation: 'Tehsildar',
        organization: 'Revenue Department',
        location: { village: 'Main', taluk: 'Hunsur' },
        mobile: '+91 98765 43211',
        email: 'priya.s@example.com',
        photo: null
    },
    {
        id: '3',
        name: 'Dr. Arun V.',
        designation: 'Health Officer',
        organization: 'City Hospital',
        location: { village: 'Kuvempunagar', taluk: 'Mysuru' },
        mobile: '+91 98765 43212',
        email: 'arun.v@example.com',
        photo: null
    },
    {
        id: '4',
        name: 'Sneha Patel',
        designation: 'Principal',
        organization: 'Global School',
        location: { village: 'Gokulam', taluk: 'Mysuru' },
        mobile: '+91 98765 43213',
        email: 'sneha.p@example.com',
        photo: null
    }
];

export const TourCreationWizard: React.FC = () => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [completedSteps, setCompletedSteps] = useState<number[]>([]);

    // Form State
    const [tourData, setTourData] = useState({
        title: '',
        type: 'Official Visit',
        startDate: '',
        startTime: '',
        duration: '2h',
        location: { name: '', address: '' },
        instructions: '',
        inviter: null as any,
        participants: [] as any[],
        notifications: {
            sms: true,
            whatsapp: true,
            email: false
        }
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [showQuickAdd, setShowQuickAdd] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [success, setSuccess] = useState(false);

    const steps = [
        { id: 1, label: 'Basic Info' },
        { id: 2, label: 'Location & Time' },
        { id: 3, label: 'Who Invited?' },
        { id: 4, label: 'Add Participants' },
        { id: 5, label: 'Notifications' },
        { id: 6, label: 'Review' },
    ];

    const handleNext = () => {
        if (currentStep < 6) {
            setCompletedSteps(prev => [...new Set([...prev, currentStep])]);
            setCurrentStep(currentStep + 1);
        } else {
            setShowConfirm(true);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const goToStep = (stepId: number) => {
        if (completedSteps.includes(stepId) || stepId <= Math.max(...completedSteps, 0) + 1) {
            setCurrentStep(stepId);
        }
    };

    // Step 3 & 4 Search Logic
    useEffect(() => {
        if (searchQuery.length >= 2) {
            const results = MOCK_CONTACTS.filter(c =>
                c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.mobile.includes(searchQuery)
            ).map(c => ({
                ...c,
                isBestMatch: c.name.toLowerCase().startsWith(searchQuery.toLowerCase())
            }));
            setSearchResults(results);
        } else {
            setSearchResults([]);
        }
    }, [searchQuery]);

    const selectInviter = (contact: any) => {
        setTourData({ ...tourData, inviter: contact });
        setSearchQuery('');
    };

    const addParticipant = (contact: any) => {
        if (!tourData.participants.find(p => p.id === contact.id)) {
            setTourData({ ...tourData, participants: [...tourData.participants, contact] });
        }
        setSearchQuery('');
    };

    const removeParticipant = (id: string) => {
        setTourData({ ...tourData, participants: tourData.participants.filter(p => p.id !== id) });
    };

    const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

    // Step Components
    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Basic Tour Information</h2>
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tour Title</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="e.g. Health Center Inspection - Ramnagar"
                                    value={tourData.title}
                                    onChange={e => setTourData({ ...tourData, title: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tour Type</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['Official Visit', 'Inspection', 'Inauguration', 'Community Meet'].map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setTourData({ ...tourData, type })}
                                            className={`px-4 py-3 rounded-2xl text-xs font-bold transition-all border ${tourData.type === type ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-white border-gray-100 text-gray-500 hover:border-primary/30'}`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">General Instructions</label>
                                <textarea
                                    rows={4}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-medium text-sm outline-none focus:ring-2 focus:ring-primary/20"
                                    placeholder="What should the team prepare for this tour?"
                                    value={tourData.instructions}
                                    onChange={e => setTourData({ ...tourData, instructions: e.target.value })}
                                />
                            </div>
                        </div>
                    </motion.div>
                );
            case 2:
                return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Location & Timing</h2>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Start Date</label>
                                    <input type="date" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm outline-none" value={tourData.startDate} onChange={e => setTourData({ ...tourData, startDate: e.target.value })} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Start Time</label>
                                    <input type="time" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm outline-none" value={tourData.startTime} onChange={e => setTourData({ ...tourData, startTime: e.target.value })} />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Venue / Location Name</label>
                                <input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm outline-none" placeholder="e.g. District Panchayat Office" value={tourData.location.name} onChange={e => setTourData({ ...tourData, location: { ...tourData.location, name: e.target.value } })} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Address</label>
                                <textarea rows={2} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl font-medium text-sm outline-none" placeholder="Enter complete address..." value={tourData.location.address} onChange={e => setTourData({ ...tourData, location: { ...tourData.location, address: e.target.value } })} />
                            </div>
                        </div>
                    </motion.div>
                );
            case 3:
                return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Who invited the MP?</h2>
                        <p className="text-sm text-gray-500 font-medium -mt-4">Search and select the primary organizer or inviter.</p>

                        {!tourData.inviter ? (
                            <div className="space-y-4">
                                <div className="relative group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                                    <input
                                        type="text"
                                        autoFocus
                                        className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-100 rounded-[1.5rem] font-bold text-sm outline-none focus:border-primary/30 transition-all"
                                        placeholder="Search by name, designation, or mobile..."
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                    />
                                </div>

                                {searchResults.length > 0 && (
                                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                        {searchResults.map(contact => (
                                            <button
                                                key={contact.id}
                                                onClick={() => selectInviter(contact)}
                                                className="w-full p-4 bg-white border border-gray-100 rounded-2xl flex items-center gap-4 hover:border-primary/30 hover:shadow-md transition-all text-left group"
                                            >
                                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black shrink-0">
                                                    {getInitials(contact.name)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-black text-gray-900 truncate tracking-tight">{contact.name}</p>
                                                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{contact.designation} • {contact.organization}</p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1 tracking-widest">{contact.location.village}</p>
                                                    <div className="flex items-center gap-1 text-[10px] font-bold text-primary">
                                                        <Phone size={10} /> {contact.mobile}
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {searchQuery.length >= 2 && searchResults.length === 0 && (
                                    <div className="text-center py-12 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                                        <p className="text-gray-400 font-bold mb-4">No contacts found matching "{searchQuery}"</p>
                                        <button onClick={() => setShowQuickAdd(true)} className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl mx-auto text-sm font-black text-primary hover:border-primary transition-all">
                                            <UserPlus size={18} /> Add New Contact
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-primary/5 border-2 border-primary/20 rounded-[2.5rem] p-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-6">
                                    <button onClick={() => setTourData({ ...tourData, inviter: null })} className="text-primary font-black text-[10px] uppercase tracking-widest hover:underline flex items-center gap-1">
                                        Change <ArrowRight size={12} />
                                    </button>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 rounded-full bg-white shadow-lg flex items-center justify-center text-primary font-black text-3xl">
                                        {getInitials(tourData.inviter.name)}
                                    </div>
                                    <div>
                                        <h4 className="text-2xl font-black text-gray-900 tracking-tighter">{tourData.inviter.name}</h4>
                                        <p className="text-sm font-bold text-primary mb-2 uppercase tracking-wide">{tourData.inviter.designation}</p>
                                        <div className="flex gap-4 text-xs font-semibold text-gray-500">
                                            <span className="flex items-center gap-1"><Phone size={14} className="text-gray-400" /> {tourData.inviter.mobile}</span>
                                            <span className="flex items-center gap-1"><MapPin size={14} className="text-gray-400" /> {tourData.inviter.location.village}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                );
            case 4:
                return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Add Participants</h2>
                            <span className="px-3 py-1 bg-primary text-white rounded-full text-[10px] font-black uppercase">{tourData.participants.length} Added</span>
                        </div>

                        <div className="space-y-4">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                                <input
                                    type="text"
                                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl font-bold text-sm outline-none transition-all focus:bg-white focus:ring-2 focus:ring-primary/10"
                                    placeholder="Add people to this tour..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                />
                            </div>

                            {/* Results list */}
                            {searchResults.length > 0 && (
                                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {searchResults.map(contact => (
                                        <button
                                            key={contact.id}
                                            onClick={() => addParticipant(contact)}
                                            className="w-full p-4 bg-white border border-gray-100 rounded-2xl flex items-center gap-4 hover:border-primary transition-all text-left"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-primary font-black shrink-0">
                                                {getInitials(contact.name)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className="font-bold text-gray-900 truncate">{contact.name}</p>
                                                    {contact.isBestMatch && (
                                                        <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-[8px] font-black uppercase rounded tracking-wider italic shrink-0">Best Match</span>
                                                    )}
                                                </div>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase">{contact.designation}</p>
                                            </div>
                                            <Plus size={16} className="text-gray-300" />
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Chips Row */}
                            {tourData.participants.length > 0 && (
                                <div className="space-y-3 pt-4">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Selected Team</label>
                                    <div className="flex flex-wrap gap-3">
                                        <AnimatePresence>
                                            {tourData.participants.map(p => (
                                                <motion.div
                                                    key={p.id}
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.8 }}
                                                    className="pl-1.5 pr-3 py-1.5 bg-white border border-gray-200 rounded-xl flex items-center gap-3 shadow-sm"
                                                >
                                                    <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary">
                                                        {getInitials(p.name)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-black text-gray-900 leading-none">{p.name}</p>
                                                        <p className="text-[9px] font-bold text-gray-400 uppercase mt-0.5">{p.designation}</p>
                                                    </div>
                                                    <button onClick={() => removeParticipant(p.id)} className="p-1 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-md transition-colors">
                                                        <X size={14} />
                                                    </button>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            )}

                            {searchQuery.length >= 2 && searchResults.length === 0 && (
                                <button onClick={() => setShowQuickAdd(true)} className="w-full py-4 border-2 border-dashed border-gray-100 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold text-gray-400 hover:text-primary hover:border-primary transition-all">
                                    <UserPlus size={18} /> Contact not found? Add new
                                </button>
                            )}
                        </div>
                    </motion.div>
                );
            case 5:
                return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Notification Preferences</h2>
                            <p className="text-sm text-gray-500 font-medium mt-1">Select the channels through which participants will be notified.</p>
                        </div>

                        <div className="grid gap-4">
                            {[
                                { id: 'sms', label: 'SMS Gateway', icon: ShieldCheck, color: 'blue' },
                                { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, color: 'green' },
                                { id: 'email', label: 'Email', icon: Mail, color: 'indigo' },
                            ].map(channel => (
                                <label key={channel.id} className={`flex items-center justify-between p-6 rounded-[2rem] border-2 transition-all cursor-pointer ${tourData.notifications[channel.id as keyof typeof tourData.notifications] ? 'bg-white border-primary shadow-lg shadow-primary/5' : 'bg-gray-50 border-transparent hover:border-gray-100'}`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${tourData.notifications[channel.id as keyof typeof tourData.notifications] ? 'bg-primary text-white' : 'bg-white text-gray-300'}`}>
                                            <channel.icon size={28} />
                                        </div>
                                        <div>
                                            <p className="font-black text-gray-900 tracking-tight">{channel.label}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Automated Dispatch</p>
                                        </div>
                                    </div>
                                    <div className="relative inline-flex items-center">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={tourData.notifications[channel.id as keyof typeof tourData.notifications]}
                                            onChange={() => setTourData({
                                                ...tourData,
                                                notifications: { ...tourData.notifications, [channel.id]: !tourData.notifications[channel.id as keyof typeof tourData.notifications] }
                                            })}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                    </div>
                                </label>
                            ))}
                        </div>

                        <div className="p-6 bg-slate-900 rounded-[2rem] text-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-primary">
                                    <Info size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-primary">Estimate</p>
                                    <p className="text-sm font-medium opacity-70">Calculation for {tourData.participants.length} unique participants</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-black text-primary">
                                    {Object.values(tourData.notifications).filter(Boolean).length * tourData.participants.length}
                                </p>
                                <p className="text-[9px] font-black uppercase opacity-50 tracking-[0.2em]">Total Messages</p>
                            </div>
                        </div>
                    </motion.div>
                );
            case 6:
                return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8 pb-8">
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Review & Confirm</h2>
                            <p className="text-sm text-gray-500 font-medium mt-1">Last look at everything before we schedule this tour.</p>
                        </div>

                        <div className="space-y-6">
                            {/* Simple Review Sections */}
                            {[
                                { step: 1, title: 'Basic Details', content: tourData.title || tourData.type },
                                { step: 2, title: 'Location & Time', content: `${tourData.startDate} at ${tourData.startTime} - ${tourData.location.name}` },
                                { step: 3, title: 'Invited By', content: tourData.inviter?.name || 'N/A' },
                            ].map(sec => (
                                <div key={sec.step} className="group p-5 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-200 hover:bg-white transition-all relative">
                                    <button onClick={() => setCurrentStep(sec.step)} className="absolute top-5 right-5 text-[10px] font-black text-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Edit</button>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{sec.title}</p>
                                    <p className="font-bold text-gray-900">{sec.content}</p>
                                </div>
                            ))}

                            {/* Participants Stacked Review */}
                            <div className="group p-5 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-200 hover:bg-white transition-all relative">
                                <button onClick={() => setCurrentStep(4)} className="absolute top-5 right-5 text-[10px] font-black text-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Edit</button>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Participants</p>
                                <div className="flex items-center gap-3">
                                    <div className="flex -space-x-3 overflow-hidden">
                                        {tourData.participants.slice(0, 5).map(p => (
                                            <div key={p.id} className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-primary text-white flex items-center justify-center text-[10px] font-black">
                                                {getInitials(p.name)}
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-sm font-bold text-gray-700">
                                        {tourData.participants.length} total participants
                                        {tourData.participants.length > 5 && <span className="text-gray-400 font-medium ml-1">and {tourData.participants.length - 5} others</span>}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                );
            default:
                return null;
        }
    };

    if (success) {
        return (
            <div className="max-w-4xl mx-auto py-12 px-4">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[3rem] p-12 text-center border border-gray-100 shadow-2xl">
                    <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-green-100">
                        <Check size={56} strokeWidth={3} />
                    </div>
                    <h1 className="text-4xl font-black text-gray-900 tracking-tighter mb-4">Tour Scheduled!</h1>
                    <div className="max-w-xs mx-auto space-y-2 mb-10">
                        <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">Confirmation ID</p>
                        <p className="text-3xl font-black text-slate-800 tracking-widest bg-slate-50 py-3 rounded-2xl border border-slate-100">TOUR-5892</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-10">
                        <div className="p-4 bg-gray-50 rounded-2xl">
                            <p className="text-2xl font-black text-gray-900">{tourData.participants.length}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Recipients</p>
                        </div>
                        <div className="p-4 bg-gray-50 rounded-2xl">
                            <p className="text-2xl font-black text-green-600">SENT</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Notifications</p>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button onClick={() => navigate('/pa/tours')} className="w-full sm:w-auto px-10 py-4 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-105 transition-all">View Tour Details</button>
                        <button onClick={() => window.location.reload()} className="w-full sm:w-auto px-10 py-4 bg-white border-2 border-primary text-primary rounded-2xl font-black text-sm hover:bg-primary/5 transition-all">Schedule Another</button>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="max-w-[1200px] mx-auto py-8 px-4 flex flex-col lg:flex-row gap-12 min-h-[700px]">
            {/* Sidebar Navigation */}
            <div className="lg:w-72 shrink-0">
                <button
                    onClick={() => navigate('/pa/tours')}
                    className="flex items-center gap-2 mb-12 text-sm font-bold text-gray-400 hover:text-primary transition-colors group"
                >
                    <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    Discard & Exit
                </button>

                <div className="space-y-4">
                    {steps.map(step => (
                        <button
                            key={step.id}
                            onClick={() => goToStep(step.id)}
                            disabled={!completedSteps.includes(step.id) && currentStep !== step.id && step.id > Math.max(...completedSteps, 0) + 1}
                            className={`w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${currentStep === step.id ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : completedSteps.includes(step.id) ? 'bg-white border-primary/20 text-primary' : 'bg-transparent border-transparent text-gray-300'}`}
                        >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-[12px] border-2 transition-all ${currentStep === step.id ? 'bg-white text-primary border-white' : completedSteps.includes(step.id) ? 'bg-primary text-white border-primary' : 'bg-transparent border-gray-200'}`}>
                                {completedSteps.includes(step.id) && currentStep !== step.id ? <Check size={14} strokeWidth={4} /> : step.id}
                            </div>
                            <span className="font-black tracking-tight text-sm uppercase">{step.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 max-w-[700px]">
                <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-slate-200/50 flex flex-col min-h-[600px] overflow-hidden">
                    <div className="flex-1 p-8 md:p-12">
                        {renderStep()}
                    </div>

                    {/* Navigation Footer */}
                    <div className="p-8 border-t border-gray-50 bg-gray-50/30 flex justify-between items-center bg-transparent">
                        <button
                            disabled={currentStep === 1}
                            onClick={handleBack}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all ${currentStep === 1 ? 'opacity-0' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <ChevronLeft size={18} />
                            Previous Step
                        </button>

                        <button
                            onClick={handleNext}
                            className={`flex items-center gap-3 px-10 py-4 rounded-2xl font-black text-sm transition-all hover:scale-[1.02] active:scale-95 shadow-xl ${currentStep === 6 ? 'bg-green-600 text-white shadow-green-200' : 'bg-primary text-white shadow-primary/20'}`}
                        >
                            {currentStep === 6 ? 'Finalize & Schedule' : 'Continue'}
                            {currentStep !== 6 && <ChevronRight size={18} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Confirmation Dialog */}
            <AnimatePresence>
                {showConfirm && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" onClick={() => setShowConfirm(false)} />
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white rounded-[2.5rem] p-10 max-w-sm w-full text-center shadow-2xl">
                            <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
                                <Send size={32} />
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2">Ready to Schedule?</h3>
                            <p className="text-gray-500 font-medium mb-8">
                                This will notify <span className="text-primary font-black">{tourData.participants.length}</span> participants via
                                <span className="text-primary font-black ml-1">
                                    {Object.entries(tourData.notifications).filter(([_, v]) => v).map(([k]) => k.toUpperCase()).join(' & ')}
                                </span>.
                            </p>
                            <div className="space-y-3">
                                <button onClick={() => { setShowConfirm(false); setSuccess(true); }} className="w-full py-4 bg-primary text-white rounded-2xl font-black hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">Yes, Proceed Now</button>
                                <button onClick={() => setShowConfirm(false)} className="w-full py-4 text-sm font-bold text-gray-400 hover:text-gray-600">Cancel</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Quick Add Modal (Placeholder) */}
            <AnimatePresence>
                {showQuickAdd && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" onClick={() => setShowQuickAdd(false)} />
                        <motion.div
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 50, opacity: 0 }}
                            className="relative bg-white rounded-[3rem] p-10 max-w-xl w-full shadow-2xl overflow-hidden"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h3 className="text-3xl font-black text-gray-900 tracking-tighter italic">Quick Add Contact</h3>
                                <button onClick={() => setShowQuickAdd(false)} className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-primary transition-all"><X size={20} /></button>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Name</label>
                                    <input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm outline-none" defaultValue={searchQuery} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mobile Number</label>
                                    <input type="text" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm outline-none" placeholder="+91" />
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <button onClick={() => setShowQuickAdd(false)} className="flex-1 py-4 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">Save & Add to Tour</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TourCreationWizard;
