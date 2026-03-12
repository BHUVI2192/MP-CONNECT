
import React, { useState, useEffect } from 'react';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { Search, Filter, TrendingUp, TrendingDown, Minus, ExternalLink, RefreshCw, Loader2 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, Cell } from 'recharts';
import { supabase } from '../../lib/supabase';

type Clip = {
  id: string;
  title: string;
  source: string;
  published_at: string;
  sentiment: 'Positive' | 'Negative' | 'Neutral';
  summary?: string;
  url?: string;
};

const SENTIMENT_COLORS = {
  Positive: '#22c55e',
  Neutral: '#94a3b8',
  Negative: '#ef4444',
};

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 24) return `${h} hour${h !== 1 ? 's' : ''} ago`;
  const d = Math.floor(h / 24);
  return `${d} day${d !== 1 ? 's' : ''} ago`;
};

export const MediaMpPage: React.FC = () => {
  const [clips, setClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadClips = () => {
    setLoading(true);
    supabase
      .from('media_clips')
      .select('*')
      .order('published_at', { ascending: false })
      .then(({ data }) => {
        setClips((data ?? []) as Clip[]);
        setLoading(false);
      });
  };

  useEffect(() => { loadClips(); }, []);

  const filtered = clips.filter(c =>
    !search || c.title.toLowerCase().includes(search.toLowerCase()) ||
    (c.summary ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const sentimentData = [
    { name: 'Positive', count: clips.filter(c => c.sentiment === 'Positive').length, color: SENTIMENT_COLORS.Positive },
    { name: 'Neutral',  count: clips.filter(c => c.sentiment === 'Neutral').length,  color: SENTIMENT_COLORS.Neutral  },
    { name: 'Negative', count: clips.filter(c => c.sentiment === 'Negative').length, color: SENTIMENT_COLORS.Negative },
  ];

  const totalScore = clips.length
    ? Math.round(
        ((clips.filter(c => c.sentiment === 'Positive').length * 100 +
          clips.filter(c => c.sentiment === 'Neutral').length * 50) /
          clips.length)
      )
    : 0;

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900">Media Sentiment</h2>
          <p className="text-slate-500">Monitor public perception and newspaper clippings.</p>
        </div>
        <Button variant="outline" onClick={loadClips}>
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh Data
        </Button>
      </header>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card title="Sentiment Analysis" subtitle="Aggregated from news clips" className="lg:col-span-1">
            <div className="h-64 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sentimentData} layout="vertical">
                  <XAxis type="number" hide />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', border: 'none'}} />
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
                <span className="text-green-600">{totalScore}/100</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${totalScore}%` }} />
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
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" /> Filter
              </Button>
            </div>

            {filtered.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">No clips found.</p>
            ) : (
              <div className="space-y-4">
                {filtered.map((news) => (
                  <Card key={news.id} className="group hover:border-indigo-300 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1 pr-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">{news.source}</span>
                          <span className="text-xs text-slate-400">â€¢ {timeAgo(news.published_at)}</span>
                        </div>
                        <h4 className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{news.title}</h4>
                        {news.summary && <p className="text-sm text-slate-500 line-clamp-2">{news.summary}</p>}
                      </div>
                      <div className={`p-2 rounded-lg flex-shrink-0 ${
                        news.sentiment === 'Positive' ? 'bg-green-50 text-green-600' :
                        news.sentiment === 'Negative' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-500'
                      }`}>
                        {news.sentiment === 'Positive' ? <TrendingUp className="w-5 h-5" /> :
                         news.sentiment === 'Negative' ? <TrendingDown className="w-5 h-5" /> :
                         <Minus className="w-5 h-5" />}
                      </div>
                    </div>
                    {news.url && (
                      <div className="mt-4 pt-4 border-t border-slate-100 flex justify-end">
                        <a
                          href={news.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" /> View Source
                        </a>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
