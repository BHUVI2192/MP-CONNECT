import React, { useRef, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, 
  Video, 
  FileText, 
  Settings, 
  Eye, 
  Plus, 
  Trash2, 
  Upload, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  Calendar,
  MapPin,
  Tag,
  Type,
  Globe,
  Star,
  Info,
  X,
  Play,
  Pause,
  Volume2
} from 'lucide-react';
import { Button } from '../../components/UI/Button';
import { Card } from '../../components/UI/Card';
import { SpeechType } from '../../types';
import { useNavigate } from 'react-router-dom';

const STEPS = [
  { id: 1, title: 'Basic Info', icon: Info },
  { id: 2, title: 'Media Upload', icon: Mic },
  { id: 3, title: 'Transcript', icon: FileText },
  { id: 4, title: 'Organize', icon: Settings },
  { id: 5, title: 'Preview & Upload', icon: Eye },
];

export const SpeechUploadPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    type: 'Public Address' as SpeechType,
    eventName: '',
    date: '',
    location: '',
    occasion: '',
    language: 'Hindi',
    description: '',
    keyTopics: [] as string[],
    keyPoints: [''],
    audioFile: null as File | null,
    videoFile: null as File | null,
    transcriptType: 'manual' as 'manual' | 'upload' | 'auto',
    transcript: '',
    isImportant: false,
    isPublic: true,
  });

  const [newTopic, setNewTopic] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({ audio: 0, video: 0 });
  const audioInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const waveformHeights = [
    30, 45, 60, 20, 80, 40, 90, 30, 50, 70, 40, 60, 80, 20, 40, 90, 30, 50, 70, 40,
    60, 80, 20, 40, 90, 30, 50, 70, 40, 60, 80, 20, 40, 90, 30, 50, 70, 40, 60
  ];

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const addKeyPoint = () => {
    setFormData(prev => ({ ...prev, keyPoints: [...prev.keyPoints, ''] }));
  };

  const updateKeyPoint = (index: number, value: string) => {
    const newPoints = [...formData.keyPoints];
    newPoints[index] = value;
    setFormData(prev => ({ ...prev, keyPoints: newPoints }));
  };

  const removeKeyPoint = (index: number) => {
    setFormData(prev => ({ ...prev, keyPoints: prev.keyPoints.filter((_, i) => i !== index) }));
  };

  const addTopic = () => {
    if (newTopic && !formData.keyTopics.includes(newTopic)) {
      setFormData(prev => ({ ...prev, keyTopics: [...prev.keyTopics, newTopic] }));
      setNewTopic('');
    }
  };

  const removeTopic = (topic: string) => {
    setFormData(prev => ({ ...prev, keyTopics: prev.keyTopics.filter(t => t !== topic) }));
  };

  const uploadSpeechMedia = async (file: File | null, kind: 'audio' | 'video') => {
    if (!file) return null;

    const path = `speech-media/${kind}/${Date.now()}_${file.name}`;
    setUploadProgress((prev) => ({ ...prev, [kind]: 20 }));

    const { error } = await supabase.storage.from('photo-gallery').upload(path, file, {
      upsert: false,
      contentType: file.type,
    });

    if (error) throw error;

    setUploadProgress((prev) => ({ ...prev, [kind]: 100 }));
    return supabase.storage.from('photo-gallery').getPublicUrl(path).data.publicUrl;
  };

  const handleTranscribe = async () => {
    if (!formData.audioFile) {
      alert('Upload an audio file before starting transcription.');
      return;
    }

    setIsTranscribing(true);
    try {
      const path = `speech-transcripts/${Date.now()}_${formData.audioFile.name}`;
      const { error: uploadError } = await supabase.storage.from('daybook-audio').upload(path, formData.audioFile, {
        upsert: false,
        contentType: formData.audioFile.type,
      });

      if (uploadError) throw uploadError;

      const { data, error } = await supabase.functions.invoke('transcribe-audio', {
        body: {
          storage_path: path,
          bucket: 'daybook-audio',
          language: formData.language === 'Hindi' ? 'hi-IN' : formData.language === 'English' ? 'en-IN' : 'hi-IN',
        },
      });

      if (error) throw error;

      setFormData((prev) => ({ ...prev, transcript: data?.transcript ?? '' }));
    } catch (err: any) {
      console.error('Transcription failed:', err);
      alert(`Transcription failed: ${err?.message ?? 'Unknown error'}`);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleUploadSpeech = async () => {
    if (!formData.title || !formData.date) {
      alert('Title and speech date are required.');
      return;
    }

    setIsSaving(true);
    try {
      const [audioUrl, videoUrl] = await Promise.all([
        uploadSpeechMedia(formData.audioFile, 'audio'),
        uploadSpeechMedia(formData.videoFile, 'video'),
      ]);

      const { error } = await (supabase as any).from('speech_storage').insert({
        title: formData.title,
        type: formData.type,
        speech_date: formData.date,
        event_name: formData.eventName || null,
        location: formData.location || null,
        occasion: formData.occasion || null,
        language: formData.language,
        description: formData.description || null,
        key_topics: formData.keyTopics,
        key_points: formData.keyPoints.filter(Boolean),
        audio_url: audioUrl,
        video_url: videoUrl,
        transcript: formData.transcript || null,
        is_important: formData.isImportant,
        is_public: formData.isPublic,
      });

      if (error) throw error;

      alert('Speech uploaded successfully.');
      navigate('/pa/speeches');
    } catch (err: any) {
      console.error('Speech upload failed:', err);
      alert(`Upload failed: ${err?.message ?? 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <header className="mb-10">
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Add New Speech</h2>
        <p className="text-slate-500 font-medium">Archive and manage official speeches, addresses, and briefings.</p>
      </header>

      {/* Stepper */}
      <div className="mb-12 flex justify-between items-center relative">
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-100 -z-10" />
        {STEPS.map((step) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;
          
          return (
            <div key={step.id} className="flex flex-col items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                isActive ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200 scale-110' :
                isCompleted ? 'bg-emerald-500 text-white' : 'bg-white text-slate-400 border border-slate-200'
              }`}>
                {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <Icon className="w-6 h-6" />}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-widest ${
                isActive ? 'text-indigo-600' : 'text-slate-400'
              }`}>{step.title}</span>
            </div>
          );
        })}
      </div>

      <Card className="p-10 rounded-[2.5rem] shadow-xl border-slate-100 min-h-[500px] flex flex-col">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1"
          >
            {currentStep === 1 && (
              <div className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Speech Title *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Budget Session Debate 2024"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Speech Type</label>
                    <select 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      value={formData.type}
                      onChange={e => setFormData({ ...formData, type: e.target.value as SpeechType })}
                    >
                      <option>Parliament</option>
                      <option>Public Address</option>
                      <option>Press Conference</option>
                      <option>Internal Meeting</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Event Name</label>
                    <input 
                      type="text" 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      value={formData.eventName}
                      onChange={e => setFormData({ ...formData, eventName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Speech Date *</label>
                    <input 
                      type="date" 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      value={formData.date}
                      onChange={e => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Language</label>
                    <select 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      value={formData.language}
                      onChange={e => setFormData({ ...formData, language: e.target.value })}
                    >
                      <option>Hindi</option>
                      <option>English</option>
                      <option>Punjabi</option>
                      <option>Urdu</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Brief Description</label>
                  <textarea 
                    rows={3}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-medium text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Summary of Key Points</label>
                  <div className="space-y-3">
                    {formData.keyPoints.map((point, i) => (
                      <div key={i} className="flex gap-3">
                        <input 
                          type="text" 
                          placeholder={`Point ${i + 1}`}
                          className="flex-1 px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-medium text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                          value={point}
                          onChange={e => updateKeyPoint(i, e.target.value)}
                        />
                        <button 
                          onClick={() => removeKeyPoint(i)}
                          className="p-3 text-slate-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                    <Button variant="outline" size="sm" onClick={addKeyPoint} className="rounded-xl">
                      <Plus className="w-4 h-4 mr-2" /> Add Point
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="grid md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                      <Mic className="w-6 h-6" />
                    </div>
                    <h4 className="text-xl font-black text-slate-900">Audio Recording</h4>
                  </div>
                  <div className="p-12 border-4 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50 text-center space-y-4 group hover:border-indigo-200 transition-all cursor-pointer" onClick={() => audioInputRef.current?.click()}>
                    <input ref={audioInputRef} type="file" accept="audio/*" className="hidden" onChange={(e) => setFormData((prev) => ({ ...prev, audioFile: e.target.files?.[0] ?? null }))} />
                    <Upload className="w-12 h-12 text-slate-300 mx-auto group-hover:scale-110 transition-transform" />
                    <div>
                      <p className="text-sm font-black text-slate-900">Upload Audio File</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">MP3, WAV, AAC (Max 500MB)</p>
                      {formData.audioFile && <p className="text-[10px] text-indigo-600 font-bold uppercase mt-2">{formData.audioFile.name}</p>}
                    </div>
                  </div>
                  {/* Simulated Waveform Preview */}
                  <div className="p-6 bg-slate-900 rounded-3xl space-y-4">
                    <div className="flex items-center justify-between">
                      <button className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20">
                        <Play className="w-4 h-4" />
                      </button>
                      <div className="flex-1 px-4 flex items-end gap-0.5 h-8">
                        {waveformHeights.map((height, i) => (
                          <div key={i} className="flex-1 bg-indigo-500 rounded-full" style={{ height: `${height}%` }} />
                        ))}
                      </div>
                      <span className="text-[10px] font-mono text-white/50">12:45</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                      <Video className="w-6 h-6" />
                    </div>
                    <h4 className="text-xl font-black text-slate-900">Video Recording</h4>
                  </div>
                  <div className="p-12 border-4 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50 text-center space-y-4 group hover:border-indigo-200 transition-all cursor-pointer" onClick={() => videoInputRef.current?.click()}>
                    <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={(e) => setFormData((prev) => ({ ...prev, videoFile: e.target.files?.[0] ?? null }))} />
                    <Upload className="w-12 h-12 text-slate-300 mx-auto group-hover:scale-110 transition-transform" />
                    <div>
                      <p className="text-sm font-black text-slate-900">Upload Video File</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">MP4, MOV, AVI (Max 2GB)</p>
                      {formData.videoFile && <p className="text-[10px] text-indigo-600 font-bold uppercase mt-2">{formData.videoFile.name}</p>}
                    </div>
                  </div>
                  <div className="aspect-video bg-slate-100 rounded-3xl flex items-center justify-center relative overflow-hidden">
                    {formData.videoFile ? (
                      <video src={URL.createObjectURL(formData.videoFile)} className="w-full h-full object-cover opacity-80" />
                    ) : (
                      <img src="https://picsum.photos/seed/video/800/450" className="w-full h-full object-cover opacity-50" />
                    )}
                    <Play className="w-12 h-12 text-slate-400 absolute" />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-8">
                <div className="flex gap-1 p-1.5 bg-slate-100 rounded-2xl w-fit">
                  {['manual', 'upload', 'auto'].map((type) => (
                    <button 
                      key={type}
                      onClick={() => setFormData({ ...formData, transcriptType: type as any })}
                      className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        formData.transcriptType === type ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:bg-white/50'
                      }`}
                    >
                      {type === 'manual' ? 'Type Manually' : type === 'upload' ? 'Upload Document' : 'Auto-Transcribe'}
                    </button>
                  ))}
                </div>

                {formData.transcriptType === 'manual' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Transcript Editor</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase">Timestamp Toggle</span>
                        <button className="w-8 h-4 bg-indigo-600 rounded-full relative p-0.5">
                          <div className="w-3 h-3 bg-white rounded-full absolute right-0.5" />
                        </button>
                      </div>
                    </div>
                    <textarea 
                      rows={12}
                      className="w-full p-8 bg-slate-50 border border-slate-100 rounded-[2rem] font-medium text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none leading-relaxed"
                      placeholder="Start typing the speech transcript here..."
                      value={formData.transcript}
                      onChange={e => setFormData({ ...formData, transcript: e.target.value })}
                    />
                  </div>
                )}

                {formData.transcriptType === 'auto' && (
                  <div className="text-center py-20 space-y-8">
                    <div className="w-24 h-24 bg-indigo-50 rounded-[2rem] flex items-center justify-center mx-auto">
                      <Mic className="w-10 h-10 text-indigo-600" />
                    </div>
                    <div className="max-w-md mx-auto">
                      <h4 className="text-2xl font-black text-slate-900 mb-2">AI Transcription</h4>
                      <p className="text-slate-500 font-medium">Our AI will process the uploaded audio and generate a timestamped transcript automatically.</p>
                    </div>
                    <Button 
                      size="lg" 
                      className="rounded-2xl px-12" 
                      onClick={handleTranscribe}
                      disabled={isTranscribing}
                    >
                      {isTranscribing ? 'Transcribing...' : 'Start Transcription'}
                    </Button>
                    
                    {formData.transcript && (
                      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-left mt-10">
                         <div className="p-8 bg-amber-50 border border-amber-100 rounded-[2rem] space-y-4">
                            <div className="flex items-center justify-between">
                               <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Confidence Score: 94%</span>
                               <Button variant="outline" size="sm" className="bg-white border-amber-200 text-amber-700 rounded-xl">Save Corrected Transcript</Button>
                            </div>
                            <p className="text-sm font-medium text-amber-900 leading-relaxed italic">
                              {formData.transcript}
                            </p>
                         </div>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-10">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Key Topics</label>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {formData.keyTopics.map(topic => (
                      <span key={topic} className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold flex items-center gap-2">
                        {topic}
                        <button onClick={() => removeTopic(topic)}><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <input 
                      type="text" 
                      placeholder="Add a topic tag..."
                      className="flex-1 px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-medium text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      value={newTopic}
                      onChange={e => setNewTopic(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && addTopic()}
                    />
                    <Button variant="outline" onClick={addTopic} className="rounded-xl">Add Tag</Button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-amber-500 shadow-sm">
                        <Star className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">Mark as Featured</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Highlight on main dashboard</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setFormData({ ...formData, isImportant: !formData.isImportant })}
                      className={`w-12 h-6 rounded-full relative p-1 transition-colors ${formData.isImportant ? 'bg-indigo-600' : 'bg-slate-200'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full absolute transition-all ${formData.isImportant ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>

                  <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
                        <Globe className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">Make Public</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Visible to citizens on portal</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setFormData({ ...formData, isPublic: !formData.isPublic })}
                      className={`w-12 h-6 rounded-full relative p-1 transition-colors ${formData.isPublic ? 'bg-indigo-600' : 'bg-slate-200'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full absolute transition-all ${formData.isPublic ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-10">
                <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">{formData.type}</span>
                    <span className="text-slate-400 text-xs font-bold">{formData.date}</span>
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-6">{formData.title || 'Untitled Speech'}</h3>
                  
                  <div className="grid md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 text-slate-500">
                        <MapPin className="w-5 h-5" />
                        <span className="font-bold">{formData.location || 'Location not specified'}</span>
                      </div>
                      <div className="space-y-4">
                        <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Key Points</h4>
                        <ul className="space-y-2">
                          {formData.keyPoints.filter(p => p).map((point, i) => (
                            <li key={i} className="flex gap-3 text-sm font-medium text-slate-600">
                              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2 flex-shrink-0" />
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="aspect-video bg-slate-900 rounded-3xl flex items-center justify-center overflow-hidden">
                        <img src="https://picsum.photos/seed/preview/800/450" className="w-full h-full object-cover opacity-40" />
                        <Play className="w-12 h-12 text-white absolute" />
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {formData.keyTopics.map(topic => (
                          <span key={topic} className="px-3 py-1 bg-slate-200 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-8 bg-emerald-50 rounded-[2.5rem] border border-emerald-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">Ready to Publish</p>
                      <p className="text-[10px] text-slate-500 font-medium">All required information has been provided.</p>
                    </div>
                  </div>
                  <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl px-12" onClick={handleUploadSpeech} disabled={isSaving}>
                    {isSaving ? 'Uploading...' : 'Upload Speech'}
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="mt-12 pt-8 border-t border-slate-100 flex justify-between">
          <Button 
            variant="outline" 
            onClick={handleBack} 
            disabled={currentStep === 1}
            className="rounded-xl px-8"
          >
            <ChevronLeft className="w-5 h-5 mr-2" /> Back
          </Button>
          {currentStep < STEPS.length && (
            <Button 
              onClick={handleNext}
              className="rounded-xl px-8"
            >
              Next Step <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
