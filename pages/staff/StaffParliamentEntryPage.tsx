import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  HelpCircle, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Upload, 
  Calendar, 
  Tag, 
  FileText, 
  Info, 
  Settings, 
  Eye,
  Plus,
  Trash2,
  AlertCircle,
  Clock
} from 'lucide-react';
import { Button } from '../../components/UI/Button';
import { Card } from '../../components/UI/Card';
import { LetterType, Priority, QuestionType } from '../../types';

const STEPS = [
  { id: 1, title: 'Basic Info', icon: Info },
  { id: 2, title: 'Dates & Priority', icon: Calendar },
  { id: 3, title: 'Content & Link', icon: FileText },
  { id: 4, title: 'Upload Document', icon: Upload },
  { id: 5, title: 'Review & Submit', icon: Eye },
];

export const StaffParliamentEntryPage: React.FC = () => {
  const [entryType, setEntryType] = useState<'letter' | 'question'>('letter');
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Letter Fields
    refNumber: '',
    subject: '',
    ministry: '',
    department: '',
    addressedTo: '',
    letterType: 'Request' as LetterType,
    priority: 'Medium' as Priority,
    sentDate: '',
    expectedResponseDate: '',
    summary: '',
    constituencyIssue: '',
    relatedProjectId: '',
    followUpReminder: false,
    followUpDate: '',
    
    // Question Fields
    questionNumber: '',
    questionType: 'Unstarred' as QuestionType,
    sessionName: '',
    sessionDate: '',
    fullQuestionText: '',
    constituencyRelevance: '',
    tags: [] as string[],
    expectedAnswerDate: '',
  });

  const [newTag, setNewTag] = useState('');

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSubmitToTracker = async () => {
    if (entryType === 'letter') {
      const { error } = await supabase.from('parliament_letters').insert({
        subject: formData.subject,
        recipient: formData.addressedTo || formData.ministry,
        ref_number: formData.refNumber || null,
        ministry: formData.ministry,
        department: formData.department || null,
        addressed_to: formData.addressedTo || null,
        type: formData.letterType,
        priority: formData.priority,
        sent_date: formData.sentDate || null,
        expected_response_date: formData.expectedResponseDate || null,
        summary: formData.summary || null,
        constituency_issue: formData.constituencyIssue || null,
        follow_up_date: formData.followUpDate || null,
        status: 'Draft',
      });
      if (error) { console.error('[DB] addLetter:', error.message, error); alert('Save failed: ' + error.message); return; }
    } else {
      const { error } = await supabase.from('parliament_questions').insert({
        question_number: formData.questionNumber || 'TBD',
        session_name: formData.sessionName,
        session_date: formData.sessionDate || null,
        subject: formData.subject,
        type: formData.questionType,
        ministry: formData.ministry || null,
        department: formData.department || null,
        constituency_relevance: formData.constituencyRelevance || null,
        full_text: formData.fullQuestionText || null,
        tags: formData.tags,
        priority: formData.priority,
        expected_answer_date: formData.expectedAnswerDate || null,
        status: 'SUBMITTED',
      });
      if (error) { console.error('[DB] addQuestion:', error.message, error); alert('Save failed: ' + error.message); return; }
    }
    alert(entryType === 'letter' ? 'Letter saved to Parliament Tracker!' : 'Question saved to Parliament Tracker!');
  };

  const addTag = () => {
    if (newTag && !formData.tags.includes(newTag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag] }));
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Parliament Entry</h2>
          <p className="text-slate-500 font-medium">Add new letters or questions to the parliament tracker.</p>
        </div>
        <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl">
          <button 
            onClick={() => { setEntryType('letter'); setCurrentStep(1); }}
            className={`px-6 py-3 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${
              entryType === 'letter' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:bg-white/50'
            }`}
          >
            <Mail className="w-4 h-4" /> Letter
          </button>
          <button 
            onClick={() => { setEntryType('question'); setCurrentStep(1); }}
            className={`px-6 py-3 rounded-xl text-sm font-black transition-all flex items-center gap-2 ${
              entryType === 'question' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:bg-white/50'
            }`}
          >
            <HelpCircle className="w-4 h-4" /> Question
          </button>
        </div>
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
            key={`${entryType}-${currentStep}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1"
          >
            {currentStep === 1 && (
              <div className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {entryType === 'letter' ? 'Reference Number' : 'Question Number'}
                    </label>
                    <input 
                      type="text" 
                      placeholder={entryType === 'letter' ? 'e.g. MP/NED/2024/045' : 'e.g. USQ 1245'}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      value={entryType === 'letter' ? formData.refNumber : formData.questionNumber}
                      onChange={e => setFormData({ ...formData, [entryType === 'letter' ? 'refNumber' : 'questionNumber']: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject</label>
                    <input 
                      type="text" 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      value={formData.subject}
                      onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ministry</label>
                    <select 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      value={formData.ministry}
                      onChange={e => setFormData({ ...formData, ministry: e.target.value })}
                    >
                      <option value="">Select Ministry</option>
                      <option>Ministry of Railways</option>
                      <option>Ministry of Health and Family Welfare</option>
                      <option>Ministry of Housing and Urban Affairs</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {entryType === 'letter' ? 'Addressed To' : 'Session Name'}
                    </label>
                    <input 
                      type="text" 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      value={entryType === 'letter' ? formData.addressedTo : formData.sessionName}
                      onChange={e => setFormData({ ...formData, [entryType === 'letter' ? 'addressedTo' : 'sessionName']: e.target.value })}
                    />
                  </div>
                </div>

                {entryType === 'letter' ? (
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Letter Type</label>
                    <div className="flex flex-wrap gap-3">
                      {['Request', 'Recommendation', 'Query', 'Complaint', 'Follow-up'].map(type => (
                        <button 
                          key={type}
                          onClick={() => setFormData({ ...formData, letterType: type as any })}
                          className={`px-6 py-3 rounded-xl text-xs font-bold transition-all ${
                            formData.letterType === type ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Question Type</label>
                    <div className="flex gap-3">
                      {['Starred', 'Unstarred', 'Short Notice'].map(type => (
                        <button 
                          key={type}
                          onClick={() => setFormData({ ...formData, questionType: type as any })}
                          className={`flex-1 px-6 py-3 rounded-xl text-xs font-bold transition-all ${
                            formData.questionType === type ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-10">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {entryType === 'letter' ? 'Sent Date' : 'Session Date'}
                    </label>
                    <input 
                      type="date" 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      value={entryType === 'letter' ? formData.sentDate : formData.sessionDate}
                      onChange={e => setFormData({ ...formData, [entryType === 'letter' ? 'sentDate' : 'sessionDate']: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {entryType === 'letter' ? 'Expected Response Date' : 'Expected Answer Date'}
                    </label>
                    <input 
                      type="date" 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      value={entryType === 'letter' ? formData.expectedResponseDate : formData.expectedAnswerDate}
                      onChange={e => setFormData({ ...formData, [entryType === 'letter' ? 'expectedResponseDate' : 'expectedAnswerDate']: e.target.value })}
                    />
                  </div>
                </div>

                {entryType === 'letter' && formData.sentDate && (
                  <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Clock className="w-6 h-6 text-indigo-600" />
                      <div>
                        <p className="text-sm font-black text-slate-900">Days elapsed since sent: 12</p>
                        <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest">2 Days Overdue!</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority</label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: 'High', color: 'bg-red-500', border: 'border-red-100' },
                      { label: 'Medium', color: 'bg-orange-500', border: 'border-orange-100' },
                      { label: 'Low', color: 'bg-emerald-500', border: 'border-emerald-100' },
                    ].map(p => (
                      <button 
                        key={p.label}
                        onClick={() => setFormData({ ...formData, priority: p.label as any })}
                        className={`p-6 rounded-[2rem] border-2 transition-all text-center space-y-3 ${
                          formData.priority === p.label ? `bg-white shadow-xl ${p.border}` : 'bg-slate-50 border-transparent opacity-60'
                        }`}
                      >
                        <div className={`w-3 h-3 ${p.color} rounded-full mx-auto`} />
                        <span className="block text-sm font-black text-slate-900">{p.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {entryType === 'letter' ? 'Summary' : 'Full Question Text'}
                  </label>
                  <textarea 
                    rows={4}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-medium text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    value={entryType === 'letter' ? formData.summary : formData.fullQuestionText}
                    onChange={e => setFormData({ ...formData, [entryType === 'letter' ? 'summary' : 'fullQuestionText']: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    {entryType === 'letter' ? 'Constituency Issue' : 'Constituency Relevance'}
                  </label>
                  <textarea 
                    rows={3}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-medium text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    value={entryType === 'letter' ? formData.constituencyIssue : formData.constituencyRelevance}
                    onChange={e => setFormData({ ...formData, [entryType === 'letter' ? 'constituencyIssue' : 'constituencyRelevance']: e.target.value })}
                  />
                </div>

                {entryType === 'question' && (
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tags / Topics</label>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {formData.tags.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold flex items-center gap-2">
                          {tag}
                          <button onClick={() => removeTag(tag)}><Trash2 className="w-3 h-3" /></button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <input 
                        type="text" 
                        placeholder="Add a tag..."
                        className="flex-1 px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-medium text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        value={newTag}
                        onChange={e => setNewTag(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && addTag()}
                      />
                      <Button variant="outline" onClick={addTag} className="rounded-xl">Add Tag</Button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-10">
                <div className="p-16 border-4 border-dashed border-slate-100 rounded-[3rem] bg-slate-50 text-center space-y-4 group hover:border-indigo-200 transition-all cursor-pointer">
                  <Upload className="w-16 h-16 text-slate-300 mx-auto group-hover:scale-110 transition-transform" />
                  <div>
                    <p className="text-xl font-black text-slate-900">Upload {entryType === 'letter' ? 'Letter' : 'Question'} Document</p>
                    <p className="text-sm text-slate-400 font-medium">PDF, JPG, PNG supported. Max 20MB.</p>
                  </div>
                  <Button variant="outline" className="rounded-xl">Browse Files</Button>
                </div>

                {entryType === 'letter' && (
                  <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
                        <Settings className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">Set Follow-up Reminder</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Notify PA on specific date</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setFormData({ ...formData, followUpReminder: !formData.followUpReminder })}
                      className={`w-12 h-6 rounded-full relative p-1 transition-colors ${formData.followUpReminder ? 'bg-indigo-600' : 'bg-slate-200'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full absolute transition-all ${formData.followUpReminder ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>
                )}

                {formData.followUpReminder && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Follow-up Date</label>
                    <input 
                      type="date" 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      value={formData.followUpDate}
                      onChange={e => setFormData({ ...formData, followUpDate: e.target.value })}
                    />
                  </motion.div>
                )}
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-10">
                <div className="p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                        {entryType === 'letter' ? formData.refNumber : formData.questionNumber}
                      </span>
                      <span className="text-slate-400 text-xs font-bold">{entryType === 'letter' ? formData.sentDate : formData.sessionDate}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      formData.priority === 'High' ? 'bg-red-100 text-red-600' :
                      formData.priority === 'Medium' ? 'bg-orange-100 text-orange-600' :
                      'bg-emerald-100 text-emerald-600'
                    }`}>
                      {formData.priority} Priority
                    </span>
                  </div>
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
                    {formData.subject || 'Untitled Entry'}
                  </h3>
                  <div className="grid md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Ministry</h4>
                        <p className="font-bold text-slate-700">{formData.ministry || 'Not selected'}</p>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Summary</h4>
                        <p className="text-sm text-slate-600 font-medium leading-relaxed">{entryType === 'letter' ? formData.summary : formData.fullQuestionText}</p>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="p-6 bg-white rounded-3xl border border-slate-100 flex items-center gap-4">
                        <FileText className="w-8 h-8 text-indigo-600" />
                        <div>
                          <p className="text-sm font-black text-slate-900">Document Uploaded</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Ready for submission</p>
                        </div>
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
                      <p className="text-sm font-black text-slate-900">Ready to Submit</p>
                      <p className="text-[10px] text-slate-500 font-medium">All required information has been provided.</p>
                    </div>
                  </div>
                  <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl px-12" onClick={handleSubmitToTracker}>
                    Submit to Tracker
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

