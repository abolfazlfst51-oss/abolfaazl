import { Task, DayOfWeek } from '../types';

// Convert DayOfWeek to closest future date in current or next week
export function getNextDateForDay(day: DayOfWeek): Date {
  const dayIndexMap: Record<DayOfWeek, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };

  const targetDay = dayIndexMap[day];
  const now = new Date();
  const currentDay = now.getDay();
  let diff = targetDay - currentDay;
  if (diff < 0) {
    diff += 7;
  }
  const targetDate = new Date(now);
  targetDate.setDate(now.getDate() + diff);
  return targetDate;
}

// Format Date object to ICS string: YYYYMMDDTHHMMSSZ
function formatIcsDate(date: Date): string {
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const y = date.getUTCFullYear();
  const m = pad(date.getUTCMonth() + 1);
  const d = pad(date.getUTCDate());
  const h = pad(date.getUTCHours());
  const min = pad(date.getUTCMinutes());
  const s = pad(date.getUTCSeconds());
  return `${y}${m}${d}T${h}${min}${s}Z`;
}

// Generate RFC 5545 standard .ics calendar file for mobile phone import
export function generateIcsCalendar(tasks: Task[], calendarTitle = 'برنامه هفتگی و مطالعه'): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//WeeklyStudyPlanner//SmartPlanner//FA',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${calendarTitle}`,
    'X-WR-TIMEZONE:Asia/Tehran',
  ];

  for (const task of tasks) {
    const baseDate = getNextDateForDay(task.dayOfWeek);
    
    // Parse start and end times
    const [startH, startM] = (task.startTime || '09:00').split(':').map(Number);
    const [endH, endM] = (task.endTime || '10:00').split(':').map(Number);

    const startDate = new Date(baseDate);
    startDate.setHours(startH || 9, startM || 0, 0, 0);

    const endDate = new Date(baseDate);
    endDate.setHours(endH || startH + 1, endM || startM, 0, 0);

    const uid = `${task.id}@studyplanner.app`;
    const dtStamp = formatIcsDate(new Date());
    const dtStart = formatIcsDate(startDate);
    const dtEnd = formatIcsDate(endDate);

    const categoryNames: Record<string, string> = {
      study: 'درس و مطالعه',
      class: 'کلاس درس',
      exam: 'امتحان و آزمون',
      work: 'کار و پروژه',
      personal: 'کارهای شخصی',
      review: 'مرور هوشمند',
    };

    const categoryFa = categoryNames[task.category] || 'برنامه هفتگی';
    const description = `${task.description || ''}\\nدسته‌بندی: ${categoryFa}\\nالویت: ${task.priority}`;

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${dtStamp}`);
    lines.push(`DTSTART:${dtStart}`);
    lines.push(`DTEND:${dtEnd}`);
    lines.push(`SUMMARY:${task.title} [${categoryFa}]`);
    lines.push(`DESCRIPTION:${description}`);
    lines.push(`STATUS:${task.status === 'completed' ? 'COMPLETED' : 'CONFIRMED'}`);

    // If reminder is enabled, add a phone alarm
    if (task.reminderEnabled) {
      const minutes = task.reminderMinutesBefore || 15;
      lines.push('BEGIN:VALARM');
      lines.push(`TRIGGER:-PT${minutes}M`);
      lines.push('ACTION:DISPLAY');
      lines.push(`DESCRIPTION:یادآور: ${task.title}`);
      lines.push('END:VALARM');
    }

    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

// Download .ics file directly to device
export function downloadIcsFile(tasks: Task[], filename = 'weekly-study-schedule.ics'): void {
  const icsData = generateIcsCalendar(tasks);
  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Create direct Google Calendar web event URL
export function createGoogleCalendarUrl(task: Task): string {
  const baseDate = getNextDateForDay(task.dayOfWeek);
  const [startH, startM] = (task.startTime || '09:00').split(':').map(Number);
  const [endH, endM] = (task.endTime || '10:00').split(':').map(Number);

  const startDate = new Date(baseDate);
  startDate.setHours(startH || 9, startM || 0, 0, 0);

  const endDate = new Date(baseDate);
  endDate.setHours(endH || startH + 1, endM || startM, 0, 0);

  const formatGoogleDate = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, '');

  const dates = `${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`;
  const title = encodeURIComponent(task.title);
  const details = encodeURIComponent(
    `${task.description || ''}\nدسته‌بندی: ${task.category}\nاولویت: ${task.priority}`
  );

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}`;
}
