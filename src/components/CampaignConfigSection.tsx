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
    <div id="campaign-config-card" className="w-full bg-white border border-slate-200 rounded-xl p-5 shadow-xs mb-6">
      {/* Header with Title and Settings Button */}
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-900">
          Tải danh sách User
        </h3>

        {/* Settings Button */}
        <button
          type="button"
          id="open-settings-btn"
          onClick={onOpenSettings}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-all shrink-0 cursor-pointer"
        >
          <Settings className="w-3.5 h-3.5 text-slate-600" />
          <span>Cài đặt</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Campaign Title Input */}
        <div>
          <label htmlFor="campaign-title-input" className="block text-xs font-semibold text-slate-800 mb-1">
            Tên chiến dịch <span className="text-red-500">*</span>
          </label>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            </div>
            <input
              type="text"
              id="campaign-title-input"
              value={title}
              onChange={(e) => onChangeTitle(e.target.value)}
              placeholder="Nhập tên chiến dịch"
              required
              autoComplete="off"
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg py-2 pl-9 pr-3 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white font-medium"
            />
          </div>
        </div>

        {/* Selection options & Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
            <input
              type="checkbox"
              id="only-valid-checkbox"
              checked={onlyValid}
              onChange={(e) => setOnlyValid(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-emerald-600 focus:ring-emerald-500"
            />
            <span>
              Chỉ xuất dòng hợp lệ ({validCount}/{totalCount})
            </span>
          </label>

          <div className="flex items-center gap-2">
            {/* Demo Run button */}
            <button
              type="button"
              id="test-demo-run-btn"
              disabled={isSubmitting || totalCount === 0 || !title.trim()}
              onClick={handleDemoRun}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-3.5 h-3.5 text-blue-600" />
              <span>Chạy thử</span>
            </button>

            {/* Main Submit Button */}
            <button
              type="submit"
              id="submit-to-drive-btn"
              disabled={isSubmitting || (onlyValid && validCount === 0) || totalCount === 0 || !title.trim()}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                  <span>Đang tải...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Tải danh sách User ({onlyValid ? validCount : totalCount})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
