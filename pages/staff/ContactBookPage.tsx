import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Plus, Upload, Filter, Search, Users, Grid, List as ListIcon, X, AlertCircle } from 'lucide-react';
import { Contact } from '../../types';
import { MOCK_CONTACTS } from '../../mockData';
import { Button } from '../../components/UI/Button';
import { ContactCard } from '../../components/UI/ContactCard';
import { ContactFilters } from '../../components/UI/ContactFilters';
import { GlobalSearch } from '../../components/UI/GlobalSearch';

// Mock Data
export const ContactBookPage: React.FC = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<Contact[]>(MOCK_CONTACTS);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<Contact | null>(null);
  const [filters, setFilters] = useState({
    location: { state: '', zilla: '', taluk: '', gp: '', village: '' },
    categories: [] as string[],
    vipOnly: false,
    birthdaysThisMonth: false,
    anniversariesThisMonth: false,
    dateFrom: '',
    dateTo: '',
  });

  const filteredContacts = useMemo(() => {
    return contacts.filter((c) => {
      if (filters.vipOnly && !c.isVip) return false;
      if (filters.categories.length > 0 && !filters.categories.includes(c.category)) return false;
      if (filters.location.zilla && c.zilla !== filters.location.zilla) return false;
      if (filters.location.taluk && c.taluk !== filters.location.taluk) return false;
      // Add other filter logic as needed
      return true;
    });
  }, [contacts, filters]);

  const handleDelete = (contact: Contact) => {
    setContacts(contacts.filter((c) => c.id !== contact.id));
    setShowDeleteConfirm(null);
  };

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden -m-8">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 320, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="hidden md:block h-full"
          >
            <ContactFilters filters={filters} setFilters={setFilters} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
        {/* Sticky Top Bar */}
        <header className="sticky top-0 z-50 bg-white border-b border-slate-200 p-6 flex flex-col gap-6 shadow-sm">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
                <Users className="w-8 h-8 text-indigo-600" />
                Contact Book
              </h2>
              <p className="text-slate-500 font-medium text-sm">Manage and organize your constituency network.</p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <Button variant="outline" className="rounded-2xl flex-1 md:flex-none" onClick={() => navigate('/staff/contacts/bulk')}>
                <Upload className="w-4 h-4 mr-2" /> Bulk Upload
              </Button>
              <Button className="rounded-2xl flex-1 md:flex-none" onClick={() => navigate('/staff/contacts/new')}>
                <Plus className="w-4 h-4 mr-2" /> Add New Contact
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className={`p-4 rounded-2xl border-2 transition-all ${
                isSidebarOpen ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-slate-200 text-slate-400'
              }`}
            >
              <Filter className="w-5 h-5" />
            </button>
            <GlobalSearch
              contacts={contacts}
              onSelect={(c) => {
                navigate(`/staff/contacts/${c.id}`);
              }}
              onAddNew={() => navigate('/staff/contacts/new')}
            />
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest">
                Showing <span className="text-slate-900">{filteredContacts.length}</span> of{' '}
                <span className="text-slate-900">{contacts.length}</span> contacts
              </p>
              <div className="flex bg-slate-200 p-1 rounded-xl">
                <button className="p-2 bg-white rounded-lg shadow-sm text-indigo-600">
                  <Grid className="w-4 h-4" />
                </button>
                <button className="p-2 text-slate-500 hover:text-slate-700">
                  <ListIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {filteredContacts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredContacts.map((contact) => (
                  <motion.div
                    key={contact.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div onClick={() => navigate(`/staff/contacts/${contact.id}`)} className="cursor-pointer">
                      <ContactCard
                        contact={contact}
                        onEdit={() => navigate(`/staff/contacts/edit/${contact.id}`)}
                        onDelete={() => setShowDeleteConfirm(contact)}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-24 h-24 bg-slate-100 text-slate-300 rounded-[2.5rem] flex items-center justify-center mb-6">
                  <Users className="w-12 h-12" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">No contacts found</h3>
                <p className="text-slate-500 mt-2 max-w-xs mx-auto">
                  Try adjusting your filters or search query to find what you're looking for.
                </p>
                <Button variant="outline" className="mt-8 rounded-2xl" onClick={() => setFilters({
                  location: { state: '', zilla: '', taluk: '', gp: '', village: '' },
                  categories: [],
                  vipOnly: false,
                  birthdaysThisMonth: false,
                  anniversariesThisMonth: false,
                  dateFrom: '',
                  dateTo: '',
                })}>
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setShowDeleteConfirm(null)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden relative z-10"
            >
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Delete Contact?</h3>
                <p className="text-slate-500 mt-2">
                  Are you sure you want to delete <span className="font-black text-slate-900">{showDeleteConfirm.name}</span>? This action cannot be undone.
                </p>
                <div className="mt-8 flex gap-3">
                  <Button
                    variant="outline"
                    fullWidth
                    className="rounded-2xl py-4"
                    onClick={() => setShowDeleteConfirm(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    fullWidth
                    className="rounded-2xl py-4 bg-red-600 hover:bg-red-700 text-white border-red-600"
                    onClick={() => handleDelete(showDeleteConfirm)}
                  >
                    Delete Contact
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
