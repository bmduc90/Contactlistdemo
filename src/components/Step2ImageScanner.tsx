import React, { useState } from 'react';
import {
  Link2,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Loader2,
  AlertCircle,
  FileSpreadsheet,
  ArrowRight,
  HelpCircle,
  FolderOpen,
  Info
} from 'lucide-react';
import { extractDriveFolderId } from '../utils/driveUrlHelper';
import {
  DEFAULT_IMAGE_FOLDER_URL,
  DEFAULT_IMAGE_FOLDER_ID
} from '../constants/appScriptCode';

interface Step2ImageScannerProps {
  onExportContactList: (folderId: string, sendAll?: boolean) => void;
  isProcessing?: boolean;
  campaignTitle?: string;
  totalStep1Contacts?: number;
  validContactsCount?: number;
  duplicateEmailCount?: number;
  step1SheetUrl?: string;
}

export function Step2ImageScanner({
  onExportContactList,
  isProcessing = false,
  campaignTitle,
  totalStep1Contacts = 0,
  validContactsCount = 0,
  duplicateEmailCount = 0,
  step1SheetUrl,
}: Step2ImageScannerProps) {
  const [folderInput, setFolderInput] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [sendAllContacts, setSendAllContacts] = useState<boolean>(true);

  // Auto extract ID from input
  const extractedId = extractDriveFolderId(folderInput);

  const handleFillSample = () => {
    setFolderInput(DEFAULT_IMAGE_FOLDER_URL);
    setErrorMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!extractedId) {
      setErrorMsg('Vui lòng dán đường link Google Drive Folder hoặc ID thư mục ảnh hợp lệ!');
      return;
    }

    // Trigger export contact list and jump immediately to Step 3
    onExportContactList(extractedId, sendAllContacts);
  };

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {errorMsg && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start justify-between gap-3 text-red-800 text-xs animate-shake">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Chưa thể xuất Contact List:</p>
              <p className="mt-0.5">{errorMsg}</p>
              <p className="mt-1 text-slate-600">
                Gợi ý: Thư mục ảnh cần được cài đặt quyền chia sẻ: <em>"Bất kỳ ai có đường liên kết đều có thể xem (Anyone with the link can view)"</em>.
              </p>
            </div>
          </div>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-red-500 hover:text-red-800 font-bold px-2 py-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Form Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
        {/* Step 2 Overview Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Bước 2: Cung cấp thư mục ảnh trên Google Drive
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Ghép nối mã ID từ danh bạ Bước 1 với tên file ảnh và sinh cột <strong>img</strong> vào Google Sheet.
              </p>
            </div>
          </div>

          {totalStep1Contacts > 0 && (
            <div className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center gap-2 self-start sm:self-auto">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Sẵn sàng ghép nối: <strong>{totalStep1Contacts}</strong> liên hệ từ Bước 1</span>
            </div>
          )}
        </div>

        {/* Explain Mapping Logic Box */}
        <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200/80 text-xs text-blue-900 space-y-2">
          <div className="flex items-center gap-2 font-bold text-blue-950">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>Quy trình tự động khi bấm "Export contact list":</span>
          </div>
          <ul className="list-disc list-inside space-y-1 text-slate-700 pl-1 leading-relaxed">
            <li>
              Hệ thống sẽ <strong>chuyển ngay sang Bước 3</strong> để bạn theo dõi trực tiếp tiến trình ghép ảnh.
            </li>
            <li>
              Mã <strong>ID</strong> của từng liên hệ ở Bước 1 sẽ được đối chiếu chính xác với tên file ảnh ở Bước 2 (ví dụ ảnh <code>1001.jpg</code> &rarr; ID <code>1001</code>).
            </li>
            <li>
              Tự động sinh thêm một cột <strong>img</strong> chứa link xem ảnh trực tiếp vào file Google Sheet đã tạo ở Bước 1.
            </li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Input Google Drive Folder Link */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="drive-folder-url-input"
                className="text-xs font-bold text-slate-900 flex items-center gap-1.5"
              >
                <Link2 className="w-4 h-4 text-blue-600" />
                <span>Đường link Google Drive Folder chứa ảnh *</span>
              </label>
              <button
                type="button"
                onClick={handleFillSample}
                className="text-[11px] font-medium text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Dùng link mẫu ({DEFAULT_IMAGE_FOLDER_ID.substring(0, 8)}...)</span>
              </button>
            </div>

            <div className="relative">
              <input
                id="drive-folder-url-input"
                type="text"
                value={folderInput}
                onChange={(e) => setFolderInput(e.target.value)}
                placeholder="Dán link Google Drive Folder (VD: https://drive.google.com/drive/folders/1ddKeOm3m468O3aBUVGbBdZLkzhzEbnkX)"
                className={`w-full px-4 py-3 pr-10 text-xs sm:text-sm rounded-xl border bg-slate-50/50 focus:bg-white transition-all outline-hidden font-mono ${
                  extractedId
                    ? 'border-emerald-500 ring-2 ring-emerald-500/10'
                    : folderInput.trim()
                    ? 'border-amber-400'
                    : 'border-slate-300 focus:border-blue-500'
                }`}
                disabled={isProcessing}
                required
              />
              {folderInput && (
                <button
                  type="button"
                  onClick={() => setFolderInput('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs p-1"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Extraction Feedback */}
            {extractedId ? (
              <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Đã nhận diện <strong>Folder ID</strong>:{' '}
                    <code className="px-1.5 py-0.5 bg-emerald-100 rounded text-emerald-950 font-mono font-bold">
                      {extractedId}
                    </code>
                  </span>
                </div>
                <a
                  href={`https://drive.google.com/drive/folders/${extractedId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-emerald-700 hover:underline flex items-center gap-1 font-medium"
                >
                  <span>Mở Drive xem ảnh</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ) : folderInput.trim() ? (
              <p className="text-[11px] text-amber-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Không tìm thấy ID thư mục trong liên kết. Vui lòng kiểm tra lại định dạng link Google Drive.</span>
              </p>
            ) : (
              <p className="text-[11px] text-slate-500">
                Hỗ trợ dạng link: <code>https://drive.google.com/drive/folders/ID</code> hoặc điền trực tiếp chuỗi ID thư mục.
              </p>
            )}
          </div>

          {/* Contact count & duplicate handling selector */}
          {totalStep1Contacts > 0 && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800">
                  Dữ liệu gửi ghép ảnh từ Bước 1:
                </span>
                <span className="text-[11px] text-slate-500">
                  Tổng <strong>{totalStep1Contacts}</strong> liên hệ
                </span>
              </div>

              {duplicateEmailCount > 0 && (
                <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200/80 rounded-lg p-2 flex items-start gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    Phát hiện <strong>{duplicateEmailCount} dòng có Email trùng nhau</strong>. Để mỗi người đều được ghép ảnh đại diện theo mã ID (không bị thiếu ảnh), hệ thống khuyên bạn giữ nguyên toàn bộ danh sách.
                  </span>
                </p>
              )}

              <div className="space-y-1.5 pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-800 font-medium cursor-pointer">
                  <input
                    type="radio"
                    name="contactSelectionMode"
                    checked={sendAllContacts}
                    onChange={() => setSendAllContacts(true)}
                    className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500"
                  />
                  <span>
                    Ghép toàn bộ <strong>{totalStep1Contacts} liên hệ</strong> (Khuyên dùng - ghép đủ {totalStep1Contacts} ảnh theo ID, giữ cả các liên hệ có chung Email)
                  </span>
                </label>

                {validContactsCount > 0 && validContactsCount < totalStep1Contacts && (
                  <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="radio"
                      name="contactSelectionMode"
                      checked={!sendAllContacts}
                      onChange={() => setSendAllContacts(false)}
                      className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500"
                    />
                    <span>
                      Chỉ ghép <strong>{validContactsCount} liên hệ</strong> không trùng lặp (loại bỏ các dòng trùng Email)
                    </span>
                  </label>
                )}
              </div>
            </div>
          )}

          {/* Campaign target summary */}
          {campaignTitle && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
              <span>Chiến dịch mục tiêu: <strong>{campaignTitle}</strong></span>
              {step1SheetUrl && (
                <a
                  href={step1SheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline inline-flex items-center gap-1 font-medium"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>File Sheet Bước 1</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          )}

          {/* Submit Button: Export contact list */}
          <div className="pt-2">
            <button
              type="submit"
              id="btn-export-contact-list"
              disabled={isProcessing || !extractedId}
              className="w-full sm:w-auto px-7 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-sm font-bold rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2.5 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang chuyển sang Bước 3 & xử lý Export contact list...</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Export contact list</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
