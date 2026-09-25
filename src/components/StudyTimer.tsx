import React, { useState, useEffect, useRef } from 'react';
import { Task, StudySession } from '../types';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  BookOpen, 
  Coffee,
  Brain
} from 'lucide-react';
import { soundManager } from '../utils/audio';

interface StudyTimerProps {
  tasks: Task[];
  activeTask?: Task | null;
  onSessionComplete: (session: StudySession) => void;
  onClose?: () => void;
}

type TimerMode = 'pomodoro' | 'short_break' | 'long_break' | 'deep_study';

export const StudyTimer: React.FC<StudyTimerProps> = ({
  tasks,
  activeTask,
  onSessionComplete,
}) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(activeTask || null);
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);

  // Default minutes for each mode
  const modeDurations: Record<TimerMode, number> = {
    pomodoro: 25 * 60,
    short_break: 5 * 60,
    long_break: 15 * 60,
    deep_study: 50 * 60,
  };

  useEffect(() => {
    if (activeTask) {
      setSelectedTask(activeTask);
    }
  }, [activeTask]);

  // Handle mode change
  const handleSwitchMode = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(modeDurations[newMode]);
  };

  // Timer Tick
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      // Completed!
      setIsRunning(false);
      if (audioEnabled) {
        soundManager.playChime('success');
      }

      // If in study mode, record session
      if (mode === 'pomodoro' || mode === 'deep_study') {
        const duration = mode === 'pomodoro' ? 25 : 50;
        setCompletedPomodoros((prev) => prev + 1);
        onSessionComplete({
          id: `session-${Date.now()}`,
          taskId: selectedTask?.id,
          subject: selectedTask?.subject || selectedTask?.title || 'مطالعه آزاد',
          durationMinutes: duration,
          date: new Date().toISOString(),
          notes: `جلسه تمرکز ${duration} دقیقه‌ای با تکنیک پومودورو`,
        });

        // Request browser notification if permitted
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('جلسه مطالعه به پایان رسید!', {
            body: `آفرین! یک بازه مطالعه با موفقیت ثبت شد. زمان استراحت کوتاه فرا رسیده است.`,
            icon: '/src/assets/images/app_logo_planner_1790330978417.jpg',
          });
        }
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, mode, selectedTask, audioEnabled, onSessionComplete]);

  // Toggle play/pause
  const togglePlay = () => {
    if (!isRunning && audioEnabled) {
      soundManager.playChime('start');
    }
    // Ask notification permission on first interaction
    if (!isRunning && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(modeDurations[mode]);
  };

  // Format MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const totalModeDuration = modeDurations[mode];
  const progressPercent = Math.round(((totalModeDuration - timeLeft) / totalModeDuration) * 100);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Timer Container Card */}
      <div className="bg-white dark:bg-slate-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 sm:p-10 shadow-xs text-center space-y-8">
        {/* Top Controls: Mode Switcher */}
        <div className="inline-flex items-center gap-1 p-1 bg-neutral-100 dark:bg-slate-800/80 rounded-xl text-xs font-medium">
          <button
            onClick={() => handleSwitchMode('pomodoro')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              mode === 'pomodoro'
                ? 'bg-white dark:bg-slate-700 text-neutral-900 dark:text-neutral-100 shadow-2xs font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
            }`}
          >
            <Brain className="w-3.5 h-3.5 text-indigo-500" />
            <span>پومودورو (۲۵ دقیقه)</span>
          </button>

          <button
            onClick={() => handleSwitchMode('deep_study')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              mode === 'deep_study'
                ? 'bg-white dark:bg-slate-700 text-neutral-900 dark:text-neutral-100 shadow-2xs font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-500" />
            <span>تمرکز عمیق (۵۰ دقیقه)</span>
          </button>

          <button
            onClick={() => handleSwitchMode('short_break')}
            className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
              mode === 'short_break'
                ? 'bg-white dark:bg-slate-700 text-neutral-900 dark:text-neutral-100 shadow-2xs font-semibold'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900'
            }`}
          >
            <Coffee className="w-3.5 h-3.5 text-emerald-500" />
            <span>استراحت کوتاه (۵ دقیقه)</span>
          </button>
        </div>

        {/* Selected Task Selector */}
        <div className="max-w-md mx-auto text-right">
          <label className="block text-xs font-medium text-neutral-500 mb-1.5">
            درس یا موضوع هدف این جلسه:
          </label>
          <select
            value={selectedTask?.id || ''}
            onChange={(e) => {
              const found = tasks.find((t) => t.id === e.target.value);
              setSelectedTask(found || null);
            }}
            className="w-full px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-slate-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">مطالعه عمومی و آزاد (بدون انتساب به درس خاص)</option>
            {tasks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title} {t.subject ? `(${t.subject})` : ''} - {t.startTime}
              </option>
            ))}
          </select>
        </div>

        {/* Digital Clock Display with Circular Accent */}
        <div className="relative py-4">
          <div className="text-6xl sm:text-7xl font-bold tracking-tight font-mono tabular-nums text-neutral-900 dark:text-neutral-100 select-none">
            {formatTime(timeLeft)}
          </div>
          <div className="text-xs text-neutral-400 mt-2 font-medium">
            {isRunning ? 'جلسه در حال اجراست... تمرکز کامل' : 'آماده برای شروع مطالعه'}
          </div>

          {/* Minimalist Progress Bar */}
          <div className="w-48 mx-auto mt-4 h-1.5 bg-neutral-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 transition-all duration-300 rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={resetTimer}
            title="شروع مجدد تایمر"
            className="p-3 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={togglePlay}
            className={`px-8 py-3.5 rounded-full font-semibold text-sm transition-all duration-200 shadow-md flex items-center gap-2 ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:scale-[1.02]'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5 fill-current" />
                <span>توقف موقت</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>شروع تمرکز</span>
              </>
            )}
          </button>

          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            title={audioEnabled ? 'صدای زنگ فعال است' : 'بی‌صدا'}
            className="p-3 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            {audioEnabled ? <Volume2 className="w-5 h-5 text-indigo-500" /> : <VolumeX className="w-5 h-5" />}
          </button>
        </div>

        {/* Pomodoros counter & Motivation text */}
        <div className="pt-4 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs text-neutral-500">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>پومودوروهای تکمیل شده امروز:</span>
            <span className="font-bold tabular-nums font-mono text-neutral-900 dark:text-neutral-100">
              {completedPomodoros}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>هر جلسه تمرکز = یک گام نزدیک‌تر به تسلط</span>
          </div>
        </div>
      </div>
    </div>
  );
};
