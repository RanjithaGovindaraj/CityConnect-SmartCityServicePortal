import React from 'react';
import { NewsItem } from '../types';

interface NewsSectionProps {
  news: NewsItem[];
  isAdmin?: boolean;
  onOpenPublishModal?: () => void;
}

export const NewsSection: React.FC<NewsSectionProps> = ({
  news,
  isAdmin,
  onOpenPublishModal,
}) => {
  return (
    <section className="py-12 bg-slate-50 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold text-amber-700 bg-amber-100 px-3.5 py-1 rounded-full border border-amber-300 uppercase tracking-wider">
              OFFICIAL PRESS RELEASES
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 font-poppins">
              CCMC News & Public Announcements
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Water supply advisories, road diversion updates, property tax circulars, and civic events.
            </p>
          </div>

          {isAdmin && onOpenPublishModal && (
            <button
              onClick={onOpenPublishModal}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition flex items-center gap-2 self-start sm:self-auto"
            >
              <i className="fa-solid fa-bullhorn"></i> Publish New Announcement
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {news.map((n) => (
            <div
              key={n.id}
              className={`bg-white rounded-2xl p-6 border shadow-2xs hover:shadow-md transition flex flex-col justify-between ${
                n.urgent ? 'border-amber-300 bg-amber-50/30' : 'border-slate-200/90'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                    {n.category}
                  </span>
                  {n.urgent && (
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-700 border border-rose-200 animate-pulse">
                      <i className="fa-solid fa-circle-exclamation mr-1"></i> Urgent Advisory
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-slate-900 text-base mb-2 font-poppins">
                  {n.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {n.content}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>
                  By: <strong className="text-slate-700">{n.author}</strong>
                </span>
                <span className="font-mono">{n.publishedAt}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
