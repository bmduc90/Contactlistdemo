import { CheckCircle2, ExternalLink, PlusCircle, FileSpreadsheet, ArrowRight, Images } from 'lucide-react';
import { SheetCreationResponse } from '../types';

interface SuccessViewProps {
  result: SheetCreationResponse;
  onReset: () => void;
  onContinueToStep2?: () => void;
}

export function SuccessView({ result, onReset, onContinueToStep2 }: SuccessViewProps) {
  return (
    <div id="success-result-container" className="w-full bg-white border border-emerald-200 rounded-xl p-6 shadow-xs mb-6 text-center">
      <div className="w-12 h-12 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 mx-auto mb-3">
        <CheckCircle2 className="w-7 h-7" />
      </div>

      <h2 className="text-base font-bold text-slate-900 mb-4">
        Đã tạo Google Sheet thành công
      </h2>

      {/* Main Action buttons */}
      <div className="flex flex-wrap items-center justify-center gap-2.5 mb-4">
        {result.sheetUrl && (
          <a
            href={result.sheetUrl}
            target="_blank"
            rel="noreferrer"
            id="open-created-sheet-btn"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Mở file</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}

        {onContinueToStep2 && (
          <button
            type="button"
            onClick={onContinueToStep2}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Images className="w-4 h-4" />
            <span>Sang Bước 2</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-center">
        <button
          type="button"
          id="create-another-campaign-btn"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 text-xs font-medium transition-colors cursor-pointer"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Tạo mới</span>
        </button>
      </div>
    </div>
  );
}


