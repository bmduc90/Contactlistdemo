import { useState } from 'react';
import { Copy, Check, ExternalLink, Code2, FolderGit2, X, AlertCircle, CheckCircle2, Images } from 'lucide-react';
import {
  APP_SCRIPT_SOURCE_CODE,
  DEFAULT_FOLDER_ID,
  DEFAULT_FOLDER_URL,
  DEFAULT_APPS_SCRIPT_URL,
  STEP2_TARGET_FOLDER_ID,
  STEP2_TARGET_FOLDER_URL
} from '../constants/appScriptCode';

interface AppScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AppScriptModal({ isOpen, onClose }: AppScriptModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(APP_SCRIPT_SOURCE_CODE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        id="app-script-modal"
        className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-700">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Mã nguồn Google Apps Script (Hợp nhất dùng cho cả 3 bước)
              </h3>
              <p className="text-xs text-slate-500">
                Tự động tạo Sheet danh bạ Bước 1, quét ảnh Bước 2 & bổ sung cột img vào Sheet Bước 1
              </p>
            </div>
          </div>
          <button
            id="close-appscript-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Target Folders Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Step 1 Folder */}
            <div className="flex items-center justify-between p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg">
              <div className="flex items-center gap-2.5">
                <FolderGit2 className="w-5 h-5 text-emerald-700 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-emerald-950">
                    Bước 1 (Contact Sheet):
                  </p>
                  <p className="text-[11px] font-mono text-emerald-800">
                    ID: <span className="font-bold">{DEFAULT_FOLDER_ID}</span>
                  </p>
                </div>
              </div>
              <a
                href={DEFAULT_FOLDER_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white border border-emerald-300 text-emerald-800 text-[11px] font-medium hover:bg-emerald-100 transition-colors shrink-0 shadow-xs"
              >
                <span>Mở Drive</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Step 2 Folder */}
            <div className="flex items-center justify-between p-3.5 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2.5">
                <Images className="w-5 h-5 text-blue-700 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-blue-950">
                    Bước 2 (Image Sheet ID, image_url):
                  </p>
                  <p className="text-[11px] font-mono text-blue-800">
                    ID: <span className="font-bold">{STEP2_TARGET_FOLDER_ID}</span>
                  </p>
                </div>
              </div>
              <a
                href={STEP2_TARGET_FOLDER_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white border border-blue-300 text-blue-800 text-[11px] font-medium hover:bg-blue-100 transition-colors shrink-0 shadow-xs"
              >
                <span>Mở Drive</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Active Web App URL status */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1 overflow-hidden">
              <p className="text-xs font-semibold text-slate-900">
                Web App URL đang kết nối:
              </p>
              <p className="text-[11px] font-mono text-slate-800 break-all bg-white p-1.5 rounded border border-slate-200">
                {DEFAULT_APPS_SCRIPT_URL}
              </p>
            </div>
          </div>

          {/* Step by step guide to update */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              Cách cập nhật mã mới vào Apps Script (Giữ nguyên URL Web App cũ):
            </h4>
            <ol className="text-xs text-slate-700 space-y-1.5 list-decimal list-inside pl-1 leading-relaxed">
              <li>
                Mở lại trình soạn thảo Apps Script trong Google Sheet của bạn.
              </li>
              <li>
                Dán đè toàn bộ đoạn mã code mới bên dưới vào file <code>Code.gs</code> rồi bấm biểu tượng <strong>Lưu (Save)</strong>.
              </li>
              <li>
                Bấm nút <strong>Triển khai (Deploy)</strong> ở góc trên bên phải &gt; chọn{' '}
                <strong>Quản lý bản triển khai (Manage deployments)</strong>.
              </li>
              <li>
                Nhấn vào biểu tượng <strong>Cây bút (Chỉnh sửa - Edit)</strong> &gt; ở mục Phiên bản (Version) chọn <strong>Phiên bản mới (New version)</strong>.
              </li>
              <li>
                Bấm <strong>Triển khai (Deploy)</strong>. Khi đó mã mới đã có hiệu lực ngay lập tức cho cả Bước 1, Bước 2 và Bước 3 (Export Contact List & map ảnh) mà không cần đổi đường link Web App!
              </li>
            </ol>
          </div>

          {/* Code Viewer */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700 font-mono">
                Code.gs (Apps Script hợp nhất Bước 1, 2 & 3)
              </span>
              <button
                id="copy-code-btn"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors shadow-xs"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Đã sao chép vào bộ nhớ tạm!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Sao chép toàn bộ mã</span>
                  </>
                )}
              </button>
            </div>
            <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950 font-mono text-xs">
              <pre className="p-4 text-slate-200 overflow-x-auto max-h-72 leading-relaxed">
                <code>{APP_SCRIPT_SOURCE_CODE}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-200 bg-slate-50">
          <p className="text-xs text-slate-500">
            Hỗ trợ tự động: Tách ID ảnh & sinh file 2 cột vào thư mục <code>{STEP2_TARGET_FOLDER_ID}</code>.
          </p>
          <button
            id="close-modal-footer-btn"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-200 text-slate-800 text-xs font-medium hover:bg-slate-300 transition-colors"
          >
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  );
}

