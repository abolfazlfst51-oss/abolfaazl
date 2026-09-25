import React from 'react';
import { 
  Calendar, 
  Clock, 
  BookOpen, 
  BarChart3, 
  Sparkles, 
  Plus, 
  Settings, 
  Smartphone,
  Cloud,
  Moon,
  Sun,
  LayoutGrid,
  Bell
} from 'lucide-react';
import { AppTheme } from '../types';

interface HeaderProps {
  currentTab: 'schedule' | 'timer' | 'reader' | 'analytics' | 'tools';
  onSelectTab: (tab: 'schedule' | 'timer' | 'reader' | 'analytics' | 'tools') => void;
  onOpenNewTask: () => void;
  onOpenCalendarSync: () => void;
  onOpenCloudBackup: () => void;
  onOpenSettings: () => void;
  onOpenWidgets: () => void;
  onTestNotification?: () => void;
  notificationPermission?: NotificationPermission | 'unsupported';
  theme: AppTheme;
  onToggleTheme: () => void;
  isOnline: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenNewTask,
  onOpenCalendarSync,
  onOpenCloudBackup,
  onOpenSettings,
  onOpenWidgets,
  onTestNotification,
  notificationPermission = 'default',
  theme,
  onToggleTheme,
  isOnline,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <div className="relative p-0.5 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 shadow-sm shadow-indigo-500/25 shrink-0 group hover:shadow-indigo-500/40 hover:scale-105 transition-all duration-300">
            <div className="w-9 h-9 rounded-[10px] overflow-hidden bg-slate-900 flex items-center justify-center">
              <img 
                src="/src/assets/images/app_logo_modern_1790334745256.jpg" 
                alt="لوگوی برنامه‌ریز هفتگی" 
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
          <button 
            onClick={() => onSelectTab('schedule')}
            className="text-base sm:text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-right flex flex-col cursor-pointer"
          >
            <span>برنامه‌ریز دهم هنرستان کامپیوتر</span>
            <span className="text-[10px] font-normal text-indigo-600 dark:text-indigo-400">شبکه و نرم‌افزار رایانه</span>
          </button>
        </div>

        {/* Zone 2: 4-6 clean text navigation links (strictly single-line) */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => onSelectTab('schedule')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              currentTab === 'schedule'
                ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-2xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>برنامه هفتگی</span>
          </button>

          <button
            onClick={() => onSelectTab('timer')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              currentTab === 'timer'
                ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-2xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>تایمر مطالعه</span>
          </button>

          <button
            onClick={() => onSelectTab('reader')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              currentTab === 'reader'
                ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-2xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>کتابخوان و فایل‌ها</span>
          </button>

          <button
            onClick={() => onSelectTab('analytics')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              currentTab === 'analytics'
                ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-2xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>گزارش بهره‌وری</span>
          </button>

          <button
            onClick={() => onSelectTab('tools')}
            className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              currentTab === 'tools'
                ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-2xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>صدا و تصویر AI</span>
          </button>
        </nav>

        {/* Zone 3: Primary actions & utilities */}
        <div className="flex items-center gap-2">
          {/* Quick sync & widgets */}
          <button
            onClick={onOpenWidgets}
            title="ویجت‌های صفحه اصلی"
            className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenCalendarSync}
            title="همگام‌سازی با تقویم گوشی"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors border border-neutral-200 dark:border-neutral-700"
          >
            <Smartphone className="w-3.5 h-3.5 text-indigo-500" />
            <span>تقویم گوشی</span>
          </button>

          <button
            onClick={onOpenCloudBackup}
            title={isOnline ? 'بک‌آپ ابری رمزگذاری شده' : 'حالت آفلاین فعال'}
            className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors relative"
          >
            <Cloud className="w-4 h-4" />
            <span className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-amber-500'}`} />
          </button>

          <button
            onClick={onToggleTheme}
            title="تغییر حالت تم"
            className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            {theme === 'dark' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
          </button>

          {/* Notification bell & test */}
          {onTestNotification && (
            <button
              onClick={onTestNotification}
              title={
                notificationPermission === 'granted'
                  ? 'اعلان‌های هوشمند فعال است (کلیک برای تست یادآور کلاس)'
                  : 'فعال‌سازی و تست اعلان‌های فشاری قبل از شروع کلاس‌ها'
              }
              className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors relative cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span
                className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ${
                  notificationPermission === 'granted'
                    ? 'bg-indigo-600'
                    : 'bg-amber-500 animate-pulse'
                }`}
              />
            </button>
          )}

          <button
            onClick={onOpenSettings}
            title="شخصی‌سازی و تنظیمات"
            className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={onOpenNewTask}
            className="flex items-center gap-1 px-3.5 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-2xs whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>کار جدید</span>
          </button>
        </div>
      </div>

      {/* Mobile navigation bottom/sub row */}
      <div className="md:hidden flex items-center justify-around border-t border-neutral-200 dark:border-neutral-800 px-2 py-1.5 bg-neutral-50/50 dark:bg-slate-900/50 text-xs">
        <button
          onClick={() => onSelectTab('schedule')}
          className={`px-2 py-1 rounded-md flex flex-col items-center gap-0.5 ${currentTab === 'schedule' ? 'text-indigo-600 font-semibold' : 'text-neutral-600 dark:text-neutral-400'}`}
        >
          <Calendar className="w-4 h-4" />
          <span>برنامه</span>
        </button>
        <button
          onClick={() => onSelectTab('timer')}
          className={`px-2 py-1 rounded-md flex flex-col items-center gap-0.5 ${currentTab === 'timer' ? 'text-indigo-600 font-semibold' : 'text-neutral-600 dark:text-neutral-400'}`}
        >
          <Clock className="w-4 h-4" />
          <span>مطالعه</span>
        </button>
        <button
          onClick={() => onSelectTab('reader')}
          className={`px-2 py-1 rounded-md flex flex-col items-center gap-0.5 ${currentTab === 'reader' ? 'text-indigo-600 font-semibold' : 'text-neutral-600 dark:text-neutral-400'}`}
        >
          <BookOpen className="w-4 h-4" />
          <span>کتابخوان</span>
        </button>
        <button
          onClick={() => onSelectTab('analytics')}
          className={`px-2 py-1 rounded-md flex flex-col items-center gap-0.5 ${currentTab === 'analytics' ? 'text-indigo-600 font-semibold' : 'text-neutral-600 dark:text-neutral-400'}`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>گزارش</span>
        </button>
        <button
          onClick={() => onSelectTab('tools')}
          className={`px-2 py-1 rounded-md flex flex-col items-center gap-0.5 ${currentTab === 'tools' ? 'text-indigo-600 font-semibold' : 'text-neutral-600 dark:text-neutral-400'}`}
        >
          <Sparkles className="w-4 h-4" />
          <span>هوش‌مصنوعی</span>
        </button>
      </div>
    </header>
  );
};
