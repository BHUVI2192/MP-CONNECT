import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/UI/Card';
import { Button } from '../../components/UI/Button';
import { MessageSquare, ArrowLeft, Upload } from 'lucide-react';
import { useMockData } from '../../context/MockDataContext';
import { useAuth } from '../../context/AuthContext';

export const SubmitComplaintPage: React.FC = () => {
  const navigate = useNavigate();
  const { addComplaint } = useMockData();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    category: '',
    location: '',
    headline: '',
    description: '',
    priority: 'Medium' as 'High' | 'Medium' | 'Low',
  });

  const handleSubmit = async () => {
    if (!formData.headline) return;
    setIsSubmitting(true);
    try {
      await addComplaint({
        id: `CMP-${Math.floor(1000 + Math.random() * 9000)}`,
        citizenName: user?.name ?? 'Citizen',
        category: formData.category || 'General',
        location: formData.location || 'Unknown',
        description: formData.description || formData.headline,
        status: 'New',
        createdAt: new Date().toISOString().split('T')[0],
        priority: formData.priority,
        staffNotes: '',
      });
      navigate('/citizen');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/citizen')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">New Grievance</h2>
          <p className="text-slate-500 text-sm font-medium">Submit a complaint to MP's office for resolution.</p>
        </div>
      </div>

      <Card>
        <div className="space-y-4 p-2">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</label>
              <select
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="">Select Category</option>
                <option value="Water Supply">Water Supply</option>
                <option value="Electricity">Electricity</option>
                <option value="Roads/Infrastructure">Roads/Infrastructure</option>
                <option value="Sanitation">Sanitation</option>
                <option value="Public Safety">Public Safety</option>
                <option value="Education">Education</option>
                <option value="Health">Health</option>
                <option value="General">General</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority</label>
              <select
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'High' | 'Medium' | 'Low' })}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location (Village/Area)</label>
            <input
              type="text"
              placeholder="e.g. Seelampur Sector 4"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Grievance Headline *</label>
            <input
              type="text"
              placeholder="Brief summary of the issue"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-500"
              value={formData.headline}
              onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Detailed Description</label>
            <textarea
              rows={4}
              placeholder="Provide specific details to help staff verify your complaint..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-sm outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Evidence (Optional)</label>
            <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center bg-slate-50 hover:bg-white hover:border-indigo-300 transition-all cursor-pointer">
              <Upload className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
              <p className="text-xs font-black text-slate-900">Upload Photos or PDF</p>
              <p className="text-[10px] text-slate-400 mt-1">Evidence increases verification speed</p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="ghost" fullWidth onClick={() => navigate('/citizen')}>Cancel</Button>
            <Button fullWidth onClick={handleSubmit} disabled={isSubmitting || !formData.headline}>
              <MessageSquare className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Submitting...' : 'Submit Grievance'}
            </Button>
          </div>
        </div>
      </Card>

      <div className="bg-indigo-50 rounded-2xl p-4 flex items-start gap-3">
        <MessageSquare className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
        <p className="text-[10px] font-black text-indigo-800 uppercase tracking-widest leading-relaxed">
          Verification Chain: Citizen → Staff (Verify) → PA (Dispatch) → Department (Resolve)
        </p>
      </div>
    </div>
  );
};
