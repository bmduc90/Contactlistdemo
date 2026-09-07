import { FileSpreadsheet, Settings, FolderGit2, ExternalLink } from 'lucide-react';
import { DEFAULT_FOLDER_URL } from '../constants/appScriptCode';

interface HeaderProps {
  onOpenSettings: () => void;
}

export function Header({ onOpenSettings }: HeaderProps) {
  return (
    <header className="border-b border-slate-200 bg-white/95 sticky top-0 z-30 backdrop-blur-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 tracking-tight">
                Contact List Creator
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href={DEFAULT_FOLDER_URL}
            target="_blank"
            rel="noreferrer"
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors"
          >
            <FolderGit2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Thư mục Drive</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

          <button
            type="button"
            id="header-settings-btn"
            onClick={onOpenSettings}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors shadow-2xs cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Cài đặt & Mã Script</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Đã kết nối Web App"></span>
          </button>
        </div>
      </div>
    </header>
  );
}
