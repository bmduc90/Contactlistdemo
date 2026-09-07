import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { Upload, FileSpreadsheet, Download, AlertTriangle, FileCheck2, RefreshCw } from 'lucide-react';
import { downloadSampleExcel } from '../utils/excelParser';

interface FileUploadProps {
  onFileLoaded: (file: File) => void;
  isLoading: boolean;
  currentFileName?: string;
  onReset: () => void;
}

export function FileUpload({ onFileLoaded, isLoading, currentFileName, onReset }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    setErrorMsg(null);
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const lowerName = file.name.toLowerCase();
    const isValidType = validExtensions.some(ext => lowerName.endsWith(ext));

    if (!isValidType) {
      setErrorMsg('Vui lòng chọn định dạng file bảng tính hợp lệ (.xlsx, .xls, .csv)');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setErrorMsg('Dung lượng file vượt quá giới hạn 25MB');
      return;
    }

    onFileLoaded(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div id="file-upload-section" className="w-full bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          1. Tải file Excel danh sách liên hệ
        </h3>

        <button
          type="button"
          id="download-sample-btn"
          onClick={downloadSampleExcel}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors shrink-0 shadow-2xs cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-emerald-600" />
          <span>Tải file Excel mẫu</span>
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        id="excel-file-input"
        accept=".xlsx, .xls, .csv"
        className="hidden"
        onChange={handleInputChange}
      />

      {currentFileName ? (
        <div className="flex items-center justify-between p-4 bg-emerald-50/60 border border-emerald-200 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-emerald-900">File đang được xử lý:</p>
              <p className="text-sm font-semibold text-slate-900 font-mono">{currentFileName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="reupload-file-btn"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors shadow-2xs cursor-pointer"
            >
              Chọn file khác
            </button>
            <button
              type="button"
              id="reset-file-btn"
              onClick={onReset}
              className="p-1.5 rounded-md border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs transition-colors cursor-pointer"
              title="Hủy file này"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div
          id="dropzone"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragOver
              ? 'border-emerald-500 bg-emerald-50/40 scale-[0.99]'
              : 'border-slate-300 hover:border-emerald-400 hover:bg-slate-50/70'
          }`}
        >
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 group-hover:text-emerald-600 transition-colors">
              {isLoading ? (
                <RefreshCw className="w-6 h-6 text-emerald-600 animate-spin" />
              ) : (
                <Upload className="w-6 h-6" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Kéo thả file Excel (.xlsx, .csv) hoặc <span className="text-emerald-600 hover:underline">nhấp để chọn</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
