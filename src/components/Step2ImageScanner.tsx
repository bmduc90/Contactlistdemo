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
  FolderOpen
} from 'lucide-react';
import { extractDriveFolderId } from '../utils/driveUrlHelper';
import { DEFAULT_IMAGE_FOLDER_URL } from '../constants/appScriptCode';

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
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between gap-3 text-red-800 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={() => setErrorMsg(null)}
            className="text-red-500 hover:text-red-800 font-bold px-1.5 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Form Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-5">
        {/* Step 2 Overview Header */}
        <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
              <FolderOpen className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Thư mục ảnh Google Drive
            </h3>
          </div>

          {totalStep1Contacts > 0 && (
            <span className="text-xs text-slate-500 font-medium">
              {totalStep1Contacts} liên hệ
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Input Google Drive Folder Link */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label
                htmlFor="drive-folder-url-input"
                className="text-xs font-semibold text-slate-800 flex items-center gap-1.5"
              >
                <Link2 className="w-3.5 h-3.5 text-blue-600" />
                <span>Link thư mục ảnh</span>
              </label>
              <button
                type="button"
                onClick={handleFillSample}
                className="text-xs text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Dùng link mẫu</span>
              </button>
            </div>

            <div className="relative">
              <input
                id="drive-folder-url-input"
                type="text"
                value={folderInput}
                onChange={(e) => setFolderInput(e.target.value)}
                placeholder="Dán link hoặc ID thư mục Google Drive..."
                className={`w-full px-3.5 py-2.5 pr-8 text-xs sm:text-sm rounded-lg border bg-slate-50 focus:bg-white transition-all outline-hidden font-mono ${
                  extractedId
                    ? 'border-emerald-500 ring-1 ring-emerald-500/20'
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
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs p-1"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Extraction Feedback */}
            {extractedId && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-900">
                <div className="flex items-center gap-1.5 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>ID: {extractedId}</span>
                </div>
                <a
                  href={`https://drive.google.com/drive/folders/${extractedId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-emerald-700 hover:underline flex items-center gap-1 font-medium"
                >
                  <span>Mở Drive</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          {/* Contact count selector */}
          {totalStep1Contacts > 0 && (
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <label className="flex items-center gap-2 text-xs text-slate-800 cursor-pointer">
                <input
                  type="radio"
                  name="contactSelectionMode"
                  checked={sendAllContacts}
                  onChange={() => setSendAllContacts(true)}
                  className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500"
                />
                <span>Tất cả ({totalStep1Contacts})</span>
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
                  <span>Chỉ hợp lệ ({validContactsCount})</span>
                </label>
              )}
            </div>
          )}

          {/* Campaign target summary */}
          {campaignTitle && (
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
              <span>Chiến dịch: <strong>{campaignTitle}</strong></span>
              {step1SheetUrl && (
                <a
                  href={step1SheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline inline-flex items-center gap-1 font-medium"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Sheet Bước 1</span>
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
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Export contact list</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
