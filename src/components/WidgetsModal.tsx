import React, { useState } from 'react';
import { Task } from '../types';
import { 
  X, 
  LayoutGrid, 
  Smartphone, 
  Plus, 
  Check, 
  Clock, 
  Calendar, 
  Play, 
  Share2,
  Copy
} from 'lucide-react';

interface WidgetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
}

export const WidgetsModal: React.FC<WidgetsModalProps> = ({
  isOpen,
  onClose,
  tasks,
}) => {
  const [activeWidgetType, setActiveWidgetType] = useState<'today' | 'timer' | 'progress'>('today');
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const todayTasks = tasks.slice(0, 3);
  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const handleInstallPwa = () => {
    // If beforeinstallprompt exists, trigger it, otherwise instruct
    if ((window as any).deferredPwaPrompt) {
      (window as any).deferredPwaPrompt.prompt();
    } else {
      alert('برای افزودن به صفحه اصلی: در منوی مرورگر گوشی خود گزینه «Add to Home screen» یا «افزودن به صفحه اصلی» را انتخاب کنید.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-xl space-y-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
              ویجت‌های تعاملی صفحه اصلی گوشی
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 space-y-5 text-xs sm:text-sm">
          <div className="flex items-center gap-3.5 p-3 rounded-xl bg-neutral-50 dark:bg-slate-800/60 border border-neutral-200/80 dark:border-neutral-700/60">
            <div className="w-12 h-12 rounded-xl p-0.5 bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 shadow-md shadow-indigo-500/20 shrink-0">
              <img 
                src="/src/assets/images/app_logo_modern_1790334745256.jpg" 
                alt="لوگوی برنامه‌ریز" 
                className="w-full h-full object-cover rounded-[10px]"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="font-bold text-neutral-900 dark:text-neutral-100 text-sm">
                برنامه‌ریز هوشمند دهم کامپیوتر
              </div>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed mt-0.5">
                می‌توانید برنامه را مانند یک اپلیکیشن بومی روی صفحه اصلی گوشی خود نصب کرده و از ویجت‌های تعاملی استفاده کنید.
              </p>
            </div>
          </div>

          {/* Widget Selector */}
          <div className="flex items-center gap-1.5 p-1 bg-neutral-100 dark:bg-slate-800 rounded-xl text-xs">
            <button
              onClick={() => setActiveWidgetType('today')}
              className={`flex-1 py-1.5 rounded-lg transition-colors font-medium ${activeWidgetType === 'today' ? 'bg-white dark:bg-slate-700 text-neutral-900 dark:text-neutral-100 shadow-2xs' : 'text-neutral-500'}`}
            >
              ویجت کارهای امروز
            </button>
            <button
              onClick={() => setActiveWidgetType('timer')}
              className={`flex-1 py-1.5 rounded-lg transition-colors font-medium ${activeWidgetType === 'timer' ? 'bg-white dark:bg-slate-700 text-neutral-900 dark:text-neutral-100 shadow-2xs' : 'text-neutral-500'}`}
            >
              ویجت تایمر مطالعه
            </button>
            <button
              onClick={() => setActiveWidgetType('progress')}
              className={`flex-1 py-1.5 rounded-lg transition-colors font-medium ${activeWidgetType === 'progress' ? 'bg-white dark:bg-slate-700 text-neutral-900 dark:text-neutral-100 shadow-2xs' : 'text-neutral-500'}`}
            >
              ویجت پیشرفت هفتگی
            </button>
          </div>

          {/* Phone Screen Mockup Container */}
          <div className="p-5 rounded-2xl bg-gradient-to-b from-neutral-800 to-neutral-950 text-white shadow-inner flex flex-col items-center justify-center">
            {/* Widget Preview Box */}
            {activeWidgetType === 'today' && (
              <div className="w-full max-w-xs bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 shadow-lg space-y-2.5 backdrop-blur-md">
                <div className="flex items-center justify-between text-xs text-neutral-400 border-b border-slate-800 pb-1.5">
                  <span className="font-semibold text-white flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                    <span>برنامه‌های اولویت‌دار</span>
                  </span>
                  <span className="font-mono tabular-nums text-[10px]">امروز</span>
                </div>
                <div className="space-y-1.5">
                  {todayTasks.map((t) => (
                    <div key={t.id} className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/50 flex items-center justify-between text-xs">
                      <span className="truncate max-w-[170px]">{t.title}</span>
                      <span className="text-[10px] font-mono tabular-nums text-neutral-400">{t.startTime}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeWidgetType === 'timer' && (
              <div className="w-full max-w-xs bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 shadow-lg space-y-2 backdrop-blur-md text-center">
                <div className="text-xs text-neutral-400">تایمر تمرکز پومودورو</div>
                <div className="text-3xl font-bold font-mono tabular-nums text-indigo-400 py-1">
                  25:00
                </div>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <div className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded-full text-xs font-semibold flex items-center gap-1 cursor-pointer">
                    <Play className="w-3 h-3 fill-current" />
                    <span>شروع تمرکز</span>
                  </div>
                </div>
              </div>
            )}

            {activeWidgetType === 'progress' && (
              <div className="w-full max-w-xs bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 shadow-lg space-y-3 backdrop-blur-md">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">هدف‌گذاری هفتگی مطالعه</span>
                  <span className="text-emerald-400 font-mono tabular-nums font-bold">{progressPercent}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${progressPercent}%` }} />
                </div>
                <div className="text-[11px] text-neutral-400 flex items-center justify-between">
                  <span>تکمیل شده: {completedCount} کار</span>
                  <span>باقی‌مانده: {tasks.length - completedCount}</span>
                </div>
              </div>
            )}
          </div>

          {/* Action to install as PWA */}
          <button
            onClick={handleInstallPwa}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-2xs transition-colors"
          >
            <Smartphone className="w-4 h-4" />
            <span>نصب و افزودن به صفحه اصلی گوشی (PWA)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
