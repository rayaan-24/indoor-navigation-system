import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Send, CheckCircle2, MessageSquare, ArrowLeft } from 'lucide-react';
import type { FeedbackReport } from '../../types';

export default function Feedback() {
  const [issueType, setIssueType] = useState<FeedbackReport['type']>('Incorrect room');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const issueTypes: FeedbackReport['type'][] = [
    'Incorrect room',
    'Incorrect route',
    'Missing location',
    'Blocked path',
    'Incorrect building information',
    'Other'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please provide a description of the issue.');
      return;
    }
    setError('');

    // Simulate saving to database via localStorage
    const newReport: FeedbackReport = {
      id: `rep-${Math.random().toString(36).substr(2, 9)}`,
      type: issueType,
      description: description,
      status: 'Pending',
      createdAt: new Date().toLocaleString(),
    };

    const existingReports = JSON.parse(localStorage.getItem('reports') || '[]');
    localStorage.setItem('reports', JSON.stringify([newReport, ...existingReports]));

    setSubmitted(true);
    setDescription('');
  };

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 py-12">
      
      {/* Page Title */}
      <div className="text-center space-y-3 mb-10">
        <h1 className="text-3xl font-extrabold text-brand-primary">Help Us Improve IndoorNav</h1>
        <p className="text-brand-muted text-sm max-w-md mx-auto">Found a map error, blocked corridor, or missing classroom? File a quick report below.</p>
      </div>

      {!submitted ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Issue Type */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">Issue Category</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {issueTypes.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setIssueType(type)}
                    className={`px-4 py-3 rounded-lg border text-xs font-semibold text-left transition-all cursor-pointer ${
                      issueType === type
                        ? 'bg-blue-50 border-brand-secondary text-brand-primary shadow-sm'
                        : 'border-slate-200 hover:bg-slate-50 text-brand-muted hover:border-slate-350'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Description Textarea */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-brand-muted">Issue Description</label>
              <textarea
                placeholder="Please describe what is incorrect (e.g. Room B204 is marked as Room B205, or Staircase B1 is closed for renovations)..."
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-xs text-brand-primary focus:outline-none focus:border-brand-secondary bg-slate-50 focus:bg-white transition-colors"
              />
              {error && <span className="text-[10px] text-brand-accent-dest font-semibold">{error}</span>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center rounded-lg bg-brand-secondary text-white font-semibold py-3 px-4 text-sm shadow hover:bg-blue-700 transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4 mr-2" />
              Submit Report
            </button>

          </form>
        </div>
      ) : (
        // Success View
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center shadow-md space-y-6 animate-fade-in">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
            <CheckCircle2 className="w-8 h-8 text-brand-accent-loc" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-brand-primary">Report Submitted Successfully</h2>
            <p className="text-brand-muted text-sm max-w-sm mx-auto leading-relaxed">
              Thank you for reporting this issue. Our campus administrative mapping team will review your ticket and adjust floor plans accordingly.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <button
              onClick={() => setSubmitted(false)}
              className="inline-flex items-center justify-center rounded-lg border border-slate-250 bg-white px-5 py-2.5 text-xs font-semibold text-brand-primary hover:bg-slate-50 transition-colors border-slate-200 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 mr-1.5" />
              Submit Another Ticket
            </button>
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-lg bg-brand-primary text-white font-semibold px-5 py-2.5 text-xs shadow hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Back to Home
            </Link>
          </div>
        </div>
      )}

    </div>
  );
}
