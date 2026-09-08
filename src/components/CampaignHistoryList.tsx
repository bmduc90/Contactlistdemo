import React from 'react';
import { History, ExternalLink, RefreshCw, Users, FileSpreadsheet, Clock } from 'lucide-react';
import { CampaignHistoryItem } from '../types';

interface CampaignHistoryListProps {
  history: CampaignHistoryItem[];
  isLoading: boolean;
  onRefresh: () => void;
  folderUrl?: string;
}

export const CampaignHistoryList: React.FC<CampaignHistoryListProps> = ({
  history,
  isLoading,
  onRefresh,
}) => {
  // Sắp xếp thời gian mới nhất lên đầu và lấy tối đa 10 campaign
  const sortedHistory = [...history].sort((a, b) => {
    const timeA = new Date(a.createdAt).getTime() || 0;
    const timeB = new Date(b.createdAt).getTime() || 0;
    return timeB - timeA;
  });

  const top10 = sortedHistory.slice(0, 10);

  return (
    <div
      id="campaign-history-section"
      className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-slate-200/80 bg-gradient-to-r from-slate-50/90 to-white flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 leading-none">
              Lịch sử chiến dịch
            </h2>
            <p className="text-[11px] text-slate-500 mt-1 leading-none">
              Hiển thị {top10.length} / {history.length} chiến dịch gần nhất
            </p>
          </div>
        </div>

        <button
          id="refresh-history-btn"
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 hover:text-slate-900 border border-slate-200 shadow-2xs transition-all disabled:opacity-60 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-600' : 'text-slate-500'}`} />
          <span>{isLoading ? 'Đang tải...' : 'Làm mới'}</span>
        </button>
      </div>

      {/* Table Body */}
      {top10.length === 0 ? (
        <div className="py-10 px-4 text-center">
          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2 text-slate-400">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <p className="text-xs font-semibold text-slate-700">Chưa có lịch sử chiến dịch</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Các chiến dịch sau khi tạo file sẽ được tự động lưu ở đây.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
                <th className="py-2.5 px-3 w-12 text-center whitespace-nowrap">#</th>
                <th className="py-2.5 px-4 whitespace-nowrap">Tên chiến dịch</th>
                <th className="py-2.5 px-4 w-44 whitespace-nowrap">Thời gian</th>
                <th className="py-2.5 px-4 w-32 text-center whitespace-nowrap">Số lượng</th>
                <th className="py-2.5 px-4 w-32 text-right whitespace-nowrap">Danh sách User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {top10.map((item, index) => (
                <tr
                  key={item.id || index}
                  className="hover:bg-slate-50/70 transition-colors group"
                >
                  {/* # Thứ tự */}
                  <td className="py-2.5 px-3 text-center whitespace-nowrap">
                    <span
                      className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold ${
                        index === 0
                          ? 'bg-emerald-600 text-white'
                          : index === 1
                          ? 'bg-emerald-100 text-emerald-800'
                          : index === 2
                          ? 'bg-slate-200 text-slate-700'
                          : 'text-slate-400'
                      }`}
                    >
                      {index + 1}
                    </span>
                  </td>

                  {/* Tên chiến dịch (1 dòng text) */}
                  <td className="py-2.5 px-4 whitespace-nowrap max-w-xs md:max-w-md">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span
                        className="font-medium text-slate-900 group-hover:text-emerald-700 transition-colors truncate block"
                        title={item.fileName ? `${item.title} (${item.fileName})` : item.title}
                      >
                        {item.title}
                      </span>
                    </div>
                  </td>

                  {/* Thời gian (1 dòng text) */}
                  <td className="py-2.5 px-4 whitespace-nowrap text-slate-600">
                    <div className="inline-flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-medium">{item.createdAt}</span>
                    </div>
                  </td>

                  {/* Số lượng (1 dòng text) */}
                  <td className="py-2.5 px-4 text-center whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium text-[11px]">
                      <Users className="w-3 h-3 text-slate-400" />
                      <span>{item.totalContacts.toLocaleString('vi-VN')} email</span>
                    </span>
                  </td>

                  {/* Danh sách User: Nút Mở file */}
                  <td className="py-2.5 px-4 text-right whitespace-nowrap">
                    <a
                      id={`open-sheet-link-${index}`}
                      href={item.sheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-600 hover:text-white border border-emerald-200 transition-all shadow-2xs group/btn cursor-pointer"
                    >
                      <span>Mở file</span>
                      <ExternalLink className="w-3 h-3 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
