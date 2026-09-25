import React, { useState } from 'react';
import { Task } from '../types';
import { downloadIcsFile } from '../utils/calendar';
import { 
  X, 
  Smartphone, 
  Download, 
  Check, 
  Calendar, 
  Clock, 
  Apple, 
  CheckCircle2, 
  HelpCircle 
} from 'lucide-react';

interface CalendarSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
}

export const CalendarSyncModal: React.FC<CalendarSyncModalProps> = ({
  isOpen,
  onClose,
  tasks,
}) => {
  const [downloaded, setDownloaded] = useState(false);
  const [calendarTitle, setCalendarTitle] = useState('برنامه هفتگی و مطالعه من');

  if (!isOpen) return null;

  const handleDownloadIcs = () => {
    downloadIcsFile(tasks, 'weekly-study-schedule.ics');
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-xl space-y-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
              همگام‌سازی مستقیم با تقویم گوشی (اندروید و آیفون)
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 space-y-5 text-xs sm:text-sm">
          <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
            با خروجی گرفتن فایل استاندارد تقویم (.ics)، تمام کلاس‌ها، امتحانات و زمان‌های مطالعه به همراه هشدارهای ۱۵ دقیقه قبل، مستقیماً وارد تقویم پیش‌فرض گوشی شما (Google Calendar، Apple Calendar یا تقویم سامسونگ) می‌شوند.
          </p>

          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/70 dark:bg-slate-800/40 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-neutral-700 dark:text-neutral-300">
                تعداد کارهای آماده انتقال به تقویم:
              </span>
              <span className="font-bold tabular-nums font-mono text-indigo-600 dark:text-indigo-400">
                {tasks.length} رویداد
              </span>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                نام پوشه تقویم:
              </label>
              <input
                type="text"
                value={calendarTitle}
                onChange={(e) => setCalendarTitle(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-slate-900 text-neutral-900 dark:text-neutral-100 text-xs"
              />
            </div>

            <button
              onClick={handleDownloadIcs}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-2xs transition-colors"
            >
              {downloaded ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>فایل تقویم (.ics) دانلود شد!</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>دانلود فایل همگام‌سازی (.ics) برای باز کردن در گوشی</span>
                </>
              )}
            </button>
          </div>

          {/* Simple Step-by-Step Mobile Instructions */}
          <div className="space-y-3 pt-2">
            <h4 className="font-semibold text-xs text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-neutral-400" />
              <span>راهنمای ۳ ثانیه‌ای باز کردن در گوشی:</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-neutral-600 dark:text-neutral-400">
              <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-slate-900 space-y-1">
                <span className="font-bold text-neutral-900 dark:text-neutral-100 block">
                  📱 در گوشی اندروید / سامسونگ:
                </span>
                <p className="text-[11px] leading-relaxed">
                  فایل دانلود شده را لمس کنید و گزینه «افزودن به تقویم گوگل» یا «تقویم سامسونگ» را بزنید. همه رویدادها با آلارم ذخیره می‌شوند.
                </p>
              </div>

              <div className="p-3 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-slate-900 space-y-1">
                <span className="font-bold text-neutral-900 dark:text-neutral-100 block">
                  🍏 در گوشی آیفون (iOS):
                </span>
                <p className="text-[11px] leading-relaxed">
                  فایل را باز کرده و گزینه «Add All» را در گوشه صفحه انتخاب نمایید تا به برنامه Apple Calendar افزوده شود.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
