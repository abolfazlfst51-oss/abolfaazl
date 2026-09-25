import React, { useState } from 'react';
import { UserSettings, AppTheme, AccentColor, FontSize, PersianFont, DayOfWeek } from '../types';
import { 
  X, 
  Settings, 
  Moon, 
  Sun, 
  Coffee, 
  Type, 
  Palette, 
  Calendar, 
  Volume2, 
  VolumeX, 
  Check, 
  RotateCcw,
  Sparkles,
  Trash2,
  AlertTriangle,
  Key,
  Copy,
  CheckCircle2,
  Bell
} from 'lucide-react';
import { soundManager } from '../utils/audio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onUpdateSettings: (settings: UserSettings) => void;
  onResetData: () => void;
  onDeleteAllTasks?: () => void;
  onTestNotification?: () => void;
  notificationPermission?: NotificationPermission | 'unsupported';
}

const ACCENT_COLORS: { id: AccentColor; name: string; bgClass: string; borderClass: string }[] = [
  { id: 'indigo', name: 'نیلی (پیش‌فرض)', bgClass: 'bg-indigo-600', borderClass: 'border-indigo-600' },
  { id: 'emerald', name: 'زمردی / سبز', bgClass: 'bg-emerald-600', borderClass: 'border-emerald-600' },
  { id: 'amber', name: 'کهربایی / نارنجی', bgClass: 'bg-amber-600', borderClass: 'border-amber-600' },
  { id: 'rose', name: 'سرخابی / صورتی', bgClass: 'bg-rose-600', borderClass: 'border-rose-600' },
  { id: 'teal', name: 'فیروزه‌ای', bgClass: 'bg-teal-600', borderClass: 'border-teal-600' },
  { id: 'slate', name: 'خاکستری تیره', bgClass: 'bg-slate-700', borderClass: 'border-slate-700' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetData,
  onDeleteAllTasks,
  onTestNotification,
  notificationPermission = 'default',
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [tokenCopied, setTokenCopied] = useState(false);

  if (!isOpen) return null;

  const handleThemeChange = (theme: AppTheme) => {
    // When manually choosing light or sepia, disable autoNightMode so it doesn't immediately force dark mode at night
    if (theme === 'light' || theme === 'sepia') {
      onUpdateSettings({ ...settings, theme, autoNightMode: false });
    } else {
      onUpdateSettings({ ...settings, theme });
    }
  };

  const handleFontChange = (persianFont: PersianFont) => {
    onUpdateSettings({ ...settings, persianFont });
  };

  const handleFontSizeChange = (fontSize: FontSize) => {
    onUpdateSettings({ ...settings, fontSize });
  };

  const handleAccentChange = (accentColor: AccentColor) => {
    onUpdateSettings({ ...settings, accentColor });
  };

  const handleStartDayChange = (startDayOfWeek: DayOfWeek) => {
    onUpdateSettings({ ...settings, startDayOfWeek });
  };

  const handleCopySyncToken = () => {
    if (navigator.clipboard && settings.syncToken) {
      navigator.clipboard.writeText(settings.syncToken);
      setTokenCopied(true);
      setTimeout(() => setTokenCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
              تنظیمات و شخصی‌سازی برنامه
            </h3>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-md cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs sm:text-sm">
          {/* App Brand & Version Card */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-indigo-950/20 via-slate-900/10 to-indigo-950/20 dark:from-slate-800/80 dark:to-slate-900/80 border border-indigo-200/60 dark:border-slate-700/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative p-0.5 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 shadow-md shadow-indigo-500/20 shrink-0">
                <div className="w-12 h-12 rounded-[10px] overflow-hidden bg-slate-900">
                  <img 
                    src="/src/assets/images/app_logo_modern_1790334745256.jpg" 
                    alt="لوگوی برنامه‌ریز" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
              <div>
                <h4 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                  <span>برنامه‌ریز هوشمند دهم هنرستان</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono font-bold">v2.5</span>
                </h4>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                  رشته شبکه و نرم‌افزار رایانه • همراه با یادآور مطالعه، OCR و تایمر تمرکز
                </p>
              </div>
            </div>
          </div>

          {/* Theme Mode */}
          <div className="space-y-2.5">
            <label className="block font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-indigo-500" />
              <span>پوسته و تم رنگی (تاریک / روشن / شب):</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleThemeChange('light')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  settings.theme === 'light'
                    ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-bold shadow-xs'
                    : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-slate-800'
                }`}
              >
                <Sun className="w-5 h-5 text-amber-500" />
                <span>روشن مینیمال</span>
              </button>

              <button
                type="button"
                onClick={() => handleThemeChange('dark')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  settings.theme === 'dark'
                    ? 'border-indigo-600 bg-slate-800 text-white font-bold shadow-xs'
                    : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-slate-800'
                }`}
              >
                <Moon className="w-5 h-5 text-indigo-400" />
                <span>تاریک شیک</span>
              </button>

              <button
                type="button"
                onClick={() => handleThemeChange('sepia')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  settings.theme === 'sepia'
                    ? 'border-amber-600 bg-[#ede4d1] text-amber-950 font-bold shadow-xs'
                    : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-slate-800'
                }`}
              >
                <Coffee className="w-5 h-5 text-amber-700" />
                <span>مطالعه کاهی</span>
              </button>

              <button
                type="button"
                onClick={() => handleThemeChange('system')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  settings.theme === 'system'
                    ? 'border-indigo-600 bg-indigo-50/70 dark:bg-slate-800 text-indigo-900 dark:text-indigo-200 font-bold shadow-xs'
                    : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-slate-800'
                }`}
              >
                <Sparkles className="w-5 h-5 text-neutral-400" />
                <span>هوشمند سیستم</span>
              </button>
            </div>
          </div>

          {/* Auto Night Mode Toggle */}
          <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-slate-800/40 flex items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-neutral-800 dark:text-neutral-200">
                حالت تاریک هوشمند خودکار (Smart Night Mode)
              </div>
              <div className="text-[11px] text-neutral-400 mt-0.5">
                فعال‌سازی خودکار فیلتر محافظ چشم بعد از غروب آفتاب (ساعت ۲۰:۰۰) در صورت استفاده از تم سیستم
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.autoNightMode}
              onChange={(e) => onUpdateSettings({ ...settings, autoNightMode: e.target.checked })}
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
            />
          </div>

          {/* Accent Color Picker */}
          <div className="space-y-2.5">
            <label className="block font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-indigo-500" />
              <span>رنگ تأکیدی برنامه (Accent Color):</span>
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {ACCENT_COLORS.map((accent) => (
                <button
                  key={accent.id}
                  type="button"
                  onClick={() => handleAccentChange(accent.id)}
                  className={`p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    settings.accentColor === accent.id
                      ? `${accent.borderClass} ring-2 ring-indigo-400/40 bg-indigo-50/40 dark:bg-slate-800 font-bold`
                      : 'border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full ${accent.bgClass} flex items-center justify-center text-white shadow-xs`}>
                    {settings.accentColor === accent.id && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span className="text-[11px] text-neutral-700 dark:text-neutral-300 whitespace-nowrap">
                    {accent.name.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Persian Font Family */}
          <div className="space-y-2.5">
            <label className="block font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
              <Type className="w-4 h-4 text-indigo-500" />
              <span>انتخاب فونت فارسی:</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'vazirmatn', label: 'وزیرمتن (استاندارد و خوانا)', style: { fontFamily: "'Vazirmatn', sans-serif" } },
                { id: 'sahel', label: 'ساحل (کلاسیک و زیبا)', style: { fontFamily: "'Sahel', sans-serif" } },
                { id: 'system', label: 'سیستمی (پیش‌فرض دستگاه)', style: { fontFamily: "system-ui, sans-serif" } },
              ].map((font) => (
                <button
                  key={font.id}
                  type="button"
                  style={font.style}
                  onClick={() => handleFontChange(font.id as PersianFont)}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    settings.persianFont === font.id
                      ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold shadow-xs'
                      : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="text-xs block">{font.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Font Size */}
          <div className="space-y-2.5">
            <label className="block font-semibold text-neutral-800 dark:text-neutral-200">
              اندازه متن کل برنامه:
            </label>
            <div className="flex gap-2">
              {[
                { id: 'sm', label: 'کوچک و فشرده' },
                { id: 'base', label: 'استاندارد' },
                { id: 'lg', label: 'بزرگ' },
                { id: 'xl', label: 'درشت و خوانا' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleFontSizeChange(s.id as FontSize)}
                  className={`flex-1 py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                    settings.fontSize === s.id
                      ? 'border-indigo-600 bg-indigo-50/80 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 font-bold shadow-xs'
                      : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Start day of week */}
          <div className="space-y-2.5">
            <label className="block font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-indigo-500" />
              <span>روز شروع جدول هفته:</span>
            </label>
            <div className="flex gap-2">
              {[
                { id: 'saturday', label: 'شنبه (تقویم رسمی ایران)' },
                { id: 'sunday', label: 'یکشنبه' },
                { id: 'monday', label: 'دوشنبه' },
              ].map((day) => (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => handleStartDayChange(day.id as DayOfWeek)}
                  className={`flex-1 py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                    settings.startDayOfWeek === day.id
                      ? 'border-indigo-600 bg-indigo-50/80 dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 font-bold shadow-xs'
                      : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sound Alerts & Test */}
          <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-slate-800/40 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {settings.soundAlertsEnabled ? <Volume2 className="w-4 h-4 text-indigo-500 shrink-0" /> : <VolumeX className="w-4 h-4 text-neutral-400 shrink-0" />}
              <div>
                <div className="font-semibold text-neutral-800 dark:text-neutral-200">
                  صدای هشدارهای پایان پومودورو و یادآورها
                </div>
                <div className="text-[11px] text-neutral-400">
                  پخش زنگ ملایم و آرامش‌بخش پس از پایان هر جلسه مطالعه
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => soundManager.playChime('success')}
                className="px-2.5 py-1 text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-lg border border-indigo-200 dark:border-indigo-800 transition-colors flex items-center gap-1 cursor-pointer"
                title="پخش آزمایشی صدای زنگ"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>تست صدا</span>
              </button>
              <input
                type="checkbox"
                checked={settings.soundAlertsEnabled}
                onChange={(e) => onUpdateSettings({ ...settings, soundAlertsEnabled: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Push Notifications for High Priority Tasks & Classes */}
          <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-slate-800/40 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-500 shrink-0" />
              <div>
                <div className="font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-2">
                  <span>یادآورهای فشاری کلاس‌های اولویت بالا (Push Notification)</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                    notificationPermission === 'granted'
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                      : 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                  }`}>
                    {notificationPermission === 'granted' ? 'فعال' : 'نیاز به دسترسی'}
                  </span>
                </div>
                <div className="text-[11px] text-neutral-400">
                  ارسال اعلان سیستمی ۱۵ دقیقه قبل از آغاز کارگاه‌ها و کلاس‌های دارای اولویت بالا
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {onTestNotification && (
                <button
                  type="button"
                  onClick={onTestNotification}
                  className="px-2.5 py-1 text-xs text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 rounded-lg border border-amber-200 dark:border-amber-800 transition-colors flex items-center gap-1 cursor-pointer"
                  title="ارسال اعلان آزمایشی برای بررسی عملکرد"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>تست اعلان</span>
                </button>
              )}
              <input
                type="checkbox"
                checked={settings.pushNotificationsEnabled ?? true}
                onChange={(e) => onUpdateSettings({ ...settings, pushNotificationsEnabled: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Cloud Sync Token Display */}
          <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/40 dark:bg-slate-800/30 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-neutral-700 dark:text-neutral-300 font-semibold text-xs">
                <Key className="w-3.5 h-3.5 text-indigo-500" />
                <span>شناسه اختصاصی همگام‌سازی ابری (Sync Token):</span>
              </div>
              <button
                type="button"
                onClick={handleCopySyncToken}
                className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
              >
                {tokenCopied ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400">کپی شد!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>کپی شناسه</span>
                  </>
                )}
              </button>
            </div>
            <div className="font-mono text-xs text-neutral-500 dark:text-neutral-400 bg-white dark:bg-slate-900 p-2 rounded-lg border border-neutral-200 dark:border-neutral-700 truncate select-all">
              {settings.syncToken || 'token-tenth-cs-offline'}
            </div>
          </div>

          {/* Delete All Tasks Action (With Safe In-App Confirmation) */}
          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-rose-700 dark:text-rose-400 text-xs">
                  حذف تمامی برنامه‌ها و خلوت کردن جدول
                </div>
                <div className="text-[11px] text-neutral-400">
                  پاک کردن یک‌باره کل کارهای ثبت‌شده برای شروع برنامه‌ریزی جدید از ابتدا
                </div>
              </div>
              {!showDeleteConfirm && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-3 py-1.5 text-xs text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors flex items-center gap-1 shadow-2xs cursor-pointer shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>حذف همه برنامه‌ها</span>
                </button>
              )}
            </div>

            {showDeleteConfirm && (
              <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/80 rounded-xl p-3 space-y-2 animate-in fade-in duration-100">
                <div className="flex items-center gap-2 text-rose-800 dark:text-rose-300 font-semibold text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>آیا مطمئن هستید که می‌خواهید تمام برنامه‌های ثبت‌شده را حذف کنید؟</span>
                </div>
                <div className="flex gap-2 justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-3 py-1.5 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-slate-800 text-neutral-700 dark:text-neutral-300 text-xs rounded-lg cursor-pointer"
                  >
                    انصراف
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (onDeleteAllTasks) onDeleteAllTasks();
                      setShowDeleteConfirm(false);
                      soundManager.playChime('reminder');
                      onClose();
                    }}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>بله، کاملاً پاک شود</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Reset Factory Data (With Safe In-App Confirmation) */}
          <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-neutral-700 dark:text-neutral-300 text-xs">
                  بارگذاری مجدد دروس نمونه دهم هنرستان
                </div>
                <div className="text-[11px] text-neutral-400">
                  بازگرداندن برنامه‌های پیش‌فرض کارگاه‌های کامپیوتر
                </div>
              </div>
              {!showResetConfirm && (
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  className="px-3 py-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg border border-indigo-200 dark:border-indigo-900 transition-colors flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>بارگذاری نمونه دروس</span>
                </button>
              )}
            </div>

            {showResetConfirm && (
              <div className="bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/80 rounded-xl p-3 space-y-2 animate-in fade-in duration-100">
                <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 font-semibold text-xs">
                  <RotateCcw className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>آیا مایلید تمام برنامه‌ها با دروس نمونه پایه دهم هنرستان جایگزین شوند؟</span>
                </div>
                <div className="flex gap-2 justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(false)}
                    className="px-3 py-1.5 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-slate-800 text-neutral-700 dark:text-neutral-300 text-xs rounded-lg cursor-pointer"
                  >
                    انصراف
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onResetData();
                      setShowResetConfirm(false);
                      soundManager.playChime('success');
                      onClose();
                    }}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>بله، بارگذاری مجدد</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
