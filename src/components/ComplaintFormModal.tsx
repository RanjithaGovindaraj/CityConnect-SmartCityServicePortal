import React, { useState, useEffect } from 'react';
import { ComplaintCategory } from '../types';

interface ComplaintFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitComplaint: (complaintData: any) => void;
  citizenName?: string;
  citizenPhone?: string;
  citizenId?: string;
}

const CATEGORIES: ComplaintCategory[] = [
  'Garbage & Sanitation',
  'Water Supply Leakage',
  'Streetlight Outage',
  'Pothole & Road Repair',
  'Sewage & Drainage Overflow',
  'Illegal Construction',
  'Public Health Hazard',
  'Tree Trimming',
];

const COIMBATORE_WARDS = [
  'Ward 24 (RS Puram)',
  'Ward 32 (Gandhipuram)',
  'Ward 58 (Singanallur)',
  'Ward 12 (Town Hall)',
  'Ward 45 (Peelamedu)',
  'Ward 67 (Ukkadam)',
  'Ward 15 (Ganapathy)',
  'Ward 82 (Kuniamuthur)',
];

export const ComplaintFormModal: React.FC<ComplaintFormModalProps> = ({
  isOpen,
  onClose,
  onSubmitComplaint,
  citizenName = 'Karthik Subramanian',
  citizenPhone = '9842212345',
  citizenId = 'usr-citizen-1',
}) => {
  const [category, setCategory] = useState<ComplaintCategory>('Garbage & Sanitation');
  const [description, setDescription] = useState('');
  const [wardNo, setWardNo] = useState('Ward 24 (RS Puram)');
  const [address, setAddress] = useState('DB Road, Near Post Office, RS Puram, Coimbatore');
  const [latitude, setLatitude] = useState<number>(11.0105);
  const [longitude, setLongitude] = useState<number>(76.9472);
  const [isLocating, setIsLocating] = useState(false);
  const [photoUrl, setPhotoUrl] = useState(
    'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&auto=format&fit=crop&q=60'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successComplaintId, setSuccessComplaintId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiDetectedPriority, setAiDetectedPriority] = useState<string | null>(null);
  const [aiNotice, setAiNotice] = useState<string | null>(null);

  const handleAnalyzePhotoWithAI = async (urlToAnalyze?: string) => {
    const targetUrl = urlToAnalyze || photoUrl;
    if (!targetUrl) return;
    setIsAnalyzing(true);
    setAiNotice(null);

    try {
      const res = await fetch('/api/ai/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoUrl: targetUrl }),
      });
      const data = await res.json();
      if (data.category && CATEGORIES.includes(data.category)) {
        setCategory(data.category);
      }
      if (data.description) {
        setDescription(data.description);
      }
      if (data.priority) {
        setAiDetectedPriority(data.priority);
      }
      setAiNotice(`✨ Gemini Vision AI detected: ${data.category} (${data.priority || 'High'} Severity)`);
    } catch (err) {
      console.error('AI Vision error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Auto detect GPS location on open
  useEffect(() => {
    if (isOpen) {
      handleDetectLocation();
    }
  }, [isOpen]);

  const handleDetectLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(Number(pos.coords.latitude.toFixed(4)));
          setLongitude(Number(pos.coords.longitude.toFixed(4)));
          setIsLocating(false);
        },
        () => {
          // Fallback to RS Puram, Coimbatore coordinates
          setLatitude(11.0105);
          setLongitude(76.9472);
          setIsLocating(false);
        },
        { timeout: 5000 }
      );
    } else {
      setIsLocating(false);
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setIsSubmitting(true);

    const payload = {
      citizenId,
      citizenName,
      citizenPhone,
      category,
      description,
      address,
      latitude,
      longitude,
      wardNo,
      photoUrl,
    };

    setTimeout(() => {
      onSubmitComplaint(payload);
      setIsSubmitting(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-[#0B2144] text-white p-5 flex items-center justify-between border-b border-blue-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-xs">
              <i className="fa-solid fa-triangle-exclamation text-xl"></i>
            </div>
            <div>
              <h3 className="font-bold text-lg text-white font-poppins">
                Register Geotagged Civic Complaint
              </h3>
              <p className="text-xs text-slate-300">
                Coimbatore City Municipal Corporation Grievance Portal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Category Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
              Select Complaint Category <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`p-2.5 rounded-xl text-xs font-semibold border text-left transition flex items-center gap-2 ${
                    category === cat
                      ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <i className="fa-solid fa-circle-dot text-[10px]"></i>
                  <span className="truncate">{cat}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
              Complaint Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue clearly (e.g., Waste bin overflowing on DB Road next to Post Office causing odor)..."
              required
              className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-hidden font-medium"
            />
          </div>

          {/* Ward & Address */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                Ward / Zone Location
              </label>
              <select
                value={wardNo}
                onChange={(e) => setWardNo(e.target.value)}
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-hidden font-medium"
              >
                {COIMBATORE_WARDS.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                Detected Address / Landmark
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address or landmark"
                required
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-hidden font-medium"
              />
            </div>
          </div>

          {/* Auto GPS Location Capture Bar */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <i className="fa-solid fa-location-crosshairs"></i>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-800">
                  GPS Coordinates Geotagged
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  Lat: <strong className="text-slate-800">{latitude}</strong> | Long:{' '}
                  <strong className="text-slate-800">{longitude}</strong>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={isLocating}
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <i className={`fa-solid fa-arrows-rotate ${isLocating ? 'animate-spin' : ''}`}></i>
              {isLocating ? 'Locating...' : 'Refresh GPS'}
            </button>
          </div>

          {/* AI Vision Status Notification */}
          {aiNotice && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-3 flex items-center justify-between text-xs font-semibold text-blue-900 animate-fade-in shadow-2xs">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-wand-magic-sparkles text-amber-500 text-sm animate-pulse"></i>
                <span>{aiNotice}</span>
              </div>
              <button
                type="button"
                onClick={() => setAiNotice(null)}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
          )}

          {/* Photo Attachment & AI Vision Trigger */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                Complaint Photo (Geotagged Attachment)
              </label>
              <button
                type="button"
                onClick={() => handleAnalyzePhotoWithAI()}
                disabled={isAnalyzing || !photoUrl}
                className="px-2.5 py-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <i className={`fa-solid fa-wand-magic-sparkles text-amber-300 ${isAnalyzing ? 'animate-spin' : ''}`}></i>
                {isAnalyzing ? 'Analyzing Image...' : '✨ Analyze Photo with AI Vision'}
              </button>
            </div>
            <div className="flex items-center gap-3">
              <img
                src={photoUrl}
                alt="Complaint Preview"
                className="w-16 h-16 rounded-xl object-cover border border-slate-300 shadow-2xs shrink-0"
              />
              <div className="flex-1 space-y-1.5">
                <input
                  type="text"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  placeholder="Photo image URL or capture"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 font-mono text-slate-600 focus:ring-2 focus:ring-blue-600 outline-hidden"
                />
                
                {/* Sample Image Quick Selector Shortcuts */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 font-medium">Quick Test Photos:</span>
                  <button
                    type="button"
                    onClick={() => {
                      const u = 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=60';
                      setPhotoUrl(u);
                      handleAnalyzePhotoWithAI(u);
                    }}
                    className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-[10px] font-semibold text-slate-600 border border-slate-200 transition"
                  >
                    🛣️ Pothole
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const u = 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&auto=format&fit=crop&q=60';
                      setPhotoUrl(u);
                      handleAnalyzePhotoWithAI(u);
                    }}
                    className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-[10px] font-semibold text-slate-600 border border-slate-200 transition"
                  >
                    🗑️ Garbage
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const u = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=60';
                      setPhotoUrl(u);
                      handleAnalyzePhotoWithAI(u);
                    }}
                    className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-[10px] font-semibold text-slate-600 border border-slate-200 transition"
                  >
                    🚰 Water Leak
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const u = 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=800&auto=format&fit=crop&q=60';
                      setPhotoUrl(u);
                      handleAnalyzePhotoWithAI(u);
                    }}
                    className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-[10px] font-semibold text-slate-600 border border-slate-200 transition"
                  >
                    💡 Streetlight
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition flex items-center gap-2"
            >
              <i className="fa-solid fa-paper-plane"></i>
              {isSubmitting ? 'Registering...' : 'Submit Complaint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
