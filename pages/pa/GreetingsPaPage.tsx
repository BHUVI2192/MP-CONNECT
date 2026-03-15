
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gift, 
  Users, 
  Calendar, 
  Search, 
  Filter, 
  Send, 
  Phone, 
  ChevronRight,
  Plus,
  Mail,
  X,
  User,
  Briefcase,
  Smartphone,
  MessageSquare,
  CheckCircle2,
  Clock,
  Download,
  Bell,
  MoreVertical,
  Check,
  Loader2,
  AlertCircle,
  MapPin
} from 'lucide-react';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { contactsApi } from '../../hooks/useContacts';
import { supabase } from '../../lib/supabase';

// DB contact mapped to greeting-page shape
type GContact = {
  id: string;          // contact_id
  name: string;        // full_name
  designation: string;
  organization?: string;
  event: 'Birthday' | 'Anniversary';
  date: string;        // MM-DD
  phone: string;
  email?: string;
  location: string;
  whatsappAvailable: boolean;
  greetedToday: boolean;
};

type HistoryLog = {
  id: string;
  created_at: string;
  contact_name: string;
  occasion: string;
  channel: string;
  status: string;
};

type DbContactRow = {
  contact_id: string;
  full_name: string;
  designation?: string | null;
  organization?: string | null;
  mobile?: string | null;
  email?: string | null;
  birthday?: string | null;
  anniversary?: string | null;
  location_village?: string | null;
  location_taluk?: string | null;
  village?: string | null;
  taluk?: string | null;
  zilla?: string | null;
  state?: string | null;
};

function dbContactToGreeting(
  c: DbContactRow,
  event: 'Birthday' | 'Anniversary',
  greetedIds: Set<string>
): GContact {
  const village = c.location_village ?? c.village ?? '';
  const taluk = c.location_taluk ?? c.taluk ?? '';
  const parts = [village, taluk, c.zilla, c.state].filter(Boolean);
  return {
    id: c.contact_id,
    name: c.full_name,
    designation: c.designation ?? '',
    organization: c.organization ?? '',
    event,
    date: event === 'Birthday' ? (c.birthday ?? '') : (c.anniversary ?? ''),
    phone: c.mobile ?? '',
    email: c.email ?? undefined,
    location: parts.join(' / ') || 'Location unknown',
    whatsappAvailable: true,
    greetedToday: greetedIds.has(c.contact_id),
  };
}


export const GreetingsPaPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'birthdays' | 'anniversaries' | 'upcoming' | 'history'>('birthdays');
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [showGreetingModal, setShowGreetingModal] = useState<string | null>(null);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<{ current: number; total: number } | null>(null);
  const [bulkReport, setBulkReport] = useState<{ sent: number; failed: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // DB state
  const [todayBirthdays, setTodayBirthdays] = useState<GContact[]>([]);
  const [todayAnniversaries, setTodayAnniversaries] = useState<GContact[]>([]);
  const [historyLogs, setHistoryLogs] = useState<HistoryLog[]>([]);
  const [allContacts, setAllContacts] = useState<GContact[]>([]); // for upcoming tab

  // Individual Greeting Modal State
  const [greetingChannel, setGreetingChannel] = useState<'whatsapp' | 'sms' | 'call' | 'email'>('whatsapp');
  const [bulkChannel, setBulkChannel] = useState<'whatsapp' | 'sms' | 'email'>('whatsapp');
  const [messageTemplate, setMessageTemplate] = useState('Wishing you a very happy birthday! May you have a wonderful year ahead filled with health and happiness.');

  const fetchContactsForUpcoming = async (): Promise<DbContactRow[]> => {
    const baseColumns = 'contact_id, full_name, designation, organization, mobile, email, birthday, anniversary, zilla, state';

    // Newer schema path: location_village/location_taluk
    const primary = await supabase
      .from('contacts')
      .select(`${baseColumns}, location_village, location_taluk`)
      .is('deleted_at', null)
      .limit(500);

    if (!primary.error) {
      return (primary.data ?? []) as DbContactRow[];
    }

    // Legacy schema fallback: village/taluk
    const fallback = await supabase
      .from('contacts')
      .select(`${baseColumns}, village, taluk`)
      .is('deleted_at', null)
      .limit(500);

    if (fallback.error) {
      throw fallback.error;
    }

    return (fallback.data ?? []) as DbContactRow[];
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    const currentYear = new Date().getFullYear();
    const today = `${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;

    try {
      const [{ data: bdContacts }, { data: anniContacts }, { data: logs }, allCts] = await Promise.all([
        contactsApi.getTodaysBirthdays(),
        contactsApi.getTodaysAnniversaries(),
        supabase.from('greeting_logs').select('*').eq('greeted_year', currentYear).order('created_at', { ascending: false }).limit(100),
        fetchContactsForUpcoming(),
      ]);

      const greetedIds = new Set<string>((logs ?? []).map((l: any) => l.contact_id).filter(Boolean));

      setTodayBirthdays((bdContacts ?? []).map((c: any) => dbContactToGreeting(c, 'Birthday', greetedIds)));
      setTodayAnniversaries((anniContacts ?? []).map((c: any) => dbContactToGreeting(c, 'Anniversary', greetedIds)));
      setHistoryLogs((logs ?? []) as HistoryLog[]);

      // Build upcoming contacts from all contacts (next 7 days)
      const upcoming: GContact[] = [];
      for (const c of (allCts ?? [])) {
        if (c.birthday) upcoming.push(dbContactToGreeting(c, 'Birthday', greetedIds));
        if (c.anniversary) upcoming.push(dbContactToGreeting(c, 'Anniversary', greetedIds));
      }
      setAllContacts(upcoming);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const allGreetingContacts = useMemo(() => [...todayBirthdays, ...todayAnniversaries], [todayBirthdays, todayAnniversaries]);


  const pendingBirthdays = todayBirthdays.filter(c => !c.greetedToday).length;
  const pendingAnniversaries = todayAnniversaries.filter(c => !c.greetedToday).length;

  const saveGreetingLog = async (contactId: string, contactName: string, occasion: string, channel: string) => {
    const currentYear = new Date().getFullYear();
    await supabase.from('greeting_logs').insert({
      contact_id: contactId,
      contact_name: contactName,
      occasion,
      channel: channel.charAt(0).toUpperCase() + channel.slice(1),
      status: 'Sent',
      greeted_year: currentYear,
    });
    // Mark as greeted in local state
    setTodayBirthdays(prev => prev.map(c => c.id === contactId ? { ...c, greetedToday: true } : c));
    setTodayAnniversaries(prev => prev.map(c => c.id === contactId ? { ...c, greetedToday: true } : c));
  };

  const handleToggleSelectAll = (list: GContact[]) => {
    if (selectedContacts.length === list.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(list.map((c: GContact) => c.id));
    }
  };

  const handleSendBulk = async (_list: GContact[]) => {
    setBulkProgress({ current: 0, total: selectedContacts.length });
    const currentYear = new Date().getFullYear();
    const channelLabel = bulkChannel === 'whatsapp' ? 'WhatsApp' : bulkChannel.toUpperCase();
    for (let i = 0; i < selectedContacts.length; i++) {
      const cid = selectedContacts[i];
      const contact = allGreetingContacts.find(c => c.id === cid);
      if (contact) {
        await supabase.from('greeting_logs').insert({
          contact_id: cid,
          contact_name: contact.name,
          occasion: contact.event,
          channel: channelLabel,
          status: 'Sent',
          greeted_year: currentYear,
        });
        setTodayBirthdays(prev => prev.map(c => c.id === cid ? { ...c, greetedToday: true } : c));
        setTodayAnniversaries(prev => prev.map(c => c.id === cid ? { ...c, greetedToday: true } : c));
      }
      setBulkProgress({ current: i + 1, total: selectedContacts.length });
    }
    setBulkReport({ sent: selectedContacts.length, failed: 0 });
    setBulkProgress(null);
    setSelectedContacts([]);
  };


  const renderContactCard = (contact: GContact) => (
    <div key={contact.id} className="flex items-center gap-4 p-5 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative">
          <input 
            type="checkbox" 
            checked={selectedContacts.includes(contact.id)}
            onChange={() => setSelectedContacts(prev => prev.includes(contact.id) ? prev.filter(id => id !== contact.id) : [...prev, contact.id])}
            className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />
        </div>
        
        <div className="relative">
          <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-black text-xl overflow-hidden border-2 border-white shadow-sm">
            {contact.name.split(' ').map(n => n[0]).join('')}
          </div>
          {contact.whatsappAvailable && (
            <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full" title="WhatsApp Online" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-base font-black text-slate-900 truncate">{contact.name}</h4>
            {contact.greetedToday && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[8px] font-black uppercase tracking-widest">
                <Check className="w-2 h-2" /> Greeted
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-bold truncate">{contact.designation} • {contact.organization}</p>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5 flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {contact.location}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button 
          onClick={() => { setShowGreetingModal(contact.id); setGreetingChannel('whatsapp'); }}
          className="p-2.5 bg-slate-50 text-slate-400 hover:bg-green-50 hover:text-green-600 rounded-xl transition-all"
        >
          <MessageSquare className="w-4 h-4" />
        </button>
        <button 
          onClick={() => { setShowGreetingModal(contact.id); setGreetingChannel('sms'); }}
          className="p-2.5 bg-slate-50 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all"
        >
          <Smartphone className="w-4 h-4" />
        </button>
        <button 
          onClick={() => { setShowGreetingModal(contact.id); setGreetingChannel('call'); }}
          className="p-2.5 bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-all"
        >
          <Phone className="w-4 h-4" />
        </button>
        <button 
          onClick={() => { setShowGreetingModal(contact.id); setGreetingChannel('email'); }}
          className="p-2.5 bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all"
        >
          <Mail className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-32">
      <header className="portal-pa-hero-soft">
        <div className="absolute inset-y-0 right-0 w-72 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.18),transparent_58%)]" />
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.28em] text-white/65 mb-3">PA Greetings</p>
            <h2 className="text-4xl font-black text-white tracking-tighter">Constituent Greetings</h2>
            <p className="text-white/80 font-medium mt-2">Manage protocol greetings for important constituents and leaders.</p>
          </div>
        <Button className="rounded-2xl shadow-lg shadow-slate-950/20 px-8 bg-white text-black hover:bg-slate-100">
          <Plus className="w-5 h-5 mr-2 text-black" /> <span className="text-black">Add Protocol Contact</span>
        </Button>
        </div>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
        </div>
      ) : (
      <>
      {/* Tabs */}
      <div className="portal-pa-tabset w-fit">
        {[
          { id: 'birthdays', label: "Today's Birthdays", badge: pendingBirthdays },
          { id: 'anniversaries', label: "Today's Anniversaries", badge: pendingAnniversaries },
          { id: 'upcoming', label: 'Upcoming (7 Days)' },
          { id: 'history', label: 'Greeting History' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest transition-all relative ${
              activeTab === tab.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:bg-white/50'
            }`}
          >
            {tab.label}
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="flex items-center justify-center min-w-5 h-5 px-1.5 bg-red-500 text-white text-[10px] rounded-full">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'birthdays' && (
          <motion.div key="birthdays" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <div className="flex items-center justify-between px-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={selectedContacts.length === todayBirthdays.length && todayBirthdays.length > 0}
                  onChange={() => handleToggleSelectAll(todayBirthdays)}
                  className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-600 transition-colors">Select All Birthdays</span>
              </label>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{todayBirthdays.length} Total Today</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {todayBirthdays.map(renderContactCard)}
            </div>
          </motion.div>
        )}

        {activeTab === 'anniversaries' && (
          <motion.div key="anniversaries" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <div className="flex items-center justify-between px-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={selectedContacts.length === todayAnniversaries.length && todayAnniversaries.length > 0}
                  onChange={() => handleToggleSelectAll(todayAnniversaries)}
                  className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xs font-black text-slate-400 uppercase tracking-widest group-hover:text-slate-600 transition-colors">Select All Anniversaries</span>
              </label>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{todayAnniversaries.length} Total Today</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {todayAnniversaries.map(renderContactCard)}
            </div>
          </motion.div>
        )}

        {activeTab === 'upcoming' && (
          <motion.div key="upcoming" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
            {[...Array(7)].map((_, i) => {
              const date = new Date();
              date.setDate(date.getDate() + i);
              const dateStr = `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
              const dayContacts = allContacts.filter(c => c.date === dateStr);
              
              return (
                <div key={i} className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center shadow-sm">
                      <span className="text-[10px] font-black text-slate-400 uppercase leading-none">{date.toLocaleDateString('en-US', { month: 'short' })}</span>
                      <span className="text-lg font-black text-slate-900 leading-none mt-1">{date.getDate()}</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-black text-slate-900">{date.toLocaleDateString('en-US', { weekday: 'long' })}</h4>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{dayContacts.length} Events</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pl-16">
                    {dayContacts.map(contact => (
                      <div key={contact.id} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold text-sm">
                            {contact.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900">{contact.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{contact.event}</p>
                          </div>
                        </div>
                        <button className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                          <Bell className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {dayContacts.length === 0 && (
                      <p className="text-sm text-slate-400 font-medium italic">No events scheduled for this day.</p>
                    )}
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        {activeTab === 'history' && (
          <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
              <div className="relative w-full md:w-96">
                <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search greeting history..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="portal-pa-search pl-11 pr-4 py-3 text-sm" 
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="rounded-xl"><Download className="w-4 h-4 mr-2" /> Export CSV</Button>
                <Button variant="outline" size="sm" className="rounded-xl"><Download className="w-4 h-4 mr-2" /> Export PDF</Button>
              </div>
            </div>

            <div className="portal-pa-shell overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 text-slate-400 uppercase text-[10px] font-black tracking-widest border-b border-slate-100">
                  <tr>
                    <th className="px-8 py-5">Date</th>
                    <th className="px-8 py-5">Contact Name</th>
                    <th className="px-8 py-5">Occasion</th>
                    <th className="px-8 py-5">Channel</th>
                    <th className="px-8 py-5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {historyLogs.filter(item =>
                    !searchQuery ||
                    item.contact_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.occasion?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.channel?.toLowerCase().includes(searchQuery.toLowerCase())
                  ).map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-5 text-sm font-bold text-slate-600">{item.created_at?.split('T')[0]}</td>
                      <td className="px-8 py-5 text-sm font-black text-slate-900">{item.contact_name}</td>
                      <td className="px-8 py-5">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-[10px] font-black uppercase tracking-widest">{item.occasion}</span>
                      </td>
                      <td className="px-8 py-5 text-sm font-bold text-slate-600">{item.channel}</td>
                      <td className="px-8 py-5">
                        <span className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${
                          item.status === 'Delivered' ? 'text-green-600' : item.status === 'Sent' ? 'text-blue-600' : 'text-red-600'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            item.status === 'Delivered' ? 'bg-green-600' : item.status === 'Sent' ? 'bg-blue-600' : 'bg-red-600'
                          }`} />
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky Bottom Bar for Bulk Actions */}
      <AnimatePresence>
        {selectedContacts.length > 0 && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-6"
          >
            <div className="rounded-3xl border border-white/10 bg-slate-900/90 p-4 text-white shadow-2xl flex items-center justify-between backdrop-blur-xl">
              <div className="flex items-center gap-4 pl-4">
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center font-black">
                  {selectedContacts.length}
                </div>
                <div>
                  <p className="text-sm font-black">Contacts Selected</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Ready for bulk greeting</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setSelectedContacts([])} className="px-6 py-3 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">Cancel</button>
                <Button onClick={() => setShowBulkModal(true)} className="rounded-2xl bg-indigo-600 hover:bg-indigo-500 px-8 py-3">
                  Send Bulk Greetings
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Individual Greeting Modal */}
      <AnimatePresence>
        {showGreetingModal && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="portal-pa-modal-backdrop" onClick={() => setShowGreetingModal(null)} />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="portal-pa-modal w-full max-w-xl">
              <div className="p-10">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-black text-2xl">
                      {allGreetingContacts.find(c => c.id === showGreetingModal)?.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 tracking-tighter">{allGreetingContacts.find(c => c.id === showGreetingModal)?.name}</h3>
                      <p className="text-sm text-slate-500 font-medium">{allGreetingContacts.find(c => c.id === showGreetingModal)?.designation}</p>
                    </div>
                  </div>
                  <button onClick={() => setShowGreetingModal(null)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X className="w-6 h-6" /></button>
                </div>

                <div className="flex p-1 bg-slate-100 rounded-2xl mb-8">
                  {[
                    { id: 'whatsapp', icon: MessageSquare, label: 'WhatsApp' },
                    { id: 'sms', icon: Smartphone, label: 'SMS' },
                    { id: 'call', icon: Phone, label: 'Phone Call' },
                    { id: 'email', icon: Mail, label: 'Email' },
                  ].map(channel => (
                    <button
                      key={channel.id}
                      onClick={() => setGreetingChannel(channel.id as any)}
                      className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl transition-all ${
                        greetingChannel === channel.id ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                      }`}
                    >
                      <channel.icon className="w-5 h-5" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{channel.label}</span>
                    </button>
                  ))}
                </div>

                <div className="space-y-6">
                  {greetingChannel === 'call' ? (
                    <div className="py-12 text-center space-y-6">
                      <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
                        <Phone className="w-10 h-10" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-2xl font-black text-slate-900">{allGreetingContacts.find(c => c.id === showGreetingModal)?.phone}</p>
                        <p className="text-sm text-slate-500 font-medium tracking-tight">Ready to initiate call from connected device</p>
                      </div>
                      <Button fullWidth size="lg" className="rounded-2xl h-16 text-lg font-black uppercase tracking-widest">
                        Dial Number
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Message Template</label>
                        <textarea 
                          value={messageTemplate}
                          onChange={(e) => setMessageTemplate(e.target.value)}
                          rows={4}
                          className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-medium text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                        />
                      </div>
                      <Button fullWidth size="lg" className="rounded-2xl h-14 font-black uppercase tracking-widest" onClick={async () => {
                        const contact = allGreetingContacts.find(c => c.id === showGreetingModal);
                        if (contact) await saveGreetingLog(contact.id, contact.name, contact.event, greetingChannel);
                        setShowGreetingModal(null);
                      }}>
                        Send Greeting via {greetingChannel.toUpperCase()}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Bulk Greeting Modal */}
      <AnimatePresence>
        {showBulkModal && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="portal-pa-modal-backdrop" onClick={() => setShowBulkModal(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="portal-pa-modal w-full max-w-xl">
              <div className="p-10">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tighter">Bulk Greetings</h3>
                  <button onClick={() => setShowBulkModal(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X className="w-6 h-6" /></button>
                </div>

                {!bulkProgress && !bulkReport ? (
                  <div className="space-y-8">
                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                      <p className="text-sm font-bold text-slate-600">You are sending greetings to <span className="text-slate-900 font-black">{selectedContacts.length}</span> selected contacts.</p>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Channel</h4>
                      <div className="grid grid-cols-3 gap-4">
                        {[
                          { id: 'whatsapp', label: 'WhatsApp' },
                          { id: 'sms', label: 'SMS' },
                          { id: 'email', label: 'Email' },
                        ].map(channel => (
                          <label key={channel.id} className="flex flex-col items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer hover:bg-white hover:border-indigo-200 transition-all group">
                            <input
                              type="radio"
                              name="bulkChannel"
                              checked={bulkChannel === channel.id}
                              onChange={() => setBulkChannel(channel.id as 'whatsapp' | 'sms' | 'email')}
                              className="sr-only"
                            />
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400 group-hover:text-indigo-600 shadow-sm transition-colors">
                              {channel.id === 'whatsapp' ? <MessageSquare className="w-5 h-5" /> : channel.id === 'sms' ? <Smartphone className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest text-slate-500 group-hover:text-indigo-600">{channel.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Message Preview</label>
                      <div className="p-5 bg-slate-50 border border-slate-100 rounded-2xl text-sm text-slate-600 font-medium italic">
                        "{messageTemplate}"
                      </div>
                    </div>

                    <Button fullWidth size="lg" className="rounded-2xl h-14 font-black uppercase tracking-widest" onClick={() => handleSendBulk(allGreetingContacts)}>
                      Confirm & Send All
                    </Button>
                  </div>
                ) : bulkProgress ? (
                  <div className="py-12 text-center space-y-8">
                    <div className="relative w-32 h-32 mx-auto">
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle className="text-slate-100 stroke-current" strokeWidth="8" fill="transparent" r="40" cx="50" cy="50" />
                        <motion.circle 
                          className="text-indigo-600 stroke-current" 
                          strokeWidth="8" 
                          strokeLinecap="round" 
                          fill="transparent" 
                          r="40" 
                          cx="50" 
                          cy="50" 
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: bulkProgress.current / bulkProgress.total }}
                          style={{ rotate: -90, transformOrigin: '50% 50%' }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-black text-slate-900">{Math.round((bulkProgress.current / bulkProgress.total) * 100)}%</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-xl font-black text-slate-900">Sending Greetings...</h4>
                      <p className="text-sm text-slate-500 font-medium">Processing {bulkProgress.current} of {bulkProgress.total} messages</p>
                    </div>
                    <button onClick={() => setBulkProgress(null)} className="text-xs font-black text-red-500 uppercase tracking-widest hover:underline">Cancel Operation</button>
                  </div>
                ) : (
                  <div className="py-8 space-y-8">
                    <div className="flex items-center justify-center gap-4">
                      <div className="w-16 h-16 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                    </div>
                    <div className="text-center space-y-2">
                      <h4 className="text-2xl font-black text-slate-900">Bulk Send Complete</h4>
                      <p className="text-sm text-slate-500 font-medium">All greetings have been processed successfully.</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-6 bg-green-50 rounded-3xl border border-green-100 text-center">
                        <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">Successfully Sent</p>
                        <p className="text-3xl font-black text-green-700 mt-1">{bulkReport?.sent}</p>
                      </div>
                      <div className="p-6 bg-red-50 rounded-3xl border border-red-100 text-center">
                        <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Failed / Skipped</p>
                        <p className="text-3xl font-black text-red-700 mt-1">{bulkReport?.failed}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-3">
                      <Button fullWidth variant="outline" className="rounded-xl"><Download className="w-4 h-4 mr-2" /> Download Delivery Report</Button>
                      <Button fullWidth className="rounded-xl" onClick={() => { setShowBulkModal(false); setBulkReport(null); }}>Close</Button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </>
      )}
    </div>
  );
};

