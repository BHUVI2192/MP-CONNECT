
import React, { useState } from 'react';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { MessageSquare, CheckCircle, Clock, MapPin, Search, ChevronRight, X, Upload, FileText, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const CitizenDashboard: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFakeSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowForm(false);
    }, 1500);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Citizen Services</h2>
          <p className="text-slate-500 font-medium">Direct channel to Hon. MP Rahul Kumar's Office.</p>
        </div>
        <Button size="lg" className="shadow-xl shadow-indigo-100 rounded-2xl px-8" onClick={() => setShowForm(true)}>
          <MessageSquare className="w-5 h-5 mr-2" />
          Raise New Complaint
        </Button>
      </header>

      {/* Stats / Quick Info */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-lg">
           <p className="text-xs font-bold text-indigo-100 uppercase tracking-widest">Active Complaints</p>
           <h4 className="text-3xl font-black mt-2">02</h4>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Resolved WTD</p>
           <h4 className="text-3xl font-black text-slate-900 mt-2">124</h4>
        </div>
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
           <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Avg. Resolution</p>
           <h4 className="text-3xl font-black text-slate-900 mt-2">4.2 Days</h4>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-bold text-slate-900">My Recent Trackers</h3>
          <div className="space-y-4">
            {[
              { id: "CMP-8821", title: "Street Light Outage", area: "West Enclave", status: "Resolved", date: "2 days ago" },
              { id: "CMP-9122", title: "Water Supply Irregularity", area: "Sector 4", status: "In Progress", date: "4 days ago" },
            ].map((item, idx) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl ${item.status === 'Resolved' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                    {item.status === 'Resolved' ? <CheckCircle className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase">{item.id}</span>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase ${item.status === 'Resolved' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{item.status}</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-lg">{item.title}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{item.area} • {item.date}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300" />
              </motion.div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
           <Card className="bg-slate-900 text-white border-none rounded-[2rem]">
              <h4 className="font-bold text-lg mb-4">Official Verification Notice</h4>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                All complaints must be accompanied by photographic evidence or relevant documents for processing. Unverified claims may be rejected by the Office Staff.
              </p>
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-widest">
                <FileText className="w-4 h-4" /> Policy Guidelines v2.4
              </div>
           </Card>
        </div>
      </div>

      {/* Complaint Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setShowForm(false)} />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 40 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 40 }}
              className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-10">
                <div className="flex justify-between items-center mb-10">
                  <div>
                    <h3 className="text-2xl font-black text-slate-900">New Grievance Redressal</h3>
                    <p className="text-sm text-slate-500 font-medium">Please provide accurate location and evidence.</p>
                  </div>
                  <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X className="w-6 h-6" /></button>
                </div>

                <div className="space-y-6">
                   <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</label>
                        <select className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500">
                          <option>Select Category</option>
                          <option>Water Supply</option>
                          <option>Electricity</option>
                          <option>Roads/Infrastructure</option>
                          <option>Sanitation</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location (Village/Area)</label>
                        <input type="text" placeholder="e.g. Seelampur Sector 4" className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                      </div>
                   </div>

                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Grievance Headline</label>
                      <input type="text" placeholder="Brief summary of the issue" className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                   </div>

                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Detailed Description</label>
                      <textarea rows={3} placeholder="Provide specific details to help staff verify..." className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-medium text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
                   </div>

                   {/* EVIDENCE DROPZONE */}
                   <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Evidence Documents (Required)</label>
                      <div className="border-2 border-dashed border-slate-200 rounded-[2rem] p-8 text-center bg-slate-50 hover:bg-white hover:border-indigo-300 transition-all cursor-pointer group">
                         <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm group-hover:scale-110 transition-transform">
                            <Upload className="w-6 h-6 text-indigo-600" />
                         </div>
                         <p className="text-sm font-black text-slate-900">Upload Photos or PDF</p>
                         <p className="text-xs text-slate-400 font-medium mt-1">Upload at least one document for verification.</p>
                      </div>
                   </div>

                   <div className="flex gap-4 pt-4">
                      <Button variant="ghost" fullWidth onClick={() => setShowForm(false)}>Discard</Button>
                      <Button fullWidth size="lg" className="rounded-2xl" onClick={handleFakeSubmit} disabled={isSubmitting}>
                        {isSubmitting ? 'Processing...' : 'Submit Grievance'}
                      </Button>
                   </div>
                </div>
              </div>
              <div className="bg-indigo-50 p-6 flex items-center gap-3">
                 <Camera className="w-5 h-5 text-indigo-600" />
                 <p className="text-[10px] font-black text-indigo-800 uppercase tracking-widest leading-relaxed">Verification Chain: Citizen (Upload) → Staff (Verify) → PA (Dispatch)</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
