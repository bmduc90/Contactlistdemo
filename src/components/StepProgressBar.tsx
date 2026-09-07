import { CheckCircle2, Clock, FileSpreadsheet, Images, Sparkles, Send } from 'lucide-react';

interface StepProgressBarProps {
  currentStep: number;
  onSelectStep?: (step: number) => void;
  hasStep1Data?: boolean;
  hasStep3Data?: boolean;
}

export function StepProgressBar({
  currentStep = 1,
  onSelectStep,
  hasStep1Data = true,
  hasStep3Data = false,
}: StepProgressBarProps) {
  const steps = [
    {
      step: 1,
      title: 'Bước 1: Tạo Sheet Contact',
      icon: FileSpreadsheet,
      badge: currentStep === 1 ? 'Đang chọn' : currentStep > 1 ? 'Hoàn tất' : 'Chưa làm',
    },
    {
      step: 2,
      title: 'Bước 2: Quét Thư Mục Ảnh',
      icon: Images,
      badge: currentStep === 2 ? 'Đang chọn' : currentStep > 2 ? 'Hoàn tất' : 'Chưa làm',
    },
    {
      step: 3,
      title: 'Bước 3: Ghép Ảnh & Xuất Sheet',
      icon: Sparkles,
      badge: currentStep === 3 ? 'Đang chọn' : hasStep3Data ? 'Hoàn tất' : 'Chưa làm',
    },
  ];

  return (
    <div id="step-progress-container" className="w-full bg-white border border-slate-200 rounded-xl p-4 shadow-xs mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {steps.map((s) => {
          const isActive = s.step === currentStep;
          const isDone = s.step < currentStep;
          const isClickable = Boolean(onSelectStep);

          return (
            <div
              key={s.step}
              id={`step-card-${s.step}`}
              onClick={() => isClickable && onSelectStep && onSelectStep(s.step)}
              className={`relative p-3 rounded-lg border transition-all ${
                isClickable ? 'cursor-pointer hover:shadow-xs' : ''
              } ${
                isActive
                  ? s.step === 3
                    ? 'border-emerald-600 bg-emerald-50/70 shadow-xs ring-1 ring-emerald-600/20'
                    : s.step === 2
                    ? 'border-blue-500 bg-blue-50/60 shadow-xs ring-1 ring-blue-500/20'
                    : 'border-emerald-500 bg-emerald-50/60 shadow-xs ring-1 ring-emerald-500/20'
                  : isDone
                  ? 'border-slate-200 bg-slate-50 opacity-95'
                  : 'border-slate-200 bg-slate-50/60 opacity-80'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  ) : isActive ? (
                    <div
                      className={`w-4 h-4 rounded-full text-white flex items-center justify-center text-[10px] font-bold ${
                        s.step === 3 ? 'bg-emerald-600' : s.step === 2 ? 'bg-blue-600' : 'bg-emerald-600'
                      }`}
                    >
                      {s.step}
                    </div>
                  ) : (
                    <Clock className="w-4 h-4 text-slate-400" />
                  )}
                  <span className={`text-xs font-bold ${isActive ? (s.step === 2 ? 'text-blue-950' : 'text-emerald-950') : 'text-slate-700'}`}>
                    {s.title}
                  </span>
                </div>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                    isActive
                      ? s.step === 2
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-emerald-100 text-emerald-800'
                      : isDone
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/50'
                      : 'bg-slate-200/70 text-slate-600'
                  }`}
                >
                  {s.badge}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
