
import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  MapPin, 
  Users, 
  MessageSquare, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Search, 
  X, 
  Plus, 
  Clock, 
  AlertCircle,
  Phone,
  Mail,
  Smartphone,
  Check
} from 'lucide-react';
import { Button } from '../../components/UI/Button';
import { Card } from '../../components/UI/Card';
import { contactsApi } from '../../hooks/useContacts';
import { Contact, TourPackage, Destination } from '../../types';

const STEPS = [
  { id: 1, label: 'Basic Info' },
  { id: 2, label: 'Destinations' },
  { id: 3, label: 'Person Who Invited' },
  { id: 4, label: 'Add Participants' },
  { id: 5, label: 'Notification Preferences' },
  { id: 6, label: 'Review & Schedule' },
];

const MOCK_PACKAGES: TourPackage[] = [
  { id: 'pkg-1', name: 'Flood Relief Visit', description: 'Standard visit for flood affected zones', standardDuration: '4 hours', activities: ['Relief distribution', 'Inspection'], resources: ['4x4 Vehicle', 'Medical Kit'], status: 'Active', mappedDestinationIds: ['dest-1'] },
  { id: 'pkg-2', name: 'School Inauguration', description: 'Ceremonial opening of new educational facilities', standardDuration: '2 hours', activities: ['Ribbon cutting', 'Interaction with students'], resources: ['PA System', 'Protocol Staff'], status: 'Active', mappedDestinationIds: ['dest-2'] }
];

const MOCK_DESTINATIONS: Destination[] = [
  { id: 'dest-1', name: 'Rampur Village', district: 'North District', block: 'North Block', village: 'Rampur', contactPerson: 'Sarpanch Singh', contactPhone: '9876543210', accessibility: 'Easy' },
  { id: 'dest-2', name: 'Shyampur Primary School', district: 'East District', block: 'East Block', village: 'Shyampur', contactPerson: 'Headmaster Ali', contactPhone: '9876543211', accessibility: 'Moderate' }
];

export const ScheduleTourWizard: React.FC = () => {
  const navigate = useNavigate();
  const [allContacts, setAllContacts] = useState<Contact[]>([]);
  useEffect(() => {
    contactsApi.list().then(({ data }: any) => {
      if (data) setAllContacts(data.map((r: any) => ({
        id: r.contact_id, name: r.full_name, designation: r.designation ?? '',
        organization: r.organization ?? '', category: r.category ?? 'Other',
        state: r.state ?? '', zilla: r.zilla ?? '', taluk: r.location_taluk ?? '',
        gp: r.gram_panchayat ?? '', village: r.location_village ?? '',
        mobile: r.mobile ?? '', email: r.email ?? undefined, isVip: r.is_vip ?? false,
        createdAt: r.created_at?.split('T')[0] ?? '',
      })));
    });
  }, []);
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  
  // Form State
  const [formData, setFormData] = useState({
    tourName: '',
    date: '',
    startTime: '',
    packageId: '',
    selectedDestinations: [] as string[],
    inviterId: '',
    participants: [] as Contact[],
    notifications: {
      sms: true,
      whatsapp: true,
      email: false
    }
  });

  // Search States
  const [inviterSearch, setInviterSearch] = useState('');
  const [participantSearch, setParticipantSearch] = useState('');
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [tourId] = useState(() => `TR-${Math.floor(Math.random() * 9000) + 1000}`);

  const handleNext = () => {
    if (currentStep < 6) {
      setCompletedSteps([...new Set([...completedSteps, currentStep])]);
      setCurrentStep(currentStep + 1);
    } else {
      setIsSuccess(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step: number) => {
    if (step < currentStep || completedSteps.includes(step - 1)) {
      setCurrentStep(step);
    }
  };

  // Step 3 Search
  const inviterResults = useMemo(() => {
    if (!inviterSearch || inviterSearch.length < 2) return [];
    return allContacts.filter(c => 
      c.name.toLowerCase().includes(inviterSearch.toLowerCase()) ||
      c.mobile.includes(inviterSearch)
    );
  }, [inviterSearch]);

  const selectedInviter = allContacts.find(c => c.id === formData.inviterId);

  // Step 4 Search
  const participantResults = useMemo(() => {
    if (!participantSearch || participantSearch.length < 2) return [];
    return allContacts.filter(c => 
      (c.name.toLowerCase().includes(participantSearch.toLowerCase()) ||
      c.mobile.includes(participantSearch)) &&
      !formData.participants.find(p => p.id === c.id)
    );
  }, [participantSearch, formData.participants]);

  const addParticipant = (contact: Contact) => {
    setFormData({
      ...formData,
      participants: [...formData.participants, contact]
    });
    setParticipantSearch('');
  };

  const removeParticipant = (id: string) => {
    setFormData({
      ...formData,
      participants: formData.participants.filter(p => p.id !== id)
    });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Basic Information</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tour Name / Purpose</label>
                <input 
                  type="text" 
                  value={formData.tourName}
                  onChange={(e) => setFormData({...formData, tourName: e.target.value})}
                  placeholder="e.g. Village Development Review"
                  className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none transition-all font-bold"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</label>
                  <input 
                    type="date" 
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none transition-all font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Start Time</label>
                  <input 
                    type="time" 
                    value={formData.startTime}
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                    className="w-full px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none transition-all font-bold"
                  />
                </div>
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Destinations</h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Tour Package</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {MOCK_PACKAGES.map(pkg => (
                    <button
                      key={pkg.id}
                      onClick={() => setFormData({...formData, packageId: pkg.id})}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${
                        formData.packageId === pkg.id ? 'bg-indigo-50 border-indigo-500' : 'bg-white border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <h4 className="font-black text-slate-900">{pkg.name}</h4>
                      <p className="text-xs text-slate-500 mt-1">{pkg.description}</p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Destinations</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {MOCK_DESTINATIONS.map(dest => (
                    <button
                      key={dest.id}
                      onClick={() => {
                        const selected = formData.selectedDestinations.includes(dest.id)
                          ? formData.selectedDestinations.filter(id => id !== dest.id)
                          : [...formData.selectedDestinations, dest.id];
                        setFormData({...formData, selectedDestinations: selected});
                      }}
                      className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${
                        formData.selectedDestinations.includes(dest.id) ? 'bg-indigo-50 border-indigo-500' : 'bg-white border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <div>
                        <h4 className="font-black text-slate-900">{dest.name}</h4>
                        <p className="text-xs text-slate-500 mt-1">{dest.village}, {dest.block}</p>
                      </div>
                      {formData.selectedDestinations.includes(dest.id) && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Person Who Invited</h3>
            <p className="text-slate-500 font-medium">Who invited the MP / Primary Organizer?</p>
            
            <div className="space-y-4">
              {!formData.inviterId ? (
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text"
                    value={inviterSearch}
                    onChange={(e) => setInviterSearch(e.target.value)}
                    placeholder="Search by name or mobile..."
                    className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none transition-all font-bold"
                  />
                  
                  <AnimatePresence>
                    {inviterResults.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden"
                      >
                        {inviterResults.map(contact => (
                          <button
                            key={contact.id}
                            onClick={() => {
                              setFormData({...formData, inviterId: contact.id});
                              setInviterSearch('');
                            }}
                            className="w-full p-4 hover:bg-slate-50 flex items-center gap-4 text-left border-b border-slate-50 last:border-0"
                          >
                            <div className="w-12 h-12 rounded-full bg-slate-100 flex-shrink-0 overflow-hidden">
                              {contact.photoUrl ? (
                                <img src={contact.photoUrl} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">
                                  {contact.name[0]}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-black text-slate-900 truncate">{contact.name}</h4>
                              <p className="text-xs text-slate-500 truncate">{contact.designation} • {contact.organization}</p>
                              <p className="text-xs text-slate-400 mt-1">{contact.mobile}</p>
                            </div>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="p-6 bg-indigo-50 border-2 border-indigo-200 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-white border-2 border-indigo-100 overflow-hidden">
                      {selectedInviter?.photoUrl ? (
                        <img src={selectedInviter.photoUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-indigo-300 font-bold text-xl">
                          {selectedInviter?.name[0]}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-900">{selectedInviter?.name}</h4>
                      <p className="text-sm text-slate-600 font-medium">{selectedInviter?.designation} • {selectedInviter?.organization}</p>
                      <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                        <Phone className="w-3 h-3" /> {selectedInviter?.mobile}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setFormData({...formData, inviterId: ''})}
                    className="text-indigo-600 font-black text-sm hover:underline"
                  >
                    Change
                  </button>
                </div>
              )}
              
              <div className="flex items-center justify-center py-4">
                <button 
                  onClick={() => setShowQuickAdd(true)}
                  className="text-indigo-600 font-black text-sm flex items-center gap-2 hover:underline"
                >
                  <Plus className="w-4 h-4" /> Add New Contact
                </button>
              </div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Add Participants</h3>
              <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-black">
                {formData.participants.length} participants added
              </span>
            </div>
            
            <div className="space-y-6">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text"
                  value={participantSearch}
                  onChange={(e) => setParticipantSearch(e.target.value)}
                  placeholder="Type to search contacts..."
                  className="w-full pl-12 pr-4 py-4 bg-white border-2 border-slate-100 rounded-2xl focus:border-indigo-500 outline-none transition-all font-bold"
                />
                
                <AnimatePresence>
                  {participantResults.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden"
                    >
                      {participantResults.map(contact => (
                        <button
                          key={contact.id}
                          onClick={() => addParticipant(contact)}
                          className="w-full p-4 hover:bg-slate-50 flex items-center gap-4 text-left border-b border-slate-50 last:border-0"
                        >
                          <div className="w-12 h-12 rounded-full bg-slate-100 flex-shrink-0 overflow-hidden">
                            {contact.photoUrl ? (
                              <img src={contact.photoUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold">
                                {contact.name[0]}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-black text-slate-900 truncate">{contact.name}</h4>
                              {contact.name.toLowerCase() === participantSearch.toLowerCase() && (
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[8px] font-black uppercase rounded">Best Match</span>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 truncate">{contact.designation} • {contact.organization}</p>
                            <p className="text-[10px] text-slate-400 mt-1">{contact.village}, {contact.taluk}</p>
                          </div>
                          <Plus className="w-5 h-5 text-slate-300" />
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="overflow-x-auto pb-4 no-scrollbar">
                <div className="flex gap-3 min-w-max">
                  {formData.participants.map(p => (
                    <div key={p.id} className="flex items-center gap-2 bg-white border-2 border-slate-100 p-2 rounded-2xl pr-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden">
                        {p.photoUrl ? (
                          <img src={p.photoUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xs">
                            {p.name[0]}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-black text-slate-900 leading-none">{p.name}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{p.designation}</p>
                      </div>
                      <button 
                        onClick={() => removeParticipant(p.id)}
                        className="ml-1 p-1 hover:bg-slate-100 rounded-full text-slate-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-center py-4">
                <button 
                  onClick={() => setShowQuickAdd(true)}
                  className="text-indigo-600 font-black text-sm flex items-center gap-2 hover:underline"
                >
                  <Plus className="w-4 h-4" /> Contact not found? Add new contact
                </button>
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-6">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Notification Preferences</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { id: 'sms', label: 'SMS', icon: Smartphone, color: 'text-blue-600', bg: 'bg-blue-50' },
                { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, color: 'text-green-600', bg: 'bg-green-50' },
                { id: 'email', label: 'Email', icon: Mail, color: 'text-indigo-600', bg: 'bg-indigo-50' },
              ].map(pref => (
                <div 
                  key={pref.id}
                  className={`p-6 rounded-3xl border-2 transition-all ${
                    formData.notifications[pref.id as keyof typeof formData.notifications] ? 'border-indigo-500 bg-white' : 'border-slate-100 bg-slate-50/50'
                  }`}
                >
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className={`w-16 h-16 rounded-2xl ${pref.bg} ${pref.color} flex items-center justify-center`}>
                      <pref.icon className="w-8 h-8" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900">{pref.label}</h4>
                      <p className="text-xs text-slate-500 mt-1">Send tour alerts via {pref.label}</p>
                    </div>
                    <button
                      onClick={() => setFormData({
                        ...formData,
                        notifications: {
                          ...formData.notifications,
                          [pref.id]: !formData.notifications[pref.id as keyof typeof formData.notifications]
                        }
                      })}
                      className={`w-14 h-8 rounded-full relative transition-all ${
                        formData.notifications[pref.id as keyof typeof formData.notifications] ? 'bg-indigo-600' : 'bg-slate-200'
                      }`}
                    >
                      <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${
                        formData.notifications[pref.id as keyof typeof formData.notifications] ? 'left-7' : 'left-1'
                      }`} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-6 bg-slate-900 rounded-3xl text-white flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <p className="text-xs font-black text-indigo-400 uppercase tracking-widest">Estimated notifications</p>
                <p className="text-lg font-bold">
                  {Object.values(formData.notifications).filter(Boolean).length * formData.participants.length} messages will be sent to {formData.participants.length} participants
                </p>
              </div>
            </div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-8">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Review & Schedule</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <section className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Basic Info</h4>
                    <button onClick={() => goToStep(1)} className="text-indigo-600 text-xs font-black hover:underline">Edit</button>
                  </div>
                  <div className="p-4 bg-white border border-slate-100 rounded-2xl">
                    <p className="text-lg font-black text-slate-900">{formData.tourName || 'Untitled Tour'}</p>
                    <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 font-medium">
                      <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {formData.date || 'No date'}</span>
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {formData.startTime || 'No time'}</span>
                    </div>
                  </div>
                </section>

                <section className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Destinations</h4>
                    <button onClick={() => goToStep(2)} className="text-indigo-600 text-xs font-black hover:underline">Edit</button>
                  </div>
                  <div className="p-4 bg-white border border-slate-100 rounded-2xl space-y-2">
                    <p className="text-sm font-bold text-slate-900">
                      Package: {MOCK_PACKAGES.find(p => p.id === formData.packageId)?.name || 'None'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {formData.selectedDestinations.map(id => {
                        const dest = MOCK_DESTINATIONS.find(d => d.id === id);
                        return (
                          <span key={id} className="px-2 py-1 bg-slate-50 text-slate-600 rounded-lg text-xs font-bold border border-slate-100 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {dest?.name}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </section>

                <section className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Inviter</h4>
                    <button onClick={() => goToStep(3)} className="text-indigo-600 text-xs font-black hover:underline">Edit</button>
                  </div>
                  <div className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden">
                      {selectedInviter?.photoUrl ? (
                        <img src={selectedInviter.photoUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xs">
                          {selectedInviter?.name[0]}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">{selectedInviter?.name || 'No inviter selected'}</p>
                      <p className="text-xs text-slate-500">{selectedInviter?.designation}</p>
                    </div>
                  </div>
                </section>
              </div>

              <div className="space-y-6">
                <section className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Participants</h4>
                    <button onClick={() => goToStep(4)} className="text-indigo-600 text-xs font-black hover:underline">Edit</button>
                  </div>
                  <div className="p-4 bg-white border border-slate-100 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-3 overflow-hidden">
                        {formData.participants.slice(0, 5).map(p => (
                          <div key={p.id} className="inline-block h-10 w-10 rounded-full ring-2 ring-white bg-slate-100 overflow-hidden">
                            {p.photoUrl ? (
                              <img src={p.photoUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xs">
                                {p.name[0]}
                              </div>
                            )}
                          </div>
                        ))}
                        {formData.participants.length > 5 && (
                          <div className="flex items-center justify-center h-10 w-10 rounded-full ring-2 ring-white bg-slate-900 text-white text-[10px] font-black">
                            +{formData.participants.length - 5}
                          </div>
                        )}
                      </div>
                      <p className="text-sm font-bold text-slate-600 ml-2">
                        {formData.participants.length} participants added
                      </p>
                    </div>
                  </div>
                </section>

                <section className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Notifications</h4>
                    <button onClick={() => goToStep(5)} className="text-indigo-600 text-xs font-black hover:underline">Edit</button>
                  </div>
                  <div className="p-4 bg-white border border-slate-100 rounded-2xl flex gap-3">
                    {formData.notifications.sms && <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase">SMS</span>}
                    {formData.notifications.whatsapp && <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-black uppercase">WhatsApp</span>}
                    {formData.notifications.email && <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-[10px] font-black uppercase">Email</span>}
                    {!formData.notifications.sms && !formData.notifications.whatsapp && !formData.notifications.email && <span className="text-xs text-slate-400 font-medium">No notifications selected</span>}
                  </div>
                </section>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 bg-green-100 text-green-600 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8"
        >
          <CheckCircle2 className="w-12 h-12" />
        </motion.div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">Tour Scheduled Successfully!</h2>
        <p className="text-slate-500 font-medium mb-8">
          Tour ID: <span className="text-slate-900 font-black">{tourId}</span> • 
          {formData.participants.length * Object.values(formData.notifications).filter(Boolean).length} notifications queued.
        </p>
        
        <div className="grid grid-cols-2 gap-4">
          <Button fullWidth onClick={() => navigate('/pa/tours')} className="rounded-2xl py-4">
            View Tour Details
          </Button>
          <Button variant="outline" fullWidth onClick={() => {
            setIsSuccess(false);
            setCurrentStep(1);
            setCompletedSteps([]);
            setFormData({
              tourName: '',
              date: '',
              startTime: '',
              packageId: '',
              selectedDestinations: [],
              inviterId: '',
              participants: [],
              notifications: { sms: true, whatsapp: true, email: false }
            });
          }} className="rounded-2xl py-4">
            Schedule Another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden -m-8">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-slate-200 p-8 flex flex-col gap-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Schedule Tour</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">6-step wizard flow</p>
        </div>
        
        <div className="space-y-2">
          {STEPS.map((step) => (
            <button
              key={step.id}
              onClick={() => goToStep(step.id)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all text-left ${
                currentStep === step.id 
                  ? 'bg-indigo-50 text-indigo-600' 
                  : completedSteps.includes(step.id)
                    ? 'text-green-600'
                    : 'text-slate-400 hover:bg-slate-50'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all ${
                currentStep === step.id
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : completedSteps.includes(step.id)
                    ? 'bg-green-600 border-green-600 text-white'
                    : 'bg-white border-slate-200'
              }`}>
                {completedSteps.includes(step.id) ? <Check className="w-4 h-4" /> : step.id}
              </div>
              <span className="font-bold text-sm">{step.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
        <div className="flex-1 overflow-y-auto p-12">
          <div className="max-w-3xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="bg-white border-t border-slate-200 p-6">
          <div className="max-w-3xl mx-auto flex justify-between items-center">
            <Button 
              variant="outline" 
              onClick={handleBack}
              disabled={currentStep === 1}
              className="rounded-2xl px-8 py-4"
            >
              <ChevronLeft className="w-5 h-5 mr-2" /> Back
            </Button>
            <Button 
              onClick={handleNext}
              className={`rounded-2xl px-12 py-4 ${currentStep === 6 ? 'bg-green-600 hover:bg-green-700 border-green-600' : ''}`}
            >
              {currentStep === 6 ? 'Schedule Tour' : 'Next'} <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Quick Add Modal */}
      <AnimatePresence>
        {showQuickAdd && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setShowQuickAdd(false)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-lg overflow-hidden relative z-10"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Quick Add Contact</h3>
                  <button onClick={() => setShowQuickAdd(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                    <input type="text" placeholder="Enter name" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mobile Number</label>
                    <input type="tel" placeholder="+91" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Designation</label>
                    <input type="text" placeholder="e.g. Village Head" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold" />
                  </div>
                  
                  <div className="pt-4 flex gap-3">
                    <Button variant="outline" fullWidth onClick={() => setShowQuickAdd(false)} className="rounded-xl">Cancel</Button>
                    <Button fullWidth onClick={() => {
                      // Simulate adding
                      const newContact: Contact = {
                        id: Date.now().toString(),
                        name: 'New Contact',
                        designation: 'Added via Quick Add',
                        organization: 'N/A',
                        category: 'Other',
                        state: 'Karnataka',
                        zilla: 'Mysuru',
                        taluk: 'Mysuru',
                        gp: 'City',
                        village: 'Mysuru',
                        mobile: '9999999999',
                        email: '',
                        isVip: false,
                        createdAt: new Date().toISOString(),
                      };
                      if (currentStep === 3) {
                        setFormData({...formData, inviterId: newContact.id});
                      } else if (currentStep === 4) {
                        setFormData({...formData, participants: [...formData.participants, newContact]});
                      }
                      setShowQuickAdd(false);
                    }} className="rounded-xl">Save & Add</Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
