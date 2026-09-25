export type DayOfWeek = 
  | 'saturday' 
  | 'sunday' 
  | 'monday' 
  | 'tuesday' 
  | 'wednesday' 
  | 'thursday' 
  | 'friday';

export type TaskCategory = 
  | 'study'      // درس و مطالعه
  | 'class'      // کلاس و دانشگاه
  | 'exam'       // آزمون و امتحانات
  | 'work'       // کار و پروژه
  | 'personal'   // کارهای شخصی
  | 'review';    // مرور فاصله‌دار

export type Priority = 'high' | 'medium' | 'low';
export type TaskStatus = 'todo' | 'in_progress' | 'completed';

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: TaskCategory;
  dayOfWeek: DayOfWeek;
  dateStr?: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;   // HH:mm
  priority: Priority;
  status: TaskStatus;
  reminderEnabled: boolean;
  reminderMinutesBefore: number;
  subject?: string;
  studyMinutesTarget?: number;
  audioNoteUrl?: string;
  tags?: string[];
  createdAt: string;
  completedAt?: string;
}

export interface StudySession {
  id: string;
  taskId?: string;
  subject: string;
  durationMinutes: number;
  date: string; // ISO date
  notes?: string;
}

export interface Bookmark {
  id: string;
  docId: string;
  pageNumber: number;
  title: string;
  createdAt: string;
}

export interface MarginNote {
  id: string;
  docId: string;
  pageNumber: number;
  selectedText?: string;
  noteText: string;
  createdAt: string;
}

export interface StudyDoc {
  id: string;
  title: string;
  author?: string;
  category: string;
  type: 'pdf' | 'epub' | 'text';
  content?: string; // For text/markdown or extracted epub chapters
  fileUrl?: string; // For uploaded PDF / EPUB blobs
  totalPages: number;
  currentPage: number;
  bookmarks: Bookmark[];
  notes: MarginNote[];
  lastReadAt: string;
}

export type AppTheme = 'light' | 'dark' | 'sepia' | 'system';
export type AccentColor = 'indigo' | 'emerald' | 'amber' | 'rose' | 'teal' | 'slate';
export type FontSize = 'sm' | 'base' | 'lg' | 'xl';
export type PersianFont = 'vazirmatn' | 'sahel' | 'system';

export interface UserSettings {
  theme: AppTheme;
  autoNightMode: boolean; // Auto activate sepia/dark after 8 PM
  accentColor: AccentColor;
  fontSize: FontSize;
  persianFont: PersianFont;
  startDayOfWeek: DayOfWeek;
  syncToken: string;
  lastBackupDate?: string;
  browserExtensionKey?: string;
  soundAlertsEnabled: boolean;
  pushNotificationsEnabled?: boolean;
}

export interface AIAnalysisReport {
  summary: string;
  productivityScore: number;
  spacedRepetitionTips: string[];
  recommendedReminders: {
    title: string;
    suggestedDay: string;
    time: string;
    reason: string;
  }[];
  focusTip: string;
}
