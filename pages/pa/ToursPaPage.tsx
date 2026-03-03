
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { 
  Calendar, 
  Package, 
  MapPin, 
  Plus, 
  ChevronRight, 
  Clock, 
  Users, 
  CheckCircle2, 
  AlertCircle,
  MoreVertical,
  Filter,
  Search,
  ArrowRight,
  Trash2,
  X,
  History,
  Image as ImageIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TourPackage, Destination, ScheduledTour } from '../../types';

// Mock Data
const initialPackages: TourPackage[] = [
  { 
    id: 'pkg-1', 
    name: 'Flood Relief Visit', 
    description: 'Standard visit for flood affected zones', 
    standardDuration: '4 hours', 
    activities: ['Relief distribution', 'Inspection'], 
    resources: ['4x4 Vehicle', 'Medical Kit'], 
    status: 'Active', 
    mappedDestinationIds: ['dest-1'],
    images: ['https://picsum.photos/seed/flood1/400/300', 'https://picsum.photos/seed/flood2/400/300']
  },
  { 
    id: 'pkg-2', 
    name: 'School Inauguration', 
    description: 'Ceremonial opening of new educational facilities', 
    standardDuration: '2 hours', 
    activities: ['Ribbon cutting', 'Interaction with students'], 
    resources: ['PA System', 'Protocol Staff'], 
    status: 'Active', 
    mappedDestinationIds: ['dest-2'],
    images: ['https://picsum.photos/seed/school1/400/300']
  }
];

const initialDestinations: Destination[] = [
  { id: 'dest-1', name: 'Rampur Village', district: 'North District', block: 'North Block', village: 'Rampur', contactPerson: 'Sarpanch Singh', contactPhone: '9876543210', accessibility: 'Easy' },
  { id: 'dest-2', name: 'Shyampur Primary School', district: 'East District', block: 'East Block', village: 'Shyampur', contactPerson: 'Headmaster Ali', contactPhone: '9876543211', accessibility: 'Moderate' }
];

const initialSchedules: ScheduledTour[] = [
  { 
    id: 'tr-101', 
    date: '2025-05-28', 
    startTime: '09:00 AM', 
    packageId: 'pkg-1', 
    status: 'Confirmed',
    destinations: [{ destinationId: 'dest-1', sequence: 1, arrivalTime: '09:30 AM', duration: '2h' }],
    participants: ['MP Rahul Kumar', 'PA Anand'],
    specialInstructions: 'Ensure media coverage is arranged.'
  }
];

export const ToursPaPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'schedules' | 'packages' | 'destinations' | 'audit'>('schedules');
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  
  const [packages, setPackages] = useState<TourPackage[]>(initialPackages);
  const [destinations, setDestinations] = useState<Destination[]>(initialDestinations);
  const [schedules, setSchedules] = useState<ScheduledTour[]>(initialSchedules);

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Tour Management</h2>
          <p className="text-slate-500 font-medium mt-1">Plan, schedule, and track constituency tours.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline"><Filter className="w-4 h-4 mr-2" /> Filter</Button>
          <Button onClick={() => {
            if (activeTab === 'schedules') {
              navigate('/pa/tours/new');
            } else {
              setShowScheduleForm(true);
            }
          }}>
            <Plus className="w-4 h-4 mr-2" /> 
            {activeTab === 'schedules' ? 'Schedule Visit' : activeTab === 'packages' ? 'New Package' : 'Add Destination'}
          </Button>
        </div>
      </header>

      <div className="flex gap-1 p-1.5 bg-slate-100 rounded-2xl w-fit">
        {[
          { id: 'schedules', label: 'Calendar & Schedules', icon: Calendar },
          { id: 'packages', label: 'Tour Packages', icon: Package },
          { id: 'destinations', label: 'Constituency Destinations', icon: MapPin },
          { id: 'audit', label: 'Audit Trail', icon: History },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab.id 
                ? 'bg-white text-indigo-600 shadow-sm border border-slate-200' 
                : 'text-slate-500 hover:bg-white/50'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="hidden md:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'schedules' && (
          <motion.div 
            key="schedules"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid gap-4"
          >
            {schedules.map((tour, idx) => {
              const pkg = packages.find(p => p.id === tour.packageId);
              return (
                <Card key={tour.id} className="hover:shadow-md transition-shadow group border-slate-200" delay={idx * 0.05}>
                  <div className="flex flex-col lg:flex-row gap-8">
                    <div className="lg:w-40 flex flex-row lg:flex-col gap-4 items-center lg:items-start lg:border-r border-slate-100 pr-6">
                      <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex flex-col items-center justify-center text-indigo-600 flex-shrink-0">
                         <span className="text-[10px] font-black uppercase">{new Date(tour.date).toLocaleString('default', { month: 'short' })}</span>
                         <span className="text-xl font-black">{new Date(tour.date).getDate()}</span>
                      </div>
                      <div className="space-y-1">
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full block w-fit ${
                          tour.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                        }`}>{tour.status}</span>
                        <p className="text-xs font-bold text-slate-400 mt-1">{tour.startTime}</p>
                      </div>
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xl font-black text-slate-900 tracking-tight">{pkg?.name}</h4>
                          <div className="flex flex-wrap gap-2 mt-2">
                             {tour.destinations.map((d, i) => {
                               const dest = destinations.find(md => md.id === d.destinationId);
                               return (
                                 <div key={i} className="flex items-center gap-1 text-xs font-bold px-2 py-1 bg-slate-50 border border-slate-100 rounded-lg">
                                    <MapPin className="w-3 h-3 text-indigo-400" />
                                    {dest?.name}
                                    {i < tour.destinations.length - 1 && <ArrowRight className="w-3 h-3 text-slate-300" />}
                                 </div>
                               );
                             })}
                          </div>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4 text-sm bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                         <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Participants</p>
                            <div className="flex -space-x-2">
                               {tour.participants.map((p, i) => (
                                 <div key={i} className="w-7 h-7 rounded-full bg-indigo-600 border-2 border-white flex items-center justify-center text-[8px] font-bold text-white uppercase">
                                    {p.split(' ').map(n => n[0]).join('')}
                                 </div>
                               ))}
                            </div>
                         </div>
                         <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Special Instructions</p>
                            <p className="text-xs text-slate-600 italic">"{tour.specialInstructions}"</p>
                         </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </motion.div>
        )}

        {activeTab === 'packages' && (
          <motion.div 
            key="packages"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {packages.map((pkg) => (
              <Card key={pkg.id} className="relative group border-slate-200 overflow-hidden !p-0">
                {/* Visual Header - Scrollable Images */}
                <div className="flex gap-1 p-1 bg-slate-100 overflow-x-auto no-scrollbar">
                   {pkg.images && pkg.images.length > 0 ? (
                      pkg.images.map((img, idx) => (
                        <div key={idx} className="w-full aspect-[16/9] flex-shrink-0 bg-white overflow-hidden rounded-xl">
                           <img src={img} alt="Ref" className="w-full h-full object-cover" />
                        </div>
                      ))
                   ) : (
                     <div className="w-full aspect-[16/9] bg-slate-200 rounded-xl flex items-center justify-center text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                        <ImageIcon className="w-5 h-5 mr-2 opacity-50" /> No Reference Photos
                     </div>
                   )}
                </div>

                <div className="p-8">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-2xl font-black text-slate-900 leading-tight tracking-tighter">{pkg.name}</h4>
                      <p className="text-xs text-slate-500 mt-1">{pkg.description}</p>
                    </div>
                    <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                      pkg.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {pkg.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 my-6">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</p>
                       <p className="text-sm font-black text-slate-900 mt-1">{pkg.standardDuration}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Media Refs</p>
                       <p className="text-sm font-black text-indigo-600 mt-1">{pkg.images?.length || 0} Assets</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Standard Activities</p>
                      <div className="flex flex-wrap gap-1.5">
                        {pkg.activities.map((act, i) => (
                          <span key={i} className="px-2 py-1 bg-white border border-slate-200 text-slate-700 rounded-lg text-[10px] font-bold">
                            {act}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="pt-4 border-t border-slate-50 flex gap-2">
                       <Button size="sm" variant="outline" className="flex-1 text-xs">Edit Configuration</Button>
                       <Button size="sm" variant="outline" className="text-red-500 hover:bg-red-50 border-red-100"><Trash2 className="w-3 h-3" /></Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </motion.div>
        )}

        {activeTab === 'destinations' && (
          <motion.div 
            key="destinations"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm"
          >
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
               <div className="relative w-full md:w-96">
                 <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                 <input type="text" placeholder="Search villages, blocks or contact..." className="w-full pl-11 pr-4 py-3 text-sm bg-slate-50 border border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl transition-all outline-none" />
               </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 text-slate-400 uppercase text-[10px] font-black tracking-widest border-b border-slate-100">
                  <tr>
                    <th className="px-8 py-5">Destination</th>
                    <th className="px-8 py-5">Admin Hierarchy</th>
                    <th className="px-8 py-5">Contact Details</th>
                    <th className="px-8 py-5">Accessibility</th>
                    <th className="px-8 py-5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {destinations.map((dest) => (
                    <tr key={dest.id} className="hover:bg-indigo-50/30 transition-colors group cursor-pointer">
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 bg-white rounded-xl border border-slate-200 flex items-center justify-center text-indigo-600 shadow-sm">
                              <MapPin className="w-5 h-5" />
                           </div>
                           <span className="font-black text-slate-900">{dest.name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="text-xs font-bold text-slate-700">{dest.block}</div>
                        <div className="text-[10px] text-slate-400 uppercase tracking-tighter">{dest.district} &gt; {dest.village}</div>
                      </td>
                      <td className="px-8 py-5">
                         <div className="text-xs font-black text-slate-900">{dest.contactPerson}</div>
                         <div className="text-xs text-slate-500">{dest.contactPhone}</div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg ${
                          dest.accessibility === 'Easy' ? 'bg-green-100 text-green-700' : 
                          dest.accessibility === 'Moderate' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {dest.accessibility}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {activeTab === 'audit' && (
           <motion.div key="audit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
              <Card title="Activity Log" subtitle="Complete change history for tour records">
                 <div className="space-y-6 mt-4">
                    {[
                      { user: 'Sarah (Staff)', action: 'Uploaded reference photos for pkg-1', time: '10 mins ago', type: 'MEDIA' },
                      { user: 'Anand (PA)', action: 'Scheduled new tour tr-101', time: '2h ago', type: 'CREATE' },
                    ].map((log, i) => (
                      <div key={i} className="flex gap-4 items-start relative pb-6 border-l-2 border-slate-100 ml-4 pl-8 last:pb-0">
                         <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-white border-4 border-indigo-600 shadow-sm" />
                         <div className="flex-1">
                            <p className="text-sm text-slate-900"><span className="font-black">{log.user}</span> {log.action}</p>
                            <p className="text-xs text-slate-400 mt-1">{log.time}</p>
                         </div>
                      </div>
                    ))}
                 </div>
              </Card>
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
