import { CheckCircle2, ExternalLink, PlusCircle, FileSpreadsheet, ArrowRight, Images } from 'lucide-react';
import { SheetCreationResponse } from '../types';

interface SuccessViewProps {
  result: SheetCreationResponse;
  onReset: () => void;
  onContinueToStep2?: () => void;
}

export function SuccessView({ result, onReset, onContinueToStep2 }: SuccessViewProps) {
  return (
    <div id="success-result-container" className="w-full bg-white border border-emerald-200 rounded-xl p-8 shadow-xs mb-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 mx-auto mb-4">
        <CheckCircle2 className="w-9 h-9" />
      </div>

      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 mb-2">
        Hoàn tất Bước 1 thành công!
      </span>

      <h2 className="text-xl font-bold text-slate-900 mb-6">
        Google Sheet đã được tạo thành công trên Google Drive!
      </h2>

      {/* Main Action buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
        {result.sheetUrl && (
          <a
            href={result.sheetUrl}
            target="_blank"
            rel="noreferrer"
            id="open-created-sheet-btn"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Mở file Google Sheet vừa tạo</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}

        {onContinueToStep2 && (
          <button
            type="button"
            onClick={onContinueToStep2}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs"
          >
            <Images className="w-4 h-4" />
            <span>Tiếp tục sang Bước 2: Quét ảnh Drive</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-4">
        <button
          type="button"
          id="create-another-campaign-btn"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-medium transition-colors cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Tạo chiến dịch Excel khác</span>
        </button>
      </div>
    </div>
  );
}


