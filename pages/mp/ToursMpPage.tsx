
import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../../components/UI/Card';
import { Calendar, MapPin, CheckCircle2, Clock, Info, ImageIcon, Image as ImageIconLucide } from 'lucide-react';

const mockTours = [
  {
    id: '1',
    date: 'May 28, 2024',
    location: 'Rampur Village',
    status: 'Upcoming',
    packageName: 'Flood Relief Visit',
    packageImages: ['https://picsum.photos/seed/flood1/400/300', 'https://picsum.photos/seed/flood2/400/300'],
    itinerary: ['Relief distribution', 'Inspection of dry stock'],
    issuesRaised: []
  },
  {
    id: '2',
    date: 'May 20, 2024',
    location: 'Shyampur Primary School',
    status: 'Completed',
    packageName: 'School Inauguration',
    packageImages: ['https://picsum.photos/seed/school1/400/300'],
    itinerary: ['Ribbon cutting', 'Interaction with students'],
    issuesRaised: ['Wall height insufficient at point B']
  }
];

export const ToursMpPage: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-20">
      <header>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Tours & Visits</h2>
        <p className="text-slate-500 font-medium">Track itinerary and reference media for constituency visits.</p>
      </header>

      <div className="space-y-8">
        {mockTours.map((tour, idx) => (
          <motion.div
            key={tour.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="relative overflow-visible border-slate-200">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Date Side */}
                <div className="md:w-56 flex-shrink-0 space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-indigo-600 font-black mb-1">
                      <Calendar className="w-4 h-4" />
                      {tour.date}
                    </div>
                    <div className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                      tour.status === 'Completed' ? 'bg-slate-100 text-slate-600' : 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                    }`}>
                      {tour.status}
                    </div>
                  </div>

                  {/* Reference Photos Preview */}
                  <div className="space-y-2">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <ImageIconLucide className="w-3 h-3" /> Package Reference
                     </p>
                     <div className="flex gap-1 overflow-x-auto no-scrollbar">
                        {tour.packageImages.map((img, i) => (
                          <div key={i} className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0 group cursor-pointer relative">
                             <img src={img} alt="Ref" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                             <div className="absolute inset-0 bg-slate-900/20 flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <Clock className="w-4 h-4 text-white" />
                             </div>
                          </div>
                        ))}
                     </div>
                  </div>
                </div>

                {/* Content Side */}
                <div className="flex-1 space-y-5">
                  <div>
                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">{tour.packageName}</p>
                    <h3 className="text-2xl font-black text-slate-900 flex items-center gap-2 tracking-tighter">
                      <MapPin className="w-5 h-5 text-slate-300" />
                      {tour.location}
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Visit Itinerary
                    </h4>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {tour.itinerary.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-xs font-bold">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {tour.issuesRaised.length > 0 && (
                    <div className="p-4 bg-orange-50 rounded-2xl border border-orange-100">
                      <h4 className="text-[10px] font-black text-orange-800 uppercase tracking-widest flex items-center gap-2 mb-2">
                        <Info className="w-4 h-4" /> Noted During Visit
                      </h4>
                      <ul className="space-y-1">
                        {tour.issuesRaised.map((issue, i) => (
                          <li key={i} className="text-xs font-bold text-orange-900 flex items-start gap-2">
                             <div className="w-1 h-1 rounded-full bg-orange-400 mt-1.5" />
                             {issue}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
