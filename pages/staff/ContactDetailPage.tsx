import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  Phone, 
  MessageCircle, 
  Mail, 
  Edit2, 
  Trash2, 
  Star, 
  Share2, 
  MapPin, 
  Calendar, 
  Tag, 
  User, 
  Clock, 
  Plus, 
  Send,
  ChevronDown,
  ExternalLink,
  History,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Button } from '../../components/UI/Button';
import { Contact } from '../../types';

// --- Mock Data ---

const MOCK_CONTACTS: Record<string, Contact> = {
  '1': {
    id: '1',
    name: 'Dr. Rajesh Kumar',
    designation: 'District Magistrate',
    organization: 'District Administration',
    category: 'Government Official',
    state: 'Karnataka',
    zilla: 'Mysuru',
    taluk: 'Mysuru',
    gp: 'City',
    village: 'Mysuru',
    fullAddress: '#12, Officers Colony, Nazarbad, Mysuru - 570010',
    mobile: '9876543210',
    altMobile: '0821-2421234',
    whatsapp: '9876543210',
    email: 'dm.mysuru@gov.in',
    isVip: true,
    photoUrl: 'https://picsum.photos/seed/rajesh/400/400',
    dob: '1978-05-15',
    anniversary: '2005-11-20',
    tags: ['Influencer', 'Key Official', 'Mysuru District'],
    notes: 'Very supportive of local development initiatives. Prefers morning meetings.',
    createdBy: 'Admin Staff',
    createdAt: '2024-01-15',
  },
  '2': {
    id: '2',
    name: 'Smt. Lakshmi Devi',
    designation: 'GP President',
    organization: 'Rampur Gram Panchayat',
    category: 'Political Leader',
    state: 'Karnataka',
    zilla: 'Mysuru',
    taluk: 'Hunsur',
    gp: 'Rampur',
    village: 'Rampur',
    mobile: '9876543211',
    email: 'lakshmi.gp@gmail.com',
    isVip: false,
    createdAt: '2024-02-10',
  }
};

const MOCK_TOURS = [
  { id: 't1', name: 'Rampur Village Development Inspection', date: '2024-02-15', role: 'Host' },
  { id: 't2', name: 'Hunsur Taluk Public Outreach', date: '2024-01-20', role: 'Participant' },
];

const MOCK_GREETINGS = [
  { id: 'g1', event: 'Birthday', date: '2024-05-15', channel: 'WhatsApp', status: 'Delivered' },
  { id: 'g2', event: 'New Year', date: '2024-01-01', channel: 'SMS', status: 'Sent' },
  { id: 'g3', event: 'Anniversary', date: '2023-11-20', channel: 'Email', status: 'Opened' },
];

// --- Sub-components ---

const InfoItem: React.FC<{ label: string; value: React.ReactNode; icon?: any }> = ({ label, value, icon: Icon }) => (
  <div className="space-y-1.5 group">
    <div className="flex items-center gap-2">
      {Icon && <Icon className="w-3.5 h-3.5 text-slate-400" />}
      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
    </div>
    <div className="text-sm font-bold text-slate-900 break-words">
      {value || <span className="text-slate-300 italic font-medium">Not provided</span>}
    </div>
  </div>
);

const AccordionSection: React.FC<{ title: string; icon: any; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, icon: Icon, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-200 rounded-[2rem] bg-white overflow-hidden shadow-sm">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Icon className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight">{title}</h3>
        </div>
        <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-6 pt-0 border-t border-slate-50">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const ContactDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'tours' | 'greetings' | 'contacted'>('tours');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const contact = useMemo(() => (id ? MOCK_CONTACTS[id] : null), [id]);

  if (!contact) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-20 h-20 bg-red-50 text-red-600 rounded-3xl flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">Contact Not Found</h2>
        <p className="text-slate-500 mt-2 mb-8">The contact you are looking for does not exist or has been removed.</p>
        <Button onClick={() => navigate('/staff/contacts')}>Back to Contacts</Button>
      </div>
    );
  }

  const initials = contact.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  const handleExportVCard = () => {
    console.log('Exporting vCard for:', contact.name);
    // Logic to generate and download .vcf file
  };

  return (
    <div className="max-w-6xl mx-auto pb-20 space-y-8">
      {/* Header / Back Navigation */}
      <header className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/staff/contacts')}
          className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-black text-xs uppercase tracking-widest transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to List
        </button>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="rounded-xl" onClick={handleExportVCard}>
            <Share2 className="w-4 h-4 mr-2" /> Export vCard
          </Button>
          <Button variant="outline" size="sm" className="rounded-xl" onClick={() => navigate(`/staff/contacts/edit/${contact.id}`)}>
            <Edit2 className="w-4 h-4 mr-2" /> Edit
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-xl text-red-600 border-red-100 hover:bg-red-50"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" /> Delete
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-white rounded-[3rem] border border-slate-200 shadow-sm overflow-hidden p-8 md:p-12 relative">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-indigo-600 to-blue-600 opacity-5" />
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
          <div className="relative">
            {contact.photoUrl ? (
              <img 
                src={contact.photoUrl} 
                alt={contact.name} 
                className="w-40 h-40 rounded-[2.5rem] object-cover border-4 border-white shadow-2xl"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-40 h-40 rounded-[2.5rem] bg-indigo-50 flex items-center justify-center text-indigo-600 font-black text-5xl border-4 border-white shadow-2xl">
                {initials}
              </div>
            )}
            {contact.isVip && (
              <div className="absolute -top-3 -right-3 w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-lg border-4 border-white" title="VIP Contact">
                <Star className="w-6 h-6 fill-current" />
              </div>
            )}
          </div>

          <div className="flex-1 text-center md:text-left space-y-4">
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter">{contact.name}</h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-2">
                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-black uppercase tracking-widest">
                  {contact.designation}
                </span>
                <span className="text-slate-400 font-bold">•</span>
                <span className="text-slate-500 font-bold">{contact.organization}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
              <Button className="rounded-2xl px-6 py-3 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100" onClick={() => window.open(`tel:${contact.mobile}`)}>
                <Phone className="w-4 h-4 mr-2" /> Call Now
              </Button>
              <Button variant="outline" className="rounded-2xl px-6 py-3 border-green-200 text-green-600 hover:bg-green-50" onClick={() => window.open(`https://wa.me/${contact.mobile.replace(/\D/g, '')}`)}>
                <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
              </Button>
              <Button variant="outline" className="rounded-2xl px-6 py-3 border-blue-200 text-blue-600 hover:bg-blue-50" onClick={() => window.open(`mailto:${contact.email}`)}>
                <Mail className="w-4 h-4 mr-2" /> Email
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Info Grid & History */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Details */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Info Accordion */}
          <AccordionSection title="Contact Information" icon={User}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8 mt-6">
              <InfoItem label="Primary Mobile" value={contact.mobile} icon={Phone} />
              <InfoItem label="Alternate Mobile" value={contact.altMobile} icon={Phone} />
              <InfoItem label="Email Address" value={contact.email} icon={Mail} />
              <InfoItem label="WhatsApp" value={contact.whatsapp || contact.mobile} icon={MessageCircle} />
              <InfoItem label="Category" value={contact.category} icon={Tag} />
              <InfoItem label="VIP Status" value={contact.isVip ? 'Yes (Priority)' : 'No'} icon={Star} />
              <InfoItem label="Date of Birth" value={contact.dob} icon={Calendar} />
              <InfoItem label="Anniversary" value={contact.anniversary} icon={Calendar} />
            </div>
          </AccordionSection>

          {/* Location Accordion */}
          <AccordionSection title="Location & Address" icon={MapPin}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8 mt-6">
              <InfoItem label="State" value={contact.state} />
              <InfoItem label="Zilla / District" value={contact.zilla} />
              <InfoItem label="Taluk" value={contact.taluk} />
              <InfoItem label="Gram Panchayat" value={contact.gp} />
              <InfoItem label="Village" value={contact.village} />
              <div className="sm:col-span-2">
                <InfoItem label="Full Address" value={contact.fullAddress} icon={MapPin} />
              </div>
            </div>
          </AccordionSection>

          {/* Additional Info Accordion */}
          <AccordionSection title="Notes & Metadata" icon={Clock}>
            <div className="space-y-8 mt-6">
              <div className="space-y-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tags</span>
                <div className="flex flex-wrap gap-2">
                  {contact.tags?.map(tag => (
                    <span key={tag} className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-black border border-indigo-100">
                      {tag}
                    </span>
                  )) || <span className="text-slate-300 italic text-xs">No tags added</span>}
                </div>
              </div>
              <InfoItem label="Internal Notes" value={contact.notes} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4 border-t border-slate-50">
                <InfoItem label="Created By" value={contact.createdBy} />
                <InfoItem label="Created Date" value={contact.createdAt} />
              </div>
            </div>
          </AccordionSection>
        </div>

        {/* Right Column: History & Quick Actions */}
        <div className="space-y-8">
          {/* Quick Actions Card */}
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl shadow-indigo-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-2xl" />
            <h3 className="text-xl font-black tracking-tight mb-6">Engagement</h3>
            <div className="space-y-4">
              <Button fullWidth className="rounded-2xl py-4 bg-white text-slate-900 hover:bg-slate-100 border-none shadow-lg">
                <Plus className="w-4 h-4 mr-2" /> Add to Tour
              </Button>
              <Button fullWidth variant="outline" className="rounded-2xl py-4 border-white/20 text-white hover:bg-white/10">
                <Send className="w-4 h-4 mr-2" /> Send Greeting
              </Button>
            </div>
            <div className="mt-8 pt-8 border-t border-white/10">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                <span>Last Contacted</span>
                <span className="text-white">2 days ago</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Greeting sent via WhatsApp</span>
              </div>
            </div>
          </div>

          {/* History Tabs */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[500px]">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center gap-2 mb-4">
                <History className="w-5 h-5 text-indigo-600" />
                <h3 className="font-black text-slate-900 tracking-tight">Activity History</h3>
              </div>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                {(['tours', 'greetings'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                      activeTab === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <AnimatePresence mode="wait">
                {activeTab === 'tours' ? (
                  <motion.div
                    key="tours"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-4"
                  >
                    {MOCK_TOURS.map(tour => (
                      <div key={tour.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{tour.role}</span>
                          <span className="text-[10px] font-bold text-slate-400">{tour.date}</span>
                        </div>
                        <h4 className="text-sm font-black text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">
                          {tour.name}
                        </h4>
                        <button className="mt-3 flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">
                          View Tour <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="greetings"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="space-y-4"
                  >
                    {MOCK_GREETINGS.map(greeting => (
                      <div key={greeting.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{greeting.event}</span>
                          <span className="text-[10px] font-bold text-slate-400">{greeting.date}</span>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                            {greeting.channel === 'WhatsApp' && <MessageCircle className="w-3 h-3" />}
                            {greeting.channel === 'SMS' && <Phone className="w-3 h-3" />}
                            {greeting.channel === 'Email' && <Mail className="w-3 h-3" />}
                            {greeting.channel}
                          </div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{greeting.status}</span>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setShowDeleteConfirm(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden relative z-10"
            >
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Delete Contact?</h3>
                <p className="text-slate-500 mt-2">
                  Are you sure you want to delete <span className="font-black text-slate-900">{contact.name}</span>? This action cannot be undone.
                </p>
                <div className="mt-8 flex gap-3">
                  <Button
                    variant="outline"
                    fullWidth
                    className="rounded-2xl py-4"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    fullWidth
                    className="rounded-2xl py-4 bg-red-600 hover:bg-red-700 text-white border-red-600"
                    onClick={() => {
                      console.log('Deleting:', contact.id);
                      navigate('/staff/contacts');
                    }}
                  >
                    Delete Contact
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
