import { useState, FormEvent } from 'react';
import { Send, Settings, Play, CheckCircle2, FileSpreadsheet } from 'lucide-react';
import { DEFAULT_CAMPAIGN_TITLE } from '../constants/appScriptCode';

interface CampaignConfigSectionProps {
  title: string;
  onChangeTitle: (title: string) => void;
  onSubmit: (onlyValid: boolean, isDemo: boolean) => void;
  isSubmitting: boolean;
  onOpenSettings: () => void;
  validCount: number;
  totalCount: number;
}

export function CampaignConfigSection({
  title,
  onChangeTitle,
  onSubmit,
  isSubmitting,
  onOpenSettings,
  validCount,
  totalCount,
}: CampaignConfigSectionProps) {
  const [onlyValid, setOnlyValid] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit(onlyValid, false);
  };

  const handleDemoRun = () => {
    onSubmit(onlyValid, true);
  };

  const hasInvalid = totalCount > validCount;

  return (
    <div id="campaign-config-card" className="w-full bg-white border border-slate-200 rounded-xl p-6 shadow-xs mb-6">
      {/* Header with Title and Settings Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          2. Tạo Google Sheet
        </h3>

        {/* Settings Button */}
        <button
          type="button"
          id="open-settings-btn"
          onClick={onOpenSettings}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all shrink-0 cursor-pointer shadow-2xs hover:border-slate-300"
          title="Cấu hình Google Apps Script & Thư mục Drive"
        >
          <Settings className="w-3.5 h-3.5 text-slate-600" />
          <span>Cài đặt kết nối</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100" title="Đã kết nối"></span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Campaign Title Input */}
        <div>
          <label htmlFor="campaign-title-input" className="block text-xs font-bold text-slate-800 uppercase tracking-wider mb-1.5">
            Email campaign <span className="text-red-500">*</span>
          </label>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            </div>
            <input
              type="text"
              id="campaign-title-input"
              value={title}
              onChange={(e) => onChangeTitle(e.target.value)}
              placeholder="Tên giải - Email campaign"
              required
              autoComplete="off"
              className="w-full text-sm bg-slate-50/70 border border-slate-300 rounded-lg py-2.5 pl-10 pr-4 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white font-medium transition-all"
            />
          </div>
        </div>

        {/* Selection options & Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-slate-100">
          <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              id="only-valid-checkbox"
              checked={onlyValid}
              onChange={(e) => setOnlyValid(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span>
              Chỉ xuất dòng hợp lệ (<strong>{validCount}</strong>/{totalCount})
            </span>
          </label>

          <div className="flex items-center gap-2.5">
            {/* Demo Run button */}
            <button
              type="button"
              id="test-demo-run-btn"
              disabled={isSubmitting || totalCount === 0 || !title.trim()}
              onClick={handleDemoRun}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-3.5 h-3.5 text-blue-600" />
              <span>Chạy thử Demo</span>
            </button>

            {/* Main Submit Button */}
            <button
              type="submit"
              id="submit-to-drive-btn"
              disabled={isSubmitting || (onlyValid && validCount === 0) || totalCount === 0 || !title.trim()}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                  <span>Đang tạo Google Sheet...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Tạo Google Sheet ({onlyValid ? validCount : totalCount})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
