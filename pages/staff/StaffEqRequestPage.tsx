import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Train as TrainIcon, 
  MapPin, 
  Calendar, 
  Eye, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Search, 
  AlertCircle, 
  Lock, 
  Info, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { Button } from '../../components/UI/Button';
import { Card } from '../../components/UI/Card';
import { railwayEQApi } from '../../hooks/useRailwayEQ';
import { Train } from '../../types';

const STEPS = [
  { id: 1, title: 'Applicant', icon: User },
  { id: 2, title: 'Train Details', icon: TrainIcon },
  { id: 3, title: 'Journey Stations', icon: MapPin },
  { id: 4, title: 'Journey Details', icon: Calendar },
  { id: 5, title: 'Preview & Submit', icon: Eye },
];

const CLASSES = [
  'AC First Class (1A)',
  'AC 2 Tier (2A)',
  'AC 3 Tier (3A)',
  'AC 3 Economy (3E)',
  'Executive Class (EC)',
  'AC Chair Car (CC)',
  'Sleeper Class (SL)'
];

export const StaffEqRequestPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    applicantName: '',
    mobile: '',
    email: '',
    emergencyReason: '',
    trainNumber: '',
    fromStation: '',
    toStation: '',
    journeyDate: '',
    travelClass: '',
    pnrNumber: '',
  });

  const [selectedTrain, setSelectedTrain] = useState<Train | null>(null);
  const [trainError, setTrainError] = useState('');
  const [isTrainLookupLoading, setIsTrainLookupLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedRequestId, setSubmittedRequestId] = useState('');
  const [submitError, setSubmitError] = useState('');

  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleTrainNumberChange = async (val: string) => {
    const normalized = val.replace(/\D/g, '').slice(0, 5);
    setFormData(prev => ({ ...prev, trainNumber: normalized }));

    if (normalized.length !== 5) {
      setSelectedTrain(null);
      setTrainError('');
      setIsTrainLookupLoading(false);
      return;
    }

    setIsTrainLookupLoading(true);
    try {
      const { data, error } = await railwayEQApi.lookupTrain(normalized);
      if (error) throw error;

      if (data) {
        const train: Train = {
          number: data.train_number,
          name: data.train_name,
          origin: data.origin ?? '',
          destination: data.destination ?? '',
          division: data.division ?? '',
          stops: (data.stops as any[]) ?? [],
        };
        setSelectedTrain(train);
        setTrainError('');
      } else {
        setSelectedTrain(null);
        setTrainError('Train not found. Please check the number.');
      }
    } catch (err) {
      setSelectedTrain(null);
      const message = err instanceof Error ? err.message : 'Train lookup failed.';
      setTrainError(message);
    } finally {
      setIsTrainLookupLoading(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitError('');
    try {
      const eq = await railwayEQApi.submitRequest({
        applicant_name: formData.applicantName,
        mobile: formData.mobile,
        email: formData.email || null,
        emergency_reason: formData.emergencyReason,
        train_number: selectedTrain?.number ?? formData.trainNumber,
        train_name: selectedTrain?.name ?? null,
        origin_station: selectedTrain?.origin ?? null,
        destination_station: selectedTrain?.destination ?? null,
        from_station: formData.fromStation,
        to_station: formData.toStation,
        journey_date: formData.journeyDate,
        travel_class: formData.travelClass,
        pnr_number: formData.pnrNumber || null,
        division: selectedTrain?.division ?? null,
      });
      setSubmittedRequestId(eq.id ?? eq.eq_request_id ?? eq.request_id ?? '');
      setIsSubmitted(true);
    } catch (err) {
      console.error('[EQ] submitRequest failed:', err);
      const message = err instanceof Error ? err.message : 'Failed to submit request.';
      setSubmitError(message);
    }
  };

  if (isSubmitted) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-8">
        <motion.div 
          initial={{ scale: 0 }} 
          animate={{ scale: 1 }} 
          className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto"
        >
          <CheckCircle2 className="w-12 h-12" />
        </motion.div>
        <div className="space-y-4">
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Request Submitted</h2>
          <p className="text-slate-500 font-medium">Request ID: <span className="text-indigo-600 font-bold">{submittedRequestId || 'Generated after submit'}</span>. Awaiting PA approval.</p>
        </div>
        <Card className="p-8 border-none shadow-xl bg-white text-left space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Status Tracker</span>
            <span className="px-3 py-1 bg-amber-100 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest">Pending PA Approval</span>
          </div>
          <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
            <div className="flex gap-4 relative">
              <div className="w-4 h-4 bg-emerald-500 rounded-full z-10 ring-4 ring-emerald-50" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-900">Request Created</p>
                <p className="text-xs text-slate-400">Today, 10:30 AM</p>
              </div>
            </div>
            <div className="flex gap-4 relative">
              <div className="w-4 h-4 bg-slate-200 rounded-full z-10" />
              <div className="space-y-1 opacity-50">
                <p className="text-sm font-bold text-slate-900">PA Review</p>
                <p className="text-xs text-slate-400">In Progress</p>
              </div>
            </div>
          </div>
        </Card>
        <Button
          size="lg"
          className="rounded-2xl px-12"
          onClick={() => {
            setIsSubmitted(false);
            setSubmittedRequestId('');
          }}
        >
          Create New Request
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <header className="mb-10">
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Railway EQ Request</h2>
        <p className="text-slate-500 font-medium">Emergency Quota request system for railway travel.</p>
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
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Applicant Name *</label>
                    <input 
                      type="text" 
                      placeholder="Full Name"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      value={formData.applicantName}
                      onChange={e => setFormData({ ...formData, applicantName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mobile Number *</label>
                    <input 
                      type="tel" 
                      placeholder="10-digit mobile"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      value={formData.mobile}
                      onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</label>
                  <input 
                    type="email" 
                    placeholder="email@example.com"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Emergency Reason *</label>
                  <textarea 
                    rows={4}
                    placeholder="Medical emergency / Family emergency / Educational / Official work / Other"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-medium text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    value={formData.emergencyReason}
                    onChange={e => setFormData({ ...formData, emergencyReason: e.target.value })}
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Train Number *</label>
                  <div className="relative">
                    <input 
                      type="text" 
                      maxLength={5}
                      placeholder="5-digit train number (e.g. 12626)"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      value={formData.trainNumber}
                      onChange={e => handleTrainNumberChange(e.target.value)}
                    />
                    {isTrainLookupLoading ? (
                      <div className="absolute right-5 top-1/2 -translate-y-1/2">
                        <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : (
                      <Search className="w-5 h-5 absolute right-5 top-1/2 -translate-y-1/2 text-slate-400" />
                    )}
                  </div>
                  {trainError && <p className="text-xs text-red-500 font-bold flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" /> {trainError}</p>}
                </div>

                <AnimatePresence>
                  {selectedTrain && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="p-8 bg-indigo-50 border border-indigo-100 rounded-[2.5rem] space-y-6"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm">
                          <TrainIcon className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900">{selectedTrain.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Train # {selectedTrain.number}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Origin</p>
                          <p className="text-sm font-bold text-slate-700">{selectedTrain.origin}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Destination</p>
                          <p className="text-sm font-bold text-slate-700">{selectedTrain.destination}</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Division</p>
                          <p className="text-sm font-bold text-slate-700 flex items-center gap-2"><Lock className="w-3 h-3" /> {selectedTrain.division}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">From Station *</label>
                    <select 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      value={formData.fromStation}
                      onChange={e => setFormData({ ...formData, fromStation: e.target.value })}
                    >
                      <option value="">Select Boarding Point</option>
                      {selectedTrain?.stops.map(stop => (
                        <option key={stop.code} value={stop.code}>{stop.name} ({stop.code})</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">To Station *</label>
                    <select 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      value={formData.toStation}
                      onChange={e => setFormData({ ...formData, toStation: e.target.value })}
                      disabled={!formData.fromStation}
                    >
                      <option value="">Select Destination</option>
                      {selectedTrain?.stops
                        .filter(stop => {
                          const fromIdx = selectedTrain.stops.findIndex(s => s.code === formData.fromStation);
                          const currentIdx = selectedTrain.stops.findIndex(s => s.code === stop.code);
                          return currentIdx > fromIdx;
                        })
                        .map(stop => (
                          <option key={stop.code} value={stop.code}>{stop.name} ({stop.code})</option>
                        ))
                      }
                    </select>
                  </div>
                </div>
                {formData.fromStation && formData.toStation && (
                  <div className="flex items-center justify-center gap-4 py-10">
                    <div className="text-center">
                      <p className="text-2xl font-black text-slate-900">{formData.fromStation}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Boarding</p>
                    </div>
                    <div className="flex-1 max-w-[100px] h-0.5 bg-slate-100 relative">
                      <ArrowRight className="w-4 h-4 text-indigo-500 absolute -right-2 -top-2" />
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-black text-slate-900">{formData.toStation}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Destination</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Journey Date *</label>
                    <input 
                      type="date" 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      value={formData.journeyDate}
                      onChange={e => setFormData({ ...formData, journeyDate: e.target.value })}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Travel Class *</label>
                    <select 
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      value={formData.travelClass}
                      onChange={e => setFormData({ ...formData, travelClass: e.target.value })}
                    >
                      <option value="">Select Class</option>
                      {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Division</label>
                    <div className="w-full px-5 py-4 bg-slate-100 border border-slate-200 rounded-2xl font-bold text-sm text-slate-500 flex items-center justify-between">
                      {selectedTrain?.division || 'N/A'}
                      <Lock className="w-4 h-4" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PNR Number (Optional)</label>
                    <input 
                      type="text" 
                      maxLength={10}
                      placeholder="10-digit PNR number"
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      value={formData.pnrNumber}
                      onChange={e => setFormData({ ...formData, pnrNumber: e.target.value })}
                    />
                    <p className="text-[10px] text-slate-400 font-bold">Format: 10 digits (e.g. 2456789012)</p>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-10">
                <div className="p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
                        <ShieldCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-900">EQ Request Summary</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Review all details before submission</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">Ready for Review</span>
                  </div>

                  <div className="grid md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                      <div className="space-y-1">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Applicant</h4>
                        <p className="font-bold text-slate-900">{formData.applicantName}</p>
                        <p className="text-xs text-slate-500">{formData.mobile} ΓÇó {formData.email}</p>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Emergency Reason</h4>
                        <p className="text-sm text-slate-600 font-medium leading-relaxed">{formData.emergencyReason}</p>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div className="p-6 bg-white rounded-3xl border border-slate-100 space-y-4">
                        <div className="flex items-center gap-3">
                          <TrainIcon className="w-5 h-5 text-indigo-600" />
                          <span className="font-bold text-slate-900">{selectedTrain?.name} ({formData.trainNumber})</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs font-bold text-slate-500">
                          <span>{formData.fromStation}</span>
                          <ArrowRight className="w-3 h-3" />
                          <span>{formData.toStation}</span>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                          <span className="text-[10px] font-black text-slate-400 uppercase">{formData.journeyDate}</span>
                          <span className="text-[10px] font-black text-indigo-600 uppercase">{formData.travelClass}</span>
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
                      <p className="text-sm font-black text-slate-900">Final Verification</p>
                      <p className="text-[10px] text-slate-500 font-medium">All required fields are valid.</p>
                    </div>
                  </div>
                  <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl px-12" onClick={handleSubmit}>
                    Submit for PA Approval
                  </Button>
                </div>
                {submitError && (
                  <p className="text-xs text-red-500 font-bold flex items-center gap-1 mt-3"><AlertCircle className="w-3 h-3" /> {submitError}</p>
                )}
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
              disabled={currentStep === 2 && !selectedTrain}
            >
              Next Step <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
