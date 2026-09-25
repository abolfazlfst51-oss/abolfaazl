import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Task, 
  StudyDoc, 
  UserSettings, 
  StudySession, 
  DayOfWeek, 
  AppTheme,
  AccentColor 
} from './types';
import { 
  loadTasksFromStorage, 
  saveTasksToStorage, 
  loadDocsFromStorage, 
  saveDocsToStorage, 
  loadSettingsFromStorage, 
  saveSettingsToStorage, 
  loadSessionsFromStorage, 
  saveSessionsToStorage,
  INITIAL_TASKS,
  INITIAL_DOCS,
  INITIAL_SETTINGS,
  INITIAL_SESSIONS
} from './utils/storage';
import { Header } from './components/Header';
import { WeeklySchedule } from './components/WeeklySchedule';
import { TaskModal } from './components/TaskModal';
import { StudyTimer } from './components/StudyTimer';
import { AnalyticsView } from './components/AnalyticsView';
import { StudyReader } from './components/StudyReader';
import { OcrVoiceTools } from './components/OcrVoiceTools';
import { CalendarSyncModal } from './components/CalendarSyncModal';
import { CloudBackupModal } from './components/CloudBackupModal';
import { WidgetsModal } from './components/WidgetsModal';
import { QuickCaptureModal } from './components/QuickCaptureModal';
import { SettingsModal } from './components/SettingsModal';
import { soundManager } from './utils/audio';
import { Mic, Zap, WifiOff, Bell, BellRing, X, ArrowLeft } from 'lucide-react';

interface ActiveNotification {
  id: string;
  task: Task;
  title: string;
  message: string;
  minutesLeft: number;
  isClass: boolean;
  timestamp: number;
}

export default function App() {
  // Core Application State
  const [tasks, setTasks] = useState<Task[]>(loadTasksFromStorage);
  const [docs, setDocs] = useState<StudyDoc[]>(loadDocsFromStorage);
  const [settings, setSettings] = useState<UserSettings>(loadSettingsFromStorage);
  const [sessions, setSessions] = useState<StudySession[]>(loadSessionsFromStorage);

  // Notification State
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [activeNotification, setActiveNotification] = useState<ActiveNotification | null>(null);
  const sentNotificationsRef = useRef<Set<string>>(new Set());

  // UI State
  const [currentTab, setCurrentTab] = useState<'schedule' | 'timer' | 'reader' | 'analytics' | 'tools'>('schedule');
  const [activeTaskForTimer, setActiveTaskForTimer] = useState<Task | null>(null);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  // Modals State
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultDayForTask, setDefaultDayForTask] = useState<DayOfWeek>('saturday');
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isCloudModalOpen, setIsCloudModalOpen] = useState(false);
  const [isWidgetsModalOpen, setIsWidgetsModalOpen] = useState(false);
  const [isQuickCaptureOpen, setIsQuickCaptureOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Save to LocalStorage whenever state changes
  useEffect(() => {
    saveTasksToStorage(tasks);
  }, [tasks]);

  useEffect(() => {
    saveDocsToStorage(docs);
  }, [docs]);

  useEffect(() => {
    saveSettingsToStorage(settings);
  }, [settings]);

  useEffect(() => {
    saveSessionsToStorage(sessions);
  }, [sessions]);

  // Online / Offline monitor
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Keyboard shortcut: Ctrl+K or Cmd+K for Quick Capture
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsQuickCaptureOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Theme calculation (including Smart Auto Night mode after 20:00)
  const isNightHour = () => {
    const currentHour = new Date().getHours();
    return currentHour >= 20 || currentHour < 6;
  };

  const effectiveTheme: AppTheme = (() => {
    // If user explicitly chose a specific theme, always honor it
    if (settings.theme === 'light') return 'light';
    if (settings.theme === 'dark') return 'dark';
    if (settings.theme === 'sepia') return 'sepia';

    // If 'system', use autoNightMode or system preference
    if (settings.autoNightMode && isNightHour()) {
      return 'dark';
    }
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  })();

  // Apply dark mode & theme class to html/root
  useEffect(() => {
    const root = document.documentElement;
    if (effectiveTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('theme-sepia');
    } else if (effectiveTheme === 'sepia') {
      root.classList.remove('dark');
      root.classList.add('theme-sepia');
    } else {
      root.classList.remove('dark');
      root.classList.remove('theme-sepia');
    }
  }, [effectiveTheme]);

  // Apply Persian font family dynamically
  useEffect(() => {
    const root = document.documentElement;
    if (settings.persianFont === 'sahel') {
      root.style.setProperty('--app-font', "'Sahel', 'Vazirmatn', system-ui, sans-serif");
      root.style.fontFamily = "'Sahel', 'Vazirmatn', system-ui, sans-serif";
    } else if (settings.persianFont === 'system') {
      root.style.setProperty('--app-font', "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Tahoma, Arial, sans-serif");
      root.style.fontFamily = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Tahoma, Arial, sans-serif";
    } else {
      root.style.setProperty('--app-font', "'Vazirmatn', system-ui, sans-serif");
      root.style.fontFamily = "'Vazirmatn', system-ui, sans-serif";
    }
  }, [settings.persianFont]);

  // Apply font size dynamically across entire application
  useEffect(() => {
    const root = document.documentElement;
    switch (settings.fontSize) {
      case 'sm':
        root.style.fontSize = '13.5px';
        break;
      case 'lg':
        root.style.fontSize = '16.5px';
        break;
      case 'xl':
        root.style.fontSize = '18px';
        break;
      case 'base':
      default:
        root.style.fontSize = '15px';
        break;
    }
  }, [settings.fontSize]);

  // Apply accent color dynamically
  useEffect(() => {
    const root = document.documentElement;
    const accentColors: Record<AccentColor, string> = {
      indigo: '#4f46e5',
      emerald: '#059669',
      amber: '#d97706',
      rose: '#e11d48',
      teal: '#0d9488',
      slate: '#475569',
    };
    const colorHex = accentColors[settings.accentColor] || '#4f46e5';
    root.style.setProperty('--primary-accent', colorHex);
  }, [settings.accentColor]);

  // Task Handlers
  const handleSaveTask = (taskData: Partial<Task>) => {
    if (taskData.id) {
      // Edit existing
      setTasks((prev) =>
        prev.map((t) => (t.id === taskData.id ? ({ ...t, ...taskData } as Task) : t))
      );
    } else {
      // Add new
      const newTask: Task = {
        id: `task-${Date.now()}`,
        title: taskData.title || 'کار جدید',
        category: taskData.category || 'study',
        dayOfWeek: taskData.dayOfWeek || 'saturday',
        startTime: taskData.startTime || '09:00',
        endTime: taskData.endTime || '10:30',
        priority: taskData.priority || 'medium',
        status: 'todo',
        reminderEnabled: taskData.reminderEnabled ?? true,
        reminderMinutesBefore: taskData.reminderMinutesBefore ?? 15,
        description: taskData.description,
        subject: taskData.subject,
        studyMinutesTarget: taskData.studyMinutesTarget || 90,
        tags: taskData.tags,
        createdAt: new Date().toISOString(),
      };
      setTasks((prev) => [newTask, ...prev]);
    }
    setEditingTask(null);
  };

  const handleToggleTaskStatus = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const isDone = t.status === 'completed';
          if (!isDone && settings.soundAlertsEnabled) {
            soundManager.playChime('success');
          }
          return {
            ...t,
            status: isDone ? 'todo' : 'completed',
            completedAt: isDone ? undefined : new Date().toISOString(),
          };
        }
        return t;
      })
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleDeleteAllTasks = () => {
    setTasks([]);
  };

  const handleResetTasksOnly = () => {
    setTasks(INITIAL_TASKS);
  };

  const handleStartStudySession = (task: Task) => {
    setActiveTaskForTimer(task);
    setCurrentTab('timer');
  };

  const handleSessionComplete = (session: StudySession) => {
    setSessions((prev) => [session, ...prev]);
  };

  const handleOpenNewTaskForDay = (day: DayOfWeek) => {
    setDefaultDayForTask(day);
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  // Restore data from encrypted cloud backup
  const handleRestoreData = (data: {
    tasks: Task[];
    docs: StudyDoc[];
    settings: UserSettings;
    sessions: StudySession[];
  }) => {
    if (data.tasks) setTasks(data.tasks);
    if (data.docs) setDocs(data.docs);
    if (data.settings) setSettings(data.settings);
    if (data.sessions) setSessions(data.sessions);
  };

  // Check initial browser Notification support and permission
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('Notification' in window) {
        setNotificationPermission(Notification.permission);
      } else {
        setNotificationPermission('unsupported');
      }
    }
  }, []);

  // Request browser Notification permission
  const requestNotificationPermission = useCallback(async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        setNotificationPermission(perm);
        return perm;
      } catch (err) {
        console.warn('Failed to request notification permission:', err);
      }
    }
    return 'unsupported';
  }, []);

  // Helper to convert HH:mm to minutes
  const timeToMinutes = (timeStr?: string): number => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  // Helper to map Date to Iranian/JS DayOfWeek
  const getDayOfWeekName = (date: Date): DayOfWeek => {
    const day = date.getDay();
    const map: Record<number, DayOfWeek> = {
      0: 'sunday',
      1: 'monday',
      2: 'tuesday',
      3: 'wednesday',
      4: 'thursday',
      5: 'friday',
      6: 'saturday',
    };
    return map[day];
  };

  // Trigger both Web Push Notification and In-App Floating Toast with sound
  const triggerNotification = useCallback((task: Task, minutesLeft: number, isTest = false) => {
    const isClass = task.category === 'class';
    const prefix = isClass ? 'یادآور کلاس هنرستان' : 'یادآور کار با اولویت بالا';
    const title = `${prefix}: ${task.title}`;
    const timeText = minutesLeft > 0 ? `تا ${minutesLeft} دقیقه دیگر` : 'هم‌اکنون';
    const message = `${isClass ? 'کلاس' : 'برنامه'} «${task.title}» ساعت ${task.startTime} (${timeText}) شروع می‌شود.${task.subject ? ` (موضوع: ${task.subject})` : ''}`;

    // 1. Play chime sound
    if (settings.soundAlertsEnabled) {
      soundManager.playChime('reminder');
    }

    // 2. Web Push Notification
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        try {
          new Notification(`🔔 ${title}`, {
            body: message,
            icon: '/src/assets/images/app_logo_planner_1790330978417.jpg',
            tag: `class-reminder-${task.id}`,
          });
        } catch (e) {
          console.warn('Web notification dispatch failed:', e);
        }
      } else if (Notification.permission === 'default' && isTest) {
        Notification.requestPermission().then((perm) => {
          setNotificationPermission(perm);
          if (perm === 'granted') {
            try {
              new Notification(`🔔 ${title}`, {
                body: message,
                icon: '/src/assets/images/app_logo_planner_1790330978417.jpg',
              });
            } catch {}
          }
        });
      }
    }

    // 3. Floating In-App Toast
    setActiveNotification({
      id: `notif-${Date.now()}`,
      task,
      title,
      message,
      minutesLeft,
      isClass,
      timestamp: Date.now(),
    });
  }, [settings.soundAlertsEnabled]);

  // Periodic Reminder Engine (Runs every 20 seconds for high priority tasks & classes)
  useEffect(() => {
    if (settings.pushNotificationsEnabled === false) return;

    const checkReminders = () => {
      const now = new Date();
      const currentDay = getDayOfWeekName(now);
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      // Find tasks matching high priority or class category with reminderEnabled !== false
      const candidates = tasks.filter(
        (t) =>
          t.status !== 'completed' &&
          t.reminderEnabled !== false &&
          (t.priority === 'high' || t.category === 'class') &&
          t.dayOfWeek === currentDay
      );

      for (const task of candidates) {
        const startMin = timeToMinutes(task.startTime);
        const reminderMin = task.reminderMinutesBefore ?? 15;
        const triggerMin = startMin - reminderMin;
        const diff = startMin - currentMinutes;

        // Key to prevent multiple notifications on the same day for the same task
        const notifKey = `${task.id}-${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;

        // Trigger if within notification window (from triggerMin up to startMin + 5)
        if (currentMinutes >= triggerMin && currentMinutes <= startMin + 5) {
          if (!sentNotificationsRef.current.has(notifKey)) {
            sentNotificationsRef.current.add(notifKey);
            triggerNotification(task, Math.max(0, diff));
            break;
          }
        }
      }
    };

    // Run check on mount and interval
    checkReminders();
    const interval = setInterval(checkReminders, 20000);
    return () => clearInterval(interval);
  }, [tasks, settings.pushNotificationsEnabled, triggerNotification]);

  // Manual Trigger / Test Notification function
  const handleTestNotification = useCallback(() => {
    // If permission is default, prompt user
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      requestNotificationPermission();
    }

    const now = new Date();
    const currentDay = getDayOfWeekName(now);

    // Prioritize high-priority class tasks
    const candidate =
      tasks.find((t) => (t.priority === 'high' || t.category === 'class') && t.dayOfWeek === currentDay) ||
      tasks.find((t) => t.category === 'class' && t.priority === 'high') ||
      tasks.find((t) => t.category === 'class') ||
      tasks.find((t) => t.priority === 'high') ||
      tasks[0] || {
        id: 'test-task',
        title: 'کارگاه تولید محتوا و برنامه‌سازی',
        subject: 'طراحی الگوریتم و فلوچارت',
        category: 'class',
        priority: 'high',
        startTime: '08:00',
        endTime: '10:30',
        dayOfWeek: 'saturday',
        status: 'todo',
        createdAt: new Date().toISOString(),
      };

    triggerNotification(candidate, candidate.reminderMinutesBefore || 15, true);
  }, [tasks, requestNotificationPermission, triggerNotification]);

  // Auto-dismiss active notification after 14 seconds
  useEffect(() => {
    if (!activeNotification) return;
    const timer = setTimeout(() => {
      setActiveNotification(null);
    }, 14000);
    return () => clearTimeout(timer);
  }, [activeNotification]);

  // Reset to default sample data
  const handleResetData = () => {
    setTasks(INITIAL_TASKS);
    setDocs(INITIAL_DOCS);
    setSettings(INITIAL_SETTINGS);
    setSessions(INITIAL_SESSIONS);
  };

  return (
    <div 
      style={{ fontFamily: 'var(--app-font)' }}
      className="min-h-screen flex flex-col bg-neutral-50 dark:bg-slate-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-200"
    >
      {/* Offline Toast Banner */}
      {!isOnline && (
        <div className="bg-amber-600 text-white text-xs py-1.5 px-4 text-center flex items-center justify-center gap-1.5 z-40 sticky top-0">
          <WifiOff className="w-3.5 h-3.5" />
          <span>حالت آفلاین: تمامی داده‌ها در دستگاه شما به صورت محلی ذخیره می‌شوند و بعد از اتصال همگام خواهند شد.</span>
        </div>
      )}

      {/* Top Header Contract */}
      <Header
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenNewTask={() => {
          setEditingTask(null);
          setIsTaskModalOpen(true);
        }}
        onOpenCalendarSync={() => setIsCalendarModalOpen(true)}
        onOpenCloudBackup={() => setIsCloudModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenWidgets={() => setIsWidgetsModalOpen(true)}
        onTestNotification={handleTestNotification}
        notificationPermission={notificationPermission}
        theme={effectiveTheme}
        onToggleTheme={() => {
          const next: AppTheme = effectiveTheme === 'dark' ? 'light' : 'dark';
          setSettings({ ...settings, theme: next });
        }}
        isOnline={isOnline}
      />

      {/* Floating In-App Push Notification Toast */}
      {activeNotification && (
        <div className="fixed top-20 right-4 sm:right-6 left-4 sm:left-auto sm:w-[420px] z-50 animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-2 border-indigo-500/80 dark:border-indigo-500/80 shadow-2xl rounded-2xl p-4 sm:p-5 text-right space-y-3 ring-4 ring-indigo-500/10">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md animate-bounce shrink-0">
                  <BellRing className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                      {activeNotification.task.priority === 'high' ? 'اولویت بالا' : 'کلاس هنرستان'}
                    </span>
                    <span className="text-[11px] text-neutral-400 font-mono tabular-nums">
                      شروع ساعت {activeNotification.task.startTime}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-neutral-900 dark:text-neutral-100 mt-1">
                    {activeNotification.task.title}
                  </h4>
                </div>
              </div>

              <button
                onClick={() => setActiveNotification(null)}
                className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 p-1 rounded-md transition-colors cursor-pointer"
                title="بستن اعلان"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed bg-neutral-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-neutral-200/70 dark:border-neutral-700/60">
              {activeNotification.message}
            </p>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setActiveNotification(null)}
                className="px-3 py-1.5 text-xs text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                متوجه شدم
              </button>
              <button
                type="button"
                onClick={() => {
                  handleStartStudySession(activeNotification.task);
                  setActiveNotification(null);
                }}
                className="px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>شروع مطالعه و تایمر</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 pb-20 md:pb-8">
        {currentTab === 'schedule' && (
          <WeeklySchedule
            tasks={tasks}
            onToggleTaskStatus={handleToggleTaskStatus}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onDeleteAllTasks={handleDeleteAllTasks}
            onResetTasks={handleResetTasksOnly}
            onStartStudySession={handleStartStudySession}
            onOpenNewTaskForDay={handleOpenNewTaskForDay}
            startDayOfWeek={settings.startDayOfWeek}
          />
        )}

        {currentTab === 'timer' && (
          <StudyTimer
            tasks={tasks}
            activeTask={activeTaskForTimer}
            onSessionComplete={handleSessionComplete}
          />
        )}

        {currentTab === 'reader' && (
          <StudyReader
            docs={docs}
            onUpdateDocs={setDocs}
          />
        )}

        {currentTab === 'analytics' && (
          <AnalyticsView
            tasks={tasks}
            sessions={sessions}
          />
        )}

        {currentTab === 'tools' && (
          <OcrVoiceTools
            onAddTask={handleSaveTask}
          />
        )}
      </main>

      {/* Floating Action Button (Quick Capture) */}
      <button
        onClick={() => setIsQuickCaptureOpen(true)}
        title="ثبت سریع یادداشت یا کار (Ctrl+K)"
        className="fixed bottom-6 left-6 z-20 w-12 h-12 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-lg hover:scale-105 transition-all"
      >
        <Zap className="w-5 h-5 fill-current text-amber-300" />
      </button>

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSaveTask={handleSaveTask}
        initialTask={editingTask}
        defaultDay={defaultDayForTask}
      />

      <CalendarSyncModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        tasks={tasks}
      />

      <CloudBackupModal
        isOpen={isCloudModalOpen}
        onClose={() => setIsCloudModalOpen(false)}
        tasks={tasks}
        docs={docs}
        settings={settings}
        sessions={sessions}
        onRestoreData={handleRestoreData}
      />

      <WidgetsModal
        isOpen={isWidgetsModalOpen}
        onClose={() => setIsWidgetsModalOpen(false)}
        tasks={tasks}
      />

      <QuickCaptureModal
        isOpen={isQuickCaptureOpen}
        onClose={() => setIsQuickCaptureOpen(false)}
        onAddTask={handleSaveTask}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onUpdateSettings={setSettings}
        onResetData={handleResetData}
        onDeleteAllTasks={handleDeleteAllTasks}
        onTestNotification={handleTestNotification}
        notificationPermission={notificationPermission}
      />
    </div>
  );
}
