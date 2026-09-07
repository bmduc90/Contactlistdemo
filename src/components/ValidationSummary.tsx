import { CheckCircle2, AlertTriangle, Users, CopyX, FileDown } from 'lucide-react';
import { exportContactsToExcel } from '../utils/excelParser';
import { ValidatedContact } from '../types';

interface ValidationSummaryProps {
  total: number;
  validCount: number;
  invalidCount: number;
  duplicateCount: number;
  contacts: ValidatedContact[];
  onRemoveAllInvalid: () => void;
  activeFilter: 'all' | 'valid' | 'invalid' | 'duplicates';
  setActiveFilter: (filter: 'all' | 'valid' | 'invalid' | 'duplicates') => void;
}

export function ValidationSummary({
  total,
  validCount,
  invalidCount,
  duplicateCount,
  contacts,
  onRemoveAllInvalid,
  activeFilter,
  setActiveFilter,
}: ValidationSummaryProps) {
  const handleExportLocal = () => {
    exportContactsToExcel(contacts, 'danh_sach_contact_da_validate');
  };

  return (
    <div id="validation-summary-section" className="space-y-4 mb-6">
      {/* 4 Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Card */}
        <button
          type="button"
          onClick={() => setActiveFilter('all')}
          className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
            activeFilter === 'all'
              ? 'bg-slate-900 text-white border-slate-900 shadow-sm ring-2 ring-slate-900/20'
              : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className={`text-xs font-semibold ${activeFilter === 'all' ? 'text-slate-300' : 'text-slate-500'}`}>
              Tổng liên hệ
            </span>
            <Users className={`w-4 h-4 ${activeFilter === 'all' ? 'text-slate-300' : 'text-slate-400'}`} />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono">{total}</span>
          </div>
        </button>

        {/* Valid Card */}
        <button
          type="button"
          onClick={() => setActiveFilter('valid')}
          className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
            activeFilter === 'valid'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm ring-2 ring-emerald-600/20'
              : 'bg-white text-slate-800 border-slate-200 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className={`text-xs font-semibold ${activeFilter === 'valid' ? 'text-emerald-100' : 'text-emerald-700'}`}>
              Hợp lệ
            </span>
            <CheckCircle2 className={`w-4 h-4 ${activeFilter === 'valid' ? 'text-emerald-100' : 'text-emerald-600'}`} />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono">{validCount}</span>
            <span className={`text-xs ${activeFilter === 'valid' ? 'text-emerald-100' : 'text-slate-400'}`}>
              ({total > 0 ? Math.round((validCount / total) * 100) : 0}%)
            </span>
          </div>
        </button>

        {/* Invalid Card */}
        <button
          type="button"
          onClick={() => setActiveFilter('invalid')}
          className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer relative ${
            activeFilter === 'invalid'
              ? 'bg-red-600 text-white border-red-600 shadow-sm ring-2 ring-red-600/30'
              : invalidCount > 0
              ? 'bg-red-50/50 text-slate-800 border-red-200 hover:border-red-400'
              : 'bg-white text-slate-800 border-slate-200 hover:border-red-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className={`text-xs font-semibold ${activeFilter === 'invalid' ? 'text-red-100' : 'text-red-700'}`}>
              Có lỗi
            </span>
            <AlertTriangle className={`w-4 h-4 ${activeFilter === 'invalid' ? 'text-red-100' : 'text-red-600'}`} />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono">{invalidCount}</span>
          </div>
        </button>

        {/* Duplicates Card */}
        <button
          type="button"
          onClick={() => setActiveFilter('duplicates')}
          className={`text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
            activeFilter === 'duplicates'
              ? 'bg-amber-600 text-white border-amber-600 shadow-sm ring-2 ring-amber-600/20'
              : 'bg-white text-slate-800 border-slate-200 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className={`text-xs font-semibold ${activeFilter === 'duplicates' ? 'text-amber-100' : 'text-amber-700'}`}>
              Trùng lặp
            </span>
            <CopyX className={`w-4 h-4 ${activeFilter === 'duplicates' ? 'text-amber-100' : 'text-amber-600'}`} />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono">{duplicateCount}</span>
          </div>
        </button>
      </div>

      {/* Quick utility strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Bộ lọc:</span>
          <span
            className={`text-xs font-bold uppercase px-2.5 py-1 rounded border shadow-2xs ${
              activeFilter === 'invalid'
                ? 'bg-red-600 text-white border-red-700'
                : activeFilter === 'valid'
                ? 'bg-emerald-600 text-white border-emerald-700'
                : activeFilter === 'duplicates'
                ? 'bg-amber-600 text-white border-amber-700'
                : 'bg-slate-800 text-white border-slate-900'
            }`}
          >
            {activeFilter === 'all' && `Tất cả (${total})`}
            {activeFilter === 'valid' && `Hợp lệ (${validCount})`}
            {activeFilter === 'invalid' && `Có lỗi (${invalidCount})`}
            {activeFilter === 'duplicates' && `Trùng lặp (${duplicateCount})`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {invalidCount > 0 && (
            <button
              type="button"
              id="remove-invalid-rows-btn"
              onClick={onRemoveAllInvalid}
              className="text-xs text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-md font-medium transition-colors cursor-pointer"
            >
              Xóa {invalidCount} dòng lỗi
            </button>
          )}

          <button
            type="button"
            id="export-local-excel-btn"
            onClick={handleExportLocal}
            className="inline-flex items-center gap-1.5 text-xs text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-md font-medium transition-colors shadow-2xs cursor-pointer"
          >
            <FileDown className="w-3.5 h-3.5" />
            <span>Tải Excel</span>
          </button>
        </div>
      </div>
    </div>
  );
}
