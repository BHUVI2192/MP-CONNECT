
import React from 'react';
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
  Pie
} from 'recharts';
import { MapPin, MessageSquare, TrendingUp, Wallet, Clock, AlertCircle } from 'lucide-react';

const mpladsData = [
  { name: 'Sanctioned', value: 45 },
  { name: 'Released', value: 35 },
  { name: 'Utilized', value: 20 },
];

const complaintData = [
  { month: 'Jan', received: 45, resolved: 32 },
  { month: 'Feb', received: 52, resolved: 48 },
  { month: 'Mar', received: 38, resolved: 35 },
  { month: 'Apr', received: 65, resolved: 42 },
  { month: 'May', received: 48, resolved: 45 },
];

const COLORS = ['#4f46e5', '#818cf8', '#c7d2fe'];

export const MpDashboard: React.FC = () => {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900">Constituency Overview</h2>
          <p className="text-slate-500">Real-time data for Northeast Delhi Constituency</p>
        </div>
        <div className="flex gap-3">
          <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
            <TrendingUp className="w-3 h-3" /> +12% Efficiency
          </span>
          <span className="flex items-center gap-1 text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
            Last updated: 5 mins ago
          </span>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-indigo-600" delay={0.1}>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-medium">MPLADS Balance</p>
              <h4 className="text-2xl font-bold text-slate-900 mt-1">₹12.4 Cr</h4>
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
              <h4 className="text-2xl font-bold text-slate-900 mt-1">24 May</h4>
              <p className="text-xs text-slate-400 mt-1">Seelampur Village</p>
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
              <h4 className="text-2xl font-bold text-slate-900 mt-1">142</h4>
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
              <h4 className="text-2xl font-bold text-slate-900 mt-1">89%</h4>
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
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
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
                  {mpladsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center">
              <span className="text-3xl font-extrabold text-slate-900">₹25 Cr</span>
              <span className="text-sm text-slate-400 font-medium uppercase tracking-widest">Total Fund</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity / Tours */}
      <Card title="Upcoming Tours" delay={0.7}>
        <div className="space-y-4">
          {[
            { area: "Yamuna Vihar", time: "10:30 AM", type: "Public Meeting", status: "Confirmed" },
            { area: "Shahdara Metro", time: "02:00 PM", type: "Road Inspection", status: "Ongoing" },
            { area: "Sriram Colony", time: "05:30 PM", type: "House Visit", status: "Pending" },
          ].map((tour, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-lg border border-slate-200 flex items-center justify-center">
                   <Clock className="w-6 h-6 text-slate-400" />
                </div>
                <div>
                  <h5 className="font-bold text-slate-900">{tour.area}</h5>
                  <p className="text-sm text-slate-500">{tour.type} • {tour.time}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                tour.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 
                tour.status === 'Ongoing' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
              }`}>
                {tour.status}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
