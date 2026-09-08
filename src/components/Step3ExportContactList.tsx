import React from 'react';
import {
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  FileSpreadsheet,
  RotateCcw,
  Loader2,
  Layers,
  FileDown
} from 'lucide-react';
import { Step3ExportResponse, ValidatedContact } from '../types';
import { exportMappedContactsToExcel, exportFullMappedRowsToExcel } from '../utils/excelParser';

interface Step3ExportContactListProps {
  result: Step3ExportResponse | null;
  isProcessing: boolean;
  error: string | null;
  onBackToStep2: () => void;
  onOpenCodeModal?: () => void;
  campaignTitle?: string;
  originalFileName?: string;
  availableHeaders?: string[];
  onRetry?: () => void;
  onClientExportFallback?: () => void;
  contacts?: ValidatedContact[];
  rawRows?: Record<string, any>[];
  idKey?: string;
  step1SheetId?: string;
  step1SheetUrl?: string;
}

export function Step3ExportContactList({
  result,
  isProcessing,
  error,
  onBackToStep2,
  onOpenCodeModal,
  campaignTitle,
  originalFileName,
  availableHeaders = [],
  onRetry,
  contacts = [],
  rawRows = [],
  idKey,
  step1SheetId,
  step1SheetUrl,
}: Step3ExportContactListProps) {
  // Trích xuất Google Sheet ID từ result hoặc step1SheetId / step1SheetUrl
  const resolvedSheetId = React.useMemo(() => {
    if (result?.sheetId && !result.sheetId.startsWith('demo-') && result.sheetId.length > 10) {
      return result.sheetId;
    }
    if (step1SheetId && !step1SheetId.startsWith('demo-') && step1SheetId.length > 10) {
      return step1SheetId;
    }
    const urlToCheck = result?.sheetUrl || step1SheetUrl;
    if (urlToCheck) {
      const match = urlToCheck.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
      if (match && match[1] && !match[1].startsWith('demo-') && match[1].length > 10) {
        return match[1];
      }
    }
    return null;
  }, [result?.sheetId, result?.sheetUrl, step1SheetId, step1SheetUrl]);

  // URL xuất file Excel (.xlsx) trực tiếp từ Google Sheet chứa toàn bộ cột và cột img
  const googleSheetExportXlsxUrl = resolvedSheetId
    ? `https://docs.google.com/spreadsheets/d/${resolvedSheetId}/export?format=xlsx`
    : null;

  // Handler tải file Excel: nếu có link Google Sheet thì mở trực tiếp, ngược lại fallback giữ nguyên các cột
  const handleDownloadExcel = () => {
    if (googleSheetExportXlsxUrl) {
      const a = document.createElement('a');
      a.href = googleSheetExportXlsxUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    const safeTitle = campaignTitle?.trim() || originalFileName?.replace(/\.[^/.]+$/, '') || 'contact_list_mapped';
    const imgMap = result?.imageMap || {};

    if (rawRows && rawRows.length > 0 && availableHeaders && availableHeaders.length > 0) {
      exportFullMappedRowsToExcel(
        rawRows,
        availableHeaders,
        idKey || availableHeaders[0] || 'ID',
        imgMap,
        `${safeTitle}_mapped.xlsx`
      );
      return;
    }

    const itemsToExport: { id: string; name: string; email: string; imageUrl?: string; hasImage?: boolean }[] = [];
    if (result?.mappedContacts && result.mappedContacts.length > 0) {
      result.mappedContacts.forEach((c) => {
        itemsToExport.push({
          id: c.id,
          name: c.name,
          email: c.email,
          imageUrl: c.imageUrl || '',
          hasImage: Boolean(c.hasImage || c.imageUrl),
        });
      });
    } else if (contacts && contacts.length > 0) {
      contacts.forEach((c) => {
        const imgUrl = imgMap[String(c.id)] || '';
        itemsToExport.push({
          id: c.id,
          name: c.name,
          email: c.email,
          imageUrl: imgUrl,
          hasImage: Boolean(imgUrl),
        });
      });
    }
    exportMappedContactsToExcel(itemsToExport, `${safeTitle}_mapped.xlsx`);
  };
  // 1. Loading / Processing State
  if (isProcessing) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 sm:p-10 shadow-xs text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mx-auto">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Đang xuất danh sách...
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Đang quét thư mục ảnh và cập nhật Google Sheet.
          </p>
        </div>
      </div>
    );
  }

  // 2. Error State
  if (error && !result) {
    return (
      <div className="bg-white border border-red-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2.5 text-red-900 text-xs">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>

        <div className="flex items-center gap-2.5">
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-3.5 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Thử lại</span>
            </button>
          )}

          <button
            onClick={onBackToStep2}
            className="px-3.5 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Quay lại</span>
          </button>
        </div>
      </div>
    );
  }

  // 3. Not triggered yet
  if (!result) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-xs text-center space-y-4">
        <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto">
          <Layers className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Chưa có dữ liệu
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Vui lòng chọn thư mục ảnh ở Bước 2 trước.
          </p>
        </div>
        <button
          onClick={onBackToStep2}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-all inline-flex items-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Quay lại Bước 2</span>
        </button>
      </div>
    );
  }

  // 4. Success Results View
  return (
    <div className="bg-white border border-emerald-200 rounded-xl p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Xuất danh sách thành công
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Đã ghép {result.matchedCount || 0} / {result.totalContacts || 0} ảnh vào danh sách
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Mở Google Sheet file */}
          {result.sheetUrl && (
            <a
              href={result.sheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              id="btn-open-step3-sheet"
              className="px-4 py-2 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Mở file</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          {/* Tải file Excel trực tiếp từ Google Sheet */}
          {googleSheetExportXlsxUrl ? (
            <a
              href={googleSheetExportXlsxUrl}
              target="_blank"
              rel="noopener noreferrer"
              download
              id="btn-download-excel-step3"
              className="px-4 py-2 rounded-lg text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 hover:text-slate-900 border border-slate-300 hover:border-slate-400 transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
              title="Tải trực tiếp file Excel từ Google Sheet với đầy đủ các cột và cột img"
            >
              <FileDown className="w-4 h-4 text-emerald-600" />
              <span>Tải file Excel</span>
            </a>
          ) : (
            <button
              type="button"
              id="btn-download-excel-step3"
              onClick={handleDownloadExcel}
              className="px-4 py-2 rounded-lg text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 hover:text-slate-900 border border-slate-300 hover:border-slate-400 transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-2xs"
            >
              <FileDown className="w-4 h-4 text-emerald-600" />
              <span>Tải file Excel</span>
            </button>
          )}

          {/* Export contact list / Xuất lại */}
          <button
            type="button"
            id="btn-re-export-contact-list"
            onClick={onBackToStep2}
            className="px-3.5 py-2 rounded-lg text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Export contact list</span>
          </button>
        </div>
      </div>
    </div>
  );
}
