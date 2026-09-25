import React, { useState } from 'react';
import { StudyDoc, Bookmark, MarginNote } from '../types';
import { 
  BookOpen, 
  Bookmark as BookmarkIcon, 
  BookmarkCheck, 
  FileText, 
  Upload, 
  Moon, 
  Sun, 
  Coffee, 
  Type, 
  StickyNote, 
  Trash2, 
  Plus, 
  ChevronRight, 
  ChevronLeft,
  X
} from 'lucide-react';
import JSZip from 'jszip';

interface StudyReaderProps {
  docs: StudyDoc[];
  onUpdateDocs: (docs: StudyDoc[]) => void;
}

export const StudyReader: React.FC<StudyReaderProps> = ({ docs, onUpdateDocs }) => {
  const [selectedDocId, setSelectedDocId] = useState<string>(docs[0]?.id || '');
  const [readingTheme, setReadingTheme] = useState<'day' | 'sepia' | 'night'>('sepia');
  const [readerFontSize, setReaderFontSize] = useState<number>(16); // px
  const [activeBookmarkTab, setActiveBookmarkTab] = useState<'content' | 'bookmarks' | 'notes'>('content');
  const [newNoteText, setNewNoteText] = useState('');
  const [showAddNote, setShowAddNote] = useState(false);

  const currentDoc = docs.find((d) => d.id === selectedDocId) || docs[0];

  // Upload custom PDF, EPUB or Text files
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (extension === 'epub') {
      try {
        const zip = new JSZip();
        const loadedZip = await zip.loadAsync(file);
        
        let extractedText = '';
        // Extract all xhtml/html chapter texts
        for (const [filename, zipEntry] of Object.entries(loadedZip.files)) {
          if ((filename.endsWith('.xhtml') || filename.endsWith('.html')) && !zipEntry.dir) {
            const content = await zipEntry.async('text');
            // strip html tags
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = content;
            const textContent = tempDiv.textContent || tempDiv.innerText || '';
            if (textContent.trim()) {
              extractedText += `\n\n=== ${filename} ===\n\n` + textContent.trim();
            }
          }
        }

        const newDoc: StudyDoc = {
          id: `doc-${Date.now()}`,
          title: file.name.replace(/\.epub$/i, ''),
          author: 'کتاب الکترونیکی EPUB',
          category: 'کتاب درسی',
          type: 'epub',
          content: extractedText || 'محتوای کتاب استخراج شد اما متنی یافت نشد.',
          totalPages: 10,
          currentPage: 1,
          bookmarks: [],
          notes: [],
          lastReadAt: new Date().toISOString(),
        };

        const updated = [newDoc, ...docs];
        onUpdateDocs(updated);
        setSelectedDocId(newDoc.id);
      } catch (err) {
        console.error('Failed to parse EPUB', err);
        alert('خطا در خواندن فایل EPUB.');
      }
    } else if (extension === 'pdf') {
      const fileUrl = URL.createObjectURL(file);
      const newDoc: StudyDoc = {
        id: `doc-${Date.now()}`,
        title: file.name.replace(/\.pdf$/i, ''),
        author: 'سند PDF',
        category: 'جزوه / مقاله',
        type: 'pdf',
        fileUrl,
        totalPages: 1,
        currentPage: 1,
        bookmarks: [],
        notes: [],
        lastReadAt: new Date().toISOString(),
      };
      const updated = [newDoc, ...docs];
      onUpdateDocs(updated);
      setSelectedDocId(newDoc.id);
    } else {
      // Plain text or markdown
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const newDoc: StudyDoc = {
          id: `doc-${Date.now()}`,
          title: file.name,
          author: 'یادداشت متنی',
          category: 'جزوات',
          type: 'text',
          content: text,
          totalPages: Math.ceil(text.length / 1000) || 1,
          currentPage: 1,
          bookmarks: [],
          notes: [],
          lastReadAt: new Date().toISOString(),
        };
        const updated = [newDoc, ...docs];
        onUpdateDocs(updated);
        setSelectedDocId(newDoc.id);
      };
      reader.readAsText(file);
    }
  };

  // Toggle bookmark on current page
  const handleToggleBookmark = () => {
    if (!currentDoc) return;
    const isBookmarked = currentDoc.bookmarks.some((b) => b.pageNumber === currentDoc.currentPage);

    let updatedBookmarks: Bookmark[];
    if (isBookmarked) {
      updatedBookmarks = currentDoc.bookmarks.filter((b) => b.pageNumber !== currentDoc.currentPage);
    } else {
      const newBm: Bookmark = {
        id: `bm-${Date.now()}`,
        docId: currentDoc.id,
        pageNumber: currentDoc.currentPage,
        title: `نشانه صفحه ${currentDoc.currentPage}`,
        createdAt: new Date().toISOString(),
      };
      updatedBookmarks = [...currentDoc.bookmarks, newBm];
    }

    const updatedDoc: StudyDoc = { ...currentDoc, bookmarks: updatedBookmarks };
    onUpdateDocs(docs.map((d) => (d.id === currentDoc.id ? updatedDoc : d)));
  };

  // Add margin note
  const handleAddNote = () => {
    if (!currentDoc || !newNoteText.trim()) return;

    const newNote: MarginNote = {
      id: `note-${Date.now()}`,
      docId: currentDoc.id,
      pageNumber: currentDoc.currentPage,
      noteText: newNoteText.trim(),
      createdAt: new Date().toISOString(),
    };

    const updatedDoc: StudyDoc = {
      ...currentDoc,
      notes: [...currentDoc.notes, newNote],
    };

    onUpdateDocs(docs.map((d) => (d.id === currentDoc.id ? updatedDoc : d)));
    setNewNoteText('');
    setShowAddNote(false);
  };

  // Delete note
  const handleDeleteNote = (noteId: string) => {
    if (!currentDoc) return;
    const updatedDoc: StudyDoc = {
      ...currentDoc,
      notes: currentDoc.notes.filter((n) => n.id !== noteId),
    };
    onUpdateDocs(docs.map((d) => (d.id === currentDoc.id ? updatedDoc : d)));
  };

  // Turn page
  const handlePageChange = (delta: number) => {
    if (!currentDoc) return;
    const newPage = Math.min(Math.max(1, currentDoc.currentPage + delta), currentDoc.totalPages);
    const updatedDoc: StudyDoc = { ...currentDoc, currentPage: newPage };
    onUpdateDocs(docs.map((d) => (d.id === currentDoc.id ? updatedDoc : d)));
  };

  // Theme-specific styles for eye strain prevention
  const themeClasses = {
    day: 'bg-white text-neutral-900 border-neutral-200',
    sepia: 'bg-[#fbf7ee] text-[#3d3326] border-[#e8dfcf]',
    night: 'bg-[#18181b] text-[#e4e4e7] border-[#27272a]',
  }[readingTheme];

  const isCurrentPageBookmarked = currentDoc?.bookmarks.some((b) => b.pageNumber === currentDoc.currentPage);

  return (
    <div className="space-y-4">
      {/* Top Document Selector Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-2xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <BookOpen className="w-4 h-4 text-indigo-500 shrink-0" />
          <span className="text-xs font-semibold text-neutral-500 shrink-0">کتابخانه:</span>
          {docs.map((doc) => (
            <button
              key={doc.id}
              onClick={() => setSelectedDocId(doc.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                selectedDocId === doc.id
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              {doc.title}
            </button>
          ))}
        </div>

        {/* Upload Button */}
        <label className="cursor-pointer shrink-0 px-3 py-1.5 text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-lg border border-indigo-200 dark:border-indigo-800 flex items-center justify-center gap-1.5 transition-colors">
          <Upload className="w-3.5 h-3.5" />
          <span>بارگذاری PDF / EPUB / متن</span>
          <input
            type="file"
            accept=".pdf,.epub,.txt,.md"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Main Reader View */}
      {currentDoc && (
        <div className={`rounded-2xl border transition-colors duration-200 overflow-hidden shadow-xs ${themeClasses}`}>
          {/* Reader Top Controls Toolbar */}
          <div className="px-4 py-3 border-b border-inherit flex flex-wrap items-center justify-between gap-3 bg-black/5 dark:bg-white/5">
            {/* Title & Page count */}
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm truncate max-w-xs">{currentDoc.title}</span>
              <span aria-hidden="true" className="opacity-40">·</span>
              <span className="text-xs opacity-75 font-mono tabular-nums">
                صفحه {currentDoc.currentPage} از {currentDoc.totalPages}
              </span>
            </div>

            {/* Reading Modes & Font controls */}
            <div className="flex items-center gap-2">
              {/* Eye Comfort Modes: Day / Sepia / Night */}
              <div className="flex items-center gap-1 p-0.5 rounded-lg border border-inherit">
                <button
                  onClick={() => setReadingTheme('day')}
                  title="حالت روز (روشن)"
                  className={`p-1.5 rounded-md transition-colors ${readingTheme === 'day' ? 'bg-black/10 dark:bg-white/10' : 'opacity-60'}`}
                >
                  <Sun className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setReadingTheme('sepia')}
                  title="حالت کاهی Sepia (کاهش خستگی چشم)"
                  className={`p-1.5 rounded-md transition-colors ${readingTheme === 'sepia' ? 'bg-amber-600/20 text-amber-900 font-bold' : 'opacity-60'}`}
                >
                  <Coffee className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setReadingTheme('night')}
                  title="حالت شب (تاریک)"
                  className={`p-1.5 rounded-md transition-colors ${readingTheme === 'night' ? 'bg-black/20 text-indigo-400' : 'opacity-60'}`}
                >
                  <Moon className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Font Size Changer */}
              <div className="flex items-center gap-1 text-xs">
                <button
                  onClick={() => setReaderFontSize((prev) => Math.max(12, prev - 2))}
                  className="px-2 py-1 rounded border border-inherit opacity-75 hover:opacity-100"
                  title="کاهش اندازه قلم"
                >
                  A-
                </button>
                <span className="tabular-nums font-mono px-1">{readerFontSize}</span>
                <button
                  onClick={() => setReaderFontSize((prev) => Math.min(26, prev + 2))}
                  className="px-2 py-1 rounded border border-inherit opacity-75 hover:opacity-100"
                  title="افزایش اندازه قلم"
                >
                  A+
                </button>
              </div>

              {/* Bookmark Toggle */}
              <button
                onClick={handleToggleBookmark}
                title={isCurrentPageBookmarked ? 'حذف نشانه از این صفحه' : 'نشانه‏گذاری این صفحه'}
                className="p-1.5 rounded-lg border border-inherit transition-colors flex items-center gap-1 text-xs"
              >
                {isCurrentPageBookmarked ? (
                  <>
                    <BookmarkCheck className="w-4 h-4 text-amber-600 fill-current" />
                    <span>نشانه‌دار</span>
                  </>
                ) : (
                  <>
                    <BookmarkIcon className="w-4 h-4 opacity-60" />
                    <span>افزودن نشانه</span>
                  </>
                )}
              </button>

              {/* Add Note Button */}
              <button
                onClick={() => setShowAddNote(!showAddNote)}
                className="p-1.5 rounded-lg border border-inherit transition-colors flex items-center gap-1 text-xs"
              >
                <StickyNote className="w-4 h-4 opacity-75" />
                <span>یادداشت متنی</span>
              </button>
            </div>
          </div>

          {/* Quick Note Input Overlay */}
          {showAddNote && (
            <div className="p-4 border-b border-inherit bg-black/5 dark:bg-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold">ثبت یادداشت حین مطالعه (صفحه {currentDoc.currentPage}):</span>
                <button onClick={() => setShowAddNote(false)} className="opacity-60 hover:opacity-100">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <textarea
                rows={2}
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                placeholder="نکته، خلاصه فرمول یا سوالی که در این صفحه برایتان پیش آمد..."
                className="w-full p-2.5 rounded-lg border border-inherit bg-transparent text-xs focus:outline-none"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleAddNote}
                  className="px-4 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg shadow-2xs"
                >
                  ذخیره یادداشت
                </button>
              </div>
            </div>
          )}

          {/* Reader Content Body */}
          <div className="grid grid-cols-1 lg:grid-cols-4 min-h-[500px]">
            {/* Main Reading Area (3 Columns) */}
            <div className="lg:col-span-3 p-6 sm:p-10 overflow-y-auto max-h-[70vh]">
              {currentDoc.type === 'pdf' && currentDoc.fileUrl ? (
                <iframe
                  src={currentDoc.fileUrl}
                  title={currentDoc.title}
                  className="w-full h-[650px] rounded-lg border border-inherit"
                />
              ) : (
                <div
                  style={{ fontSize: `${readerFontSize}px`, lineHeight: 1.8 }}
                  className="whitespace-pre-line leading-relaxed font-serif text-justify select-text"
                >
                  {currentDoc.content || 'محتوای متنی وجود ندارد.'}
                </div>
              )}
            </div>

            {/* Sidebar: Bookmarks & Margin Notes (1 Column) */}
            <div className="border-t lg:border-t-0 lg:border-r border-inherit p-4 space-y-4 bg-black/2 dark:bg-white/2">
              <div className="flex items-center justify-between text-xs border-b border-inherit pb-2">
                <span className="font-bold flex items-center gap-1.5">
                  <StickyNote className="w-3.5 h-3.5 text-indigo-500" />
                  <span>نشانه‌ها و یادداشت‌ها</span>
                </span>
                <span className="opacity-60 text-[11px] font-mono tabular-nums">
                  {currentDoc.bookmarks.length} نشانه · {currentDoc.notes.length} یادداشت
                </span>
              </div>

              {/* Bookmarks List */}
              <div className="space-y-2">
                <div className="text-[11px] font-semibold opacity-75">نشانه‌های ثبت شده:</div>
                {currentDoc.bookmarks.length === 0 ? (
                  <p className="text-[11px] opacity-50">هنوز نشانه‌ای برای این کتاب ثبت نشده.</p>
                ) : (
                  currentDoc.bookmarks.map((bm) => (
                    <div
                      key={bm.id}
                      className="p-2 rounded-lg border border-inherit text-xs flex items-center justify-between bg-black/5 dark:bg-white/5"
                    >
                      <span className="truncate">{bm.title}</span>
                      <span className="text-[10px] font-mono opacity-60">ص {bm.pageNumber}</span>
                    </div>
                  ))
                )}
              </div>

              {/* Notes List */}
              <div className="space-y-2 pt-2 border-t border-inherit">
                <div className="text-[11px] font-semibold opacity-75">یادداشت‌های متنی شما:</div>
                {currentDoc.notes.length === 0 ? (
                  <p className="text-[11px] opacity-50">یادداشتی ثبت نشده است.</p>
                ) : (
                  currentDoc.notes.map((note) => (
                    <div
                      key={note.id}
                      className="p-2.5 rounded-lg border border-inherit text-xs space-y-1 bg-black/5 dark:bg-white/5"
                    >
                      <div className="flex items-center justify-between text-[10px] opacity-60">
                        <span>صفحه {note.pageNumber}</span>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="hover:text-rose-500 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="leading-relaxed text-inherit">{note.noteText}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Reader Pagination Footer */}
          <div className="px-6 py-3 border-t border-inherit flex items-center justify-between text-xs bg-black/5 dark:bg-white/5">
            <button
              onClick={() => handlePageChange(-1)}
              disabled={currentDoc.currentPage <= 1}
              className="px-3 py-1.5 rounded-lg border border-inherit disabled:opacity-30 flex items-center gap-1 hover:bg-black/5"
            >
              <ChevronRight className="w-4 h-4" />
              <span>صفحه قبل</span>
            </button>

            <span className="font-mono tabular-nums opacity-75">
              صفحه {currentDoc.currentPage} از {currentDoc.totalPages}
            </span>

            <button
              onClick={() => handlePageChange(1)}
              disabled={currentDoc.currentPage >= currentDoc.totalPages}
              className="px-3 py-1.5 rounded-lg border border-inherit disabled:opacity-30 flex items-center gap-1 hover:bg-black/5"
            >
              <span>صفحه بعد</span>
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
