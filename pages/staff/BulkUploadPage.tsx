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
import { supabase } from '../../lib/supabase';

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

interface ContactInsertRow {
  full_name: string;
  designation: string | null;
  organization: string | null;
  category: 'VOTER' | 'VILLAGE_HEAD' | 'CONTRACTOR' | 'PARTY_WORKER' | 'OFFICIAL' | 'OTHER';
  mobile: string;
  email: string | null;
  state: string | null;
  zilla: string | null;
  location_taluk: string | null;
  gram_panchayat: string | null;
  location_village: string | null;
  address: string | null;
  birthday: string | null;
  anniversary: string | null;
  notes: string | null;
  is_vip: boolean;
}

type UploadStep = 'SELECT' | 'VALIDATING' | 'RESULTS' | 'IMPORTING' | 'FINAL';

const ALLOWED_CATEGORIES: ContactInsertRow['category'][] = ['VOTER', 'VILLAGE_HEAD', 'CONTRACTOR', 'PARTY_WORKER', 'OFFICIAL', 'OTHER'];

const normalizeHeader = (value: string) => value.trim().toLowerCase().replace(/\*/g, '');

const parseCsvLine = (line: string) => {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    const next = line[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current.trim());
  return values;
};

const readTextFile = (inputFile: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsText(inputFile);
  });

const normalizeCategory = (category: string): ContactInsertRow['category'] | null => {
  const value = category.trim().toUpperCase().replace(/\s+/g, '_');
  if (ALLOWED_CATEGORIES.includes(value as ContactInsertRow['category'])) {
    return value as ContactInsertRow['category'];
  }
  return null;
};

const normalizePhone = (phone: string) => {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  if (digits.length === 10) {
    return digits;
  }
  return '';
};

const normalizeMonthDay = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (/^\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [, month, day] = trimmed.split('-');
    return `${month}-${day}`;
  }

  return null;
};

const downloadTextFile = (content: string, fileName: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
};

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
  const [validRows, setValidRows] = useState<ContactInsertRow[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [importedCount, setImportedCount] = useState(0);

  // --- Handlers ---

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setStatusMessage(null);
      setValidationResults({ valid: 0, errors: [], total: 0 });
      setValidRows([]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile && (droppedFile.name.endsWith('.csv') || droppedFile.name.endsWith('.xlsx'))) {
      setFile(droppedFile);
      setStatusMessage(null);
      setValidationResults({ valid: 0, errors: [], total: 0 });
      setValidRows([]);
    }
  };

  const startValidation = async () => {
    if (!file) return;
    setStep('VALIDATING');
    setProgress(0);
    setStatusMessage(null);

    try {
      if (!file.name.toLowerCase().endsWith('.csv')) {
        throw new Error('Only CSV files are supported for validation/import in this build.');
      }

      const text = await readTextFile(file);
      const lines = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

      if (lines.length < 2) {
        throw new Error('The file must contain a header row and at least one data row.');
      }

      const headers = parseCsvLine(lines[0]).map(normalizeHeader);
      const headerIndex = new Map<string, number>();
      headers.forEach((header, idx) => headerIndex.set(header, idx));

      const getValue = (cells: string[], ...possibleHeaders: string[]) => {
        for (const header of possibleHeaders) {
          const idx = headerIndex.get(normalizeHeader(header));
          if (idx !== undefined) {
            return (cells[idx] ?? '').trim();
          }
        }
        return '';
      };

      const errors: ValidationError[] = [];
      const parsedValidRows: ContactInsertRow[] = [];
      const seenMobiles = new Set<string>();
      const totalRows = lines.length - 1;

      for (let i = 1; i < lines.length; i += 1) {
        const rowNumber = i + 1;
        const cells = parseCsvLine(lines[i]);

        const fullName = getValue(cells, 'Full Name', 'Name');
        const mobile = normalizePhone(getValue(cells, 'Mobile', 'Primary Mobile'));
        const email = getValue(cells, 'Email');
        const categoryText = getValue(cells, 'Category') || 'OTHER';
        const category = normalizeCategory(categoryText);

        let rowHasError = false;

        if (!fullName) {
          errors.push({ row: rowNumber, field: 'Full Name', message: 'Required field is missing' });
          rowHasError = true;
        }

        if (!mobile) {
          errors.push({ row: rowNumber, field: 'Mobile', message: 'Invalid phone number format' });
          rowHasError = true;
        } else if (seenMobiles.has(mobile)) {
          errors.push({ row: rowNumber, field: 'Mobile', message: 'Duplicate mobile number found in file' });
          rowHasError = true;
        }

        if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          errors.push({ row: rowNumber, field: 'Email', message: 'Invalid email address' });
          rowHasError = true;
        }

        if (!category) {
          errors.push({ row: rowNumber, field: 'Category', message: 'Value not in allowed list' });
          rowHasError = true;
        }

        const birthdayInput = getValue(cells, 'DOB', 'Birthday');
        const birthday = normalizeMonthDay(birthdayInput);
        if (birthdayInput && !birthday) {
          errors.push({ row: rowNumber, field: 'DOB', message: 'Use YYYY-MM-DD or MM-DD format' });
          rowHasError = true;
        }

        const anniversaryInput = getValue(cells, 'Anniversary');
        const anniversary = normalizeMonthDay(anniversaryInput);
        if (anniversaryInput && !anniversary) {
          errors.push({ row: rowNumber, field: 'Anniversary', message: 'Use YYYY-MM-DD or MM-DD format' });
          rowHasError = true;
        }

        if (!rowHasError && category) {
          parsedValidRows.push({
            full_name: fullName,
            designation: getValue(cells, 'Designation') || null,
            organization: getValue(cells, 'Organization') || null,
            category,
            mobile,
            email: email || null,
            state: getValue(cells, 'State') || null,
            zilla: getValue(cells, 'Zilla') || null,
            location_taluk: getValue(cells, 'Taluk') || null,
            gram_panchayat: getValue(cells, 'GP', 'Gram Panchayat') || null,
            location_village: getValue(cells, 'Village') || null,
            address: getValue(cells, 'Full Address', 'Address') || null,
            birthday,
            anniversary,
            notes: getValue(cells, 'Notes') || null,
            is_vip: false,
          });
          seenMobiles.add(mobile);
        }

        setProgress(Math.floor((i / (lines.length - 1)) * 100));
      }

      setValidationResults({ total: totalRows, valid: parsedValidRows.length, errors });
      setValidRows(parsedValidRows);
      setStep('RESULTS');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Validation failed.';
      setStatusMessage(message);
      setValidationResults({ total: 0, valid: 0, errors: [] });
      setValidRows([]);
      setStep('SELECT');
    }
  };

  const startImport = async () => {
    if (!file) return;
    if (validRows.length === 0) {
      setStatusMessage('No valid rows found to import.');
      return;
    }

    setStep('IMPORTING');
    setProgress(0);
    setStatusMessage(null);

    try {
      const rowsToInsert = skipInvalid ? validRows : validRows;
      const chunkSize = 200;
      let imported = 0;

      for (let i = 0; i < rowsToInsert.length; i += chunkSize) {
        const chunk = rowsToInsert.slice(i, i + chunkSize);
        const { error } = await supabase.from('contacts').insert(chunk);
        if (error) {
          throw new Error(error.message);
        }
        imported += chunk.length;
        setProgress(Math.floor((imported / rowsToInsert.length) * 100));
      }

      setImportedCount(imported);
      setProgress(100);
      setStep('FINAL');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Import failed.';
      console.error('Error importing bulk data:', error);
      setStatusMessage(message);
      setStep('RESULTS');
    }
  };

  const downloadTemplate = () => {
    const headerRow = TEMPLATE_COLUMNS.join(',');
    const sampleRow = [
      'Suma R',
      'Ward Coordinator',
      'MP Connect',
      'PARTY_WORKER',
      '9876543210',
      '9123456780',
      'suma@example.com',
      '9876543210',
      'Karnataka',
      'Mysuru',
      'Hunsur',
      'Bilikere',
      'Hanagodu',
      'Near Main Bus Stand',
      '09-14',
      '02-21',
      'booth-12;women-wing',
      'Prefers morning calls'
    ].join(',');

    downloadTextFile(`${headerRow}\n${sampleRow}\n`, 'contact-upload-template.csv', 'text/csv;charset=utf-8;');
  };

  const downloadErrorReport = () => {
    if (validationResults.errors.length === 0) return;

    const rows = [
      ['Row', 'Field', 'Message'].join(','),
      ...validationResults.errors.map((error) => [error.row, `"${error.field.replace(/"/g, '""')}"`, `"${error.message.replace(/"/g, '""')}"`].join(','))
    ];

    downloadTextFile(`${rows.join('\n')}\n`, 'contact-upload-errors.csv', 'text/csv;charset=utf-8;');
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
            <p className="text-slate-500 mt-2 font-medium">Supports .csv files for validation and import (Max 20MB)</p>
            <Button variant="outline" className="mt-8 rounded-2xl px-8 border-slate-200">
              Browse Files
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".csv"
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
          Checking rows...
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
          Importing {Math.floor((progress / 100) * Math.max(validRows.length, 1))} of {validRows.length} contacts...
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
            <p className="text-4xl font-black text-slate-900">{importedCount}</p>
          </div>
          <div className="p-8 bg-orange-50 rounded-[2rem] border border-orange-100">
            <h4 className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-1">Skipped / Failed</h4>
            <p className="text-4xl font-black text-slate-900">{Math.max(validationResults.total - importedCount, 0)}</p>
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
            <button onClick={downloadErrorReport} className="text-xs font-black text-indigo-600 uppercase tracking-widest hover:underline flex items-center gap-2">
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
        <p className="text-slate-500 font-medium">Import large lists of contacts using the standard CSV template.</p>
      </header>

      {statusMessage && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
          {statusMessage}
        </div>
      )}

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
