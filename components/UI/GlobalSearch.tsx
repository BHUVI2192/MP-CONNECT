import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, X, User, Phone, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Contact } from '../../types';

interface GlobalSearchProps {
  contacts: Contact[];
  onSelect: (contact: Contact) => void;
  onAddNew: () => void;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ contacts, onSelect, onAddNew }) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);

  const results = useMemo(() => {
    if (query.length >= 2) {
      return contacts.filter((c) =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.designation.toLowerCase().includes(query.toLowerCase()) ||
        c.mobile.includes(query)
      ).slice(0, 10);
    }
    return [];
  }, [query, contacts]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.length >= 2) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
      setSelectedIndex(-1);
    }, 0);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && results[selectedIndex]) {
        onSelect(results[selectedIndex]);
        setIsOpen(false);
        setQuery('');
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <span key={i} className="bg-indigo-100 text-indigo-900 font-black">
              {part}
            </span>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <div ref={searchRef} className="relative flex-1 max-w-2xl">
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-600 transition-colors" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search contacts by name, designation, or mobile..."
          className="w-full pl-12 pr-12 py-4 bg-slate-100 border-2 border-transparent focus:border-indigo-600 focus:bg-white rounded-2xl outline-none font-bold text-slate-900 transition-all shadow-sm"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-[110]"
          >
            {results.length > 0 ? (
              <div className="p-2">
                {results.map((contact, index) => (
                  <button
                    key={contact.id}
                    onClick={() => {
                      onSelect(contact);
                      setIsOpen(false);
                      setQuery('');
                    }}
                    className={`w-full flex items-center gap-4 p-3 rounded-2xl text-left transition-all ${
                      selectedIndex === index ? 'bg-indigo-50 border-indigo-100' : 'hover:bg-slate-50'
                    }`}
                  >
                    {contact.photoUrl ? (
                      <img
                        src={contact.photoUrl}
                        alt={contact.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-100"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-black text-sm border border-slate-200">
                        {contact.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-black text-slate-900 text-sm truncate">
                        {highlightText(contact.name, query)}
                      </div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase truncate">
                        {highlightText(contact.designation, query)}
                      </div>
                    </div>
                    <div className="text-xs font-black text-indigo-600 flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      {highlightText(contact.mobile, query)}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8" />
                </div>
                <h4 className="font-black text-slate-900">No results found for "{query}"</h4>
                <p className="text-sm text-slate-500 mt-1">Try a different search term or add a new contact.</p>
                <button
                  onClick={onAddNew}
                  className="mt-6 text-indigo-600 font-black text-sm hover:underline flex items-center gap-2 mx-auto"
                >
                  Add New Contact <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
