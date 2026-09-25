import React, { useState } from 'react';
import { Task, StudyDoc, UserSettings, StudySession } from '../types';
import { encryptData, decryptData } from '../utils/crypto';
import { 
  X, 
  Cloud, 
  Lock, 
  Key, 
  Download, 
  Upload, 
  Check, 
  AlertCircle, 
  RefreshCw, 
  ShieldCheck,
  HardDrive
} from 'lucide-react';

interface CloudBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  docs: StudyDoc[];
  settings: UserSettings;
  sessions: StudySession[];
  onRestoreData: (data: { tasks: Task[]; docs: StudyDoc[]; settings: UserSettings; sessions: StudySession[] }) => void;
}

export const CloudBackupModal: React.FC<CloudBackupModalProps> = ({
  isOpen,
  onClose,
  tasks,
  docs,
  settings,
  sessions,
  onRestoreData,
}) => {
  const [password, setPassword] = useState('');
  const [syncToken, setSyncToken] = useState(settings.syncToken || 'STUDY-VAULT-1');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  // 1. Encrypt and Upload to Cloud Vault
  const handleCloudSave = async () => {
    if (!password) {
      setStatusMessage({ type: 'error', text: 'لطفاً یک رمز عبور قوی برای رمزنگاری داده‌ها وارد کنید.' });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);
    try {
      const payload = JSON.stringify({
        tasks,
        docs: docs.map((d) => ({ ...d, fileUrl: undefined })), // avoid saving heavy blob urls
        settings: { ...settings, syncToken },
        sessions,
        exportedAt: new Date().toISOString(),
      });

      // Encrypt with client-side Web Crypto AES-GCM (256-bit)
      const { ciphertext, iv, salt } = await encryptData(payload, password);

      const res = await fetch('/api/vault/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          syncToken,
          encryptedData: JSON.stringify({ ciphertext, salt }),
          iv,
        }),
      });

      if (!res.ok) throw new Error('خطا در ذخیره در سرور ابری');
      setStatusMessage({
        type: 'success',
        text: `بک‌آپ ابری رمزگذاری‌شده (AES-256) با موفقیت ذخیره شد. کد همگام‌سازی شما: ${syncToken}`,
      });
    } catch (err: any) {
      console.error(err);
      setStatusMessage({ type: 'error', text: err.message || 'خطا در ارتباط با سرور ابری' });
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Download and Decrypt from Cloud Vault
  const handleCloudLoad = async () => {
    if (!password) {
      setStatusMessage({ type: 'error', text: 'برای بازگشایی داده‌ها باید رمز عبور را وارد کنید.' });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/vault/load', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ syncToken }),
      });

      if (!res.ok) {
        throw new Error('نسخه پشتیبانی با این کد همگام‌سازی یافت نشد.');
      }

      const data = await res.json();
      const { ciphertext, salt } = JSON.parse(data.encryptedData);
      const decryptedPlaintext = await decryptData(ciphertext, data.iv, salt, password);
      const restored = JSON.parse(decryptedPlaintext);

      onRestoreData({
        tasks: restored.tasks || [],
        docs: restored.docs || [],
        settings: restored.settings || settings,
        sessions: restored.sessions || [],
      });

      setStatusMessage({
        type: 'success',
        text: 'داده‌ها با موفقیت بازیابی و رمزگشایی شدند.',
      });
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: 'رمز عبور اشتباه است یا خطایی در رمزگشایی داده‌ها رخ داده است.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Export Encrypted File (.enc.json) for Offline Backup
  const handleExportOfflineEncrypted = async () => {
    if (!password) {
      setStatusMessage({ type: 'error', text: 'لطفاً رمز عبور را برای رمزنگاری فایل خروجی وارد کنید.' });
      return;
    }

    try {
      const payload = JSON.stringify({ tasks, docs, settings, sessions });
      const encrypted = await encryptData(payload, password);
      const fileData = JSON.stringify(encrypted, null, 2);

      const blob = new Blob([fileData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup-planner-encrypted-${new Date().toISOString().slice(0, 10)}.enc.json`;
      a.click();
      URL.revokeObjectURL(url);

      setStatusMessage({ type: 'success', text: 'فایل پشتیبان آفلاین رمزگذاری‌شده دانلود شد.' });
    } catch (err) {
      setStatusMessage({ type: 'error', text: 'خطا در تولید فایل پشتیبان' });
    }
  };

  // 4. Import Offline Encrypted File
  const handleImportOfflineEncrypted = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !password) {
      setStatusMessage({ type: 'error', text: 'ابتدا رمز عبور را وارد کنید، سپس فایل را انتخاب نمایید.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        const decrypted = await decryptData(parsed.ciphertext, parsed.iv, parsed.salt, password);
        const restored = JSON.parse(decrypted);

        onRestoreData({
          tasks: restored.tasks || [],
          docs: restored.docs || [],
          settings: restored.settings || settings,
          sessions: restored.sessions || [],
        });

        setStatusMessage({ type: 'success', text: 'فایل با موفقیت رمزگشایی و بازگردانی شد.' });
      } catch (err) {
        setStatusMessage({ type: 'error', text: 'رمز عبور اشتباه است یا فرمت فایل نامعتبر است.' });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-xl space-y-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
              بک‌آپ ابری رمزگذاری‌شده و همگام‌سازی چنددستگاهی
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 space-y-4 text-xs sm:text-sm">
          <p className="text-xs text-neutral-500 leading-relaxed">
            تمامی اطلاعات شما با الگوریتم استاندارد AES-256 پیش از خروج از دستگاه شما رمزنگاری می‌شود. حتی سرور نیز بدون داشتن رمز عبور شما امکان دسترسی به داده‌ها را ندارد.
          </p>

          {/* Status Message */}
          {statusMessage && (
            <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
            }`}>
              {statusMessage.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Sync Token Input */}
          <div>
            <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              کد همگام‌سازی ابری (Sync Token):
            </label>
            <input
              type="text"
              value={syncToken}
              onChange={(e) => setSyncToken(e.target.value.toUpperCase())}
              placeholder="مثلاً: STUDY-2026-X"
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-slate-800 text-neutral-900 dark:text-neutral-100 font-mono"
            />
            <span className="text-[11px] text-neutral-400 mt-1 block">
              این کد را در گوشی یا تبلت دیگر خود وارد کنید تا برنامه‌هایتان همگام شوند.
            </span>
          </div>

          {/* Encryption Password */}
          <div>
            <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              رمز عبور اختصاصی شما برای رمزنگاری:
            </label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="حداقل ۶ کاراکتر"
                className="w-full px-3 py-2 pl-9 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-slate-800 text-neutral-900 dark:text-neutral-100"
              />
              <Lock className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Action Buttons: Cloud Sync */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleCloudSave}
              disabled={isLoading}
              className="py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium text-xs flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <Cloud className="w-4 h-4" />
              <span>ارسال به ابر (همگام‌سازی)</span>
            </button>

            <button
              onClick={handleCloudLoad}
              disabled={isLoading}
              className="py-2.5 px-3 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-slate-800 disabled:opacity-50 text-neutral-800 dark:text-neutral-200 font-medium text-xs flex items-center justify-center gap-1.5"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>دریافت و بازیابی از ابر</span>
            </button>
          </div>

          {/* Offline Encrypted File Backup Section */}
          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-2">
            <div className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
              پشتیبان‌گیری آفلاین بدون نیاز به اینترنت:
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleExportOfflineEncrypted}
                className="flex-1 py-2 px-3 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-slate-800 text-xs text-neutral-700 dark:text-neutral-300 flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>دانلود فایل رمزدار</span>
              </button>

              <label className="flex-1 py-2 px-3 rounded-lg border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-slate-800 text-xs text-neutral-700 dark:text-neutral-300 flex items-center justify-center gap-1.5 cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>بارگذاری فایل پشتیبان</span>
                <input
                  type="file"
                  accept=".json,.enc"
                  onChange={handleImportOfflineEncrypted}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
