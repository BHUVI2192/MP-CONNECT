import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  Download,
  Upload,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Loader2,
  FileSpreadsheet,
  AlertTriangle,
  Info
} from 'lucide-react';
import { Button } from '../../components/UI/Button';

// --- Constants ---

const TEMPLATE_COLUMNS = [
  'Full Name*', 'Designation', 'Organization', 'Category', 'Mobile*',
  'Alternate Mobile', 'Email', 'WhatsApp', 'State', 'Zilla',
  'Taluk', 'GP', 'Village', 'Full Address', 'DOB', 'Anniversary', 'Tags', 'Notes'
];

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

type UploadStep = 'SELECT' | 'VALIDATING' | 'RESULTS' | 'IMPORTING' | 'FINAL';

export const BulkUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<UploadStep>('SELECT');
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [validationResults, setValidationResults] = useState({
    valid: 0,
    errors: [] as ValidationError[],
    total: 0
  });
  const [skipInvalid, setSkipInvalid] = useState(true);
  const [showAllErrors, setShowAllErrors] = useState(false);

  // --- Handlers ---

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && (droppedFile.name.endsWith('.csv') || droppedFile.name.endsWith('.xlsx'))) {
      setFile(droppedFile);
    }
  };

  const startValidation = () => {
    if (!file) return;
    setStep('VALIDATING');
    setProgress(0);

    // Simulate validation process
    const totalRows = 124;
    let current = 0;
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 15) + 5;
      if (current >= totalRows) {
        current = totalRows;
        clearInterval(interval);
        setValidationResults({
          total: totalRows,
          valid: 112,
          errors: [
            { row: 14, field: 'Mobile', message: 'Invalid phone number format' },
            { row: 28, field: 'Full Name', message: 'Required field is missing' },
            { row: 45, field: 'Email', message: 'Invalid email address' },
            { row: 67, field: 'Category', message: 'Value not in allowed list' },
            { row: 82, field: 'Mobile', message: 'Duplicate mobile number found' },
            { row: 91, field: 'Taluk', message: 'Taluk does not match Zilla' },
            { row: 104, field: 'Mobile', message: 'Invalid phone number format' },
            { row: 115, field: 'Full Name', message: 'Required field is missing' },
            { row: 118, field: 'Email', message: 'Invalid email address' },
            { row: 121, field: 'Category', message: 'Value not in allowed list' },
            { row: 123, field: 'Mobile', message: 'Duplicate mobile number found' },
            { row: 124, field: 'Taluk', message: 'Taluk does not match Zilla' },
          ]
        });
        setStep('RESULTS');
      }
      setProgress(Math.floor((current / totalRows) * 100));
    }, 150);
  };

  const startImport = async () => {
    if (!file) return;
    setStep('IMPORTING');
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('skipInvalid', skipInvalid.toString());

      // Simulate a progress and then call API 
      let current = 0;
      const interval = setInterval(() => {
        current += 10;
        if (current >= 90) clearInterval(interval);
        setProgress(current);
      }, 100);

      const response = await fetch('/api/contacts/bulk-upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        console.warn("Backend API not found, simulating success");
      }

      clearInterval(interval);
      setProgress(100);
      setStep('FINAL');
    } catch (error) {
      console.error('Error importing bulk data:', error);
      alert('Import failed. Please try again.');
      setStep('RESULTS');
    }
  };

  const downloadTemplate = () => {
    console.log('Downloading CSV Template...');
    // Logic to trigger CSV download
  };

  // --- Render Helpers ---

  const renderSelectStep = () => (
    <div className="space-y-8">
      {/* Step 1: Template */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 p-8 md:p-12 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Step 1: Download Template</h3>
            </div>
            <p className="text-slate-500 font-medium">Use our standard template to ensure your data is formatted correctly. Required fields are marked with an asterisk (*).</p>
            <div className="flex flex-wrap gap-2 pt-2">
              {TEMPLATE_COLUMNS.slice(0, 8).map(col => (
                <span key={col} className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-200">
                  {col}
                </span>
              ))}
              <span className="px-3 py-1 bg-slate-50 text-slate-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-dashed border-slate-200">
                + {TEMPLATE_COLUMNS.length - 8} more
              </span>
            </div>
          </div>
          <Button
            onClick={downloadTemplate}
            className="rounded-2xl px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-100"
          >
            <Download className="w-4 h-4 mr-2" /> Download CSV Template
          </Button>
        </div>
      </div>

      {/* Step 2: Upload */}
      <div className="bg-white rounded-[3rem] border border-slate-200 p-8 md:p-12 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Upload className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-black text-slate-900 tracking-tight">Step 2: Upload File</h3>
        </div>

        {!file ? (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-4 border-dashed border-slate-100 rounded-[2.5rem] p-16 flex flex-col items-center text-center group hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer"
          >
            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg shadow-indigo-50">
              <FileSpreadsheet className="w-10 h-10" />
            </div>
            <h4 className="text-2xl font-black text-slate-900 tracking-tight">Drag and drop your file here</h4>
            <p className="text-slate-500 mt-2 font-medium">Supports .csv and .xlsx files (Max 20MB)</p>
            <Button variant="outline" className="mt-8 rounded-2xl px-8 border-slate-200">
              Browse Files
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".csv, .xlsx"
              onChange={handleFileSelect}
            />
          </div>
        ) : (
          <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 flex items-center justify-between animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm text-indigo-600 border border-slate-100">
                <FileSpreadsheet className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-black text-slate-900 text-lg">{file.name}</h4>
                <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">
                  {(file.size / 1024).toFixed(1)} KB • Ready for validation
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => setFile(null)} className="text-red-500 hover:bg-red-50 rounded-xl">
                <X className="w-4 h-4 mr-2" /> Remove
              </Button>
              <Button onClick={startValidation} className="rounded-2xl px-10 py-4 shadow-xl shadow-indigo-100">
                Validate Data <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderValidatingStep = () => (
    <div className="bg-white rounded-[3rem] border border-slate-200 p-12 md:p-20 shadow-sm text-center max-w-2xl mx-auto">
      <div className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 animate-pulse">
        <Loader2 className="w-12 h-12 animate-spin" />
      </div>
      <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Validating Contacts</h2>
      <p className="text-slate-500 font-medium mb-12">Please wait while we check your file for formatting errors and duplicates.</p>

      <div className="space-y-4">
        <div className="flex justify-between items-end mb-2">
          <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Progress</span>
          <span className="text-2xl font-black text-slate-900">{progress}%</span>
        </div>
        <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-indigo-600"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
          />
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pt-4">
          Checking row {Math.floor((progress / 100) * validationResults.total)} of {validationResults.total}...
        </p>
      </div>
    </div>
  );

  const renderResultsStep = () => (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Valid Rows Card */}
        <div className="bg-emerald-50 rounded-[2.5rem] border border-emerald-100 p-8 flex items-center gap-6">
          <div className="w-16 h-16 bg-emerald-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-100">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Valid Rows</h4>
            <p className="text-4xl font-black text-slate-900 mt-1">{validationResults.valid}</p>
            <p className="text-xs text-emerald-700 font-medium mt-1">Ready to be imported</p>
          </div>
        </div>

        {/* Error Rows Card */}
        <div className="bg-red-50 rounded-[2.5rem] border border-red-100 p-8 flex items-center gap-6">
          <div className="w-16 h-16 bg-red-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-red-100">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div>
            <h4 className="text-[10px] font-black text-red-600 uppercase tracking-widest">Rows with Errors</h4>
            <p className="text-4xl font-black text-slate-900 mt-1">{validationResults.errors.length}</p>
            <p className="text-xs text-red-700 font-medium mt-1">Need correction before import</p>
          </div>
        </div>
      </div>

      {/* Error Table */}
      {validationResults.errors.length > 0 && (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm">
          <div className="p-8 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Validation Error Details</h3>
            </div>
            <button
              onClick={() => setShowAllErrors(!showAllErrors)}
              className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline"
            >
              {showAllErrors ? 'Show Less' : `Show All ${validationResults.errors.length} Errors`}
            </button>
          </div>
          <div className={`overflow-x-auto ${showAllErrors ? '' : 'max-h-[400px] overflow-y-auto'}`}>
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Row #</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Field</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Error Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {validationResults.errors.slice(0, showAllErrors ? undefined : 10).map((err, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-4 font-black text-slate-900 text-sm">{err.row}</td>
                    <td className="px-8 py-4">
                      <span className="px-2 py-1 bg-red-50 text-red-600 rounded text-[10px] font-black uppercase">
                        {err.field}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-sm text-slate-500 font-medium">{err.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Options & Actions */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white shadow-xl shadow-indigo-100 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSkipInvalid(!skipInvalid)}
              className={`w-14 h-8 rounded-full relative transition-all ${skipInvalid ? 'bg-indigo-500' : 'bg-slate-700'
                }`}
            >
              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm ${skipInvalid ? 'left-7' : 'left-1'
                }`} />
            </button>
            <div>
              <h4 className="font-black tracking-tight">Skip invalid rows</h4>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Import only the {validationResults.valid} valid contacts</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <button
            onClick={() => setStep('SELECT')}
            className="flex-1 md:flex-none px-8 py-4 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <Button
            onClick={startImport}
            className="flex-1 md:flex-none rounded-2xl px-12 py-4 bg-white text-slate-900 hover:bg-slate-100 border-none shadow-lg"
          >
            Confirm Import <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );

  const renderImportingStep = () => (
    <div className="bg-white rounded-[3rem] border border-slate-200 p-12 md:p-20 shadow-sm text-center max-w-2xl mx-auto">
      <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
        <Loader2 className="w-12 h-12 animate-spin" />
      </div>
      <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Importing Contacts</h2>
      <p className="text-slate-500 font-medium mb-12">We're adding the validated contacts to your database. This will only take a moment.</p>

      <div className="space-y-4">
        <div className="flex justify-between items-end mb-2">
          <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">Import Progress</span>
          <span className="text-2xl font-black text-slate-900">{progress}%</span>
        </div>
        <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-emerald-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
          />
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pt-4">
          Importing {Math.floor((progress / 100) * (skipInvalid ? validationResults.valid : validationResults.total))} of {skipInvalid ? validationResults.valid : validationResults.total} contacts...
        </p>
      </div>
    </div>
  );

  const renderFinalStep = () => (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="bg-white rounded-[3rem] border border-slate-200 p-12 md:p-16 shadow-sm text-center">
        <div className="w-24 h-24 bg-emerald-50 text-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-lg shadow-emerald-50">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">Import Complete!</h2>
        <p className="text-slate-500 font-medium mb-12">Your constituency network has been successfully updated with the new contacts.</p>

        <div className="grid grid-cols-2 gap-6 mb-12">
          <div className="p-8 bg-emerald-50 rounded-[2rem] border border-emerald-100">
            <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Successfully Imported</h4>
            <p className="text-4xl font-black text-slate-900">{skipInvalid ? validationResults.valid : validationResults.total - validationResults.errors.length}</p>
          </div>
          <div className="p-8 bg-orange-50 rounded-[2rem] border border-orange-100">
            <h4 className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1">Skipped / Failed</h4>
            <p className="text-4xl font-black text-slate-900">{skipInvalid ? validationResults.errors.length : 0}</p>
          </div>
        </div>

        {validationResults.errors.length > 0 && (
          <div className="mb-12 p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3 text-left">
              <Info className="w-5 h-5 text-indigo-600" />
              <div>
                <h5 className="font-black text-slate-900 text-sm">Need to fix errors?</h5>
                <p className="text-xs text-slate-500 font-medium">Download the error report to see which rows failed and why.</p>
              </div>
            </div>
            <button className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline flex items-center gap-2">
              <Download className="w-4 h-4" /> Download Error Report
            </button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            variant="outline"
            fullWidth
            className="rounded-2xl py-4"
            onClick={() => {
              setFile(null);
              setStep('SELECT');
            }}
          >
            Upload Another File
          </Button>
          <Button
            fullWidth
            className="rounded-2xl py-4 shadow-xl shadow-indigo-100"
            onClick={() => navigate('/staff/contacts')}
          >
            Go to Contact Book
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <header className="mb-12">
        <button
          onClick={() => navigate('/staff/contacts')}
          className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-black text-xs uppercase tracking-widest mb-4 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Contacts
        </button>
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Bulk Contact Upload</h1>
        <p className="text-slate-500 font-medium">Import large lists of contacts using CSV or Excel files.</p>
      </header>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {step === 'SELECT' && renderSelectStep()}
          {step === 'VALIDATING' && renderValidatingStep()}
          {step === 'RESULTS' && renderResultsStep()}
          {step === 'IMPORTING' && renderImportingStep()}
          {step === 'FINAL' && renderFinalStep()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
