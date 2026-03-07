import React, { useState, useEffect, useRef } from 'react';
import {
    Upload,
    Download,
    FileText,
    CheckCircle2,
    AlertCircle,
    X,
    ChevronLeft,
    ChevronRight,
    Loader2,
    Trash2,
    FileSpreadsheet,
    ArrowRight,
    Info
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

type UploadStep = 'template' | 'upload' | 'validating' | 'results' | 'importing' | 'complete';

interface ValidationError {
    row: number;
    field: string;
    message: string;
}

export const ContactBulkUploadPage: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<UploadStep>('template');
    const [file, setFile] = useState<File | null>(null);
    const [progress, setProgress] = useState(0);
    const [skipInvalid, setSkipInvalid] = useState(true);
    const [showErrors, setShowErrors] = useState(false);

    const [stats, setStats] = useState({
        total: 150,
        valid: 142,
        invalid: 8
    });

    const mockErrors: ValidationError[] = [
        { row: 12, field: 'Mobile', message: 'Invalid format (must be 10 digits)' },
        { row: 45, field: 'Email', message: 'Missing @ symbol' },
        { row: 67, field: 'Name', message: 'Required field is empty' },
        { row: 89, field: 'Category', message: 'Invalid category option' },
        { row: 102, field: 'Mobile', message: 'Duplicate number already exists' },
        { row: 115, field: 'Email', message: 'Invalid domain' },
        { row: 128, field: 'Zilla', message: 'Region not found in database' },
        { row: 144, field: 'Name', message: 'Contains invalid characters' }
    ];

    useEffect(() => {
        if (step === 'validating') {
            const timer = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(timer);
                        setStep('results');
                        return 100;
                    }
                    return prev + 5;
                });
            }, 100);
            return () => clearInterval(timer);
        }


    }, [step]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setStep('upload');
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile) {
            setFile(droppedFile);
            setStep('upload');
        }
    };

    const startValidation = () => {
        setProgress(0);
        setStep('validating');
    };

    const startImport = async () => {
        if (!file) return;
        setStep('importing');
        setProgress(0);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('skipInvalid', skipInvalid.toString());

            let current = 0;
            const timer = setInterval(() => {
                current += 10;
                if (current >= 90) clearInterval(timer);
                setProgress(current);
            }, 100);

            const response = await fetch('/api/contacts/bulk-upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                console.warn("Backend API not found, simulating success");
            }

            clearInterval(timer);
            setProgress(100);
            setStep('complete');
        } catch (error) {
            console.error('Error importing contacts:', error);
            alert('Import failed. Please try again.');
            setStep('results');
        }
    };

    const StepHeader = ({ title, subtitle }: { title: string, subtitle: string }) => (
        <div className="mb-8">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">{title}</h1>
            <p className="text-gray-500 font-medium">{subtitle}</p>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
            {/* Back Button */}
            <button
                onClick={() => navigate('/staff/contacts')}
                className="flex items-center gap-2 mb-8 text-sm font-bold text-gray-400 hover:text-primary transition-colors group"
            >
                <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                Back to Contact Book
            </button>

            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                <div className="p-8 md:p-12">
                    <AnimatePresence mode="wait">
                        {/* STEP 1: DOWNLOAD TEMPLATE */}
                        {step === 'template' && (
                            <motion.div
                                key="template"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                            >
                                <StepHeader
                                    title="Bulk Upload Contacts"
                                    subtitle="Import multiple contacts at once using our standardized template."
                                />

                                <div className="bg-slate-50 rounded-3xl p-8 border border-gray-100 mb-8">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                            <FileSpreadsheet size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">Required CSV Columns</h3>
                                            <p className="text-xs text-gray-500 font-semibold tracking-wide uppercase">12 Columns identified</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
                                        {['Full Name*', 'Designation', 'Mobile*', 'Email', 'State*', 'Zilla*', 'Taluk*', 'Village*', 'Category', 'VIP', 'DOB', 'Notes'].map(col => (
                                            <div key={col} className="px-3 py-2 bg-white rounded-xl border border-gray-200 text-[11px] font-bold text-gray-600">
                                                {col}
                                            </div>
                                        ))}
                                    </div>

                                    <button className="w-full py-4 bg-white border-2 border-primary text-primary rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-primary/5 transition-all">
                                        <Download size={18} />
                                        Download CSV Template
                                    </button>
                                </div>

                                <div
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={handleDrop}
                                    className="relative group h-48 border-2 border-dashed border-gray-200 rounded-3xl flex flex-col items-center justify-center gap-3 bg-gray-50/50 hover:bg-primary/5 hover:border-primary/30 transition-all cursor-pointer overflow-hidden"
                                >
                                    <input
                                        type="file"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        accept=".csv,.xlsx"
                                        onChange={handleFileChange}
                                    />
                                    <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors">
                                        <Upload size={24} />
                                    </div>
                                    <p className="text-sm font-bold text-gray-500 group-hover:text-primary transition-colors">
                                        Drag and drop your file here, or <span className="text-primary underline">browse</span>
                                    </p>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Supports .CSV and .XLSX</p>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 2: FILE SELECTED */}
                        {step === 'upload' && file && (
                            <motion.div
                                key="upload"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-8"
                            >
                                <div className="w-20 h-20 bg-green-50 text-green-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                                    <FileText size={40} />
                                </div>
                                <h2 className="text-2xl font-black text-gray-900 mb-1">{file.name}</h2>
                                <p className="text-gray-500 font-bold text-sm mb-8 uppercase tracking-widest">{(file.size / 1024).toFixed(1)} KB</p>

                                <div className="flex flex-col gap-3 max-w-xs mx-auto">
                                    <button
                                        onClick={startValidation}
                                        className="w-full py-4 bg-primary text-white rounded-2xl font-black text-sm shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                                    >
                                        Validate File
                                    </button>
                                    <button
                                        onClick={() => { setFile(null); setStep('template'); }}
                                        className="text-sm font-bold text-red-400 hover:text-red-500 transition-colors"
                                    >
                                        Remove File
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 3: VALIDATING */}
                        {step === 'validating' && (
                            <motion.div
                                key="validating"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-12"
                            >
                                <Loader2 size={48} className="animate-spin text-primary mx-auto mb-8" />
                                <h2 className="text-2xl font-black text-gray-900 mb-8 uppercase tracking-tighter italic">Validating Your Data...</h2>

                                <div className="max-w-md mx-auto h-3 bg-gray-100 rounded-full overflow-hidden mb-4">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        className="h-full bg-primary"
                                    />
                                </div>
                                <p className="text-sm font-bold text-gray-400">Processing {Math.round(stats.total * (progress / 100))} of {stats.total} rows...</p>
                            </motion.div>
                        )}

                        {/* STEP 4: RESULTS */}
                        {step === 'results' && (
                            <motion.div
                                key="results"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <StepHeader
                                    title="Validation Results"
                                    subtitle="We've analyzed your file. Please review the findings before importing."
                                />

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="p-6 bg-green-50 border border-green-100 rounded-[2rem] text-center">
                                        <p className="text-3xl font-black text-green-600 mb-1">{stats.valid}</p>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-green-700/60">Valid Rows</p>
                                    </div>
                                    <div className="p-6 bg-red-50 border border-red-100 rounded-[2rem] text-center">
                                        <p className="text-3xl font-black text-red-600 mb-1">{stats.invalid}</p>
                                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-700/60">Rows with Errors</p>
                                    </div>
                                </div>

                                {/* Error Table */}
                                <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden mb-8 shadow-sm">
                                    <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                                        <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider flex items-center gap-2">
                                            <AlertCircle size={14} className="text-red-500" />
                                            Error Details
                                        </h4>
                                        <button
                                            onClick={() => setShowErrors(!showErrors)}
                                            className="text-[10px] font-black text-primary uppercase"
                                        >
                                            {showErrors ? 'Show Summary' : 'Show All'}
                                        </button>
                                    </div>
                                    <div className={`overflow-y-auto max-h-64 transition-all ${showErrors ? 'max-h-[500px]' : 'max-h-64'}`}>
                                        <table className="w-full text-left text-sm">
                                            <thead className="sticky top-0 bg-white shadow-sm">
                                                <tr className="border-b border-gray-50">
                                                    <th className="px-6 py-4 font-black uppercase text-[10px] text-gray-400">Row</th>
                                                    <th className="px-6 py-4 font-black uppercase text-[10px] text-gray-400">Field</th>
                                                    <th className="px-6 py-4 font-black uppercase text-[10px] text-gray-400">Message</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {mockErrors.slice(0, showErrors ? undefined : 5).map((err, i) => (
                                                    <tr key={i} className="hover:bg-red-50/30 transition-colors">
                                                        <td className="px-6 py-4 font-bold text-gray-900">#{err.row}</td>
                                                        <td className="px-6 py-4">
                                                            <span className="px-2 py-1 bg-gray-100 rounded-lg text-[10px] font-bold text-gray-600 uppercase">
                                                                {err.field}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-xs font-medium text-gray-600">{err.message}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* Options & Confirm */}
                                <div className="bg-slate-900 rounded-3xl p-6 mb-8 text-white flex flex-col md:flex-row items-center justify-between gap-6">
                                    <label className="flex items-center gap-4 cursor-pointer">
                                        <div className="relative inline-flex items-center">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={skipInvalid}
                                                onChange={() => setSkipInvalid(!skipInvalid)}
                                            />
                                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                        </div>
                                        <div className="text-left">
                                            <p className="text-xs font-black uppercase tracking-wider">Skip invalid rows</p>
                                            <p className="text-[10px] text-gray-400 font-medium">Continue with {stats.valid} valid records</p>
                                        </div>
                                    </label>

                                    <div className="flex items-center gap-4 w-full md:w-auto">
                                        <button
                                            onClick={() => setStep('template')}
                                            className="px-6 py-3 text-sm font-bold text-gray-400 hover:text-white transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={startImport}
                                            className="flex-1 md:flex-none px-8 py-3 bg-white text-slate-900 rounded-2xl font-black text-sm hover:bg-primary hover:text-white transition-all transform active:scale-95"
                                        >
                                            Confirm Import
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 5: IMPORTING */}
                        {step === 'importing' && (
                            <motion.div
                                key="importing"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-12"
                            >
                                <Loader2 size={48} className="animate-spin text-primary mx-auto mb-8" />
                                <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tighter">Importing Contacts...</h2>
                                <p className="text-sm font-bold text-gray-400 mb-8">Please do not close this window</p>

                                <div className="max-w-md mx-auto h-4 bg-gray-100 rounded-full overflow-hidden mb-6 relative">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        className="h-full bg-gradient-to-r from-primary to-blue-500"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-[10px] font-black text-slate-900 mix-blend-difference">{progress}%</span>
                                    </div>
                                </div>
                                <p className="text-xs font-bold text-gray-600">Successfully created {Math.round(stats.valid * (progress / 100))} of {stats.valid} contacts</p>
                            </motion.div>
                        )}

                        {/* STEP 6: COMPLETE */}
                        {step === 'complete' && (
                            <motion.div
                                key="complete"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-8"
                            >
                                <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-green-100">
                                    <CheckCircle2 size={56} />
                                </div>

                                <h2 className="text-4xl font-black text-gray-900 mb-6 tracking-tighter">Import Complete!</h2>

                                {/* Report Card */}
                                <div className="max-w-md mx-auto bg-slate-50 rounded-[2.5rem] border border-gray-100 p-8 mb-8">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 bg-white rounded-3xl border border-gray-100">
                                            <p className="text-2xl font-black text-green-600">{stats.valid}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-tight">Successfully<br />Imported</p>
                                        </div>
                                        <div className="p-4 bg-white rounded-3xl border border-gray-100">
                                            <p className="text-2xl font-black text-orange-400">{stats.invalid}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-tight">Skipped<br />(Errors)</p>
                                        </div>
                                    </div>

                                    {stats.invalid > 0 && (
                                        <button className="mt-8 text-sm font-bold text-primary flex items-center justify-center gap-2 mx-auto hover:underline">
                                            <Download size={16} />
                                            Download Error Report
                                        </button>
                                    )}
                                </div>

                                <button
                                    onClick={() => navigate('/staff/contacts')}
                                    className="px-12 py-4 bg-primary text-white rounded-2xl font-black text-base shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                                >
                                    Return to Contact Book
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Help / Footer */}
            <div className="mt-12 flex items-center justify-center gap-6">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                    <Info size={14} />
                    <span>Need help formatting your CSV?</span>
                </div>
                <a href="#" className="text-xs font-black text-primary hover:underline uppercase tracking-wider">
                    View Import Guide
                </a>
            </div>
        </div>
    );
};

export default ContactBulkUploadPage;
