import React, { useState, useEffect } from 'react';
import {
    Phone,
    MessageCircle,
    Mail,
    Edit2,
    Trash2,
    Star,
    Download,
    MapPin,
    Calendar,
    Tag,
    FileText,
    User,
    ChevronLeft,
    ChevronRight,
    Plus,
    Send,
    MoreVertical,
    History,
    CheckCircle2,
    Clock
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Contact } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { contactsApi } from '../../hooks/useContacts';

export const ContactDetailPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState<'tours' | 'greetings' | 'history'>('tours');
    const [openSections, setOpenSections] = useState({
        info: true,
        notes: true,
        engagement: true
    });
    const [contact, setContact] = useState<Contact | null>(null);

    useEffect(() => {
        if (!id) return;
        contactsApi.getById(id).then(({ data }: { data: any }) => {
            if (data) setContact({
                id: data.contact_id,
                name: data.full_name,
                designation: data.designation ?? '',
                organization: data.organization ?? '',
                state: data.state ?? '',
                zilla: data.zilla ?? '',
                taluk: data.taluk ?? '',
                gp: data.gram_panchayat ?? '',
                village: data.village ?? '',
                mobile: data.mobile ?? '',
                email: data.email ?? undefined,
                category: data.category ?? 'OTHER',
                isVip: data.is_vip ?? false,
                createdAt: data.created_at ?? '',
                birthday: data.birthday ?? undefined,
                anniversary: data.anniversary ?? undefined,
                notes: data.notes ?? undefined,
            });
        });
    }, [id]);

    const toggleSection = (section: keyof typeof openSections) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    if (!contact) return <div className="p-8 text-center text-slate-400">Loading contact...</div>;

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    const handleAction = (type: string) => {
        console.log(`Action: ${type} for contact ${contact.id}`);
        // Implement specific logic for each action
        if (type === 'edit') navigate(`/staff/contacts/edit/${contact.id}`);
    };

    const InfoItem = ({ icon: Icon, label, value, fullWidth = false }: { icon: any, label: string, value: string | React.ReactNode, fullWidth?: boolean }) => (
        <div className={`p-4 bg-gray-50 rounded-2xl border border-gray-100/50 flex flex-col gap-1 ${fullWidth ? 'md:col-span-2' : ''}`}>
            <div className="flex items-center gap-2 text-gray-400">
                <Icon size={14} className="shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
            </div>
            <div className="text-sm font-semibold text-gray-900 truncate">
                {value || <span className="text-gray-300 italic font-normal">Not provided</span>}
            </div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
            {/* Header / Back */}
            <div className="flex items-center justify-between mb-8">
                <button
                    onClick={() => navigate('/staff/contacts')}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:border-primary hover:text-primary transition-all shadow-sm group"
                >
                    <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Contact Book
                </button>
                <div className="flex gap-2">
                    <button onClick={() => handleAction('edit')} className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-primary hover:border-primary transition-all shadow-sm">
                        <Edit2 size={20} />
                    </button>
                    <button className="p-2.5 bg-white border border-red-100 rounded-xl text-red-400 hover:bg-red-50 hover:text-red-600 transition-all shadow-sm">
                        <Trash2 size={20} />
                    </button>
                </div>
            </div>

            {/* Hero Section */}
            <div className="relative overflow-hidden bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-slate-200/50 mb-8">
                {/* Decorative Background */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent -z-10"></div>

                <div className="p-8 md:p-12">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                        {/* Profile Image */}
                        <div className="relative shrink-0">
                            {contact.photoUrl ? (
                                <img src={contact.photoUrl} alt={contact.name} className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-white shadow-xl" />
                            ) : (
                                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-primary/10 flex items-center justify-center border-4 border-white shadow-xl">
                                    <span className="text-4xl md:text-5xl font-black text-primary">{getInitials(contact.name)}</span>
                                </div>
                            )}
                            {contact.isVip && (
                                <div className="absolute -top-2 -right-2 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center border-4 border-white shadow-lg text-white" title="VIP Contact">
                                    <Star size={20} fill="currentColor" />
                                </div>
                            )}
                        </div>

                        {/* Identity */}
                        <div className="flex-1 text-center md:text-left pt-4">
                            <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight mb-2">
                                {contact.name}
                            </h1>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-6">
                                <span className="px-4 py-1.5 bg-slate-900 text-white rounded-full text-xs font-bold uppercase tracking-wider">
                                    {contact.designation}
                                </span>
                                <span className="text-gray-500 font-semibold">
                                    {contact.organization}
                                </span>
                            </div>

                            {/* Actions Row */}
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                <button onClick={() => window.open(`tel:${contact.mobile}`)} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all hover:scale-105 active:scale-95">
                                    <Phone size={18} />
                                    Call
                                </button>
                                <button onClick={() => window.open(`https://wa.me/${contact.mobile.replace(/\D/g, '')}`)} className="flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-2xl font-bold shadow-lg shadow-green-500/20 hover:bg-green-600 transition-all hover:scale-105 active:scale-95">
                                    <MessageCircle size={18} />
                                    WhatsApp
                                </button>
                                <button onClick={() => contact.email && window.open(`mailto:${contact.email}`)} className="p-3 bg-gray-100 text-gray-600 rounded-2xl hover:bg-gray-200 transition-all">
                                    <Mail size={20} />
                                </button>
                                <button className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-200 text-gray-700 rounded-2xl font-bold hover:bg-gray-50 transition-all">
                                    <Download size={18} />
                                    Export vCard
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Details */}
                <div className="lg:col-span-2 space-y-8">
                    <section className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
                        <button
                            onClick={() => toggleSection('info')}
                            className="w-full flex items-center justify-between lg:cursor-default"
                        >
                            <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                                Contact Information
                            </h3>
                            <div className="lg:hidden text-gray-400">
                                <ChevronRight size={20} className={`transition-transform duration-300 ${openSections.info ? 'rotate-90' : ''}`} />
                            </div>
                        </button>

                        <AnimatePresence initial={false}>
                            {(openSections.info || window.innerWidth >= 1024) && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden mt-6"
                                >
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <InfoItem icon={Phone} label="Primary Mobile" value={contact.mobile} />
                                        <InfoItem icon={Phone} label="Alternate Mobile" value="" />
                                        <InfoItem icon={Mail} label="Email Address" value={contact.email} />
                                        <InfoItem icon={MessageCircle} label="WhatsApp" value={contact.mobile} />
                                        <InfoItem icon={MapPin} label="Location" value={`${contact.village}, ${contact.taluk}, ${contact.zilla}`} fullWidth />
                                        <InfoItem icon={FileText} label="Address" value="123 Revenue Colony, Main Road, Mysuru" fullWidth />
                                        <InfoItem icon={Calendar} label="Date of Birth" value={contact.birthday} />
                                        <InfoItem icon={Calendar} label="Anniversary" value={contact.anniversary} />
                                        <InfoItem icon={Tag} label="Category" value={contact.category} />
                                        <InfoItem icon={Star} label="VIP Status" value={contact.isVip ? "Active" : "Regular"} />
                                        <InfoItem icon={User} label="Created By" value="Admin Staff" />
                                        <InfoItem icon={Clock} label="Created Date" value={contact.createdAt ? new Date(contact.createdAt).toLocaleDateString() : ''} />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </section>

                    <section className="bg-white rounded-[2rem] border border-gray-100 p-8 shadow-sm">
                        <button
                            onClick={() => toggleSection('notes')}
                            className="w-full flex items-center justify-between lg:cursor-default"
                        >
                            <h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
                                <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                                Internal Notes & Tags
                            </h3>
                            <div className="lg:hidden text-gray-400">
                                <ChevronRight size={20} className={`transition-transform duration-300 ${openSections.notes ? 'rotate-90' : ''}`} />
                            </div>
                        </button>

                        <AnimatePresence initial={false}>
                            {(openSections.notes || window.innerWidth >= 1024) && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden mt-6"
                                >
                                    <div className="space-y-6">
                                        <div className="flex flex-wrap gap-2">
                                            {['Key Influencer', 'Frequent Visitor', 'Supporter'].map(tag => (
                                                <span key={tag} className="px-3 py-1.5 bg-primary/5 text-primary border border-primary/10 rounded-xl text-xs font-bold uppercase tracking-tight">
                                                    {tag}
                                                </span>
                                            ))}
                                            <button className="px-3 py-1.5 bg-gray-50 border border-dashed border-gray-300 rounded-xl text-xs font-bold text-gray-400 hover:border-primary hover:text-primary transition-all">
                                                + Add Tag
                                            </button>
                                        </div>
                                        <div className="p-5 bg-yellow-50/50 rounded-2xl border border-yellow-100 text-sm text-gray-700 leading-relaxed italic">
                                            "Highly influential in the local community. Prefers communication via WhatsApp for urgent matters."
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </section>
                </div>

                {/* Right Column: History & Actions */}
                <div className="space-y-8">
                    <section className="bg-white rounded-[2rem] border border-gray-100 p-6 shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between mb-6">
                            <button
                                onClick={() => toggleSection('engagement')}
                                className="flex items-center gap-2 lg:cursor-default"
                            >
                                <h3 className="text-lg font-black text-gray-900 uppercase tracking-tighter">Engagement</h3>
                                <div className="lg:hidden text-gray-400">
                                    <ChevronRight size={18} className={`transition-transform duration-300 ${openSections.engagement ? 'rotate-90' : ''}`} />
                                </div>
                            </button>
                            <div className="flex bg-gray-100 p-1 rounded-xl">
                                {(['tours', 'greetings', 'history'] as const).map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${activeTab === tab ? 'bg-white text-primary shadow-sm' : 'text-gray-400 hover:text-gray-600'
                                            }`}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <AnimatePresence initial={false}>
                            {(openSections.engagement || window.innerWidth >= 1024) && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="min-h-[250px]">
                                        <AnimatePresence mode="wait">
                                            {activeTab === 'tours' && (
                                                <motion.div
                                                    key="tours"
                                                    initial={{ opacity: 0, scale: 0.98 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.98 }}
                                                    className="space-y-4"
                                                >
                                                    {[
                                                        { name: 'Rural Development Tour', date: 'Jan 15, 2026' },
                                                        { name: 'Inauguration Ceremony', date: 'Dec 10, 2025' }
                                                    ].map((tour, i) => (
                                                        <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-gray-100">
                                                            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-primary">
                                                                <MapPin size={18} />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-bold text-gray-900 tracking-tight">{tour.name}</p>
                                                                <p className="text-[10px] text-gray-500 font-semibold">{tour.date}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <button className="w-full py-4 border-2 border-dashed border-gray-100 rounded-[1.5rem] flex items-center justify-center gap-2 text-xs font-bold text-gray-400 hover:border-primary hover:text-primary transition-all">
                                                        <Plus size={16} /> Add to Tour
                                                    </button>
                                                </motion.div>
                                            )}

                                            {activeTab === 'greetings' && (
                                                <motion.div
                                                    key="greetings"
                                                    initial={{ opacity: 0, x: 10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    exit={{ opacity: 0, x: -10 }}
                                                    className="space-y-4"
                                                >
                                                    {[
                                                        { type: 'Birthday Wish', channel: 'WhatsApp', date: 'May 15, 2025' },
                                                        { type: 'Diwali Greeting', channel: 'SMS', date: 'Nov 01, 2025' }
                                                    ].map((g, i) => (
                                                        <div key={i} className="flex items-center gap-3 p-3 bg-pink-50/50 rounded-2xl border border-pink-100/50">
                                                            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-pink-500">
                                                                <Star size={18} />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-bold text-gray-900 tracking-tight">{g.type}</p>
                                                                <p className="text-[10px] text-gray-500 font-semibold">{g.date} via {g.channel}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <button className="w-full py-4 bg-primary text-white rounded-[1.5rem] flex items-center justify-center gap-2 text-xs font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
                                                        <Send size={16} /> Send Greeting
                                                    </button>
                                                </motion.div>
                                            )}

                                            {activeTab === 'history' && (
                                                <motion.div
                                                    key="history"
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="space-y-4"
                                                >
                                                    <div className="flex items-start gap-3 relative pb-6 border-l-2 border-gray-100 ml-3 pl-6">
                                                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary border-4 border-white"></div>
                                                        <div>
                                                            <p className="text-xs font-bold text-gray-900">Modified by Office Staff</p>
                                                            <p className="text-[10px] text-gray-400 mb-2">2 days ago</p>
                                                            <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">Updated location details and added 'Supporter' tag.</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start gap-3 relative ml-3 pl-6">
                                                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-gray-200 border-4 border-white"></div>
                                                        <div>
                                                            <p className="text-xs font-bold text-gray-900">Contact Created</p>
                                                            <p className="text-[10px] text-gray-400">Oct 01, 2025</p>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default ContactDetailPage;
