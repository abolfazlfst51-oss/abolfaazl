import React, { useState, useMemo } from 'react';
import { 
  Task, 
  DayOfWeek, 
  TaskCategory, 
  Priority 
} from '../types';
import { 
  Search, 
  Filter, 
  Clock, 
  CheckCircle2, 
  Circle, 
  Calendar, 
  Bell, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  Play, 
  CalendarPlus,
  BookMarked,
  GraduationCap,
  Briefcase,
  Layers,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  X,
  Cpu,
  Globe,
  FileCode
} from 'lucide-react';
import { createGoogleCalendarUrl } from '../utils/calendar';

interface WeeklyScheduleProps {
  tasks: Task[];
  onToggleTaskStatus: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onDeleteAllTasks?: () => void;
  onResetTasks?: () => void;
  onStartStudySession: (task: Task) => void;
  onOpenNewTaskForDay: (day: DayOfWeek) => void;
  startDayOfWeek?: DayOfWeek;
}

const DAYS_ORDER: { id: DayOfWeek; name: string; shortName: string }[] = [
  { id: 'saturday', name: 'شنبه', shortName: 'شن' },
  { id: 'sunday', name: 'یکشنبه', shortName: 'یک' },
  { id: 'monday', name: 'دوشنبه', shortName: 'دو' },
  { id: 'tuesday', name: 'سه‌شنبه', shortName: 'سه' },
  { id: 'wednesday', name: 'چهارشنبه', shortName: 'چه' },
  { id: 'thursday', name: 'پنجشنبه', shortName: 'پن' },
  { id: 'friday', name: 'جمعه', shortName: 'جم' },
];

const CATEGORY_MAP: Record<TaskCategory, { label: string; icon: React.ReactNode; color: string }> = {
  study: { label: 'درس و مطالعه', icon: <BookMarked className="w-3.5 h-3.5 text-blue-500" />, color: 'text-blue-600 dark:text-blue-400' },
  class: { label: 'کلاس درس', icon: <GraduationCap className="w-3.5 h-3.5 text-emerald-500" />, color: 'text-emerald-600 dark:text-emerald-400' },
  exam: { label: 'آزمون و امتحان', icon: <Layers className="w-3.5 h-3.5 text-rose-500" />, color: 'text-rose-600 dark:text-rose-400' },
  work: { label: 'کار و پروژه', icon: <Briefcase className="w-3.5 h-3.5 text-amber-500" />, color: 'text-amber-600 dark:text-amber-400' },
  personal: { label: 'شخصی', icon: <Calendar className="w-3.5 h-3.5 text-purple-500" />, color: 'text-purple-600 dark:text-purple-400' },
  review: { label: 'مرور فاصله‌دار', icon: <Clock className="w-3.5 h-3.5 text-indigo-500" />, color: 'text-indigo-600 dark:text-indigo-400' },
};

const PRIORITY_LABELS: Record<Priority, { label: string; textClass: string }> = {
  high: { label: 'اولویت بالا', textClass: 'text-rose-600 dark:text-rose-400 font-semibold' },
  medium: { label: 'متوسط', textClass: 'text-amber-600 dark:text-amber-400' },
  low: { label: 'عادی', textClass: 'text-neutral-500' },
};

export type VocationalSubject = 'all' | 'content' | 'web' | 'hardware';

export const WeeklySchedule: React.FC<WeeklyScheduleProps> = ({
  tasks,
  onToggleTaskStatus,
  onEditTask,
  onDeleteTask,
  onDeleteAllTasks,
  onResetTasks,
  onStartStudySession,
  onOpenNewTaskForDay,
  startDayOfWeek = 'saturday',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedVocationalSubject, setSelectedVocationalSubject] = useState<VocationalSubject>('all');
  const [activeDayFilter, setActiveDayFilter] = useState<string>('all');
  const [showDeleteAllModal, setShowDeleteAllModal] = useState(false);

  // Dynamically compute days order based on startDayOfWeek setting
  const orderedDays = useMemo(() => {
    const baseDays: { id: DayOfWeek; name: string; shortName: string }[] = [
      { id: 'saturday', name: 'شنبه', shortName: 'شن' },
      { id: 'sunday', name: 'یکشنبه', shortName: 'یک' },
      { id: 'monday', name: 'دوشنبه', shortName: 'دو' },
      { id: 'tuesday', name: 'سه‌شنبه', shortName: 'سه' },
      { id: 'wednesday', name: 'چهارشنبه', shortName: 'چه' },
      { id: 'thursday', name: 'پنجشنبه', shortName: 'پن' },
      { id: 'friday', name: 'جمعه', shortName: 'جم' },
    ];
    if (startDayOfWeek === 'sunday') {
      return [baseDays[1], baseDays[2], baseDays[3], baseDays[4], baseDays[5], baseDays[6], baseDays[0]];
    }
    if (startDayOfWeek === 'monday') {
      return [baseDays[2], baseDays[3], baseDays[4], baseDays[5], baseDays[6], baseDays[0], baseDays[1]];
    }
    return baseDays;
  }, [startDayOfWeek]);

  // Helper matcher for 10th grade vocational computer curriculum subjects
  const matchVocationalSubject = (task: Task, filter: VocationalSubject) => {
    if (filter === 'all') return true;
    const text = `${task.title} ${task.subject || ''} ${task.description || ''} ${(task.tags || []).join(' ')}`.toLowerCase();
    if (filter === 'content') {
      return text.includes('تولید محتوا') || text.includes('برنامه‌سازی') || text.includes('پایتون') || text.includes('الگوریتم') || text.includes('فلوچارت') || text.includes('سی‌شارپ');
    }
    if (filter === 'web') {
      return text.includes('طراحی وب') || text.includes('وب') || text.includes('html') || text.includes('css') || text.includes('سیستم‌های اطلاعاتی');
    }
    if (filter === 'hardware') {
      return text.includes('سخت‌افزار') || text.includes('سختافزار') || text.includes('سیستم‌های رایانه‌ای') || text.includes('اسمبل') || text.includes('مادربرد') || text.includes('قطعات');
    }
    return true;
  };

  // Vocational task counts
  const vocationalCounts = useMemo(() => {
    return {
      all: tasks.length,
      content: tasks.filter((t) => matchVocationalSubject(t, 'content')).length,
      web: tasks.filter((t) => matchVocationalSubject(t, 'web')).length,
      hardware: tasks.filter((t) => matchVocationalSubject(t, 'hardware')).length,
    };
  }, [tasks]);

  // Filter tasks based on criteria
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(q);
        const matchesDesc = task.description?.toLowerCase().includes(q) || false;
        const matchesSubject = task.subject?.toLowerCase().includes(q) || false;
        const matchesTags = task.tags?.some((t) => t.toLowerCase().includes(q)) || false;
        if (!matchesTitle && !matchesDesc && !matchesSubject && !matchesTags) {
          return false;
        }
      }

      if (selectedCategory !== 'all' && task.category !== selectedCategory) {
        return false;
      }

      if (selectedVocationalSubject !== 'all' && !matchVocationalSubject(task, selectedVocationalSubject)) {
        return false;
      }

      if (selectedStatus === 'completed' && task.status !== 'completed') return false;
      if (selectedStatus === 'todo' && task.status === 'completed') return false;

      if (activeDayFilter !== 'all' && task.dayOfWeek !== activeDayFilter) {
        return false;
      }

      return true;
    });
  }, [tasks, searchQuery, selectedCategory, selectedStatus, selectedVocationalSubject, activeDayFilter]);

  // Group filtered tasks by day of week
  const tasksByDay = useMemo(() => {
    const map: Record<DayOfWeek, Task[]> = {
      saturday: [],
      sunday: [],
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
    };

    filteredTasks.forEach((task) => {
      if (map[task.dayOfWeek]) {
        map[task.dayOfWeek].push(task);
      }
    });

    // Sort each day's tasks by start time
    Object.keys(map).forEach((dayKey) => {
      map[dayKey as DayOfWeek].sort((a, b) => (a.startTime || '00:00').localeCompare(b.startTime || '00:00'));
    });

    return map;
  }, [filteredTasks]);

  // Overall statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Hero Banner with Study Desk Texture */}
      <div className="relative rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 bg-neutral-900 text-white min-h-[160px] flex flex-col justify-end p-6 sm:p-8">
        <img
          src="/src/assets/images/study_desk_minimal_1790330956022.jpg"
          alt="میز مطالعه منظم"
          className="absolute inset-0 w-full h-full object-cover opacity-25"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-transparent" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-neutral-300">
              <span className="font-semibold text-emerald-400">هنرستان فنی و حرفه‌ای</span>
              <span aria-hidden="true">·</span>
              <span>پایه دهم شبکه و نرم‌افزار کامپیوتر</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums font-mono">{totalTasks} برنامه کارگاهی و درسی</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              برنامه‌ریزی کارگاهی، تمرین کدنویسی و موفقیت در پودمان‌ها
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 max-w-2xl leading-relaxed">
              مدیریت ساعت کارگاه‌های طراحی وب، تولید محتوا و سخت‌افزار به همراه یادآورهای مرور کدهای پایتون و HTML/CSS ویژه دانش‌آموزان کامپیوتر هنرستان.
            </p>
          </div>

          <div className="shrink-0 bg-neutral-900/80 backdrop-blur-md p-4 rounded-xl border border-neutral-700/60 flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-neutral-400">پیشرفت هفتگی</div>
              <div className="text-xl font-bold tabular-nums font-mono text-emerald-400">
                {progressPercent}%
              </div>
            </div>
            <div className="w-16 h-2 bg-neutral-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Search and Filters (Clean zero-pill design) */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-2xs">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجوی پیشرفته در دروس، تکالیف، جزوات و برچسب‌ها..."
            className="w-full pl-3 pr-9 py-2 text-xs sm:text-sm bg-neutral-50 dark:bg-slate-800/80 rounded-lg border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400"
          />
        </div>

        {/* Category Segmented Control */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            همه موارد
          </button>
          <button
            onClick={() => setSelectedCategory('study')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              selectedCategory === 'study'
                ? 'bg-blue-600 text-white'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            درس و مطالعه
          </button>
          <button
            onClick={() => setSelectedCategory('class')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              selectedCategory === 'class'
                ? 'bg-emerald-600 text-white'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            کلاس‌ها
          </button>
          <button
            onClick={() => setSelectedCategory('exam')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              selectedCategory === 'exam'
                ? 'bg-rose-600 text-white'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            آزمون‌ها
          </button>
          <button
            onClick={() => setSelectedCategory('review')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              selectedCategory === 'review'
                ? 'bg-indigo-600 text-white'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            مرور فاصله‌دار
          </button>
        </div>

        {/* Status Filter & Clear All Action */}
        <div className="flex items-center gap-2 border-r border-neutral-200 dark:border-neutral-800 pr-2">
          <button
            onClick={() => setSelectedStatus(selectedStatus === 'completed' ? 'all' : 'completed')}
            className={`px-2.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
              selectedStatus === 'completed'
                ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
            }`}
          >
            تکمیل شده‌ها
          </button>

          {tasks.length > 0 && onDeleteAllTasks && (
            <button
              onClick={() => setShowDeleteAllModal(true)}
              title="حذف تمام برنامه‌های ثبت شده"
              className="px-2.5 py-1.5 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg border border-rose-200/80 dark:border-rose-900/60 transition-colors flex items-center gap-1 whitespace-nowrap"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>حذف همه برنامه‌ها</span>
            </button>
          )}
        </div>
      </div>

      {/* Vocational Subjects Filter Bar (هنرستان کامپیوتر: تولید محتوا، طراحی وب، سخت‌افزار) */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-gradient-to-r from-indigo-50/80 via-white to-neutral-50 dark:from-indigo-950/20 dark:via-slate-900 dark:to-slate-900 p-3 sm:p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-900/60 shadow-2xs">
        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-800 dark:text-neutral-200 shrink-0">
          <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
            <GraduationCap className="w-3.5 h-3.5" />
          </div>
          <span>فیلتر موضوعات تخصصی هنرستان کامپیوتر:</span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setSelectedVocationalSubject('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedVocationalSubject === 'all'
                ? 'bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 shadow-xs'
                : 'bg-white dark:bg-slate-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-slate-700/60'
            }`}
          >
            <span>همه دروس</span>
            <span className="text-[11px] opacity-80 font-mono tabular-nums">({vocationalCounts.all})</span>
          </button>

          <button
            onClick={() => setSelectedVocationalSubject('content')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedVocationalSubject === 'content'
                ? 'bg-amber-600 text-white shadow-xs font-semibold'
                : 'bg-white dark:bg-slate-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 hover:border-amber-300 dark:hover:border-amber-700 hover:bg-amber-50/50 dark:hover:bg-slate-700/60'
            }`}
          >
            <FileCode className={`w-3.5 h-3.5 ${selectedVocationalSubject === 'content' ? 'text-white' : 'text-amber-500'}`} />
            <span>تولید محتوا و برنامه‌سازی</span>
            <span className="text-[11px] opacity-80 font-mono tabular-nums">({vocationalCounts.content})</span>
          </button>

          <button
            onClick={() => setSelectedVocationalSubject('web')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedVocationalSubject === 'web'
                ? 'bg-blue-600 text-white shadow-xs font-semibold'
                : 'bg-white dark:bg-slate-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-slate-700/60'
            }`}
          >
            <Globe className={`w-3.5 h-3.5 ${selectedVocationalSubject === 'web' ? 'text-white' : 'text-blue-500'}`} />
            <span>طراحی وب و سیستم‌های اطلاعاتی</span>
            <span className="text-[11px] opacity-80 font-mono tabular-nums">({vocationalCounts.web})</span>
          </button>

          <button
            onClick={() => setSelectedVocationalSubject('hardware')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
              selectedVocationalSubject === 'hardware'
                ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                : 'bg-white dark:bg-slate-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50/50 dark:hover:bg-slate-700/60'
            }`}
          >
            <Cpu className={`w-3.5 h-3.5 ${selectedVocationalSubject === 'hardware' ? 'text-white' : 'text-emerald-500'}`} />
            <span>سخت‌افزار و سیستم‌های رایانه‌ای</span>
            <span className="text-[11px] opacity-80 font-mono tabular-nums">({vocationalCounts.hardware})</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Deleting All Tasks */}
      {showDeleteAllModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-6 text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
                حذف تمامی برنامه‌ها؟
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                آیا مطمئن هستید که می‌خواهید تمام <strong className="text-neutral-900 dark:text-neutral-100 font-mono">{tasks.length}</strong> برنامه ثبت‌شده در جدول هفتگی را حذف کنید؟ این عملیات غیرقابل بازگشت است.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteAllModal(false)}
                className="py-2.5 px-3 rounded-xl border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-slate-800 text-neutral-700 dark:text-neutral-300 text-xs font-semibold transition-colors"
              >
                انصراف
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onDeleteAllTasks) {
                    onDeleteAllTasks();
                  }
                  setShowDeleteAllModal(false);
                }}
                className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors shadow-xs flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>بله، حذف همه</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State Banner when all tasks are deleted */}
      {tasks.length === 0 && (
        <div className="p-8 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs text-center space-y-4 shadow-2xs">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto shadow-inner">
            <CalendarPlus className="w-7 h-7" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100">
              تمامی برنامه‌ها با موفقیت حذف شدند
            </h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed">
              جدول هفتگی در حال حاضر خالی است. شما می‌توانید برنامه‌های جدید خود را ثبت کنید یا در صورت تمایل، برنامه‌های پیش‌فرض کارگاه‌های کامپیوتر پایه دهم هنرستان را مجدداً بازیابی نمایید.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onOpenNewTaskForDay('saturday')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <CalendarPlus className="w-4 h-4" />
              <span>افزودن اولین برنامه</span>
            </button>
            {onResetTasks && (
              <button
                onClick={onResetTasks}
                className="px-4 py-2 border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-slate-800 text-neutral-700 dark:text-neutral-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
              >
                بارگذاری مجدد برنامه‌های دهم هنرستان
              </button>
            )}
          </div>
        </div>
      )}

      {/* No matching tasks found for filter */}
      {tasks.length > 0 && filteredTasks.length === 0 && (
        <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs text-center space-y-3 shadow-2xs">
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-400">
            هیچ برنامه‌ای منطبق با فیلتر موضوعی انتخابی یافت نشد.
          </p>
          <button
            onClick={() => {
              setSelectedVocationalSubject('all');
              setSelectedCategory('all');
              setSelectedStatus('all');
              setSearchQuery('');
            }}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-semibold cursor-pointer underline underline-offset-4"
          >
            نمایش همه دروس و بازنشانی فیلترها
          </button>
        </div>
      )}

      {/* Days Tabs for Small Screens / Day Picker */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setActiveDayFilter('all')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
            activeDayFilter === 'all'
              ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
              : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
          }`}
        >
          نمای هفتگی (کل روزها)
        </button>
        {orderedDays.map((day) => {
          const count = tasksByDay[day.id].length;
          return (
            <button
              key={day.id}
              onClick={() => setActiveDayFilter(day.id)}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors flex items-center gap-1.5 ${
                activeDayFilter === day.id
                  ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <span>{day.name}</span>
              <span className="text-[11px] opacity-70 tabular-nums font-mono">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Weekly Grid / Columns View */}
      <div className={`grid gap-4 ${activeDayFilter === 'all' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7' : 'grid-cols-1'}`}>
        {orderedDays.filter((day) => activeDayFilter === 'all' || activeDayFilter === day.id).map((day) => {
          const dayTasks = tasksByDay[day.id];
          const isToday = false; // Could compare with Persian day if desired

          return (
            <div 
              key={day.id} 
              className="flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-neutral-200 dark:border-neutral-800 overflow-hidden shadow-2xs transition-shadow hover:shadow-xs"
            >
              {/* Day Header */}
              <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/70 dark:bg-slate-800/40">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">
                    {day.name}
                  </span>
                  <span className="text-xs text-neutral-400 tabular-nums font-mono">
                    {dayTasks.length} مورد
                  </span>
                </div>
                <button
                  onClick={() => onOpenNewTaskForDay(day.id)}
                  title="افزودن برنامه در این روز"
                  className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium px-2 py-0.5 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors"
                >
                  + افزودن
                </button>
              </div>

              {/* Tasks List */}
              <div className="p-3 space-y-2.5 flex-1 min-h-[140px]">
                {dayTasks.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center py-6 text-center text-neutral-400 animate-card-fade-in">
                    <p className="text-xs">برنامه‌ای برای این روز ثبت نشده</p>
                    <button
                      onClick={() => onOpenNewTaskForDay(day.id)}
                      className="mt-2 text-xs text-neutral-500 hover:text-indigo-600 dark:hover:text-indigo-400 underline underline-offset-4"
                    >
                      ثبت اولین کار
                    </button>
                  </div>
                ) : (
                  dayTasks.map((task, index) => {
                    const isCompleted = task.status === 'completed';
                    const categoryInfo = CATEGORY_MAP[task.category] || CATEGORY_MAP.study;
                    const priorityInfo = PRIORITY_LABELS[task.priority] || PRIORITY_LABELS.medium;

                    return (
                      <div
                        key={task.id}
                        style={{ animationDelay: `${Math.min(index * 45, 300)}ms` }}
                        className={`animate-card-fade-in p-3 rounded-lg border transition-all duration-150 ${
                          isCompleted
                            ? 'bg-neutral-50/80 dark:bg-slate-900/50 border-neutral-200 dark:border-neutral-800 opacity-60'
                            : 'bg-white dark:bg-slate-800/90 border-neutral-200/90 dark:border-neutral-700/80 hover:border-neutral-300 dark:hover:border-neutral-600 shadow-2xs hover:shadow-xs'
                        }`}
                      >
                        {/* Header: Title + Checkbox */}
                        <div className="flex items-start justify-between gap-2">
                          <button
                            onClick={() => onToggleTaskStatus(task.id)}
                            className="mt-0.5 text-neutral-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors shrink-0"
                            title={isCompleted ? 'علامت به عنوان انجام نشده' : 'علامت به عنوان تکمیل شده'}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <Circle className="w-4 h-4" />
                            )}
                          </button>

                          <div className="flex-1 min-w-0 text-right">
                            <h4 className={`text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate ${isCompleted ? 'line-through text-neutral-400 dark:text-neutral-500' : ''}`}>
                              {task.title}
                            </h4>
                            {task.subject && (
                              <div className="text-[11px] text-neutral-500 truncate mt-0.5">
                                {task.subject}
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => onEditTask(task)}
                              title="ویرایش"
                              className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-sm"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => onDeleteTask(task.id)}
                              title="حذف"
                              className="p-1 text-neutral-400 hover:text-rose-600 rounded-sm"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Description if any */}
                        {task.description && (
                          <p className="text-[11px] text-neutral-600 dark:text-neutral-400 line-clamp-2 mt-1.5 leading-relaxed">
                            {task.description}
                          </p>
                        )}

                        {/* Unboxed Metadata (Zero-pill rule: clean text with dividers) */}
                        <div className="mt-2.5 pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[11px] text-neutral-500">
                          <div className="flex items-center gap-1.5">
                            <span className="flex items-center gap-1">
                              {categoryInfo.icon}
                              <span>{categoryInfo.label}</span>
                            </span>
                            <span aria-hidden="true">·</span>
                            <span className="tabular-nums font-mono">
                              {task.startTime} - {task.endTime}
                            </span>
                          </div>

                          {task.reminderEnabled && (
                            <span title={`یادآوری هوشمند ${task.reminderMinutesBefore} دقیقه قبل`} className="flex items-center gap-0.5 text-amber-500">
                              <Bell className="w-3 h-3" />
                              <span className="text-[10px] tabular-nums font-mono">{task.reminderMinutesBefore}m</span>
                            </span>
                          )}
                        </div>

                        {/* Quick Action Footer: Start Timer or Add to Google Calendar */}
                        <div className="mt-2 pt-1.5 flex items-center justify-between text-[11px]">
                          <span className={priorityInfo.textClass}>
                            {priorityInfo.label}
                          </span>

                          <div className="flex items-center gap-2">
                            {/* Direct Google Calendar sync link */}
                            <a
                              href={createGoogleCalendarUrl(task)}
                              target="_blank"
                              rel="noreferrer"
                              title="افزودن مستقیم به تقویم گوگل"
                              className="text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-0.5 transition-colors"
                            >
                              <CalendarPlus className="w-3 h-3" />
                              <span>تقویم</span>
                            </a>

                            {/* Launch Pomodoro study timer for this task */}
                            <button
                              onClick={() => onStartStudySession(task)}
                              title="شروع مطالعه با تایمر پومودورو"
                              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-0.5 font-medium transition-colors"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>شروع مطالعه</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
