
import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldAlert,
    Search,
    Filter,
    Clock,
    User as UserIcon,
    Database,
    ChevronRight,
    ChevronDown,
    ArrowRight,
    History,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Download,
    Terminal,
    RefreshCw
} from 'lucide-react';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { AuditLog } from '../../types';
import { supabase } from '../../lib/supabase';

export const AuditLogsPage: React.FC = () => {
    const [expandedLog, setExpandedLog] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterAction, setFilterAction] = useState<string>('ALL');
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);

    const loadLogs = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('audit_logs')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(100);

        if (error) {
            console.error('Failed to load audit logs:', error);
            setLogs([]);
        } else {
            setLogs((data ?? []) as AuditLog[]);
        }

        setLoading(false);
    };

    useEffect(() => {
        void loadLogs();
    }, []);

    const filteredLogs = useMemo(() => {
        return logs.filter((log) => {
            const matchesAction = filterAction === 'ALL' || log.action === filterAction;
            const q = searchTerm.trim().toLowerCase();
            const matchesSearch = !q || [
                log.record_id,
                log.table_name,
                log.user_id,
                log.user_role,
                log.ip_address,
            ].some((value) => (value ?? '').toLowerCase().includes(q));

            return matchesAction && matchesSearch;
        });
    }, [filterAction, logs, searchTerm]);

    const getActionColor = (action: string) => {
        switch (action) {
            case 'INSERT': return 'text-green-600 bg-green-50 border-green-100';
            case 'UPDATE': return 'text-amber-600 bg-amber-50 border-amber-100';
            case 'DELETE': return 'text-red-600 bg-red-50 border-red-100';
            default: return 'text-slate-600 bg-slate-50 border-slate-100';
        }
    };

    const getTableIcon = (tableName: string) => {
        if (tableName.includes('railway')) return <Terminal className="w-4 h-4" />;
        if (tableName.includes('letters')) return <History className="w-4 h-4" />;
        return <Database className="w-4 h-4" />;
    };

    return (
        <div className="space-y-8 max-w-6xl mx-auto pb-20">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-indigo-600 rounded-[2rem] flex items-center justify-center shadow-xl shadow-indigo-100">
                        <ShieldAlert className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-4xl font-black text-slate-900 tracking-tighter italic">System Audit Logs</h2>
                        <p className="text-slate-500 font-medium">Immutable record of all sensitive database operations.</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        className="rounded-2xl border-slate-200"
                        onClick={() => {
                            const blob = new Blob([JSON.stringify(filteredLogs, null, 2)], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const anchor = document.createElement('a');
                            anchor.href = url;
                            anchor.download = 'audit-logs.json';
                            anchor.click();
                            URL.revokeObjectURL(url);
                        }}
                    >
                        <Download className="w-4 h-4 mr-2" /> Export Logs
                    </Button>
                    <Button className="rounded-2xl shadow-lg shadow-indigo-100 px-8" onClick={() => void loadLogs()}>
                        <RefreshCw className="w-4 h-4 mr-2" /> Refresh
                    </Button>
                </div>
            </header>

            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by ID, table, or user..."
                        className="w-full pl-11 pr-4 py-3 text-sm bg-slate-50 border-transparent rounded-xl focus:bg-white focus:border-indigo-500 outline-none transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <select
                        className="flex-1 md:flex-none px-4 py-3 bg-slate-50 border-transparent rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-indigo-500 transition-all cursor-pointer"
                        value={filterAction}
                        onChange={(e) => setFilterAction(e.target.value)}
                    >
                        <option value="ALL">All Actions</option>
                        <option value="INSERT">Inserts</option>
                        <option value="UPDATE">Updates</option>
                        <option value="DELETE">Deletes</option>
                    </select>
                    <Button variant="outline" className="rounded-xl border-slate-200">
                        <Filter className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Logs Table */}
            <div className="space-y-4">
                {loading ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <p className="text-sm font-bold text-slate-500">Loading audit logs...</p>
                    </div>
                ) : filteredLogs.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <p className="text-sm font-bold text-slate-500">No audit logs found.</p>
                    </div>
                ) : filteredLogs.map((log) => (
                    <Card
                        key={log.log_id}
                        className={`overflow-hidden border-l-4 transition-all ${expandedLog === log.log_id ? 'border-l-indigo-600 shadow-xl' : 'hover:border-l-indigo-400'
                            }`}
                    >
                        <div
                            className="p-6 cursor-pointer flex flex-col md:flex-row items-start md:items-center gap-6"
                            onClick={() => setExpandedLog(expandedLog === log.log_id ? null : log.log_id)}
                        >
                            {/* Action Badge */}
                            <div className={`px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest min-w-[100px] text-center ${getActionColor(log.action)}`}>
                                {log.action}
                            </div>

                            {/* Log Details */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-4 mb-1">
                                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-tight">
                                        <Clock className="w-3 h-3" /> {new Date(log.created_at).toLocaleString()}
                                    </span>
                                    <span className="w-1 h-1 bg-slate-200 rounded-full" />
                                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-400 uppercase tracking-tight">
                                        <UserIcon className="w-3 h-3" /> {log.user_role}: {log.user_id}
                                    </span>
                                </div>
                                <h4 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                                    <span className="text-slate-400">{getTableIcon(log.table_name)}</span>
                                    {log.table_name}
                                    <span className="text-slate-300 font-medium">/</span>
                                    <span className="text-indigo-600">{log.record_id}</span>
                                </h4>
                            </div>

                            {/* IP & Expand */}
                            <div className="flex items-center gap-6">
                                <div className="hidden md:block text-right">
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">IP Address</p>
                                    <p className="text-xs font-bold text-slate-500 font-mono">{log.ip_address}</p>
                                </div>
                                <div className={`p-2 rounded-full transition-transform ${expandedLog === log.log_id ? 'rotate-180 bg-indigo-50 text-indigo-600' : 'text-slate-400'}`}>
                                    <ChevronDown className="w-6 h-6" />
                                </div>
                            </div>
                        </div>

                        <AnimatePresence>
                            {expandedLog === log.log_id && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="bg-slate-50 border-t border-slate-100"
                                >
                                    <div className="p-8 grid md:grid-cols-2 gap-8">
                                        {/* Old Data */}
                                        <div className="space-y-3">
                                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                <ArrowRight className="w-3 h-3 rotate-180" /> Before Change
                                            </h5>
                                            <div className="bg-white p-4 rounded-2xl border border-slate-200 font-mono text-[11px] overflow-x-auto min-h-[100px]">
                                                {log.old_data ? (
                                                    <pre className="text-red-500 whitespace-pre-wrap">{JSON.stringify(log.old_data, null, 2)}</pre>
                                                ) : (
                                                    <p className="text-slate-300 italic">No previous data (Initial Insert)</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* New Data */}
                                        <div className="space-y-3">
                                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                <ArrowRight className="w-3 h-3 text-indigo-500" /> After Change
                                            </h5>
                                            <div className="bg-white p-4 rounded-2xl border border-slate-200 font-mono text-[11px] overflow-x-auto min-h-[100px]">
                                                {log.new_data ? (
                                                    <pre className="text-green-600 whitespace-pre-wrap">{JSON.stringify(log.new_data, null, 2)}</pre>
                                                ) : (
                                                    <p className="text-slate-300 italic">Record Deleted</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="px-8 pb-8 flex justify-end">
                                        <Button variant="outline" size="sm" className="rounded-xl text-[10px] font-black uppercase tracking-widest border-slate-200">
                                            View Full Record Details
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Card>
                ))}
            </div>

            {/* Empty State Help */}
            <div className="p-12 border-2 border-dashed border-slate-200 rounded-[3rem] text-center space-y-4 bg-slate-50/50">
                <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-sm">
                    <Terminal className="w-8 h-8 text-slate-300" />
                </div>
                <div className="max-w-md mx-auto">
                    <p className="text-lg font-black text-slate-900 tracking-tight">Immutable Record Integrity</p>
                    <p className="text-sm text-slate-500 font-medium">
                        This page now reads directly from the live <span className="bg-slate-200 px-1 rounded text-slate-700">audit_logs</span> table.
                        If the list is empty, the next backend step is to add database triggers for the sensitive tables you want to track.
                    </p>
                </div>
            </div>
        </div>
    );
};
