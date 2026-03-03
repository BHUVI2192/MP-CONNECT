import React from 'react';
import { Filter, X, ChevronDown, Calendar, Star, MapPin } from 'lucide-react';
import { Button } from './Button';

interface ContactFiltersProps {
  onClose?: () => void;
  filters: any;
  setFilters: (filters: any) => void;
}

export const ContactFilters: React.FC<ContactFiltersProps> = ({ onClose, filters, setFilters }) => {
  const categories = ['Political Leader', 'Government Official', 'Community Head', 'Media', 'Business', 'Citizen'];

  const toggleCategory = (cat: string) => {
    const next = filters.categories.includes(cat)
      ? filters.categories.filter((c: string) => c !== cat)
      : [...filters.categories, cat];
    setFilters({ ...filters, categories: next });
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 w-full md:w-80">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-indigo-600" />
          <h3 className="font-black text-slate-900 tracking-tight">Filters</h3>
        </div>
        {onClose && (
          <button onClick={onClose} className="md:hidden p-2 hover:bg-slate-100 rounded-full">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Location Filters */}
        <section className="space-y-4">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <MapPin className="w-3 h-3" /> Location
          </h4>
          <div className="space-y-3">
            {['State', 'Zilla', 'Taluk', 'GP', 'Village'].map((level) => (
              <div key={level} className="relative">
                <select
                  className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl appearance-none font-bold text-sm text-slate-700 focus:border-indigo-600 outline-none transition-all"
                  value={filters.location[level.toLowerCase()]}
                  onChange={(e) =>
                    setFilters({
                      ...filters,
                      location: { ...filters.location, [level.toLowerCase()]: e.target.value },
                    })
                  }
                >
                  <option value="">Select {level}</option>
                  <option value="Karnataka">Karnataka</option>
                  {/* Mock options */}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            ))}
          </div>
        </section>

        {/* Categories */}
        <section className="space-y-4">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Categories</h4>
          <div className="space-y-2">
            {categories.map((cat) => (
              <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                <div
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                    filters.categories.includes(cat)
                      ? 'bg-indigo-600 border-indigo-600'
                      : 'border-slate-200 group-hover:border-indigo-300'
                  }`}
                  onClick={() => toggleCategory(cat)}
                >
                  {filters.categories.includes(cat) && <X className="w-3 h-3 text-white" />}
                </div>
                <span className="text-sm font-bold text-slate-600">{cat}</span>
              </label>
            ))}
          </div>
        </section>

        {/* Special Filters */}
        <section className="space-y-4">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Special</h4>
          <div className="space-y-4">
            <label className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-3">
                <Star className={`w-4 h-4 ${filters.vipOnly ? 'text-amber-500 fill-current' : 'text-slate-400'}`} />
                <span className="text-sm font-bold text-slate-600">VIP Only</span>
              </div>
              <div
                className={`w-10 h-6 rounded-full relative transition-all ${
                  filters.vipOnly ? 'bg-indigo-600' : 'bg-slate-200'
                }`}
                onClick={() => setFilters({ ...filters, vipOnly: !filters.vipOnly })}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                    filters.vipOnly ? 'left-5' : 'left-1'
                  }`}
                />
              </div>
            </label>

            <label className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-bold text-slate-600">Birthdays This Month</span>
              </div>
              <div
                className={`w-10 h-6 rounded-full relative transition-all ${
                  filters.birthdaysThisMonth ? 'bg-indigo-600' : 'bg-slate-200'
                }`}
                onClick={() => setFilters({ ...filters, birthdaysThisMonth: !filters.birthdaysThisMonth })}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                    filters.birthdaysThisMonth ? 'left-5' : 'left-1'
                  }`}
                />
              </div>
            </label>

            <label className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-bold text-slate-600">Anniversaries This Month</span>
              </div>
              <div
                className={`w-10 h-6 rounded-full relative transition-all ${
                  filters.anniversariesThisMonth ? 'bg-indigo-600' : 'bg-slate-200'
                }`}
                onClick={() => setFilters({ ...filters, anniversariesThisMonth: !filters.anniversariesThisMonth })}
              >
                <div
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                    filters.anniversariesThisMonth ? 'left-5' : 'left-1'
                  }`}
                />
              </div>
            </label>
          </div>
        </section>

        {/* Date Range */}
        <section className="space-y-4">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Added</h4>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-indigo-600"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
            />
            <input
              type="date"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-xs outline-none focus:border-indigo-600"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            />
          </div>
        </section>
      </div>

      <div className="p-6 border-t border-slate-100">
        <Button
          variant="outline"
          fullWidth
          className="rounded-2xl"
          onClick={() =>
            setFilters({
              location: { state: '', zilla: '', taluk: '', gp: '', village: '' },
              categories: [],
              vipOnly: false,
              birthdaysThisMonth: false,
              anniversariesThisMonth: false,
              dateFrom: '',
              dateTo: '',
            })
          }
        >
          Reset Filters
        </Button>
      </div>
    </div>
  );
};
