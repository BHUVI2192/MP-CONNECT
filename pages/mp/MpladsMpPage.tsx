
import React from 'react';
import { Card } from '../../components/UI/Card';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { ArrowUpRight, ArrowDownRight, IndianRupee, PieChart, Info, Download } from 'lucide-react';
import { Button } from '../../components/UI/Button';

const fundHistory = [
  { year: '2020', recommended: 5, sanctioned: 4.5, released: 4 },
  { year: '2021', recommended: 5, sanctioned: 4.8, released: 4.5 },
  { year: '2022', recommended: 5, sanctioned: 5, released: 5 },
  { year: '2023', recommended: 7.5, sanctioned: 7, released: 6.5 },
  { year: '2024', recommended: 7.5, sanctioned: 3.5, released: 2 },
];

export const MpladsMpPage: React.FC = () => {
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

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-slate-900 text-white border-none shadow-xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-sm font-medium">Total Recommended</p>
              <h4 className="text-3xl font-bold mt-1">₹30.0 Cr</h4>
              <p className="text-xs text-indigo-400 mt-2 flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" /> 100% of entitlement
              </p>
            </div>
            <div className="bg-white/10 p-2 rounded-lg text-white">
              <PieChart className="w-6 h-6" />
            </div>
          </div>
        </Card>
        <Card className="bg-indigo-600 text-white border-none shadow-xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-indigo-200 text-sm font-medium">Total Sanctioned</p>
              <h4 className="text-3xl font-bold mt-1">₹24.8 Cr</h4>
              <p className="text-xs text-indigo-200 mt-2 flex items-center gap-1">
                <Info className="w-3 h-3" /> 82.6% of recommended
              </p>
            </div>
            <div className="bg-white/10 p-2 rounded-lg text-white">
              <IndianRupee className="w-6 h-6" />
            </div>
          </div>
        </Card>
        <Card className="bg-white text-slate-900 border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-medium">Total Released</p>
              <h4 className="text-3xl font-bold mt-1">₹22.0 Cr</h4>
              <p className="text-xs text-red-600 mt-2 flex items-center gap-1">
                <ArrowDownRight className="w-3 h-3" /> Pending releases: ₹2.8 Cr
              </p>
            </div>
            <div className="bg-slate-100 p-2 rounded-lg text-slate-600">
              <ArrowUpRight className="w-6 h-6" />
            </div>
          </div>
        </Card>
      </div>

      <Card title="Financial Cycle (Past 5 Years)" subtitle="Comparison of Recommendation vs Release in Crores">
        <div className="h-80 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={fundHistory}>
              <defs>
                <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
              <Tooltip 
                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
              />
              <Area type="monotone" dataKey="recommended" stroke="#4f46e5" fillOpacity={1} fill="url(#colorRec)" />
              <Area type="monotone" dataKey="released" stroke="#94a3b8" fillOpacity={0} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="space-y-4">
        <h3 className="text-xl font-bold text-slate-900">Recent Sanctions</h3>
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
              {[
                { name: 'Community Center, Block G', date: 'Feb 12, 2024', amount: '₹45 L', status: 'Sanctioned' },
                { name: 'Solar Street Lights Phase IV', date: 'Jan 05, 2024', amount: '₹88 L', status: 'Released' },
                { name: 'Library Digitalization', date: 'Dec 22, 2023', amount: '₹12 L', status: 'In Process' },
              ].map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900">{item.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-500">{item.date}</td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-900">{item.amount}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      item.status === 'Released' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {item.status}
                    </span>
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
