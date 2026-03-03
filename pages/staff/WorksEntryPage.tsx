
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
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
import { MOCK_PROJECTS } from '../../mockProjects';

export const WorksEntryPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = MOCK_PROJECTS.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.village.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Development Projects</h2>
          <p className="text-slate-500 font-medium">Register and track infrastructure works in the constituency.</p>
        </div>
        <Button onClick={() => navigate('/staff/works/new')} className="rounded-2xl shadow-lg shadow-indigo-100">
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
              {filteredProjects.map((project) => (
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
                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${
                      project.status === 'Completed' ? 'bg-green-100 text-green-700' : 
                      project.status === 'Ongoing' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'
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
    </div>
  );
};
