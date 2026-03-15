import React, { useMemo, useRef, useState } from 'react';
import { ChevronLeft, FileSpreadsheet, Loader2, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/UI/Button';
import { Card } from '../../components/UI/Card';
import { supabase } from '../../lib/supabase';

type UploadStep = 'SELECT' | 'VALIDATING' | 'RESULTS' | 'IMPORTING' | 'FINAL';

type ValidationError = {
  row: number;
  field: string;
  message: string;
};

type SpeechInsertRow = {
  title: string;
  type: string;
  event_name: string | null;
  speech_date: string;
  location: string | null;
  occasion: string | null;
  language: string;
  description: string | null;
  key_topics: string[];
  key_points: string[];
  transcript: string | null;
  is_public: boolean;
  is_important: boolean;
  audioFileName: string | null;
  videoFileName: string | null;
};

const TEMPLATE_COLUMNS = [
  'title*',
  'speech_date*',
  'type',
  'event_name',
  'location',
  'occasion',
  'language',
  'description',
  'key_topics',
  'key_points',
  'audio_file',
  'video_file',
  'transcript',
  'is_public',
  'is_important',
];

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
    reader.onerror = () => reject(new Error('Failed to read metadata file.'));
    reader.readAsText(inputFile);
  });

const isIsoDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);

const parseBoolean = (value: string, defaultValue: boolean) => {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return defaultValue;
  if (['true', '1', 'yes', 'y'].includes(normalized)) return true;
  if (['false', '0', 'no', 'n'].includes(normalized)) return false;
  return defaultValue;
};

const splitList = (value: string) =>
  value
    .split('|')
    .map((item) => item.trim())
    .filter(Boolean);

export const SpeechBulkUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const metadataInputRef = useRef<HTMLInputElement>(null);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<UploadStep>('SELECT');
  const [metadataFile, setMetadataFile] = useState<File | null>(null);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [parsedRows, setParsedRows] = useState<SpeechInsertRow[]>([]);
  const [importedCount, setImportedCount] = useState(0);

  const mediaByName = useMemo(() => {
    const map = new Map<string, File>();
    mediaFiles.forEach((file) => map.set(file.name, file));
    return map;
  }, [mediaFiles]);

  const startValidation = async () => {
    if (!metadataFile) return;

    setStep('VALIDATING');
    setProgress(0);
    setStatusMessage(null);

    try {
      if (!metadataFile.name.toLowerCase().endsWith('.csv')) {
        throw new Error('Only CSV metadata files are supported in this workflow.');
      }

      const text = await readTextFile(metadataFile);
      const lines = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean);

      if (lines.length < 2) {
        throw new Error('Metadata file must contain a header row and at least one speech row.');
      }

      const headers = parseCsvLine(lines[0]).map(normalizeHeader);
      const headerIndex = new Map<string, number>();
      headers.forEach((header, idx) => headerIndex.set(header, idx));

      const getValue = (cells: string[], ...possibleHeaders: string[]) => {
        for (const header of possibleHeaders) {
          const idx = headerIndex.get(normalizeHeader(header));
          if (idx !== undefined) return (cells[idx] ?? '').trim();
        }
        return '';
      };

      const rows: SpeechInsertRow[] = [];
      const errors: ValidationError[] = [];

      for (let i = 1; i < lines.length; i += 1) {
        const rowNumber = i + 1;
        const cells = parseCsvLine(lines[i]);

        const title = getValue(cells, 'title');
        const speechDate = getValue(cells, 'speech_date', 'date');
        const language = getValue(cells, 'language') || 'English';
        const audioFileName = getValue(cells, 'audio_file') || null;
        const videoFileName = getValue(cells, 'video_file') || null;

        let rowHasError = false;

        if (!title) {
          errors.push({ row: rowNumber, field: 'title', message: 'Title is required' });
          rowHasError = true;
        }

        if (!speechDate || !isIsoDate(speechDate)) {
          errors.push({ row: rowNumber, field: 'speech_date', message: 'Use YYYY-MM-DD format' });
          rowHasError = true;
        }

        if (audioFileName && !mediaByName.has(audioFileName)) {
          errors.push({ row: rowNumber, field: 'audio_file', message: `File not selected: ${audioFileName}` });
          rowHasError = true;
        }

        if (videoFileName && !mediaByName.has(videoFileName)) {
          errors.push({ row: rowNumber, field: 'video_file', message: `File not selected: ${videoFileName}` });
          rowHasError = true;
        }

        if (!rowHasError) {
          rows.push({
            title,
            type: getValue(cells, 'type') || 'Public Address',
            event_name: getValue(cells, 'event_name') || null,
            speech_date: speechDate,
            location: getValue(cells, 'location') || null,
            occasion: getValue(cells, 'occasion') || null,
            language,
            description: getValue(cells, 'description') || null,
            key_topics: splitList(getValue(cells, 'key_topics')),
            key_points: splitList(getValue(cells, 'key_points')),
            transcript: getValue(cells, 'transcript') || null,
            is_public: parseBoolean(getValue(cells, 'is_public'), true),
            is_important: parseBoolean(getValue(cells, 'is_important'), false),
            audioFileName,
            videoFileName,
          });
        }

        setProgress(Math.floor((i / (lines.length - 1)) * 100));
      }

      setParsedRows(rows);
      setValidationErrors(errors);
      setStep('RESULTS');
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Validation failed.');
      setParsedRows([]);
      setValidationErrors([]);
      setStep('SELECT');
    }
  };

  const uploadMediaFile = async (fileName: string | null, kind: 'audio' | 'video') => {
    if (!fileName) return null;

    const file = mediaByName.get(fileName);
    if (!file) throw new Error(`Missing ${kind} file: ${fileName}`);

    const path = `speech-media/${kind}/${Date.now()}_${file.name}`;
    const { error } = await supabase.storage.from('photo-gallery').upload(path, file, {
      upsert: false,
      contentType: file.type,
    });

    if (error) throw error;

    return supabase.storage.from('photo-gallery').getPublicUrl(path).data.publicUrl;
  };

  const startImport = async () => {
    if (parsedRows.length === 0) return;

    setStep('IMPORTING');
    setProgress(0);
    setStatusMessage(null);

    try {
      let imported = 0;

      for (let i = 0; i < parsedRows.length; i += 1) {
        const row = parsedRows[i];
        const [audioUrl, videoUrl] = await Promise.all([
          uploadMediaFile(row.audioFileName, 'audio'),
          uploadMediaFile(row.videoFileName, 'video'),
        ]);

        const { error } = await supabase.from('speech_storage').insert({
          title: row.title,
          type: row.type,
          event_name: row.event_name,
          speech_date: row.speech_date,
          location: row.location,
          occasion: row.occasion,
          language: row.language,
          description: row.description,
          key_topics: row.key_topics,
          key_points: row.key_points,
          transcript: row.transcript,
          is_public: row.is_public,
          is_important: row.is_important,
          audio_url: audioUrl,
          video_url: videoUrl,
        });

        if (error) throw error;

        imported += 1;
        setProgress(Math.round((imported / parsedRows.length) * 100));
      }

      setImportedCount(imported);
      setStep('FINAL');
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Bulk upload failed.');
      setStep('RESULTS');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <Button variant="outline" onClick={() => navigate('/staff/speech/upload')} className="rounded-xl">
        <ChevronLeft className="w-4 h-4 mr-2" /> Back to Speech Upload
      </Button>

      <header>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Speech Bulk Upload</h2>
        <p className="text-slate-500 font-medium mt-1">Upload multiple speech records in one batch using CSV metadata and optional media files.</p>
      </header>

      <Card className="p-8 rounded-3xl border-slate-100 space-y-8">
        {step === 'SELECT' && (
          <div className="space-y-6">
            <div>
              <p className="text-xs font-black tracking-widest uppercase text-slate-500">CSV Columns</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {TEMPLATE_COLUMNS.map((column) => (
                  <span key={column} className="px-2 py-1 rounded-lg bg-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    {column}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-black tracking-widest uppercase text-slate-500">Metadata CSV</label>
              <div className="flex items-center gap-3">
                <input
                  ref={metadataInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={(event) => setMetadataFile(event.target.files?.[0] ?? null)}
                />
                <Button variant="outline" onClick={() => metadataInputRef.current?.click()} className="rounded-xl">
                  <FileSpreadsheet className="w-4 h-4 mr-2" /> Select CSV
                </Button>
                <span className="text-sm text-slate-500">{metadataFile?.name ?? 'No file selected'}</span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-black tracking-widest uppercase text-slate-500">Media Files (optional)</label>
              <div className="flex items-center gap-3">
                <input
                  ref={mediaInputRef}
                  type="file"
                  accept="audio/*,video/*"
                  multiple
                  className="hidden"
                  onChange={(event) => setMediaFiles(Array.from(event.target.files ?? []))}
                />
                <Button variant="outline" onClick={() => mediaInputRef.current?.click()} className="rounded-xl">
                  <Upload className="w-4 h-4 mr-2" /> Select Media
                </Button>
                <span className="text-sm text-slate-500">{mediaFiles.length} file(s) selected</span>
              </div>
            </div>

            <Button onClick={startValidation} disabled={!metadataFile} className="rounded-xl">
              Validate Batch
            </Button>
          </div>
        )}

        {(step === 'VALIDATING' || step === 'IMPORTING') && (
          <div className="py-12 text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
            <p className="text-sm font-bold text-slate-600">{step === 'VALIDATING' ? 'Validating metadata...' : 'Uploading speeches...'}</p>
            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-indigo-600 transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{progress}%</p>
          </div>
        )}

        {step === 'RESULTS' && (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-sm font-bold text-slate-700">Valid rows: {parsedRows.length}</p>
              <p className="text-sm font-bold text-slate-700">Rows with errors: {validationErrors.length}</p>
            </div>

            {validationErrors.length > 0 && (
              <div className="space-y-2 max-h-56 overflow-y-auto border border-rose-100 rounded-2xl p-4 bg-rose-50/40">
                {validationErrors.map((error, idx) => (
                  <p key={`${error.row}-${error.field}-${idx}`} className="text-sm text-rose-700">
                    Row {error.row} - {error.field}: {error.message}
                  </p>
                ))}
              </div>
            )}

            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={() => setStep('SELECT')} className="rounded-xl">
                Back
              </Button>
              <Button onClick={startImport} disabled={parsedRows.length === 0} className="rounded-xl">
                Import Valid Rows
              </Button>
            </div>
          </div>
        )}

        {step === 'FINAL' && (
          <div className="py-10 text-center space-y-4">
            <p className="text-2xl font-black text-slate-900">Bulk upload complete</p>
            <p className="text-sm text-slate-600 font-medium">{importedCount} speeches imported into speech storage.</p>
            <Button className="rounded-xl" onClick={() => navigate('/staff/speech/upload')}>
              Back to Speech Upload
            </Button>
          </div>
        )}

        {statusMessage && (
          <p className="text-sm text-rose-600 font-medium">{statusMessage}</p>
        )}
      </Card>
    </div>
  );
};
