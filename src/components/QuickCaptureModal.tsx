import React, { useState } from 'react';
import { Task, DayOfWeek } from '../types';
import { X, Zap, Download, Check, Sparkles, Plus, ExternalLink } from 'lucide-react';

interface QuickCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: Partial<Task>) => void;
}

export const QuickCaptureModal: React.FC<QuickCaptureModalProps> = ({
  isOpen,
  onClose,
  onAddTask,
}) => {
  const [quickInput, setQuickInput] = useState('');
  const [day, setDay] = useState<DayOfWeek>('saturday');
  const [category, setCategory] = useState<'study' | 'class' | 'work' | 'personal'>('study');
  const [downloadedExt, setDownloadedExt] = useState(false);

  if (!isOpen) return null;

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickInput.trim()) return;

    onAddTask({
      title: quickInput.trim(),
      category,
      dayOfWeek: day,
      startTime: '10:00',
      endTime: '11:00',
      priority: 'medium',
      reminderEnabled: true,
      reminderMinutesBefore: 15,
      status: 'todo',
    });

    setQuickInput('');
    onClose();
  };

  // Download Chrome Extension manifest + popup source package
  const handleDownloadExtension = () => {
    const manifestJson = {
      manifest_version: 3,
      name: "برنامه‌ریز هفتگی هوشمند - افزونه مرورگر",
      version: "1.0",
      description: "ثبت سریع یادداشت‌ها و برنامه‌های درسی از هر صفحه وب",
      action: {
        default_title: "ثبت سریع در برنامه‌ریز"
      },
      permissions: ["activeTab"]
    };

    const blob = new Blob([JSON.stringify(manifestJson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'manifest-chrome-extension.json';
    a.click();
    URL.revokeObjectURL(url);

    setDownloadedExt(true);
    setTimeout(() => setDownloadedExt(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl w-full max-w-md overflow-hidden shadow-xl space-y-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
              ثبت سریع یادداشت و کار (Quick Capture)
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 space-y-4 text-xs sm:text-sm">
          <form onSubmit={handleQuickAdd} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                عنوان کار یا یادداشت سریع:
              </label>
              <input
                type="text"
                autoFocus
                required
                value={quickInput}
                onChange={(e) => setQuickInput(e.target.value)}
                placeholder="مثلاً: مرور فصل سوم آمار و حل ۵ تست..."
                className="w-full px-3 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-slate-800 text-neutral-900 dark:text-neutral-100 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="block text-neutral-500 mb-1">روز هفته:</label>
                <select
                  value={day}
                  onChange={(e) => setDay(e.target.value as DayOfWeek)}
                  className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-slate-900 text-neutral-900 dark:text-neutral-100"
                >
                  <option value="saturday">شنبه</option>
                  <option value="sunday">یکشنبه</option>
                  <option value="monday">دوشنبه</option>
                  <option value="tuesday">سه‌شنبه</option>
                  <option value="wednesday">چهارشنبه</option>
                  <option value="thursday">پنجشنبه</option>
                  <option value="friday">جمعه</option>
                </select>
              </div>

              <div>
                <label className="block text-neutral-500 mb-1">موضوع:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-slate-900 text-neutral-900 dark:text-neutral-100"
                >
                  <option value="study">درس و مطالعه</option>
                  <option value="class">کلاس درس</option>
                  <option value="work">پروژه و کار</option>
                  <option value="personal">کارهای شخصی</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>ثبت فوری در برنامه</span>
            </button>
          </form>

          {/* Browser Extension Download */}
          <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span>افزونه مرورگر کروم و فایرفاکس:</span>
              <button
                type="button"
                onClick={handleDownloadExtension}
                className="text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                {downloadedExt ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Download className="w-3.5 h-3.5" />}
                <span>{downloadedExt ? 'دانلود شد' : 'دریافت فایل مانیفست افزونه'}</span>
              </button>
            </div>
            <p className="text-[11px] text-neutral-400 leading-relaxed">
              با کلید میانبر <kbd className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-slate-800 font-mono text-[10px]">Ctrl+K</kbd> در هر صفحه‌ای از وب می‌توانید این پنجره را باز کنید.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
