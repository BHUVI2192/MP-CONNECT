
import React from 'react';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Search, Filter, AlertCircle, Clock, CheckCircle2, MoreVertical, Flag } from 'lucide-react';

import { useState } from 'react';
import { useComplaints } from '../../hooks/useComplaints';

export const ComplaintsMpPage: React.FC = () => {
  const { complaints, updateStatus, loading, error } = useComplaints();
  const [activeTab, setActiveTab] = useState<'Pending' | 'Resolved'>('Pending');

  const pendingComplaints = complaints.filter((c) => c.status !== 'Resolved' && c.status !== 'Rejected');
  const resolvedComplaints = complaints.filter((c) => c.status === 'Resolved');
  const visibleComplaints = activeTab === 'Pending' ? pendingComplaints : resolvedComplaints;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900">Citizen Complaints</h2>
          <p className="text-slate-500">Monitor and track resolution of constituent grievances.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Advanced Analytics</Button>
          <Button>Export PDF</Button>
        </div>
      </header>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Pending Review', count: pendingComplaints.length, color: 'bg-blue-100 text-blue-600' },
          { label: 'Resolved', count: resolvedComplaints.length, color: 'bg-green-100 text-green-600' },
          { label: 'High Priority', count: complaints.filter(c => c.priority === 'High').length, color: 'bg-red-100 text-red-600' },
        ].map((stat) => (
          <Card key={stat.label} className="p-4 border-none shadow-sm flex flex-col items-center text-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</span>
            <span className={`text-2xl font-black mt-1 px-3 py-1 rounded-lg ${stat.color}`}>{stat.count}</span>
          </Card>
        ))}
      </div>

      <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit">
        {(['Pending', 'Resolved'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:bg-white/50'
              }`}
          >
            {tab === 'Pending' ? 'Pending Review' : tab}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          Failed to load complaints: {error}
        </div>
      )}

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search complaints by ID, name, or keywords..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" /> Sort By
          </Button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Grievance</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Citizen</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Priority</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Raised</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td className="px-6 py-8 text-sm font-medium text-slate-500" colSpan={6}>Loading complaints...</td>
                </tr>
              ) : visibleComplaints.length === 0 ? (
                <tr>
                  <td className="px-6 py-8 text-sm font-medium text-slate-500" colSpan={6}>No complaints found for this tab.</td>
                </tr>
              ) : visibleComplaints.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <AlertCircle className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 leading-tight">{item.description.length > 30 ? item.description.substring(0, 30) + '...' : item.description}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{item.id} • {item.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-700">{item.citizen_name}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase ${item.priority === 'High' ? 'text-red-600' :
                        item.priority === 'Medium' ? 'text-orange-600' : 'text-slate-400'
                      }`}>
                      <Flag className="w-3 h-3" fill="currentColor" /> {item.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase ${item.status === 'Resolved' ? 'bg-green-100 text-green-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                      {item.status === 'Resolved' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {item.status}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400 font-medium">{new Date(item.created_at).toLocaleDateString('en-IN')}</td>
                  <td className="px-6 py-4 text-right">
                    {item.status !== 'Resolved' && item.status !== 'Rejected' && (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white rounded-lg"
                        onClick={() => { void updateStatus(item.id, 'Resolved'); }}
                      >
                        Resolve
                      </Button>
                    )}
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
