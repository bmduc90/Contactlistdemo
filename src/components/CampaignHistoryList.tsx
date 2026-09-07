import React, { useState } from 'react';
import { History, ExternalLink, RefreshCw, Clock, Users, FileSpreadsheet, FolderOpen, CheckCircle } from 'lucide-react';
import { CampaignHistoryItem } from '../types';
import { DEFAULT_FOLDER_URL } from '../constants/appScriptCode';

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
  folderUrl = DEFAULT_FOLDER_URL,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Sắp xếp thời gian mới nhất lên đầu và lấy tối đa 10 campaign
  const sortedHistory = [...history]
    .sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime() || 0;
      const timeB = new Date(b.createdAt).getTime() || 0;
      return timeB - timeA;
    })
    .filter((item) => {
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        item.title.toLowerCase().includes(term) ||
        item.fileName.toLowerCase().includes(term) ||
        item.createdAt.toLowerCase().includes(term)
      );
    });

  const top10 = sortedHistory.slice(0, 10);

  return (
    <div id="campaign-history-section" className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-slate-100 bg-linear-to-r from-slate-50 via-white to-slate-50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
              <History className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900">
              10 Chiến dịch Email Campaign mới nhất
            </h2>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Mới nhất lên đầu
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 pl-10.5">
            Lịch sử tự động lưu vào Google Sheet mỗi khi tạo thành công ở Bước 1
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            id="refresh-history-btn"
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 transition-colors shadow-2xs disabled:opacity-60 cursor-pointer"
            title="Tải lại danh sách từ Google Sheet"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-600' : ''}`} />
            <span>{isLoading ? 'Đang cập nhật...' : 'Làm mới'}</span>
          </button>

          <a
            id="open-drive-folder-btn"
            href={folderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Mở Drive Folder</span>
          </a>
        </div>
      </div>

      {/* Body */}
      {top10.length === 0 ? (
        <div className="p-10 text-center">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-700">Chưa có chiến dịch nào được tạo</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
            Hãy tải file Excel danh bạ lên ở phía trên và nhấn "Xuất Google Sheet lên Drive" để bắt đầu tạo chiến dịch đầu tiên.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4 min-w-[220px]">Tên Email Campaign</th>
                <th className="py-3 px-4 min-w-[170px]">Thời gian tạo</th>
                <th className="py-3 px-4 min-w-[130px] text-center">Số lượng</th>
                <th className="py-3 px-4 min-w-[140px] text-center">Trạng thái</th>
                <th className="py-3 px-4 min-w-[150px] text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {top10.map((item, index) => (
                <tr
                  key={item.id || index}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {/* Thứ tự */}
                  <td className="py-3.5 px-4 text-center">
                    <span className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-[11px] font-bold ${
                      index === 0
                        ? 'bg-emerald-600 text-white'
                        : index === 1
                        ? 'bg-emerald-100 text-emerald-800'
                        : index === 2
                        ? 'bg-slate-200 text-slate-700'
                        : 'text-slate-400'
                    }`}>
                      {index + 1}
                    </span>
                  </td>

                  {/* Tên Campaign & Tên file */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-100">
                        <FileSpreadsheet className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors text-sm">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5 truncate max-w-xs">
                          {item.fileName}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Thời gian tạo (mới nhất lên đầu) */}
                  <td className="py-3.5 px-4">
                    <div className="inline-flex items-center gap-1.5 text-slate-700 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{item.createdAt}</span>
                    </div>
                  </td>

                  {/* Số lượng liên hệ */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold text-[11px]">
                      <Users className="w-3 h-3 text-slate-500" />
                      <span>{item.totalContacts.toLocaleString('vi-VN')} email</span>
                    </div>
                  </td>

                  {/* Trạng thái */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      <span>Đã tạo Google Sheet</span>
                    </span>
                  </td>

                  {/* Thao tác mở Google Sheet */}
                  <td className="py-3.5 px-4 text-right">
                    <a
                      id={`open-sheet-link-${index}`}
                      href={item.sheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-600 hover:text-white border border-emerald-200 transition-all shadow-2xs group/btn cursor-pointer"
                    >
                      <span>Mở Google Sheet</span>
                      <ExternalLink className="w-3 h-3 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer count indicator */}
      {top10.length > 0 && (
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Hiển thị {top10.length} / {history.length} chiến dịch gần nhất (sắp xếp giảm dần theo thời gian)</span>
          <a
            href={folderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-700 font-semibold hover:underline flex items-center gap-1"
          >
            <span>Xem tất cả file trong Google Drive Folder</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
    </div>
  );
};
