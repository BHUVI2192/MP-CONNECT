import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  ArrowLeft, 
  Train as TrainIcon, 
  MapPin, 
  Calendar, 
  User, 
  FileText, 
  ShieldCheck, 
  Download, 
  Mail, 
  PenTool, 
  Upload, 
  Trash2, 
  Check,
  AlertTriangle,
  ArrowRight,
  Info
} from 'lucide-react';
import { Button } from '../../components/UI/Button';
import { Card } from '../../components/UI/Card';
import { railwayEQApi } from '../../hooks/useRailwayEQ';
import { EqRequest, EqStatus } from '../../types';

export const PaEqDashboardPage: React.FC = () => {
  const [eqRequests, setEqRequests] = useState<EqRequest[]>([]);
  useEffect(() => {
    railwayEQApi.getRequests().then(({ data }: any) => {
      if (data) setEqRequests(data.map((r: any) => ({
        id: r.id, applicantName: r.applicant_name, mobile: r.mobile ?? '',
        email: r.email ?? '', emergencyReason: r.emergency_reason,
        trainNumber: r.train_number ?? '', trainName: r.train_name ?? '',
        originStation: r.origin_station ?? '', destinationStation: r.destination_station ?? '',
        fromStation: r.from_station, toStation: r.to_station,
        journeyDate: r.journey_date, travelClass: r.travel_class ?? '',
        division: r.division ?? '', pnrNumber: r.pnr_number ?? '',
        status: r.status === 'PENDING_PA_APPROVAL' ? 'PENDING' : r.status,
        letterNumber: r.letter_number ?? undefined,
        letterPath: r.letter_path ?? undefined,
        rejectionReason: r.rejection_reason ?? undefined,
        submittedAt: r.created_at ?? '',
      })));
    });
  }, []);
  const [selectedRequest, setSelectedRequest] = useState<EqRequest | null>(null);
  const [activeTab, setActiveTab] = useState<EqStatus | 'ALL'>('PENDING');
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [approvedLetterNumber, setApprovedLetterNumber] = useState('');
  const [approvedLetterPath, setApprovedLetterPath] = useState('');

  const filteredRequests = useMemo(() => {
    if (activeTab === 'ALL') return eqRequests;
    return eqRequests.filter(r => r.status === activeTab);
  }, [eqRequests, activeTab]);

  const stats = [
    { label: 'Pending Approval', value: eqRequests.filter(r => r.status === 'PENDING').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Approved This Month', value: eqRequests.filter(r => r.status === 'APPROVED' || r.status === 'SENT').length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Monthly Quota', value: '45/100', icon: ShieldCheck, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  ];

  const handleApprove = () => {
    setShowSignatureModal(true);
  };

  const handleConfirmApproval = async () => {
    if (!selectedRequest) return;
    setIsApproving(true);
    try {
      // Call sign-eq-letter edge function
      const { data: signResult } = await railwayEQApi.approveAndSign(selectedRequest.id, '');
      // Send signed letter email to DRM
      await railwayEQApi.sendEmail(selectedRequest.id);
      // Update local state
      setEqRequests(prev =>
        prev.map(r => r.id === selectedRequest.id ? { ...r, status: 'APPROVED' as any } : r)
      );
      setApprovedLetterNumber(signResult?.letter_number || selectedRequest.letterNumber || selectedRequest.id.slice(0, 8).toUpperCase());
      setApprovedLetterPath(signResult?.letter_path || selectedRequest.letterPath || '');
      setShowSignatureModal(false);
      setShowSuccessScreen(true);
    } catch (err) {
      console.error('Approval failed:', err);
      alert('Failed to approve the EQ request. Please try again.');
    } finally {
      setIsApproving(false);
    }
  };

  const handleReject = () => {
    setShowRejectModal(true);
  };

  const handleConfirmRejection = async () => {
    if (!selectedRequest || !rejectionReason.trim()) return;
    setIsRejecting(true);
    try {
      await railwayEQApi.rejectRequest(selectedRequest.id, rejectionReason);
      setEqRequests(prev =>
        prev.map(r => r.id === selectedRequest.id ? { ...r, status: 'REJECTED' as any } : r)
      );
      setShowRejectModal(false);
      setRejectionReason('');
      setSelectedRequest(null);
    } catch (err) {
      console.error('Rejection failed:', err);
      alert('Failed to reject the EQ request. Please try again.');
    } finally {
      setIsRejecting(false);
    }
  };

  if (showSuccessScreen) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center space-y-10">
        <motion.div 
          initial={{ scale: 0 }} 
          animate={{ scale: 1 }} 
          className="w-32 h-32 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xl shadow-emerald-100"
        >
          <CheckCircle2 className="w-16 h-16" />
        </motion.div>
        <div className="space-y-4">
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Letter Signed & Emailed</h2>
          <p className="text-slate-500 font-medium text-lg">The EQ request has been approved, signed, and dispatched to the DRM office.</p>
        </div>
        <Card className="p-10 border-none shadow-2xl bg-white text-left space-y-8 rounded-[3rem]">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Letter Number</p>
              <p className="text-xl font-black text-slate-900">{approvedLetterNumber}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Emailed To</p>
              <p className="text-sm font-bold text-slate-700">drm.delhi@rb.railnet.gov.in</p>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-50 flex gap-4">
            <Button
              fullWidth
              size="lg"
              className="rounded-2xl bg-slate-900 hover:bg-slate-800 text-white"
              onClick={() => approvedLetterPath && window.open(approvedLetterPath, '_blank')}
              disabled={!approvedLetterPath}
            >
              <Download className="w-5 h-5 mr-2" /> Download Signed Letter
            </Button>
            <Button fullWidth variant="outline" size="lg" className="rounded-2xl" onClick={() => { setShowSuccessScreen(false); setSelectedRequest(null); }}>
              View All EQ Requests
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (selectedRequest) {
    return (
      <div className="max-w-6xl mx-auto pb-20">
        <button 
          onClick={() => setSelectedRequest(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold mb-8 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back to EQ Dashboard
        </button>

        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-10">
            <header className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">
                  {selectedRequest.id}
                </span>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                  selectedRequest.status === 'PENDING' ? 'bg-amber-100 text-amber-600' :
                  selectedRequest.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-600' :
                  'bg-red-100 text-red-600'
                }`}>
                  {selectedRequest.status}
                </span>
              </div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-tight">
                EQ Request: {selectedRequest.applicantName}
              </h1>
            </header>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-8 border-none shadow-sm bg-white space-y-6 rounded-[2.5rem]">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Applicant Details</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{selectedRequest.applicantName}</p>
                      <p className="text-xs text-slate-500">{selectedRequest.mobile}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                      <Mail className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-bold text-slate-900">{selectedRequest.email}</p>
                  </div>
                  <div className="pt-4 border-t border-slate-50">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Emergency Reason</p>
                    <p className="text-sm text-slate-600 font-medium leading-relaxed">{selectedRequest.emergencyReason}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-8 border-none shadow-sm bg-white space-y-6 rounded-[2.5rem]">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">Journey Details</h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                      <TrainIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{selectedRequest.trainName}</p>
                      <p className="text-xs text-slate-500">Train # {selectedRequest.trainNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-bold text-slate-900">{selectedRequest.journeyDate}</p>
                  </div>
                  <div className="pt-4 border-t border-slate-50">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-center">
                        <p className="text-lg font-black text-slate-900">{selectedRequest.fromStation}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Boarding</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-indigo-500" />
                      <div className="text-center">
                        <p className="text-lg font-black text-slate-900">{selectedRequest.toStation}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Destination</p>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs font-bold text-slate-500">
                      <span>Class: {selectedRequest.travelClass}</span>
                      <span>PNR: {selectedRequest.pnrNumber || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Train Route Visual */}
            <div className="space-y-6">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Train Route</h3>
              <div className="p-10 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm overflow-x-auto no-scrollbar">
                <div className="min-w-[600px] flex items-center justify-between relative before:absolute before:left-0 before:right-0 before:top-1/2 before:-translate-y-1/2 before:h-0.5 before:bg-slate-100">
                  {['NDLS', 'MTJ', 'AGC', 'GWL', 'JHS', 'BPL'].map((stop, i) => {
                    const isBoarding = stop === selectedRequest.fromStation;
                    const isDestination = stop === selectedRequest.toStation;
                    const isActive = isBoarding || isDestination;
                    
                    return (
                      <div key={stop} className="flex flex-col items-center gap-3 relative z-10">
                        <div className={`w-4 h-4 rounded-full transition-all ${
                          isActive ? 'bg-indigo-600 ring-4 ring-indigo-50' : 'bg-slate-200'
                        }`} />
                        <span className={`text-[10px] font-black uppercase tracking-widest ${
                          isActive ? 'text-indigo-600' : 'text-slate-400'
                        }`}>{stop}</span>
                        {isBoarding && <span className="absolute -top-6 text-[8px] font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full uppercase">Boarding</span>}
                        {isDestination && <span className="absolute -top-6 text-[8px] font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full uppercase">Destination</span>}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Preview Letter */}
            <div className="space-y-6">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Draft Letter Preview</h3>
              <div className="aspect-[1/1.4] bg-slate-50 border border-slate-200 rounded-[2.5rem] p-16 shadow-inner relative overflow-hidden">
                <div className="space-y-8 max-w-2xl mx-auto bg-white p-12 shadow-2xl h-full">
                  <div className="text-center border-b pb-6">
                    <h2 className="text-xl font-black uppercase tracking-tighter">Office of the Member of Parliament</h2>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">Northeast Delhi Constituency</p>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-slate-500">
                    <span>Ref: MP/NED/EQ/2024/102</span>
                    <span>Date: 05/03/2024</span>
                  </div>
                  <div className="space-y-4">
                    <p className="text-xs font-bold">To,<br />The Divisional Railway Manager,<br />Delhi Division, Northern Railway.</p>
                    <p className="text-xs font-black uppercase">Subject: Request for Emergency Quota (EQ) Allotment</p>
                    <p className="text-xs leading-relaxed">Respected Sir/Madam,<br /><br />I am writing to recommend the allotment of Emergency Quota for the following passenger(s) traveling on an urgent basis due to a medical emergency.</p>
                    <div className="p-4 bg-slate-50 rounded-xl space-y-2">
                      <p className="text-[10px] font-bold">Passenger: {selectedRequest.applicantName}</p>
                      <p className="text-[10px] font-bold">Train: {selectedRequest.trainNumber} ({selectedRequest.trainName})</p>
                      <p className="text-[10px] font-bold">Date: {selectedRequest.journeyDate}</p>
                      <p className="text-[10px] font-bold">PNR: {selectedRequest.pnrNumber || 'N/A'}</p>
                    </div>
                    <p className="text-xs leading-relaxed">Your kind intervention in this matter is highly appreciated.</p>
                  </div>
                  <div className="pt-20 text-right">
                    <div className="w-32 h-12 border-b border-slate-200 ml-auto mb-2" />
                    <p className="text-xs font-black uppercase">Member of Parliament</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-10">
            {/* Division Info Card */}
            <Card className="p-8 bg-indigo-900 text-white rounded-[2.5rem] border-none shadow-xl">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-black">Delhi Division</p>
                  <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Northern Railway</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between text-xs">
                  <span className="text-white/50">Monthly Quota</span>
                  <span className="font-bold">100 Requests</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-400" style={{ width: '45%' }} />
                </div>
                <p className="text-[10px] font-bold text-white/50 text-center">45/100 Used (45%)</p>
              </div>
            </Card>

            {/* Actions */}
            <div className="space-y-4">
              <Button fullWidth size="lg" className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-100" onClick={handleApprove}>
                <PenTool className="w-5 h-5 mr-2" /> Approve & Sign
              </Button>
              <Button fullWidth variant="outline" size="lg" className="rounded-2xl text-red-600 border-red-100 hover:bg-red-50" onClick={handleReject}>
                <XCircle className="w-5 h-5 mr-2" /> Reject Request
              </Button>
            </div>
          </div>
        </div>

        {/* Digital Signature Modal */}
        <AnimatePresence>
          {showSignatureModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
                onClick={() => setShowSignatureModal(false)}
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                exit={{ scale: 0.9, opacity: 0 }} 
                className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden"
              >
                <div className="p-10 space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Add Digital Signature</h3>
                    <button onClick={() => setShowSignatureModal(false)} className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                      <XCircle className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit">
                    {['Upload Image', 'Saved Signatures', 'Draw Signature'].map((tab) => (
                      <button key={tab} className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${tab === 'Draw Signature' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:bg-white/50'}`}>
                        {tab}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-6">
                    <div className="w-full h-[200px] bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center space-y-4 relative">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Draw your signature here</p>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div 
                          className="w-48 h-24 border-b-2 border-indigo-600/20 flex items-center justify-center"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                        >
                          <span className="font-serif italic text-4xl text-indigo-600 opacity-50">Signature</span>
                        </motion.div>
                      </div>
                      <div className="absolute bottom-4 right-4 flex gap-2">
                        <Button variant="outline" size="sm" className="rounded-lg text-[10px] font-black uppercase">Clear</Button>
                        <div className="flex gap-1 bg-white p-1 rounded-lg border border-slate-100">
                          <div className="w-4 h-4 rounded-full bg-slate-900" />
                          <div className="w-4 h-4 rounded-full bg-indigo-600" />
                        </div>
                      </div>
                    </div>

                    <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Letter Preview</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-indigo-500" />
                          <span className="text-xs font-bold text-slate-700">MP_EQ_Letter_102.pdf</span>
                        </div>
                        <div className="w-24 h-8 bg-white border border-indigo-100 rounded flex items-center justify-center">
                           <span className="font-serif italic text-xs text-indigo-600">Signature</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button fullWidth size="lg" className="rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleConfirmApproval} disabled={isApproving}>
                    {isApproving ? 'Processing...' : 'Confirm & Approve'}
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Reject Confirmation Modal */}
        <AnimatePresence>
          {showRejectModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
                onClick={() => setShowRejectModal(false)}
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                exit={{ scale: 0.9, opacity: 0 }} 
                className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md relative z-10 overflow-hidden"
              >
                <div className="p-10 space-y-8 text-center">
                  <div className="w-20 h-20 bg-red-50 text-red-600 rounded-[2rem] flex items-center justify-center mx-auto">
                    <AlertTriangle className="w-10 h-10" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Reject Request?</h3>
                    <p className="text-slate-500 font-medium">Please provide a reason for rejecting this EQ request.</p>
                  </div>
                  <textarea 
                    rows={3}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-medium text-sm outline-none focus:ring-2 focus:ring-red-500 resize-none"
                    placeholder="e.g. Monthly quota exceeded / Invalid PNR"
                    value={rejectionReason}
                    onChange={e => setRejectionReason(e.target.value)}
                  />
                  <div className="flex gap-3">
                    <Button fullWidth variant="outline" className="rounded-xl" onClick={() => setShowRejectModal(false)}>Cancel</Button>
                    <Button fullWidth className="bg-red-600 hover:bg-red-700 text-white rounded-xl" onClick={handleConfirmRejection} disabled={isRejecting || !rejectionReason.trim()}>{isRejecting ? 'Rejecting...' : 'Confirm Rejection'}</Button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto pb-20 space-y-10">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Railway EQ Dashboard</h2>
          <p className="text-slate-500 font-medium">Manage and approve Emergency Quota requests for railway travel.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full md:w-auto">
          {stats.map((stat, i) => (
            <div key={i} className={`px-6 py-4 rounded-2xl ${stat.bg} ${stat.color} text-center min-w-[120px]`}>
              <p className="text-xl font-black">{stat.value}</p>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-70">{stat.label}</p>
            </div>
          ))}
        </div>
      </header>

      {/* Quota Section */}
      <Card className="p-8 rounded-[2.5rem] border-none shadow-sm bg-white space-y-8">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-indigo-600" /> Quota Utilization by Division
          </h3>
          <Button variant="ghost" size="sm" className="text-indigo-600 font-bold">View Details</Button>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { name: 'Delhi Division', used: 45, total: 100, color: 'bg-indigo-500' },
            { name: 'Mysuru Division', used: 8, total: 10, color: 'bg-red-500', warning: true },
            { name: 'Ambala Division', used: 12, total: 50, color: 'bg-emerald-500' },
          ].map(div => (
            <div key={div.name} className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black text-slate-700">{div.name}</span>
                <span className={`text-[10px] font-black ${div.warning ? 'text-red-600' : 'text-slate-400'}`}>
                  {div.used}/{div.total} Used
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full ${div.color}`} style={{ width: `${(div.used / div.total) * 100}%` }} />
              </div>
              {div.warning && <p className="text-[8px] font-black text-red-500 uppercase tracking-widest flex items-center gap-1"><AlertTriangle className="w-2 h-2" /> Near Quota Limit</p>}
            </div>
          ))}
        </div>
      </Card>

      {/* Tabs */}
      <div className="space-y-6">
        <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl w-fit">
          {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeTab === tab ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:bg-white/50'
              }`}
            >
              {tab === 'PENDING' ? 'Pending Approval' : tab === 'APPROVED' ? 'Approved & Sent' : tab}
            </button>
          ))}
        </div>

        <div className="grid gap-4">
          {filteredRequests.map((req, idx) => (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => setSelectedRequest(req)}
              className="group bg-white p-6 rounded-[2rem] border border-slate-200 hover:border-indigo-300 hover:shadow-xl transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center gap-8"
            >
              <div className="w-full md:w-64 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                    {req.id}
                  </span>
                  <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                    req.status === 'PENDING' ? 'bg-amber-100 text-amber-600' :
                    req.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-600' :
                    'bg-red-100 text-red-600'
                  }`}>
                    {req.status}
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">
                  {req.applicantName}
                </h3>
              </div>

              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-6 text-slate-500 text-xs font-bold">
                  <div className="flex items-center gap-1.5"><TrainIcon className="w-4 h-4 text-indigo-500" /> {req.trainNumber} - {req.trainName}</div>
                  <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-indigo-500" /> {req.journeyDate}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-xs font-black text-slate-700">
                    <span>{req.fromStation}</span>
                    <ArrowRight className="w-3 h-3 text-indigo-500" />
                    <span>{req.toStation}</span>
                  </div>
                  <span className="px-3 py-1 bg-slate-50 text-slate-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                    {req.travelClass}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium truncate max-w-md italic">"{req.emergencyReason}"</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right hidden md:block">
                  <p className="text-[10px] font-black text-slate-900 uppercase">{req.submittedBy}</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase">Submitted 2h ago</p>
                </div>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-slate-300 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition-all">
                  <ChevronRight className="w-6 h-6" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
