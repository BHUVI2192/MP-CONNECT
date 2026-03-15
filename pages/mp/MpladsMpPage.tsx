
import React, { useState, useEffect } from 'react';
import { Card } from '../../components/UI/Card';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { ArrowUpRight, ArrowDownRight, IndianRupee, PieChart, Info, Download, Loader2 } from 'lucide-react';
import { Button } from '../../components/UI/Button';
import { supabase } from '../../lib/supabase';

type FundRow = { id: string; year: string; recommended_cr: number; sanctioned_cr: number; released_cr: number };
type ProjectRow = { id: string; project_name: string; recommended_date?: string; amount_lakhs: number; status: string };

export const MpladsMpPage: React.FC = () => {
  const [funds, setFunds] = useState<FundRow[]>([]);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from('mplads_funds').select('*').order('year', { ascending: true }),
      supabase.from('mplads_projects').select('*').order('recommended_date', { ascending: false }),
    ]).then(([{ data: f }, { data: p }]) => {
      setFunds((f ?? []) as FundRow[]);
      setProjects((p ?? []) as ProjectRow[]);
      setLoading(false);
    });
  }, []);

  const totalRecommended = funds.reduce((s, f) => s + Number(f.recommended_cr), 0);
  const totalSanctioned  = funds.reduce((s, f) => s + Number(f.sanctioned_cr), 0);
  const totalReleased    = funds.reduce((s, f) => s + Number(f.released_cr), 0);
  const pendingReleased  = totalSanctioned - totalReleased;

  const formatCr = (n: number) => `${n.toLocaleString('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} Cr`;
  const sanctionPct = totalRecommended > 0 ? ((totalSanctioned / totalRecommended) * 100).toFixed(1) : '0';

  const formatDate = (d?: string) => {
    if (!d) return 'â€”';
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900">MPLADS Funds</h2>
          <p className="text-slate-500">Monitoring fund recommendation, sanction, and release cycles.</p>
        </div>
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" /> Download Report
        </Button>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-slate-900 text-white border-none shadow-xl">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-400 text-sm font-medium">Total Recommended</p>
                  <h4 className="text-3xl font-bold mt-1">{formatCr(totalRecommended)}</h4>
                  <p className="text-xs text-indigo-400 mt-2 flex items-center gap-1">
                    <ArrowUpRight className="w-3 h-3" /> 100% of entitlement
                  </p>
                </div>
                <div className="bg-white/10 p-2 rounded-lg text-white"><PieChart className="w-6 h-6" /></div>
              </div>
            </Card>
            <Card className="bg-indigo-600 text-white border-none shadow-xl">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-indigo-200 text-sm font-medium">Total Sanctioned</p>
                  <h4 className="text-3xl font-bold mt-1">{formatCr(totalSanctioned)}</h4>
                  <p className="text-xs text-indigo-200 mt-2 flex items-center gap-1">
                    <Info className="w-3 h-3" /> {sanctionPct}% of recommended
                  </p>
                </div>
                <div className="bg-white/10 p-2 rounded-lg text-white"><IndianRupee className="w-6 h-6" /></div>
              </div>
            </Card>
            <Card className="bg-white text-slate-900 border-slate-200">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-slate-500 text-sm font-medium">Total Released</p>
                  <h4 className="text-3xl font-bold mt-1">{formatCr(totalReleased)}</h4>
                  <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                    <ArrowDownRight className="w-3 h-3" /> Pending: {formatCr(pendingReleased)}
                  </p>
                </div>
                <div className="bg-slate-100 p-2 rounded-lg text-slate-600"><ArrowUpRight className="w-6 h-6" /></div>
              </div>
            </Card>
          </div>

          <Card title="Financial Cycle" subtitle="Comparison of Recommendation vs Release in Crores">
            <div className="h-80 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={funds}>
                  <defs>
                    <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Area type="monotone" dataKey="recommended_cr" name="Recommended (Cr)" stroke="#4f46e5" fillOpacity={1} fill="url(#colorRec)" />
                  <Area type="monotone" dataKey="released_cr" name="Released (Cr)" stroke="#94a3b8" fillOpacity={0} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900">Recent Sanctions</h3>
            {projects.length === 0 ? (
              <p className="text-slate-400 text-sm">No projects found.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left bg-white">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Project Name</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Rec. Date</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Amount</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {projects.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-bold text-slate-900">{item.project_name}</td>
                        <td className="px-6 py-4 text-sm text-slate-500">{formatDate(item.recommended_date)}</td>
                        <td className="px-6 py-4 text-sm font-bold text-slate-900">â‚¹{item.amount_lakhs} L</td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                            item.status === 'Released' ? 'bg-green-100 text-green-700' :
                            item.status === 'Sanctioned' ? 'bg-blue-100 text-blue-700' :
                            'bg-amber-100 text-amber-700'
                          }`}>
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
