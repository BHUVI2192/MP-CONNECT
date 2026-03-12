import React from 'react';
import { Card } from '../../components/UI/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Building2, Droplets, GraduationCap, HeartPulse } from 'lucide-react';
import { motion } from 'framer-motion';
import { useMockData } from '../../context/MockDataContext';

export const WorksMpPage: React.FC = () => {
  const { works } = useMockData();

  const sectorData = [
    { name: 'Roads', planned: works.filter(w => w.category === 'Roads').length, completed: works.filter(w => w.category === 'Roads' && w.status === 'Completed').length },
    { name: 'Water', planned: works.filter(w => w.category === 'Water').length, completed: works.filter(w => w.category === 'Water' && w.status === 'Completed').length },
    { name: 'School', planned: works.filter(w => w.category === 'School').length, completed: works.filter(w => w.category === 'School' && w.status === 'Completed').length },
    { name: 'Health', planned: works.filter(w => w.category === 'Health').length, completed: works.filter(w => w.category === 'Health' && w.status === 'Completed').length },
  ];

  const categoryIcons = {
    Roads: Building2,
    Water: Droplets,
    School: GraduationCap,
    Health: HeartPulse,
  } as const;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <header>
        <h2 className="text-3xl font-extrabold text-slate-900">Development Works</h2>
        <p className="text-slate-500">Infrastructure projects summary and progress tracking.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card title="Projects Status by Sector" className="lg:col-span-2">
          <div className="h-64 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectorData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="planned" fill="#e2e8f0" radius={[4, 4, 0, 0]} barSize={32} />
                <Bar dataKey="completed" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 mt-4 text-xs font-medium text-slate-500 uppercase tracking-widest">
            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-[#e2e8f0] rounded"></div> Planned</div>
            <div className="flex items-center gap-1"><div className="w-3 h-3 bg-[#4f46e5] rounded"></div> Completed</div>
          </div>
        </Card>

        <Card title="Sector Breakdown">
          <div className="space-y-4">
            {sectorData.map((item) => {
              const Icon = categoryIcons[item.name as keyof typeof categoryIcons];
              return (
                <div key={item.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded shadow-sm text-indigo-600">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-slate-700">{item.name}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{item.completed}/{item.planned}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900">Project List</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {works.map((project) => (
            <Card key={project.id} className="hover:border-indigo-200 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-bold text-slate-900 text-lg leading-tight">{project.name}</h4>
                  <p className="text-sm text-slate-500 mt-1">{project.category} • Budget: {(project.budget / 10000000).toFixed(1)} Cr</p>
                </div>
                <div className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${project.status === 'Completed' ? 'bg-green-100 text-green-700' :
                    project.status === 'Ongoing' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                  {project.status}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-400">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${project.progress}%` }}
                    className={`h-full ${project.status === 'Completed' ? 'bg-green-500' : 'bg-indigo-600'}`}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
