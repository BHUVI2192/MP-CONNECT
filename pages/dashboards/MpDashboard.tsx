
import React, { useState, useEffect } from 'react';
import { Card } from '../../components/UI/Card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { MapPin, TrendingUp, Wallet, Clock, AlertCircle } from 'lucide-react';
import { useMockData } from '../../context/MockDataContext';
import { supabase } from '../../lib/supabase';

type FundRow = { year: string; recommended_cr: number; sanctioned_cr: number; released_cr: number };

const COLORS = ['#4f46e5', '#818cf8', '#c7d2fe'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const formatCr = (v: number) => `₹${v.toFixed(1)} Cr`;

export const MpDashboard: React.FC = () => {
  const { complaints, tours } = useMockData();
  const [funds, setFunds] = useState<FundRow[]>([]);

  useEffect(() => {
    supabase
      .from('mplads_funds')
      .select('*')
      .then(({ data }: { data: FundRow[] | null }) => {
        if (data) setFunds(data);
      });
  }, []);

  // MPLADS stats
  const totalSanctioned = funds.reduce((s, f) => s + Number(f.sanctioned_cr), 0);
  const totalReleased = funds.reduce((s, f) => s + Number(f.released_cr), 0);
  const mpladsBalance = Math.max(totalSanctioned - totalReleased, 0);
  const mpladsData = [
    { name: 'Sanctioned', value: totalSanctioned },
    { name: 'Released', value: totalReleased },
    { name: 'Balance', value: mpladsBalance },
  ];

  // Complaint stats
  const today = new Date().toISOString().split('T')[0];
  const monthStart = `${today.slice(0, 7)}-01`;
  const pendingComplaints = complaints.filter(c => c.status === 'New' || c.status === 'Verified').length;
  const thisMonthAll = complaints.filter(c => c.createdAt >= monthStart).length;
  const thisMonthResolved = complaints.filter(c => c.status === 'Resolved' && c.createdAt >= monthStart).length;
  const resolvedPct = thisMonthAll > 0 ? Math.round((thisMonthResolved / thisMonthAll) * 100) : 0;

  // Complaint bar chart: last 5 months
  const now = new Date();
  const complaintData = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (4 - i), 1);
    const prefix = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const slice = complaints.filter(c => c.createdAt?.startsWith(prefix));
    return {
      month: MONTHS[d.getMonth()],
      received: slice.length,
      resolved: slice.filter(c => c.status === 'Resolved').length,
    };
  });

  // Tour stats
  const sortedFuture = tours
    .filter(t => t.startDate >= today)
    .sort((a, b) => a.startDate.localeCompare(b.startDate));
  const nextTour = sortedFuture[0];
  const upcomingTours = sortedFuture.slice(0, 3);

  const nextTourDate = nextTour
    ? new Date(nextTour.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
    : 'None';
  const nextTourPlace = nextTour?.location?.name ?? '—';

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900">Constituency Overview</h2>
          <p className="text-slate-500">Real-time data for Northeast Delhi Constituency</p>
        </div>
        <div className="flex gap-3">
          <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
            <TrendingUp className="w-3 h-3" /> Live Data
          </span>
          <span className="flex items-center gap-1 text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
            Last updated: Just now
          </span>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-indigo-600" delay={0.1}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-medium">MPLADS Balance</p>
              <h4 className="text-2xl font-bold text-slate-900 mt-1">
                {funds.length > 0 ? formatCr(mpladsBalance) : '—'}
              </h4>
            </div>
            <div className="bg-indigo-50 p-2 rounded-lg text-indigo-600">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
        </Card>
        <Card className="border-l-4 border-l-slate-900" delay={0.2}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-medium">Next Tour</p>
              <h4 className="text-2xl font-bold text-slate-900 mt-1">{nextTourDate}</h4>
              <p className="text-xs text-slate-400 mt-1">{nextTourPlace}</p>
            </div>
            <div className="bg-slate-100 p-2 rounded-lg text-slate-900">
              <MapPin className="w-5 h-5" />
            </div>
          </div>
        </Card>
        <Card className="border-l-4 border-l-orange-500" delay={0.3}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-medium">Pending Complaints</p>
              <h4 className="text-2xl font-bold text-slate-900 mt-1">{pendingComplaints}</h4>
            </div>
            <div className="bg-orange-50 p-2 rounded-lg text-orange-600">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
        </Card>
        <Card className="border-l-4 border-l-green-500" delay={0.4}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-medium">Resolved (Monthly)</p>
              <h4 className="text-2xl font-bold text-slate-900 mt-1">{resolvedPct}%</h4>
            </div>
            <div className="bg-green-50 p-2 rounded-lg text-green-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card title="Complaints Performance" subtitle="Volume vs Resolution Rate (Last 5 Months)" delay={0.5}>
          <div className="h-80 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={complaintData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="received" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={24} />
                <Bar dataKey="resolved" fill="#94a3b8" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="MPLADS Fund Distribution" subtitle="Budget utilization breakdown in Cr" delay={0.6}>
          <div className="h-80 w-full mt-4 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mpladsData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {mpladsData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => formatCr(v)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-extrabold text-slate-900">
                {funds.length > 0 ? formatCr(totalSanctioned) : '—'}
              </span>
              <span className="text-sm text-slate-400 font-medium uppercase tracking-widest">Sanctioned</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Upcoming Tours */}
      <Card title="Upcoming Tours" delay={0.7}>
        {upcomingTours.length === 0 ? (
          <p className="text-slate-400 text-sm mt-4">No upcoming tours scheduled.</p>
        ) : (
          <div className="space-y-4">
            {upcomingTours.map((tour) => (
              <div key={tour.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-lg border border-slate-200 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-slate-400" />
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900">{tour.location.name}</h5>
                    <p className="text-sm text-slate-500">{tour.type} • {tour.startTime}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                  tour.status === 'Scheduled' ? 'bg-green-100 text-green-700' :
                  tour.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  {tour.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};
