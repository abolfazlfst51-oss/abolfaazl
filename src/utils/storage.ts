import { Task, StudyDoc, UserSettings, StudySession } from '../types';

const STORAGE_KEYS = {
  TASKS: 'planner_tasks_v3_tenth_cs',
  DOCS: 'planner_docs_v3_tenth_cs',
  SETTINGS: 'planner_settings_v3_tenth_cs',
  SESSIONS: 'planner_sessions_v3_tenth_cs',
  QUICK_NOTES: 'planner_quick_notes_v3_tenth_cs',
};

export const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'کارگاه تولید محتوای الکترونیک و برنامه‌سازی',
    description: 'پودمان ۲: مفاهیم الگوریتم، فلوچارت و ساختارهای کنترلی در زبان پایتون/سی‌شارپ',
    category: 'class',
    dayOfWeek: 'saturday',
    startTime: '08:00',
    endTime: '11:30',
    priority: 'high',
    status: 'completed',
    reminderEnabled: true,
    reminderMinutesBefore: 15,
    subject: 'برنامه‌سازی و تولید محتوا',
    studyMinutesTarget: 180,
    tags: ['هنرستان', 'کارگاه تخصصی', 'پودمان ۲'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-2',
    title: 'تمرین کدنویسی پایتون و حل مسائل فلوچارت',
    description: 'پیاده‌سازی برنامه‌های حلقه و شرط در محیط VS Code و ارسال پروژه کارگاهی',
    category: 'study',
    dayOfWeek: 'saturday',
    startTime: '16:00',
    endTime: '17:30',
    priority: 'high',
    status: 'in_progress',
    reminderEnabled: true,
    reminderMinutesBefore: 15,
    subject: 'برنامه‌سازی و تولید محتوا',
    studyMinutesTarget: 90,
    tags: ['کدنویسی', 'تکلیف هنرستان'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-3',
    title: 'کارگاه پیاده‌سازی سیستم‌های اطلاعاتی و طراحی وب',
    description: 'آموزش تگ‌های معنایی HTML5، استایل‌دهی با CSS و چیدمان ریسپانسیو فرم‌ها',
    category: 'class',
    dayOfWeek: 'sunday',
    startTime: '08:00',
    endTime: '12:00',
    priority: 'high',
    status: 'todo',
    reminderEnabled: true,
    reminderMinutesBefore: 20,
    subject: 'طراحی وب و سیستم‌های اطلاعاتی',
    studyMinutesTarget: 180,
    tags: ['طراحی وب', 'کارگاه تخصصی'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-4',
    title: 'تکمیل پروژه طراحی سایت شخصی با HTML و CSS',
    description: 'طراحی لایه Navigation Bar و بخش مقالات به همراه فایل style.css',
    category: 'work',
    dayOfWeek: 'sunday',
    startTime: '17:00',
    endTime: '19:00',
    priority: 'medium',
    status: 'todo',
    reminderEnabled: true,
    reminderMinutesBefore: 15,
    subject: 'طراحی وب و سیستم‌های اطلاعاتی',
    studyMinutesTarget: 120,
    tags: ['پروژه', 'HTML/CSS'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-5',
    title: 'کلاس ریاضی ۱ هنرستان (فنی و حرفه‌ای)',
    description: 'پودمان ۲: توابع، خط و معادله درجه دوم با کاربرد در محاسبات گرافیک کامپیوتری',
    category: 'class',
    dayOfWeek: 'monday',
    startTime: '09:00',
    endTime: '11:00',
    priority: 'medium',
    status: 'todo',
    reminderEnabled: true,
    reminderMinutesBefore: 15,
    subject: 'ریاضی ۱ هنرستان',
    studyMinutesTarget: 90,
    tags: ['عمومی', 'پایه دهم'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-6',
    title: 'کارگاه نصب و راه‌اندازی سیستم‌های رایانه‌ای (سخت‌افزار)',
    description: 'شناسایی قطعات مادربرد، اسمبل کیس، نصب ویندوز و پیکربندی درایورها',
    category: 'class',
    dayOfWeek: 'tuesday',
    startTime: '08:00',
    endTime: '11:30',
    priority: 'high',
    status: 'todo',
    reminderEnabled: true,
    reminderMinutesBefore: 15,
    subject: 'سخت‌افزار و سیستم‌های رایانه‌ای',
    studyMinutesTarget: 180,
    tags: ['سخت‌افزار', 'کارگاهی'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-7',
    title: 'ارزشیابی پودمان اول درس تولید محتوا',
    description: 'آزمون عملی کارگاهی ساخت کلیپ و ویرایش تصویر با نرم‌افزارهای گرافیکی',
    category: 'exam',
    dayOfWeek: 'wednesday',
    startTime: '10:00',
    endTime: '11:30',
    priority: 'high',
    status: 'todo',
    reminderEnabled: true,
    reminderMinutesBefore: 60,
    subject: 'برنامه‌سازی و تولید محتوا',
    studyMinutesTarget: 90,
    tags: ['ارزشیابی', 'امتحان کارگاهی'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-8',
    title: 'مرور لغات تخصصی انگلیسی کامپیوتر و شبکه',
    description: 'واژگان کلیدی مادربرد، CPU، شبکه و اینترنت از کتاب زبان دهم هنرستان',
    category: 'review',
    dayOfWeek: 'thursday',
    startTime: '18:00',
    endTime: '19:00',
    priority: 'low',
    status: 'todo',
    reminderEnabled: true,
    reminderMinutesBefore: 15,
    subject: 'زبان انگلیسی تخصصی',
    studyMinutesTarget: 60,
    tags: ['زبان تخصصی', 'مرور'],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'task-9',
    title: 'جمع‌بندی هفتگی پروژه‌های کارگاهی و گیت‌هاب',
    description: 'مرور کدهای پایتون و طراحی وب، بک‌آپ‌گیری از تکالیف در فلش مموری',
    category: 'review',
    dayOfWeek: 'friday',
    startTime: '16:00',
    endTime: '17:30',
    priority: 'medium',
    status: 'todo',
    reminderEnabled: true,
    reminderMinutesBefore: 30,
    subject: 'جمع‌بندی پروژه‌ها',
    studyMinutesTarget: 90,
    tags: ['برنامه‌ریزی', 'بک‌آپ'],
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_DOCS: StudyDoc[] = [
  {
    id: 'doc-vocational-cs',
    title: 'جزوه طلایی پودمان ۲ طراحی صفحات وب (دهم هنرستان)',
    author: 'گروه آموزشی کامپیوتر هنرستان فنی و حرفه‌ای',
    category: 'کتاب‌های تخصصی کامپیوتر',
    type: 'text',
    totalPages: 3,
    currentPage: 1,
    content: `# جزوه خلاصه پودمان ۲: طراحی صفحات وب (HTML5 و CSS)
رشته شبکه و نرم‌افزار رایانه - پایه دهم هنرستان

## بخش ۱: ساختار استاندارد فایل HTML
هر سند وب با اعلام نوع سند شروع می‌شود:
\`\`\`html
<!DOCTYPE html>
<html lang="fa" dir="rtl">
  <head>
    <meta charset="UTF-8">
    <title>پروژه کارگاهی دهم</title>
    <link rel="stylesheet" href="style.css">
  </head>
  <body>
    <header><h1>وبلاگ کامپیوتر هنرستان</h1></header>
    <main>محتوای اصلی تمرین</main>
  </body>
</html>
\`\`\`

---

## بخش ۲: تگ‌های پرکاربرد کارگاه هنرستان
- **تگ <a>**: ایجاد ابرپیوند و لینک به صفحات دیگر با ویژگی href
- **تگ <img>**: افزودن تصویر با ویژگی‌های src و alt (متن جایگزین)
- **تگ <div> و <section>**: بخش‌بندی ساختار صفحه برای اعمال استایل
- **تگ <form>**: ایجاد فرم‌های ورود، ثبت‌نام و دریافت اطلاعات کاربری

---

## بخش ۳: نکات کلیدی CSS برای ارزشیابی کارگاهی
۱. **نحوه اتصال فایل CSS**:
استفاده از روش External با تگ <link> در هدر صفحه بهترین روش استاندارد است.

۲. **مدل جعبه‌ای (Box Model)**:
شامل ۴ بخش اصلی:
- Content (محتوا)
- Padding (فاصله داخلی)
- Border (کادر دور)
- Margin (فاصله بیرونی از عناصر مجاور)

نکته امتحانی: برای ریست کردن فاصله‌های پیش‌فرض مرورگر همواره از دستور زیر در ابتدای فایل CSS استفاده کنید:
\`\`\`css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
\`\`\``,
    bookmarks: [
      { id: 'b1', docId: 'doc-vocational-cs', pageNumber: 2, title: 'تگ‌های پرکاربرد HTML', createdAt: new Date().toISOString() },
    ],
    notes: [
      { id: 'n1', docId: 'doc-vocational-cs', pageNumber: 3, noteText: 'نکته باکس مدل و box-sizing حتماً در آزمون پودمان ۲ هنرستان می‌آید.', createdAt: new Date().toISOString() },
    ],
    lastReadAt: new Date().toISOString(),
  },
  {
    id: 'doc-python-basics',
    title: 'راهنمای سریع الگوریتم و کدنویسی پایتون (تولید محتوا)',
    author: 'دبیرخانه کشوری کامپیوتر',
    category: 'برنامه‌نویسی هنرستان',
    type: 'text',
    totalPages: 2,
    currentPage: 1,
    content: `# مفاهیم کلیدی پودمان برنامه‌سازی و الگوریتم - دهم کامپیوتر

## دستورات ورودی و خروجی در پایتون:
برای چاپ پیام در خروجی:
\`print("سلام به دنیای برنامه‌نویسی!")\`

برای دریافت ورودی از کاربر:
\`name = input("نام خود را وارد کنید: ")\`
\`age = int(input("سن خود را وارد کنید: "))\`

---

## ساختار شرطی if-else:
\`\`\`python
score = float(input("نمره کارگاه را وارد کنید: "))
if score >= 12:
    print("شایستگی احراز شد (قبول)")
else:
    print("نیاز به تلاش مجدد در پودمان")
\`\`\`

نکته کارگاهی: در پایتون، تورفتگی (Indentation) برای مشخص کردن بلوک‌های دستورات الزامی است و نبود آن خطای SyntaxError می‌دهد.`,
    bookmarks: [],
    notes: [],
    lastReadAt: new Date().toISOString(),
  }
];

export const INITIAL_SETTINGS: UserSettings = {
  theme: 'system',
  autoNightMode: true,
  accentColor: 'indigo',
  fontSize: 'base',
  persianFont: 'vazirmatn',
  startDayOfWeek: 'saturday',
  syncToken: Math.random().toString(36).substring(2, 10).toUpperCase(),
  soundAlertsEnabled: true,
  pushNotificationsEnabled: true,
};

export const INITIAL_SESSIONS: StudySession[] = [
  { id: 's1', subject: 'طراحی وب و سیستم‌های اطلاعاتی', durationMinutes: 90, date: new Date(Date.now() - 86400000 * 2).toISOString(), notes: 'کدنویسی تگ‌های فرم و سلکتورهای CSS' },
  { id: 's2', subject: 'برنامه‌سازی و تولید محتوا', durationMinutes: 100, date: new Date(Date.now() - 86400000 * 1).toISOString(), notes: 'پیاده‌سازی الگوریتم و حلقه‌های پایتون' },
  { id: 's3', subject: 'سخت‌افزار و سیستم‌های رایانه‌ای', durationMinutes: 60, date: new Date().toISOString(), notes: 'بررسی درگاه‌های مادربرد و انواع حافظه RAM' },
  { id: 's4', subject: 'ریاضی ۱ هنرستان', durationMinutes: 75, date: new Date().toISOString(), notes: 'حل تمرینات پودمان دوم معادله خط' },
];

export function loadTasksFromStorage(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.TASKS);
    if (!raw) return INITIAL_TASKS;
    return JSON.parse(raw);
  } catch {
    return INITIAL_TASKS;
  }
}

export function saveTasksToStorage(tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save tasks', e);
  }
}

export function loadDocsFromStorage(): StudyDoc[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.DOCS);
    if (!raw) return INITIAL_DOCS;
    return JSON.parse(raw);
  } catch {
    return INITIAL_DOCS;
  }
}

export function saveDocsToStorage(docs: StudyDoc[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DOCS, JSON.stringify(docs));
  } catch (e) {
    console.error('Failed to save docs', e);
  }
}

export function loadSettingsFromStorage(): UserSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return INITIAL_SETTINGS;
    return { ...INITIAL_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return INITIAL_SETTINGS;
  }
}

export function saveSettingsToStorage(settings: UserSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}

export function loadSessionsFromStorage(): StudySession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    if (!raw) return INITIAL_SESSIONS;
    return JSON.parse(raw);
  } catch {
    return INITIAL_SESSIONS;
  }
}

export function saveSessionsToStorage(sessions: StudySession[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
  } catch (e) {
    console.error('Failed to save sessions', e);
  }
}
