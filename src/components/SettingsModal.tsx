import { useState } from 'react';
import {
  Settings,
  X,
  CheckCircle2,
  RotateCcw,
  ExternalLink,
  Code2,
  FolderGit2,
  Check,
  Copy,
  Images,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import {
  DEFAULT_FOLDER_ID,
  DEFAULT_FOLDER_URL,
  DEFAULT_APPS_SCRIPT_URL,
  APP_SCRIPT_SOURCE_CODE,
  STEP2_TARGET_FOLDER_ID,
  STEP2_TARGET_FOLDER_URL,
} from '../constants/appScriptCode';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appsScriptUrl: string;
  onChangeAppsScriptUrl: (url: string) => void;
  defaultTab?: 'connection' | 'code';
  onOpenCodeModal?: () => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  appsScriptUrl,
  onChangeAppsScriptUrl,
  defaultTab = 'connection',
  onOpenCodeModal: _onOpenCodeModal,
}: SettingsModalProps) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState<'connection' | 'code'>(defaultTab);

  if (!isOpen) return null;

  const isDefaultUrl = appsScriptUrl.trim() === DEFAULT_APPS_SCRIPT_URL;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(APP_SCRIPT_SOURCE_CODE);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        id="settings-modal"
        className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Cài đặt & Mã Google Apps Script
              </h3>
              <p className="text-xs text-slate-500">
                Cấu hình kết nối Web App và xem/sao chép mã Apps Script dùng chung cho cả 3 bước
              </p>
            </div>
          </div>
          <button
            id="close-settings-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 px-6 bg-slate-50">
          <button
            type="button"
            onClick={() => setActiveTab('connection')}
            className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'connection'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Cấu hình Web App & Thư mục Drive
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('code')}
            className={`py-2.5 px-4 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'code'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Mã Google Apps Script (Dùng cho cả 3 bước)</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {activeTab === 'connection' ? (
            <>
              {/* Status Badge */}
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-emerald-950">
                    {isDefaultUrl ? 'Đang kết nối Web App mặc định' : 'Đang sử dụng Web App tùy chỉnh'}
                  </p>
                  <p className="text-[11px] text-emerald-800">
                    Endpoint này tự động xử lý trọn gói cả 3 bước: Tạo Sheet danh bạ, Quét ảnh Drive và Bổ sung cột img.
                  </p>
                </div>
              </div>

              {/* URL Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="modal-appscript-url" className="text-xs font-semibold text-slate-800">
                    URL Web App của Google Apps Script
                  </label>
                  {!isDefaultUrl && (
                    <button
                      type="button"
                      onClick={() => onChangeAppsScriptUrl(DEFAULT_APPS_SCRIPT_URL)}
                      className="text-[11px] text-blue-700 hover:text-blue-900 inline-flex items-center gap-1 cursor-pointer font-medium"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Khôi phục URL gốc
                    </button>
                  )}
                </div>
                <input
                  type="url"
                  id="modal-appscript-url"
                  value={appsScriptUrl}
                  onChange={(e) => onChangeAppsScriptUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                  className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg py-2.5 px-3 text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[11px] text-slate-500">
                  Đây là endpoint nhận payload JSON từ ứng dụng để thao tác trực tiếp với Google Drive và Google Sheets.
                </p>
              </div>

              {/* Target Folders Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {/* Step 1 Folder */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                      <FolderGit2 className="w-4 h-4 text-emerald-600" />
                      Bước 1: Thư mục lưu Contact Sheet
                    </span>
                    <a
                      href={DEFAULT_FOLDER_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      <span>Mở Drive</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <p className="text-xs font-mono text-slate-700 bg-white p-2 rounded border border-slate-200">
                    {DEFAULT_FOLDER_ID}
                  </p>
                </div>

                {/* Step 2 Folder */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                      <Images className="w-4 h-4 text-blue-600" />
                      Bước 2: Thư mục lưu Image Sheet
                    </span>
                    <a
                      href={STEP2_TARGET_FOLDER_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      <span>Mở Drive</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <p className="text-xs font-mono text-slate-700 bg-white p-2 rounded border border-slate-200">
                    {STEP2_TARGET_FOLDER_ID}
                  </p>
                </div>
              </div>
            </>
          ) : (
            /* Code.gs Tab - 1 script duy nhất dùng cho cả 3 bước */
            <div className="space-y-4">
              {/* Header card */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      1 Script duy nhất dùng cho cả 3 bước
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-800 mt-1">
                    Google Apps Script hợp nhất (Tạo Sheet, Quét ảnh & Bổ sung cột img)
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Không cần chia nhỏ mã hay tạo nhiều Web App. Dán toàn bộ đoạn mã này vào duy nhất 1 file <code>Code.gs</code>.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs cursor-pointer shrink-0"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Đã sao chép!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Sao chép mã Apps Script</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code display block */}
              <div className="relative rounded-xl overflow-hidden border border-slate-800 bg-slate-950 font-mono text-xs shadow-inner">
                <pre className="p-4 text-slate-200 overflow-x-auto max-h-80 leading-relaxed">
                  <code>{APP_SCRIPT_SOURCE_CODE}</code>
                </pre>
              </div>

              {/* Quick instructions */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl text-[11px] text-blue-900 space-y-1.5">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-blue-600" />
                  Hướng dẫn cập nhật vào Google Apps Script:
                </p>
                <ol className="list-decimal list-inside space-y-1 text-slate-700 leading-relaxed pl-1">
                  <li>Sao chép đoạn mã phía trên và dán đè toàn bộ vào file <code>Code.gs</code> trong dự án Apps Script của bạn.</li>
                  <li>Bấm nút <strong>Lưu (Save - Ctrl+S)</strong>.</li>
                  <li>Bấm <strong>Triển khai (Deploy)</strong> &gt; <strong>Quản lý bản triển khai (Manage deployments)</strong> &gt; Chọn biểu tượng <strong>Cây bút (Chỉnh sửa)</strong>.</li>
                  <li>
                    Tại mục <strong>Phiên bản (Version)</strong>: chọn <strong>Phiên bản mới (New version)</strong> &gt; Kiểm tra <strong>Ai có quyền truy cập (Who has access)</strong> là <strong>Bất kỳ ai (Anyone)</strong> &gt; Bấm <strong>Triển khai (Deploy)</strong>.
                  </li>
                </ol>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-200 bg-slate-50">
          <p className="text-xs text-slate-500">
            {isDefaultUrl ? '✓ Cấu hình đang hoạt động hoàn hảo' : 'Đã lưu cấu hình tùy chỉnh'}
          </p>
          <button
            type="button"
            id="save-close-settings-btn"
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            Đóng cài đặt
          </button>
        </div>
      </div>
    </div>
  );
}
