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
      title: '1. Tạo Sheet',
      icon: FileSpreadsheet,
    },
    {
      step: 2,
      title: '2. Thư mục ảnh',
      icon: Images,
    },
    {
      step: 3,
      title: '3. Xuất danh sách',
      icon: Sparkles,
    },
  ];

  return (
    <div id="step-progress-container" className="w-full bg-white border border-slate-200 rounded-xl p-2.5 shadow-xs mb-6">
      <div className="grid grid-cols-3 gap-2">
        {steps.map((s) => {
          const isActive = s.step === currentStep;
          const isDone = s.step < currentStep;
          const isClickable = Boolean(onSelectStep);

          return (
            <div
              key={s.step}
              id={`step-card-${s.step}`}
              onClick={() => isClickable && onSelectStep && onSelectStep(s.step)}
              className={`p-2.5 rounded-lg border text-center transition-all ${
                isClickable ? 'cursor-pointer hover:bg-slate-50' : ''
              } ${
                isActive
                  ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900 font-semibold'
                  : isDone
                  ? 'border-slate-200 bg-white text-slate-700'
                  : 'border-slate-100 bg-slate-50/50 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <span
                    className={`w-4 h-4 rounded-full text-[11px] font-bold flex items-center justify-center ${
                      isActive ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {s.step}
                  </span>
                )}
                <span className="text-xs">{s.title.replace(/^\d+\.\s*/, '')}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
