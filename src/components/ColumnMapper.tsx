import { CheckCircle2, Columns3, AlertCircle } from 'lucide-react';

interface ColumnMapperProps {
  availableHeaders: string[];
  idKey: string;
  nameKey: string;
  emailKey: string;
  onUpdateMapping: (idKey: string, nameKey: string, emailKey: string) => void;
}

export function ColumnMapper({
  availableHeaders,
  idKey,
  nameKey,
  emailKey,
  onUpdateMapping,
}: ColumnMapperProps) {
  const isComplete = Boolean(idKey && nameKey && emailKey);

  return (
    <div id="column-mapper-section" className="w-full bg-slate-50 border border-slate-200 rounded-xl p-5 mb-6">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Columns3 className="w-4 h-4 text-slate-700" />
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Khớp cột dữ liệu
          </h4>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* ID Column */}
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
          <label htmlFor="id-col-select" className="block text-xs font-semibold text-slate-800 mb-1">
            Cột ID <span className="text-red-500">*</span>
          </label>
          <select
            id="id-col-select"
            value={idKey}
            onChange={(e) => onUpdateMapping(e.target.value, nameKey, emailKey)}
            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md py-1.5 px-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="">-- Chọn cột ID --</option>
            {availableHeaders.map((h) => (
              <option key={`id-${h}`} value={h}>
                {h} {h === idKey ? '✓' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Name Column */}
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
          <label htmlFor="name-col-select" className="block text-xs font-semibold text-slate-800 mb-1">
            Cột Name <span className="text-red-500">*</span>
          </label>
          <select
            id="name-col-select"
            value={nameKey}
            onChange={(e) => onUpdateMapping(idKey, e.target.value, emailKey)}
            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md py-1.5 px-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="">-- Chọn cột Name --</option>
            {availableHeaders.map((h) => (
              <option key={`name-${h}`} value={h}>
                {h} {h === nameKey ? '✓' : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Email Column */}
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
          <label htmlFor="email-col-select" className="block text-xs font-semibold text-slate-800 mb-1">
            Cột Email <span className="text-red-500">*</span>
          </label>
          <select
            id="email-col-select"
            value={emailKey}
            onChange={(e) => onUpdateMapping(idKey, nameKey, e.target.value)}
            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md py-1.5 px-2 text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="">-- Chọn cột Email --</option>
            {availableHeaders.map((h) => (
              <option key={`email-${h}`} value={h}>
                {h} {h === emailKey ? '✓' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
