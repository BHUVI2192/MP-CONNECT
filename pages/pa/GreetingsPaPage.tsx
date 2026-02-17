
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
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
  Smartphone
} from 'lucide-react';
import { GreetingContact } from '../../types';

const mockContacts: GreetingContact[] = [
  { id: '1', name: 'Shri Arun Shourie', designation: 'Former Union Minister', event: 'Birthday', date: '05-24', phone: '9876543210', email: 'arun.shourie@example.com', lastGreetedYear: 2023 },
  { id: '2', name: 'Dr. Meena Swamy', designation: 'Block Head, East Delhi', event: 'Anniversary', date: '05-25', phone: '9876543211', email: 'meena.swamy@delhi.gov.in', lastGreetedYear: 2023 },
  { id: '3', name: 'Hon. Speaker Om Birla', designation: 'LS Speaker', event: 'Birthday', date: '11-23', phone: '9876543212' },
];

export const GreetingsPaPage: React.FC = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [contacts, setContacts] = useState<GreetingContact[]>(mockContacts);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Protocol Greetings</h2>
          <p className="text-slate-500 font-medium">Manage constituent birthdays and anniversaries of important leaders.</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="rounded-2xl shadow-lg shadow-indigo-100 px-8">
          <Plus className="w-5 h-5 mr-2" /> Add Contact
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today & Tomorrow */}
        <div className="space-y-6">
           <Card title="Upcoming (48 Hours)" className="border-indigo-100 bg-indigo-50/20">
              <div className="space-y-4 mt-4">
                 {contacts.slice(0, 2).map((contact) => (
                   <div key={contact.id} className="p-5 bg-white rounded-2xl border border-indigo-100 shadow-sm relative group overflow-hidden">
                      <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-600 rounded-bl-[2rem] flex items-center justify-center text-white translate-x-4 -translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 transition-transform">
                         <Gift className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                         <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{contact.event}</p>
                         <h4 className="text-lg font-black text-slate-900">{contact.name}</h4>
                         <p className="text-xs text-slate-500 font-medium">{contact.designation}</p>
                      </div>
                      <div className="flex gap-2 mt-4">
                         <Button size="sm" className="rounded-xl flex-1 bg-indigo-600">
                           <Send className="w-3 h-3 mr-2" /> SMS
                         </Button>
                         {contact.email && (
                            <Button size="sm" variant="outline" className="rounded-xl flex-1 border-slate-200">
                              <Mail className="w-3 h-3 mr-2 text-indigo-500" /> Email
                            </Button>
                         )}
                         <Button size="sm" variant="outline" className="rounded-xl p-2 h-9 w-9 border-slate-200"><Phone className="w-3 h-3" /></Button>
                      </div>
                   </div>
                 ))}
              </div>
           </Card>

           <Card title="Bulk Automation" subtitle="Auto-schedule festival wishes">
              <div className="space-y-3 mt-4">
                 <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <p className="text-sm font-bold text-slate-900">Independence Day</p>
                    <p className="text-xs text-slate-500 mt-1">Scheduled for Aug 15 • 12,400 Recipients</p>
                 </div>
                 <Button variant="outline" fullWidth className="rounded-xl text-xs font-black uppercase">Setup Bulk Greeting</Button>
              </div>
           </Card>
        </div>

        {/* Database Table */}
        <div className="lg:col-span-2">
           <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
             <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
               <div className="relative w-full md:w-96">
                 <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                 <input type="text" placeholder="Search contact database..." className="w-full pl-11 pr-4 py-3.5 text-sm bg-slate-50 border border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl transition-all outline-none" />
               </div>
               <div className="flex gap-2 w-full md:w-auto">
                 <Button variant="outline" size="sm" className="rounded-xl"><Filter className="w-4 h-4" /></Button>
               </div>
             </div>
             
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead className="bg-slate-50/50 text-slate-400 uppercase text-[10px] font-black tracking-widest border-b border-slate-100">
                    <tr>
                      <th className="px-8 py-5">Contact</th>
                      <th className="px-8 py-5">Event</th>
                      <th className="px-8 py-5">Channel Info</th>
                      <th className="px-8 py-5"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {contacts.map((contact) => (
                      <tr key={contact.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-5">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                                 <Users className="w-5 h-5" />
                              </div>
                              <div>
                                 <p className="font-bold text-slate-900">{contact.name}</p>
                                 <p className="text-[10px] text-slate-400 uppercase font-bold">{contact.designation}</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-8 py-5">
                           <div className="flex items-center gap-2">
                              <Calendar className="w-3 h-3 text-indigo-400" />
                              <span className="text-xs font-bold text-slate-700">{contact.date}</span>
                              <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-500 font-bold uppercase">{contact.event}</span>
                           </div>
                        </td>
                        <td className="px-8 py-5">
                           <div className="space-y-1">
                              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                 <Smartphone className="w-3 h-3" /> {contact.phone}
                              </div>
                              {contact.email && (
                                 <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                                    <Mail className="w-3 h-3" /> {contact.email}
                                 </div>
                              )}
                           </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                           <Button variant="ghost" size="sm" className="rounded-xl"><ChevronRight className="w-5 h-5" /></Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
             </div>
           </div>
        </div>
      </div>

      {/* Add Contact Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" 
              onClick={() => setShowAddModal(false)} 
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 20 }} 
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
               <div className="p-10">
                  <div className="flex justify-between items-center mb-10">
                     <div>
                        <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Add Protocol Contact</h3>
                        <p className="text-sm text-slate-500 font-medium">Register VIPs and constituents for protocol greetings.</p>
                     </div>
                     <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
                        <X className="w-6 h-6" />
                     </button>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                             <User className="w-3 h-3" /> Full Name
                          </label>
                          <input type="text" placeholder="e.g. Shri Rajnath Singh" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                             <Briefcase className="w-3 h-3" /> Designation
                          </label>
                          <input type="text" placeholder="e.g. Block Development Officer" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all" />
                       </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                             <Gift className="w-3 h-3" /> Event Type
                          </label>
                          <select className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all appearance-none cursor-pointer">
                             <option>Birthday</option>
                             <option>Anniversary</option>
                          </select>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                             <Calendar className="w-3 h-3" /> Date (MM-DD)
                          </label>
                          <input type="text" placeholder="e.g. 08-15" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all" />
                       </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                             <Smartphone className="w-3 h-3" /> Phone (for SMS)
                          </label>
                          <input type="tel" placeholder="+91 98XXX XXXXX" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                             <Mail className="w-3 h-3" /> Email Address
                          </label>
                          <input type="email" placeholder="example@office.com" className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 transition-all" />
                       </div>
                    </div>

                    <div className="flex gap-4 pt-6 border-t border-slate-50">
                       <Button variant="ghost" fullWidth onClick={() => setShowAddModal(false)}>Cancel</Button>
                       <Button fullWidth size="lg" className="rounded-2xl h-14" onClick={() => setShowAddModal(false)}>Save Contact Details</Button>
                    </div>
                  </div>
               </div>
               <div className="bg-indigo-50 px-10 py-4 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                  <p className="text-[10px] font-black text-indigo-700 uppercase tracking-widest">Channel sync active: Automatic birthday reminders enabled for this contact.</p>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
