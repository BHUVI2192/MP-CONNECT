
import React from 'react';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Search, Filter, TrendingUp, TrendingDown, Minus, ExternalLink, RefreshCw } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, Cell } from 'recharts';

const sentimentData = [
  { name: 'Positive', count: 24, color: '#22c55e' },
  { name: 'Neutral', count: 42, color: '#94a3b8' },
  { name: 'Negative', count: 12, color: '#ef4444' },
];

const newsClippings = [
  { 
    id: '1', 
    title: 'MP Rahul Kumar inaugurates new hospital wing in Northeast Delhi', 
    source: 'The Daily Herald', 
    date: '2 hours ago', 
    sentiment: 'Positive',
    summary: 'The inauguration marks a major milestone for local healthcare accessibility.' 
  },
  { 
    id: '2', 
    title: 'Local residents protest delay in road repairs near Metro station', 
    source: 'City Times', 
    date: '5 hours ago', 
    sentiment: 'Negative',
    summary: 'Protestors expressed frustration over the 3-month delay in finishing internal road work.' 
  },
  { 
    id: '3', 
    title: 'Constituency reports 15% increase in solar energy adoption', 
    source: 'Global News', 
    date: '1 day ago', 
    sentiment: 'Positive',
    summary: 'Efforts by the local representative office to promote green energy yield results.' 
  },
  { 
    id: '4', 
    title: 'New policy announcement for local vendors upcoming', 
    source: 'Economic Times', 
    date: '2 days ago', 
    sentiment: 'Neutral',
    summary: 'The MP Connect team is drafting a guideline for street vendor organization.' 
  },
];

export const MediaMpPage: React.FC = () => {
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900">Media Sentiment</h2>
          <p className="text-slate-500">Monitor public perception and newspaper clippings.</p>
        </div>
        <Button variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh Data
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card title="Sentiment Analysis" subtitle="Aggregated from top 10 local news sources" className="lg:col-span-1">
          <div className="h-64 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sentimentData} layout="vertical">
                <XAxis type="number" hide />
                <Tooltip 
                   cursor={{fill: 'transparent'}}
                   contentStyle={{borderRadius: '8px', border: 'none'}}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={40}>
                  {sentimentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
             <div className="flex justify-between text-sm font-bold text-slate-700">
                <span>Overall Sentiment Score</span>
                <span className="text-green-600">68/100</span>
             </div>
             <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 w-[68%]" />
             </div>
          </div>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search news..." 
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" /> Filter
            </Button>
          </div>

          <div className="space-y-4">
            {newsClippings.map((news) => (
              <Card key={news.id} className="group hover:border-indigo-300 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="space-y-1 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{news.source}</span>
                      <span className="text-xs text-slate-400">• {news.date}</span>
                    </div>
                    <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{news.title}</h4>
                    <p className="text-sm text-slate-500 line-clamp-2">{news.summary}</p>
                  </div>
                  <div className={`p-2 rounded-lg flex-shrink-0 ${
                    news.sentiment === 'Positive' ? 'bg-green-50 text-green-600' :
                    news.sentiment === 'Negative' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-500'
                  }`}>
                    {news.sentiment === 'Positive' ? <TrendingUp className="w-5 h-5" /> : 
                     news.sentiment === 'Negative' ? <TrendingDown className="w-5 h-5" /> : <Minus className="w-5 h-5" />}
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                   <button className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:underline">
                      <ExternalLink className="w-3 h-3" /> View Source
                   </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
