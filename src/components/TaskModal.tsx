import React, { useState, useEffect } from 'react';
import { Task, DayOfWeek, TaskCategory, Priority } from '../types';
import { X, Clock, Calendar, Bell, BookOpen, Tag, Check, Sparkles } from 'lucide-react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTask: (task: Partial<Task>) => void;
  initialTask?: Task | null;
  defaultDay?: DayOfWeek;
}

const CATEGORIES: { id: TaskCategory; label: string }[] = [
  { id: 'class', label: 'کارگاه تخصصی هنرستان / کلاس' },
  { id: 'study', label: 'تمرین کدنویسی و مطالعه فردی' },
  { id: 'work', label: 'پروژه عملی و کارگاهی' },
  { id: 'exam', label: 'ارزشیابی پودمان و امتحان' },
  { id: 'review', label: 'مرور فاصله‌دار فرمول‌ها و کدها' },
  { id: 'personal', label: 'کارهای شخصی و استراحت' },
];

const VOCATIONAL_QUICK_SUBJECTS = [
  'طراحی وب و سیستم‌های اطلاعاتی',
  'برنامه‌سازی و تولید محتوا',
  'سخت‌افزار و سیستم‌های رایانه‌ای',
  'ریاضی ۱ هنرستان',
  'زبان انگلیسی تخصصی',
  'دانش فنی پایه',
  'الزامات محیط کار',
];

const DAYS: { id: DayOfWeek; label: string }[] = [
  { id: 'saturday', label: 'شنبه' },
  { id: 'sunday', label: 'یکشنبه' },
  { id: 'monday', label: 'دوشنبه' },
  { id: 'tuesday', label: 'سه‌شنبه' },
  { id: 'wednesday', label: 'چهارشنبه' },
  { id: 'thursday', label: 'پنجشنبه' },
  { id: 'friday', label: 'جمعه' },
];

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSaveTask,
  initialTask,
  defaultDay = 'saturday',
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<TaskCategory>('study');
  const [dayOfWeek, setDayOfWeek] = useState<DayOfWeek>(defaultDay);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:30');
  const [priority, setPriority] = useState<Priority>('medium');
  const [subject, setSubject] = useState('');
  const [studyMinutesTarget, setStudyMinutesTarget] = useState(90);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderMinutesBefore, setReminderMinutesBefore] = useState(15);
  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description || '');
      setCategory(initialTask.category);
      setDayOfWeek(initialTask.dayOfWeek);
      setStartTime(initialTask.startTime || '09:00');
      setEndTime(initialTask.endTime || '10:30');
      setPriority(initialTask.priority);
      setSubject(initialTask.subject || '');
      setStudyMinutesTarget(initialTask.studyMinutesTarget || 90);
      setReminderEnabled(initialTask.reminderEnabled);
      setReminderMinutesBefore(initialTask.reminderMinutesBefore || 15);
      setTagsInput(initialTask.tags ? initialTask.tags.join(', ') : '');
    } else {
      setTitle('');
      setDescription('');
      setCategory('study');
      setDayOfWeek(defaultDay);
      setStartTime('09:00');
      setEndTime('10:30');
      setPriority('medium');
      setSubject('');
      setStudyMinutesTarget(90);
      setReminderEnabled(true);
      setReminderMinutesBefore(15);
      setTagsInput('');
    }
  }, [initialTask, defaultDay, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = tagsInput
      .split(/[,،]/)
      .map((t) => t.trim())
      .filter(Boolean);

    onSaveTask({
      ...(initialTask ? { id: initialTask.id } : {}),
      title: title.trim(),
      description: description.trim(),
      category,
      dayOfWeek,
      startTime,
      endTime,
      priority,
      subject: subject.trim(),
      studyMinutesTarget: Number(studyMinutesTarget) || 60,
      reminderEnabled,
      reminderMinutesBefore: Number(reminderMinutesBefore) || 15,
      tags,
      status: initialTask?.status || 'todo',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
          <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
            {initialTask ? 'ویرایش برنامه' : 'ثبت برنامه جدید'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs sm:text-sm">
          {/* Title */}
          <div>
            <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              عنوان برنامه یا درس *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثلاً: کلاس ریاضی عمومی یا حل تست‌های فیزیک"
              className="w-full px-3.5 py-2.5 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-slate-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Subject & Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                دسته‌بندی موضوعی
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-slate-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                نام درس یا کارگاه هنرستان
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="مثلاً: طراحی وب، تولید محتوا، پایتون..."
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-slate-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <div className="flex flex-wrap gap-1 mt-1.5">
                {VOCATIONAL_QUICK_SUBJECTS.slice(0, 4).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setSubject(s);
                      if (!title) setTitle(`تمرین کارگاهی ${s}`);
                    }}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-slate-800 text-neutral-600 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                  >
                    + {s.split(' ')[0]} {s.split(' ')[1] || ''}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Day & Timing */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                روز هفته
              </label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value as DayOfWeek)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-slate-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {DAYS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                ساعت شروع
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-slate-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 tabular-nums font-mono text-center"
              />
            </div>

            <div>
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                ساعت پایان
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-slate-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 tabular-nums font-mono text-center"
              />
            </div>
          </div>

          {/* Priority & Target minutes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                سطح اولویت
              </label>
              <div className="flex gap-2">
                {(['low', 'medium', 'high'] as Priority[]).map((p) => {
                  const labels: Record<Priority, string> = { low: 'عادی', medium: 'متوسط', high: 'فوری / بالا' };
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                        priority === p
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                          : 'border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400'
                      }`}
                    >
                      {labels[p]}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
                هدف زمان مطالعه (دقیقه)
              </label>
              <input
                type="number"
                min="10"
                max="480"
                step="5"
                value={studyMinutesTarget}
                onChange={(e) => setStudyMinutesTarget(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-slate-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500 tabular-nums font-mono"
              />
            </div>
          </div>

          {/* Smart Reminder Toggle */}
          <div className="p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/60 dark:bg-slate-800/40 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-500" />
                <span className="font-medium text-neutral-800 dark:text-neutral-200">
                  یادآور هوشمند تلفن همراه و مرورگر
                </span>
              </div>
              <input
                type="checkbox"
                checked={reminderEnabled}
                onChange={(e) => setReminderEnabled(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
            </div>

            {reminderEnabled && (
              <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400 pt-1">
                <span>هشدار اعلان:</span>
                <select
                  value={reminderMinutesBefore}
                  onChange={(e) => setReminderMinutesBefore(Number(e.target.value))}
                  className="px-2 py-1 rounded-md border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-slate-900 text-neutral-900 dark:text-neutral-100"
                >
                  <option value={5}>۵ دقیقه قبل</option>
                  <option value={10}>۱۰ دقیقه قبل</option>
                  <option value={15}>۱۵ دقیقه قبل (پیشنهادی تقویم)</option>
                  <option value={30}>۳۰ دقیقه قبل</option>
                  <option value={60}>۱ ساعت قبل</option>
                </select>
                <span>قبل از شروع برنامه</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              توضیحات و سرفصل‌ها (اختیاری)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="نکات مطالعه، تکالیف مرتبط یا صفحات کتاب..."
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-slate-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block font-medium text-neutral-700 dark:text-neutral-300 mb-1.5">
              برچسب‌ها (با کاما یا ویرگول جدا کنید)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="دانشگاه، تستی، کنکور، مهم"
              className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-slate-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg transition-colors"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
            >
              ذخیره برنامه
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
