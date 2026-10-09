import React from 'react';
import { Complaint, ComplaintStatus } from '../types';

interface ComplaintProgressTimelineProps {
  complaint: Complaint | null;
  onClose: () => void;
}

const STATUS_ORDER: ComplaintStatus[] = ['Pending', 'Assigned', 'In Progress', 'Resolved'];

export const ComplaintProgressTimeline: React.FC<ComplaintProgressTimelineProps> = ({
  complaint,
  onClose,
}) => {
  if (!complaint) return null;

  const currentStatusIdx = STATUS_ORDER.indexOf(complaint.status);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-400 text-slate-950 font-mono font-extrabold text-xs px-2.5 py-0.5 rounded-md">
                {complaint.id}
              </span>
              <span className="text-xs text-slate-400">{complaint.wardNo}</span>
            </div>
            <h3 className="font-bold text-lg text-white font-poppins mt-1">
              {complaint.category}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition"
          >
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Progress Timeline Tracker */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
              Complaint Resolution Lifecycle
            </h4>
            <div className="grid grid-cols-4 gap-2 relative">
              {STATUS_ORDER.map((st, idx) => {
                const isPassed = idx <= currentStatusIdx;
                const isCurrent = idx === currentStatusIdx;

                return (
                  <div key={st} className="flex flex-col items-center text-center">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border-2 transition z-10 ${
                        isPassed
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-100 text-slate-400 border-slate-300'
                      }`}
                    >
                      {isPassed ? (
                        <i className="fa-solid fa-check"></i>
                      ) : (
                        <span>{idx + 1}</span>
                      )}
                    </div>
                    <span
                      className={`text-xs font-bold mt-2 ${
                        isCurrent
                          ? 'text-blue-600'
                          : isPassed
                          ? 'text-slate-800'
                          : 'text-slate-400'
                      }`}
                    >
                      {st}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Details Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500">Citizen Name:</span>
              <span className="font-semibold text-slate-900">{complaint.citizenName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Location:</span>
              <span className="font-semibold text-slate-900">{complaint.address}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Assigned Officer:</span>
              <span className="font-semibold text-blue-700">
                {complaint.assignedEmployeeName || 'Pending Allocation'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Department:</span>
              <span className="font-semibold text-slate-900">
                {complaint.assignedEmployeeDepartment || 'CCMC Civic Cell'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Issue Description:</span>
              <p className="text-slate-800 font-medium bg-white p-2.5 rounded-xl border border-slate-200 leading-relaxed">
                {complaint.description}
              </p>
            </div>
          </div>

          {/* Work Completion Photo if available */}
          {complaint.resolutionPhotoUrl && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs">
              <div className="font-bold text-emerald-900 mb-2 flex items-center gap-2">
                <i className="fa-solid fa-circle-check text-emerald-600"></i>
                Work Completion Inspection Photo
              </div>
              <img
                src={complaint.resolutionPhotoUrl}
                alt="Resolution Work"
                className="w-full h-48 object-cover rounded-xl border border-emerald-200"
              />
              {complaint.resolutionNotes && (
                <p className="mt-2 text-emerald-800 font-medium">
                  Officer Notes: {complaint.resolutionNotes}
                </p>
              )}
            </div>
          )}

          {/* Activity Log History */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Detailed Activity Log & Updates
            </h4>
            <div className="space-y-3">
              {complaint.logs.map((log, index) => (
                <div
                  key={index}
                  className="p-3 bg-white border border-slate-200 rounded-xl text-xs space-y-1 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">
                      Status: <span className="text-blue-600">{log.status}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {log.timestamp}
                    </span>
                  </div>
                  <div className="text-slate-600">
                    Updated by: <strong>{log.updatedBy}</strong>
                  </div>
                  <p className="text-slate-700 bg-slate-50 p-2 rounded-lg italic">
                    "{log.comment}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition"
          >
            Close Tracker
          </button>
        </div>
      </div>
    </div>
  );
};
