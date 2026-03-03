import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import {
    FileText,
    Upload,
    Send,
    Clock,
    CheckCircle2,
    AlertCircle,
    X,
    Search,
    Filter,
    Plus
} from 'lucide-react';
import { Letter } from '../../types';

import { useMockData } from '../../context/MockDataContext';

export const StaffLettersPage: React.FC = () => {
    const { letters, addLetter } = useMockData();
    const [activeTab, setActiveTab] = useState<'All' | 'Pending' | 'Completed'>('All');
    const [showUploadModal, setShowUploadModal] = useState(false);

    const [newDraft, setNewDraft] = useState({
        type: 'Central',
        department: '',
        title: '',
        content: '',
        tags: ''
    });

    const handleUpload = () => {
        const draft: Letter = {
            id: `LTR-2024-${Math.floor(Math.random() * 1000)}`,
            type: newDraft.type as any,
            department: newDraft.department,
            title: newDraft.title,
            content: newDraft.content,
            status: 'Pending',
            version: 1,
            tags: newDraft.tags.split(',').map(t => t.trim()),
            createdAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0],
            senderId: 'STAFF-001'
        };

        addLetter(draft);
        setShowUploadModal(false);
        setNewDraft({ type: 'Central', department: '', title: '', content: '', tags: '' });
    };

    const filteredDrafts = letters.filter(d => activeTab === 'All' || d.status === activeTab);

    return (
        <div className="space-y-8 pb-20 max-w-6xl mx-auto">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Draft Letters</h2>
                    <p className="text-slate-500 font-medium">Upload and manage official correspondence.</p>
                </div>
                <Button onClick={() => setShowUploadModal(true)} className="rounded-xl px-6 font-bold shadow-lg shadow-indigo-200">
                    <Plus className="w-5 h-5 mr-2" /> Upload New Draft
                </Button>
            </header>

            {/* Tabs */}
            <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit">
                {['All', 'Pending', 'Completed'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${activeTab === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:bg-white/50'
                            }`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="grid gap-4">
                {filteredDrafts.map((draft) => (
                    <motion.div key={draft.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <Card className="hover:border-indigo-300 transition-all border-slate-200 group">
                            <div className="p-5 flex flex-col md:flex-row gap-6 items-center">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${draft.status === 'Completed' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'
                                    }`}>
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{draft.id}</span>
                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${draft.type === 'Central' ? 'bg-blue-100 text-blue-600' :
                                            draft.type === 'State' ? 'bg-purple-100 text-purple-600' : 'bg-orange-100 text-orange-600'
                                            }`}>{draft.type}</span>
                                        <span className="text-[10px] font-black bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase">{draft.department}</span>
                                    </div>
                                    <h4 className="text-lg font-bold text-slate-900 truncate">{draft.title}</h4>
                                    <p className="text-xs text-slate-500 truncate mt-0.5">Version {draft.version} • Uploaded on {draft.createdAt}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    {draft.status === 'Pending' ? (
                                        <div className="px-4 py-2 bg-amber-50 text-amber-700 rounded-xl text-xs font-bold flex items-center gap-2">
                                            <Clock className="w-4 h-4" /> Pending Review
                                        </div>
                                    ) : (
                                        <div className="px-4 py-2 bg-green-50 text-green-700 rounded-xl text-xs font-bold flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4" /> Approved
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Upload Modal */}
            <AnimatePresence>
                {showUploadModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" onClick={() => setShowUploadModal(false)} />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-2xl font-black text-slate-900">Upload Draft Letter</h3>
                                <button onClick={() => setShowUploadModal(false)} className="p-2 hover:bg-slate-100 rounded-full"><X className="w-5 h-5 text-slate-400" /></button>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Letter Type</label>
                                        <select
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                                            value={newDraft.type}
                                            onChange={(e) => setNewDraft({ ...newDraft, type: e.target.value })}
                                        >
                                            <option value="Central">Central</option>
                                            <option value="State">State</option>
                                            <option value="Devotional">Devotional</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Department</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Finance"
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                                            value={newDraft.department}
                                            onChange={(e) => setNewDraft({ ...newDraft, department: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject / Title</label>
                                    <input
                                        type="text"
                                        placeholder="Letter Subject..."
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl font-bold text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                                        value={newDraft.title}
                                        onChange={(e) => setNewDraft({ ...newDraft, title: e.target.value })}
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Brief Content</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Summary or content..."
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl font-medium text-xs outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                                        value={newDraft.content}
                                        onChange={(e) => setNewDraft({ ...newDraft, content: e.target.value })}
                                    />
                                </div>

                                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center bg-slate-50 hover:bg-white hover:border-indigo-300 transition-all cursor-pointer group">
                                    <Upload className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
                                    <p className="text-xs font-black text-slate-500">Upload .DOCX or .PDF</p>
                                </div>

                                <Button fullWidth size="lg" className="rounded-xl mt-2" onClick={handleUpload} disabled={!newDraft.title}>
                                    Submit Draft
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
