import React from 'react';
import {
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  FileSpreadsheet,
  RotateCcw,
  Loader2,
  Code2,
  Layers
} from 'lucide-react';
import { Step3ExportResponse } from '../types';

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
}

export function Step3ExportContactList({
  result,
  isProcessing,
  error,
  onBackToStep2,
  onOpenCodeModal,
  onRetry,
}: Step3ExportContactListProps) {
  // 1. Loading / Processing State
  if (isProcessing) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 shadow-xs text-center space-y-6">
        <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-4 border-blue-100 animate-ping opacity-60" />
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shadow-sm relative">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        </div>

        <div className="max-w-md mx-auto space-y-2">
          <h3 className="text-lg font-bold text-slate-900">
            Đang xử lý Export Contact List...
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Hệ thống đang quét thư mục ảnh trên Google Drive, tự động map cột <strong>ID</strong> của Bước 1 với tên file ảnh ở Bước 2 và sinh thêm cột <strong>img</strong> vào Google Sheet.
          </p>
        </div>

        <div className="max-w-md mx-auto p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-left">
          <div className="flex items-center gap-2.5 text-xs text-slate-700">
            <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="font-medium">1. Quét file ảnh &amp; trích xuất mã ID từ Google Drive</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-slate-700">
            <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="font-medium">2. Đối chiếu mã ID danh bạ Bước 1 với ID ảnh</span>
          </div>
          <div className="flex items-center gap-2.5 text-xs text-slate-700">
            <div className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="font-medium">3. Ghi cột [img] vào file Google Sheet tạo ở Bước 1</span>
          </div>
        </div>
      </div>
    );
  }

  // 2. Error State
  if (error && !result) {
    const isFetchError = error.toLowerCase().includes('failed to fetch') || error.toLowerCase().includes('truy cập');

    return (
      <div className="bg-white border border-red-200 rounded-2xl p-8 shadow-xs space-y-6">
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-900 text-xs">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="font-bold text-sm text-red-950">Không thể hoàn thành Export Contact List</p>
            <p className="text-red-800 leading-relaxed">{error}</p>
            
            {isFetchError && (
              <div className="mt-3 p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-amber-950 space-y-2">
                <p className="font-bold text-xs flex items-center gap-1.5 text-amber-900">
                  <span>💡 Cách khắc phục lỗi &quot;Failed to fetch&quot; (Google chặn quyền truy cập):</span>
                </p>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-amber-900 leading-relaxed">
                  <li>Mở dự án <strong>Google Apps Script</strong> của bạn.</li>
                  <li>Nhấn nút xanh <strong>Triển khai (Deploy)</strong> ở góc phải &gt; chọn <strong>Quản lý bản triển khai (Manage deployments)</strong>.</li>
                  <li>Nhấn vào biểu tượng <strong>Cây bút (Chỉnh sửa - Edit)</strong>.</li>
                  <li>
                    Tại dòng <strong>&quot;Ai có quyền truy cập&quot; (Who has access)</strong>: BẮT BUỘC chọn <strong>&quot;Bất kỳ ai&quot; (Anyone)</strong> (thay vì &quot;Chỉ mình tôi&quot;).
                  </li>
                  <li>
                    Tại dòng <strong>&quot;Phiên bản&quot; (Version)</strong>: Chọn <strong>&quot;Phiên bản mới&quot; (New version)</strong>.
                  </li>
                  <li>Bấm <strong>Triển khai (Deploy)</strong> để lưu lại.</li>
                </ol>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Thử lại kết nối Apps Script ngay</span>
            </button>
          )}

          <button
            onClick={onBackToStep2}
            className="px-4 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Quay lại Bước 2</span>
          </button>
          
          {onOpenCodeModal && (
            <button
              onClick={onOpenCodeModal}
              className="px-4 py-2.5 bg-white border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <Code2 className="w-4 h-4 text-blue-600" />
              <span>Kiểm tra mã Apps Script</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // 3. Not triggered yet (Direct navigation without clicking export)
  if (!result) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 sm:p-12 shadow-xs text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 mx-auto">
          <Layers className="w-8 h-8" />
        </div>
        <div className="max-w-md mx-auto space-y-1">
          <h3 className="text-base font-bold text-slate-900">
            Chưa có dữ liệu Export Contact List
          </h3>
          <p className="text-xs text-slate-500">
            Vui lòng nhập đường link Google Drive thư mục ảnh ở <strong>Bước 2</strong> và bấm nút <strong>&quot;Export contact list&quot;</strong> để hệ thống tự động map ảnh và sinh cột <code>img</code>.
          </p>
        </div>
        <button
          onClick={onBackToStep2}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all inline-flex items-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Chuyển sang Bước 2: Nhập thư mục ảnh</span>
        </button>
      </div>
    );
  }

  // 4. Success Results View: Chỉ hiển thị tiêu đề và duy nhất nút Mở file Google sheet
  return (
    <div className="space-y-6">
      <div className="bg-white border border-emerald-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Bước 3: Export Contact List thành công
            </h3>
          </div>

          {result.sheetUrl && (
            <a
              href={result.sheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              id="btn-open-step3-sheet"
              className="px-5 py-3 rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-xs hover:shadow transition-all inline-flex items-center justify-center gap-2 cursor-pointer shrink-0"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Mở file Google Sheet</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
