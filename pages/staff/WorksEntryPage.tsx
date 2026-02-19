
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import {
  Plus,
  Search,
  Filter,
  Building2,
  FileText,
  CheckCircle2,
  Clock,
  IndianRupee,
  MoreVertical,
  X,
  Upload,
  Calendar
} from 'lucide-react';
import { Project } from '../../types';

import { useMockData } from '../../context/MockDataContext';

export const WorksEntryPage: React.FC = () => {
  const { works, addWork } = useMockData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [newWork, setNewWork] = useState<Partial<Project>>({
    name: '',
    category: 'Roads',
    status: 'Planned',
    progress: 0,
    budget: 0,
    village: '',
    sanctionOrderNo: '',
    startDate: ''
  });

  const handleCreateWork = () => {
    if (!newWork.name || !newWork.village) return;

    const work: Project = {
      id: `PRJ-${Math.floor(Math.random() * 1000)}`,
      name: newWork.name!,
      category: newWork.category as any,
      status: 'Planned',
      progress: 0,
      budget: newWork.budget || 0,
      village: newWork.village!,
      sanctionOrderNo: newWork.sanctionOrderNo || `SO-${Math.floor(Math.random() * 100)}/2024`,
      startDate: new Date().toISOString().split('T')[0]
    };

    addWork(work);
    setShowAddModal(false);
    setNewWork({ name: '', category: 'Roads', status: 'Planned', progress: 0, budget: 0, village: '', sanctionOrderNo: '', startDate: '' });
  };

  const filteredWorks = works.filter(w =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.village.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Development Projects</h2>
          <p className="text-slate-500 font-medium">Register and track infrastructure works in the constituency.</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="rounded-2xl shadow-lg shadow-indigo-100">
          <Plus className="w-5 h-5 mr-2" /> New Project Entry
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-900 text-white border-none">
          <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Active Projects</p>
          <h4 className="text-3xl font-black mt-2">14</h4>
          <p className="text-indigo-400 text-xs mt-2 font-bold">87% on schedule</p>
        </Card>
        <Card>
          <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Total Budgeted</p>
          <h4 className="text-3xl font-black mt-2">₹12.8 Cr</h4>
          <p className="text-green-600 text-xs mt-2 font-bold">₹4.2 Cr Disbursed</p>
        </Card>
        <Card>
          <p className="text-slate-400 text-xs font-black uppercase tracking-widest">Completed (FY 24-25)</p>
          <h4 className="text-3xl font-black mt-2">06</h4>
          <p className="text-slate-500 text-xs mt-2 font-bold">12 projects in pipeline</p>
        </Card>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID, name or village..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 text-sm bg-slate-50 border border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl transition-all outline-none"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Button variant="outline" size="sm" className="rounded-xl"><Filter className="w-4 h-4 mr-2" /> Filter By Sector</Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 text-slate-400 uppercase text-[10px] font-black tracking-widest border-b border-slate-100">
              <tr>
                <th className="px-8 py-5">Project Details</th>
                <th className="px-8 py-5">Village/Area</th>
                <th className="px-8 py-5">Progress</th>
                <th className="px-8 py-5">Budget</th>
                <th className="px-8 py-5">Status</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredWorks.map((project) => (
                <tr key={project.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 font-bold">
                        {project.category[0]}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 leading-tight">{project.name}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold mt-0.5">{project.id} • {project.sanctionOrderNo}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm font-bold text-slate-700">{project.village}</td>
                  <td className="px-8 py-5">
                    <div className="w-full max-w-[120px]">
                      <div className="flex justify-between text-[10px] font-black text-slate-400 mb-1 uppercase">
                        <span>{project.progress}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${project.progress}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm font-black text-slate-900">₹{(project.budget / 10000000).toFixed(1)} Cr</td>
                  <td className="px-8 py-5">
                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${project.status === 'Completed' ? 'bg-green-100 text-green-700' :
                      project.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
                      }`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-300 hover:text-indigo-600 transition-colors">
                      <MoreVertical className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)} />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden">
              <div className="p-10">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-3xl font-black text-slate-900">Add New Project</h3>
                  <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X className="w-6 h-6" /></button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Project Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Community Center"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                      value={newWork.name}
                      onChange={(e) => setNewWork({ ...newWork, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Village/Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Shahdara"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                      value={newWork.village}
                      onChange={(e) => setNewWork({ ...newWork, village: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sanction Order No.</label>
                    <input
                      type="text"
                      placeholder="SO/..."
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                      value={newWork.sanctionOrderNo}
                      onChange={(e) => setNewWork({ ...newWork, sanctionOrderNo: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Budget (INR)</label>
                    <input
                      type="number"
                      placeholder="5,00,000"
                      className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                      value={newWork.budget || ''}
                      onChange={(e) => setNewWork({ ...newWork, budget: Number(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="mt-8 p-6 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200 text-center space-y-3">
                  <Upload className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-sm font-bold text-slate-600">Drag & Drop Documents</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Sanction Orders, Bills, Photos (Max 10MB)</p>
                </div>

                <div className="flex gap-4 mt-10">
                  <Button variant="ghost" fullWidth onClick={() => setShowAddModal(false)}>Cancel</Button>
                  <Button fullWidth onClick={handleCreateWork}>Register Project</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
