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
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">
              Cài đặt
            </h3>
          </div>
          <button
            id="close-settings-modal-btn"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-200 px-5 bg-slate-50">
          <button
            type="button"
            onClick={() => setActiveTab('connection')}
            className={`py-2 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'connection'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Kết nối
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('code')}
            className={`py-2 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'code'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Mã Apps Script</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {activeTab === 'connection' ? (
            <>
              {/* URL Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="modal-appscript-url" className="text-xs font-semibold text-slate-800">
                    URL Google Apps Script
                  </label>
                  {!isDefaultUrl && (
                    <button
                      type="button"
                      onClick={() => onChangeAppsScriptUrl(DEFAULT_APPS_SCRIPT_URL)}
                      className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Mặc định
                    </button>
                  )}
                </div>
                <input
                  type="url"
                  id="modal-appscript-url"
                  value={appsScriptUrl}
                  onChange={(e) => onChangeAppsScriptUrl(e.target.value)}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg py-2 px-3 text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Target Folders Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                {/* Step 1 Folder */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                      <FolderGit2 className="w-3.5 h-3.5 text-emerald-600" />
                      Thư mục Sheet
                    </span>
                    <a
                      href={DEFAULT_FOLDER_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                    >
                      <span>Mở</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <p className="text-xs font-mono text-slate-700 bg-white p-1.5 rounded border border-slate-200 truncate">
                    {DEFAULT_FOLDER_ID}
                  </p>
                </div>

                {/* Step 2 Folder */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                      <Images className="w-3.5 h-3.5 text-blue-600" />
                      Thư mục Image Sheet
                    </span>
                    <a
                      href={STEP2_TARGET_FOLDER_URL}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                    >
                      <span>Mở</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <p className="text-xs font-mono text-slate-700 bg-white p-1.5 rounded border border-slate-200 truncate">
                    {STEP2_TARGET_FOLDER_ID}
                  </p>
                </div>
              </div>
            </>
          ) : (
            /* Code.gs Tab */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800">Mã Apps Script (Code.gs)</span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-medium hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Đã chép!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Sao chép</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code display block */}
              <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950 font-mono text-xs">
                <pre className="p-3 text-slate-200 overflow-x-auto max-h-80 leading-relaxed text-[11px]">
                  <code>{APP_SCRIPT_SOURCE_CODE}</code>
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-5 py-3 border-t border-slate-200 bg-slate-50">
          <button
            type="button"
            id="save-close-settings-btn"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
