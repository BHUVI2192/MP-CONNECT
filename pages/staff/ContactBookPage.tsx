import React, { useState, useEffect, useMemo } from 'react';
import {
    Search,
    Plus,
    Upload,
    Filter,
    ChevronDown,
    Star,
    Calendar,
    X,
    ChevronRight
} from 'lucide-react';
import { Contact, ContactCategory } from '../../types';
import ContactCard from '../../components/ContactCard';
import { useNavigate } from 'react-router-dom';
import { contactsApi } from '../../hooks/useContacts';

export const ContactBookPage: React.FC = () => {
    const navigate = useNavigate();
    const [allContacts, setAllContacts] = useState<Contact[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        contactsApi.list().then(({ data }) => {
            if (data) setAllContacts(data.map((r: any) => ({
                id: r.contact_id,
                name: r.full_name,
                designation: r.designation ?? '',
                organization: r.organization ?? '',
                location: { state: r.state ?? '', zilla: r.zilla ?? '', taluk: r.taluk ?? '', gp: r.gram_panchayat ?? '', village: r.village ?? '' },
                mobile: r.mobile ?? '',
                email: r.email ?? undefined,
                category: r.category ?? 'OTHER',
                isVip: r.is_vip ?? false,
                addedAt: r.created_at ?? '',
                birthday: r.birthday ?? undefined,
                anniversary: r.anniversary ?? undefined,
            })));
        });
    }, []);

    // Filters State
    const [filters, setFilters] = useState({
        state: '',
        zilla: '',
        taluk: '',
        gp: '',
        village: '',
        categories: [] as ContactCategory[],
        vipOnly: false,
        birthdaysThisMonth: false,
        anniversariesThisMonth: false,
        dateFrom: '',
        dateTo: ''
    });

    const filteredContacts = useMemo(() => {
        return allContacts.filter(contact => {
            if (filters.state && contact.state !== filters.state) return false;
            if (filters.zilla && contact.zilla !== filters.zilla) return false;
            if (filters.taluk && contact.taluk !== filters.taluk) return false;
            if (filters.gp && contact.gp !== filters.gp) return false;
            if (filters.village && contact.village !== filters.village) return false;
            if (filters.categories.length > 0 && !filters.categories.includes(contact.category as any)) return false;
            if (filters.vipOnly && !contact.isVip) return false;

            const searchMatch = !searchQuery ||
                contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                contact.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
                contact.mobile.includes(searchQuery);

            return searchMatch;
        });
    }, [filters, searchQuery, allContacts]);

    const searchResults = useMemo(() => {
        if (searchQuery.length < 2) return [];
        return allContacts.filter(c =>
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.designation.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.mobile.includes(searchQuery)
        ).slice(0, 10);
    }, [searchQuery, allContacts]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (searchResults.length === 0) return;

        if (e.key === 'ArrowDown') {
            setSelectedIndex(prev => (prev < searchResults.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
        } else if (e.key === 'Enter' && selectedIndex >= 0) {
            setSearchQuery(searchResults[selectedIndex].name);
            setShowSearchDropdown(false);
        } else if (e.key === 'Escape') {
            setShowSearchDropdown(false);
        }
    };

    const highlightMatch = (text: string, query: string) => {
        if (!query) return text;
        const parts = text.split(new RegExp(`(${query})`, 'gi'));
        return (
            <span>
                {parts.map((part, i) =>
                    part.toLowerCase() === query.toLowerCase()
                        ? <span key={i} className="bg-yellow-200 text-gray-900">{part}</span>
                        : part
                )}
            </span>
        );
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this contact?')) {
            contactsApi.delete(id).then(() => {
                setAllContacts(prev => prev.filter(c => c.id !== id));
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside
                className={`${isSidebarOpen ? 'w-72' : 'w-0'
                    } transition-all duration-300 bg-white border-r border-gray-200 overflow-hidden sticky top-0 h-screen hidden md:block`}
            >
                <div className="p-6 w-72">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Filter size={18} className="text-primary" />
                            Filters
                        </h2>
                        <button
                            onClick={() => setFilters({
                                state: '', zilla: '', taluk: '', gp: '', village: '',
                                categories: [], vipOnly: false, birthdaysThisMonth: false, anniversariesThisMonth: false,
                                dateFrom: '', dateTo: ''
                            })}
                            className="text-xs text-primary font-medium hover:underline"
                        >
                            Reset All
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Location Section */}
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">Location</label>
                            <div className="space-y-3">
                                <select
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    value={filters.state}
                                    onChange={(e) => setFilters(f => ({ ...f, state: e.target.value }))}
                                >
                                    <option value="">Select State</option>
                                    <option value="Karnataka">Karnataka</option>
                                </select>
                                <select
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    disabled={!filters.state}
                                    value={filters.zilla}
                                    onChange={(e) => setFilters(f => ({ ...f, zilla: e.target.value }))}
                                >
                                    <option value="">Select Zilla</option>
                                    <option value="Mysuru">Mysuru</option>
                                </select>
                                <select
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                    disabled={!filters.zilla}
                                    value={filters.taluk}
                                    onChange={(e) => setFilters(f => ({ ...f, taluk: e.target.value }))}
                                >
                                    <option value="">Select Taluk</option>
                                    <option value="Mysuru">Mysuru</option>
                                    <option value="Hunsur">Hunsur</option>
                                </select>
                            </div>
                        </div>

                        {/* Categories */}
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">Category</label>
                            <div className="space-y-2">
                                {([
                                  { value: 'VOTER' as ContactCategory,        label: 'Voter' },
                                  { value: 'VILLAGE_HEAD' as ContactCategory,  label: 'Village Head' },
                                  { value: 'CONTRACTOR' as ContactCategory,    label: 'Contractor' },
                                  { value: 'PARTY_WORKER' as ContactCategory,  label: 'Party Worker' },
                                  { value: 'OFFICIAL' as ContactCategory,      label: 'Official' },
                                  { value: 'OTHER' as ContactCategory,         label: 'Other' },
                                ]).map(({ value, label }) => (
                                    <label key={value} className="flex items-center gap-2 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-primary focus:ring-primary"
                                            checked={filters.categories.includes(value)}
                                            onChange={(e) => {
                                                const newCats = e.target.checked
                                                    ? [...filters.categories, value]
                                                    : filters.categories.filter(c => c !== value);
                                                setFilters(f => ({ ...f, categories: newCats }));
                                            }}
                                        />
                                        <span className="text-sm text-gray-600 group-hover:text-gray-900">{label}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Special Filters */}
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">Special</label>
                            <div className="space-y-3">
                                <label className="flex items-center justify-between cursor-pointer">
                                    <span className="text-sm text-gray-600">VIP Only</span>
                                    <input
                                        type="checkbox"
                                        className="toggle toggle-primary"
                                        checked={filters.vipOnly}
                                        onChange={(e) => setFilters(f => ({ ...f, vipOnly: e.target.checked }))}
                                    />
                                </label>
                                <label className="flex items-center justify-between cursor-pointer">
                                    <span className="text-sm text-gray-600">Birthdays (Month)</span>
                                    <input
                                        type="checkbox"
                                        className="toggle toggle-primary"
                                        checked={filters.birthdaysThisMonth}
                                        onChange={(e) => setFilters(f => ({ ...f, birthdaysThisMonth: e.target.checked }))}
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Date Range */}
                        <div>
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 block">Added Between</label>
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="date"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none"
                                    value={filters.dateFrom}
                                    onChange={(e) => setFilters(f => ({ ...f, dateFrom: e.target.value }))}
                                />
                                <input
                                    type="date"
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none"
                                    value={filters.dateTo}
                                    onChange={(e) => setFilters(f => ({ ...f, dateTo: e.target.value }))}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                {/* Sticky Header */}
                <header className="sticky top-0 bg-white border-b border-gray-200 z-30 px-6 py-4">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                        <div className="flex items-center gap-4 flex-1">
                            <button
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
                            >
                                <Filter size={20} />
                            </button>
                            <h1 className="text-2xl font-bold text-gray-900 whitespace-nowrap">Contact Book</h1>

                            {/* Search Bar */}
                            <div className="relative flex-1 max-w-2xl ml-4">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search size={18} className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search by name, designation, or mobile..."
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setShowSearchDropdown(true);
                                    }}
                                    onFocus={() => setShowSearchDropdown(true)}
                                    onKeyDown={handleKeyDown}
                                />

                                {/* Search Dropdown */}
                                {showSearchDropdown && searchQuery.length >= 2 && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 py-2 max-h-80 overflow-y-auto z-50">
                                        {searchResults.length > 0 ? (
                                            searchResults.map((result, idx) => (
                                                <button
                                                    key={result.id}
                                                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left ${selectedIndex === idx ? 'bg-gray-50' : ''
                                                        }`}
                                                    onClick={() => {
                                                        navigate(`/staff/contacts/${result.id}`);
                                                        setShowSearchDropdown(false);
                                                    }}
                                                >
                                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-xs">
                                                        {result.name.charAt(0)}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-semibold text-gray-900">
                                                            {highlightMatch(result.name, searchQuery)}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {highlightMatch(result.designation, searchQuery)} • {highlightMatch(result.mobile, searchQuery)}
                                                        </p>
                                                    </div>
                                                    <ChevronRight size={16} className="ml-auto text-gray-300" />
                                                </button>
                                            ))
                                        ) : (
                                            <div className="px-4 py-6 text-center">
                                                <p className="text-sm text-gray-500 mb-2">No results found for "{searchQuery}"</p>
                                                <button className="text-sm text-primary font-semibold hover:underline flex items-center gap-1 mx-auto">
                                                    <Plus size={16} /> Add New Contact
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => navigate('/staff/contacts/new')}
                                className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                            >
                                <Plus size={20} />
                                <span className="whitespace-nowrap">Add New Contact</span>
                            </button>
                            <button
                                onClick={() => navigate('/staff/contacts/bulk-upload')}
                                className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-white text-gray-700 border border-gray-200 px-5 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                            >
                                <Upload size={18} />
                                <span className="whitespace-nowrap">Bulk Upload</span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* Results Info */}
                <div className="px-6 py-4 flex items-center justify-between">
                    <p className="text-sm text-gray-500 font-medium">
                    <span>Showing <span className="text-gray-900">{filteredContacts.length}</span> of <span className="text-gray-900">{allContacts.length}</span> contacts</span>
                    </p>
                    <div className="flex gap-2">
                        {/* Active filter badges could go here */}
                    </div>
                </div>

                {/* Contact Grid */}
                <div className="px-6 pb-8">
                    {filteredContacts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredContacts.map(contact => (
                                <ContactCard
                                    key={contact.id}
                                    contact={contact}
                                    onEdit={(c) => navigate(`/staff/contacts/edit/${c.id}`)}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center mt-8">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search size={32} className="text-gray-300" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">No contacts match your filters</h3>
                            <p className="text-gray-500 mb-6 max-w-xs mx-auto text-sm">
                                Try adjusting your search query or filters to find what you're looking for.
                            </p>
                            <button
                                onClick={() => setFilters({
                                    state: '', zilla: '', taluk: '', gp: '', village: '',
                                    categories: [], vipOnly: false, birthdaysThisMonth: false, anniversariesThisMonth: false,
                                    dateFrom: '', dateTo: ''
                                })}
                                className="text-primary font-semibold hover:underline"
                            >
                                Clear all filters
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div >
    );
};


