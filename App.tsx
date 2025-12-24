
import React, { useState, useEffect, useRef } from 'react';
import { Appointment, CaseType, CASE_TYPE_LABELS_AR, CASE_GROUPS } from './types';
import AppointmentCard from './components/AppointmentCard';
import ManualEntryModal from './components/ManualEntryModal';
import ConfirmModal from './components/ConfirmModal';
import WeeklyCalendar from './components/WeeklyCalendar';
import NotificationToast, { NotificationType } from './components/NotificationToast';
import NotificationPermissionModal from './components/NotificationPermissionModal';
import ArchiveModal from './components/ArchiveModal';
import { 
  Calendar as CalendarIcon, 
  Bell, 
  BellOff, 
  Scale, 
  Plus, 
  Settings, 
  Search, 
  Moon, 
  Sun, 
  Upload, 
  FileSpreadsheet, 
  Smartphone, 
  X, 
  Building2, 
  Clock,
  Home,
  User as UserIcon,
  ShieldCheck,
  Archive,
  ChevronRight,
  ChevronDown,
  Layout,
  Database,
  History,
  CalendarPlus
} from 'lucide-react';

const STORAGE_KEY = 'lexschedule_appointments';
const NOTIF_PREF_KEY = 'lexschedule_notifications_enabled';
const DARK_MODE_KEY = 'lexschedule_dark_mode';
const COMMERCIAL_MODE_KEY = 'lexschedule_commercial_mode';
const NOTIFIED_IDS_KEY = 'lexschedule_notified_ids';

// --- Utility: Haptic Feedback ---
const hapticFeedback = (intensity: 'light' | 'medium' | 'heavy' = 'light') => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    const patterns = {
      light: 10,
      medium: 20,
      heavy: 40
    };
    navigator.vibrate(patterns[intensity]);
  }
};

// --- Helper Functions for Navigation ---
// Push state to history to enable hardware back button support on Android/Mobile
const openModalWithHistory = (setter: (val: boolean) => void) => {
  window.history.pushState({ modalOpen: true }, '', window.location.href);
  setter(true);
};

// --- Helper Components ---

const ToggleSwitch = ({ isOn, onToggle }: { isOn: boolean; onToggle: () => void }) => (
  <button 
    onClick={(e) => {
      e.stopPropagation();
      hapticFeedback('light');
      onToggle();
    }}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shrink-0 ${
      isOn ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
    }`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
        isOn ? '-translate-x-6' : '-translate-x-1'
      }`}
    />
  </button>
);

const SettingsGroup = ({ title, icon: Icon, children, defaultOpen = false }: { title: string, icon: any, children?: React.ReactNode, defaultOpen?: boolean }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden mb-3 bg-white dark:bg-slate-900/50 transition-colors">
       <button 
         onClick={() => {
           hapticFeedback('light');
           setIsOpen(!isOpen);
         }}
         className="w-full flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
       >
          <div className="flex items-center gap-3">
             <div className="text-slate-500 dark:text-slate-400">
               <Icon className="w-5 h-5" />
             </div>
             <span className="font-bold text-sm text-slate-700 dark:text-slate-200">{title}</span>
          </div>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
       </button>
       <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="p-4 space-y-4 border-t border-slate-50 dark:border-slate-800/50">
            {children}
          </div>
       </div>
    </div>
  );
};

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  notificationsEnabled: boolean;
  toggleNotifications: () => void;
  commercialMode: boolean;
  setCommercialMode: (val: boolean) => void;
  onExportCSV: () => void;
  onImportCSV: () => void;
  onExportCalendar: () => void;
  onOpenArchive: () => void;
  installPrompt: any;
  onInstall: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
  isOpen, 
  onClose, 
  darkMode, 
  setDarkMode, 
  notificationsEnabled,
  toggleNotifications,
  commercialMode,
  setCommercialMode,
  onExportCSV,
  onImportCSV,
  onExportCalendar,
  onOpenArchive,
  installPrompt,
  onInstall
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[90] bg-black/40 backdrop-blur-sm transition-opacity duration-300" onClick={onClose} />
      <div 
        className="fixed z-[100] bg-white dark:bg-slate-900 shadow-2xl transition-all inset-x-0 bottom-0 rounded-t-[2.5rem] p-6 pb-safe max-h-[92vh] overflow-y-auto scrollbar-hide border-t border-slate-100 dark:border-slate-800 animate-slideUp md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md md:rounded-3xl md:p-6 md:border md:border-slate-200 md:dark:border-slate-700"
        onClick={(e) => e.stopPropagation()} dir="rtl"
      >
        <div className="md:hidden w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-6"></div>
        <div className="flex items-center justify-between pb-4 border-b border-slate-50 dark:border-slate-800 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-2.5 rounded-2xl text-indigo-600 dark:text-indigo-400">
              <Settings className="w-6 h-6" />
            </div>
            <h3 className="font-black text-slate-800 dark:text-slate-200 text-xl tracking-tight">الإعدادات</h3>
          </div>
          <button onClick={() => { hapticFeedback('light'); onClose(); }} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors active:scale-90"><X className="w-6 h-6 text-slate-400" /></button>
        </div>
        <div className="space-y-1">
          <SettingsGroup title="التفضيلات" icon={Layout} defaultOpen={true}>
              <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg text-slate-600 dark:text-slate-300">{darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}</div>
                     <span className="text-sm font-bold text-slate-700 dark:text-slate-300">الوضع الليلي</span>
                  </div>
                  <ToggleSwitch isOn={darkMode} onToggle={() => setDarkMode(!darkMode)} />
              </div>
              <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="bg-cyan-50 dark:bg-cyan-900/20 p-2 rounded-lg text-cyan-600 dark:text-cyan-400"><Building2 className="w-4 h-4" /></div>
                     <span className="text-sm font-bold text-slate-700 dark:text-slate-300">قضايا تجارية</span>
                  </div>
                  <ToggleSwitch isOn={commercialMode} onToggle={() => setCommercialMode(!commercialMode)} />
              </div>
              {installPrompt && (
                  <button onClick={() => { hapticFeedback('medium'); onClose(); onInstall(); }} className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-sm font-bold transition-all hover:bg-indigo-100 border border-indigo-100 dark:border-indigo-800/30 active:scale-95"><Smartphone className="w-4 h-4" />تثبيت التطبيق على الجهاز</button>
              )}
          </SettingsGroup>
          <SettingsGroup title="التنبيهات" icon={Bell} defaultOpen={true}>
               <div className="flex items-center justify-between cursor-pointer" onClick={toggleNotifications}>
                  <div className="flex items-center gap-3">
                     <div className={`p-2 rounded-lg transition-colors ${notificationsEnabled ? 'bg-green-100 dark:bg-green-900/20 text-green-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>{notificationsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}</div>
                     <div className="flex flex-col"><span className="text-sm font-bold text-slate-700 dark:text-slate-300">تفعيل الإشعارات</span><span className="text-[10px] text-slate-500 dark:text-slate-400">تنبيه قبل 24 ساعة من الموعد</span></div>
                  </div>
                  <ToggleSwitch isOn={notificationsEnabled} onToggle={toggleNotifications} />
              </div>
          </SettingsGroup>
          <SettingsGroup title="إدارة البيانات" icon={Database}>
              <button onClick={() => { hapticFeedback('medium'); onClose(); onOpenArchive(); }} className="w-full flex items-center justify-between p-3.5 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-800/30 hover:bg-amber-100 dark:hover:bg-amber-900/20 transition-all active:scale-98 group mb-3">
                  <div className="flex items-center gap-3"><div className="bg-amber-100 dark:bg-amber-900/40 p-1.5 rounded-lg text-amber-600 dark:text-amber-400"><Archive className="w-4 h-4" /></div><span className="text-sm font-bold text-slate-700 dark:text-slate-300">الأرشيف (القضايا المنتهية)</span></div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:-translate-x-1 transition-transform rotate-180" />
              </button>
              
              <button onClick={() => { hapticFeedback('medium'); onClose(); onExportCalendar(); }} className="w-full flex items-center gap-3 p-3.5 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-800/30 hover:bg-blue-100 dark:hover:bg-blue-900/20 transition-all active:scale-98 mb-3">
                  <div className="bg-blue-100 dark:bg-blue-900/40 p-1.5 rounded-lg text-blue-600 dark:text-blue-400"><CalendarPlus className="w-4 h-4" /></div>
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">إضافة الكل للتقويم</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">تصدير جميع الجلسات لـ Google/Apple Calendar</span>
                  </div>
              </button>

              <div className="grid grid-cols-2 gap-3 pt-1">
                   <button onClick={() => { hapticFeedback('light'); onClose(); onImportCSV(); }} className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 active:scale-95 transition-all"><Upload className="w-5 h-5 text-indigo-500" /><span className="text-xs font-bold text-slate-600 dark:text-slate-300">استيراد CSV</span></button>
                   <button onClick={() => { hapticFeedback('light'); onClose(); onExportCSV(); }} className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 active:scale-95 transition-all"><FileSpreadsheet className="w-5 h-5 text-green-500" /><span className="text-xs font-bold text-slate-600 dark:text-slate-300">تصدير Excel</span></button>
              </div>
          </SettingsGroup>
        </div>
        <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-8 text-center font-medium">المحامي الذكي • خصوصية تامة • تخزين محلي</p>
      </div>
    </>
  );
};

const SearchInput = ({ className = "", value, onChange, onClear }: { className?: string, value: string, onChange: (val: string) => void, onClear: () => void }) => (
  <div className={`relative group ${className}`}>
    <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors"><Search className="text-slate-400 w-4 h-4 group-focus-within:text-indigo-500" /></div>
    <input 
      type="text" 
      placeholder="بحث بالاسم أو رقم الملف..." 
      value={value} 
      onChange={(e) => onChange(e.target.value)} 
      className="w-full bg-slate-100/80 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700 focus:bg-white dark:focus:bg-slate-900 border-2 border-transparent focus:border-indigo-500 rounded-3xl py-3.5 pr-10 pl-4 text-sm transition-all outline-none text-slate-900 dark:text-white placeholder-slate-500 shadow-sm" 
    />
    {value && (<button onClick={() => { hapticFeedback('light'); onClear(); }} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 bg-slate-200/50 dark:bg-slate-700 rounded-full active:scale-90"><X className="w-3 h-3" /></button>)}
  </div>
);

function App() {
  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return JSON.parse(stored);
      }
    } catch (e) { console.error("Local storage error", e); }
    return [];
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'calendar' | 'history'>('dashboard');
  const [filterType, setFilterType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date()); 
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(() => localStorage.getItem(NOTIF_PREF_KEY) === 'true');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState<boolean>(() => JSON.parse(localStorage.getItem(DARK_MODE_KEY) || 'false'));
  const [commercialMode, setCommercialMode] = useState<boolean>(() => JSON.parse(localStorage.getItem(COMMERCIAL_MODE_KEY) || 'false'));
  const [toastConfig, setToastConfig] = useState<{visible: boolean; title: string; message: string; type: NotificationType;}>({ visible: false, title: '', message: '', type: 'info' });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Mobile Back Button Handling ---
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // If the back button is pressed and we have open modals, close them
      // This mimics native app behavior where "Back" closes the current view/modal
      let handled = false;

      if (isManualModalOpen) { setIsManualModalOpen(false); handled = true; }
      else if (isSettingsOpen) { setIsSettingsOpen(false); handled = true; }
      else if (isArchiveModalOpen) { setIsArchiveModalOpen(false); handled = true; }
      else if (isNotificationModalOpen) { setIsNotificationModalOpen(false); handled = true; }
      else if (deleteId) { setDeleteId(null); handled = true; }
      
      // If we closed a modal, we might want to prevent the default back navigation if possible,
      // but popstate happens *after* the navigation. The key is we used pushState when opening.
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isManualModalOpen, isSettingsOpen, isArchiveModalOpen, isNotificationModalOpen, deleteId]);

  // --- Notification Logic ---
  useEffect(() => {
    if (!notificationsEnabled) return;

    const checkReminders = () => {
      if (!('Notification' in window) || Notification.permission !== 'granted') return;

      const now = new Date();
      // Look ahead 24 hours
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      
      const notifiedList: string[] = JSON.parse(localStorage.getItem(NOTIFIED_IDS_KEY) || '[]');
      let updatedNotifiedList = [...notifiedList];
      let hasUpdates = false;

      appointments.forEach(appt => {
        if (appt.archived) return;

        const apptDate = new Date(appt.date);

        // Check conditions:
        // 1. Appointment is in the future (apptDate > now)
        // 2. Appointment is within the next 24 hours (apptDate <= tomorrow)
        // 3. Has NOT been notified yet (!notifiedList.includes)
        if (apptDate > now && apptDate <= tomorrow && !notifiedList.includes(appt.id)) {
           
           const timeStr = apptDate.toLocaleTimeString('ar-MA', { hour: 'numeric', minute: '2-digit' });
           
           // Trigger Notification via Service Worker (best for mobile/PWA)
           navigator.serviceWorker.ready.then(registration => {
             registration.showNotification(`تذكير: جلسة ${appt.clientName}`, {
               body: `موعد الجلسة غداً: ${CASE_TYPE_LABELS_AR[appt.caseType]} - الساعة ${timeStr}`,
               icon: 'https://cdn-icons-png.flaticon.com/512/924/924915.png',
               tag: appt.id, // prevent duplicate notifications visually
               lang: 'ar',
               dir: 'rtl',
               badge: 'https://cdn-icons-png.flaticon.com/512/924/924915.png'
             });
           });

           updatedNotifiedList.push(appt.id);
           hasUpdates = true;
        }
      });

      if (hasUpdates) {
        localStorage.setItem(NOTIFIED_IDS_KEY, JSON.stringify(updatedNotifiedList));
      }
    };

    // Run immediately on mount/update
    checkReminders();

    // Check periodically (every 5 minutes)
    const intervalId = setInterval(checkReminders, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [appointments, notificationsEnabled]);


  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); setDeferredPrompt(e); });
    
    // Apply Dark Mode Class
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setDeferredPrompt(null);
  };

  const showToast = (title: string, message: string, type: NotificationType = 'info') => setToastConfig({ visible: true, title, message, type });

  const handleExportToCSV = () => {
    hapticFeedback('medium');
    const headers = ['اسم الموكل', 'رقم الهاتف', 'رقم الملف', 'نوع القضية', 'تاريخ الجلسة', 'الساعة', 'التفاصيل', 'مؤرشف'];
    const rows = appointments.map(appt => {
      const d = new Date(appt.date);
      return [`"${appt.clientName}"`, `"${appt.clientPhone || ''}"`, `"${appt.fileNumber || ''}"`, `"${CASE_TYPE_LABELS_AR[appt.caseType]}"`, `"${d.toLocaleDateString('ar-MA')}"`, `"${d.toLocaleTimeString('ar-MA', {hour:'2-digit', minute:'2-digit'})}"`, `"${appt.description}"`, `"${appt.archived ? 'نعم' : 'لا'}"`].join(',');
    });
    const csv = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `المحامي_الذكي_نسخة_احتياطية_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    showToast("تصدير البيانات", "تم حفظ النسخة الاحتياطية بنجاح", "success");
  };

  const handleExportCalendar = () => {
    hapticFeedback('medium');
    const activeAppts = appointments.filter(a => !a.archived);
    
    if (activeAppts.length === 0) {
      showToast("تنبيه", "لا توجد مواعيد لتصديرها", "warning");
      return;
    }

    // Header required for iCalendar format
    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Smart Lawyer App//AR',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ].join('\r\n') + '\r\n';

    // Loop through appointments and add events
    activeAppts.forEach(appt => {
      const startDate = new Date(appt.date);
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // Default 1 hour duration
      
      // Helper to format date to YYYYMMDDTHHmmssZ
      const formatICSDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
      };

      // Sanitize description for ICS
      const description = `نوع القضية: ${CASE_TYPE_LABELS_AR[appt.caseType]}\\nرقم الملف: ${appt.fileNumber || '---'}\\nالهاتف: ${appt.clientPhone || '---'}\\n${appt.description}`;
      const safeDesc = description.replace(/(\r\n|\n|\r)/gm, "\\n");

      icsContent += [
        'BEGIN:VEVENT',
        `UID:${appt.id}@smartlawyer`,
        `DTSTAMP:${formatICSDate(new Date())}`,
        `DTSTART:${formatICSDate(startDate)}`,
        `DTEND:${formatICSDate(endDate)}`,
        `SUMMARY:جلسة: ${appt.clientName}`,
        `DESCRIPTION:${safeDesc}`,
        'END:VEVENT'
      ].join('\r\n') + '\r\n';
    });

    icsContent += 'END:VCALENDAR';

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `جدول_المحامي_${new Date().toISOString().split('T')[0]}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast("تم التصدير", "تم إنشاء ملف التقويم. افتحه لإضافة جميع المواعيد.", "success");
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    hapticFeedback('medium');
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
        const text = event.target?.result as string;
        if (!text) return;
        showToast("استيراد البيانات", "تم استيراد الملف بنجاح", "success");
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const toggleNotifications = () => {
    hapticFeedback('medium');
    if (!('Notification' in window)) return showToast("غير مدعوم", "متصفحك لا يدعم التنبيهات", "error");
    if (!notificationsEnabled) {
      if (Notification.permission === 'granted') { setNotificationsEnabled(true); localStorage.setItem(NOTIF_PREF_KEY, 'true'); }
      else { setIsNotificationModalOpen(true); }
    } else { setNotificationsEnabled(false); localStorage.setItem(NOTIF_PREF_KEY, 'false'); }
  };

  const handleAddAppointment = (appt: Appointment) => {
    hapticFeedback('heavy');
    const updated = [...appointments, appt];
    setAppointments(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    showToast("تم الحفظ", "تمت إضافة الموعد بنجاح", "success");
  };

  const handleEdit = (id: string) => {
    hapticFeedback('light');
    const appt = appointments.find(a => a.id === id);
    if (appt) { 
        setEditingAppointment(appt); 
        openModalWithHistory(setIsManualModalOpen);
    }
  };

  const confirmDelete = () => {
    hapticFeedback('heavy');
    if (deleteId) {
      const updated = appointments.filter(a => a.id !== deleteId);
      setAppointments(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setDeleteId(null);
      showToast("تم الحذف", "تم حذف الموعد نهائياً", "warning");
    }
  };

  const handleArchive = (id: string) => {
    hapticFeedback('medium');
    const u = appointments.map(x => x.id === id ? { ...x, archived: true } : x);
    setAppointments(u);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    showToast("تمت الأرشفة", "تم نقل القضية إلى الأرشيف", "info");
  };

  const handleRestore = (id: string) => {
    hapticFeedback('medium');
    const u = appointments.map(a => a.id === id ? { ...a, archived: false } : a);
    setAppointments(u);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    showToast("تمت الاستعادة", "تمت إعادة القضية للقائمة النشطة", "success");
  };

  const activeAppointments = appointments.filter(a => !a.archived);
  const archivedAppointments = appointments.filter(a => a.archived);
  
  const filtered = (activeTab === 'history' ? appointments : activeAppointments).filter(appt => {
    const match = appt.clientName.includes(searchQuery) || (appt.fileNumber?.includes(searchQuery));
    if (!match) return false;
    if (activeTab === 'calendar') return true;
    if (filterType === 'All') return true;
    if (filterType === 'Today') return new Date(appt.date).toDateString() === new Date().toDateString();
    return CASE_GROUPS.find(g => g.label === filterType)?.types.includes(appt.caseType);
  });

  const sorted = [...filtered].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Bottom Navigation Active Indicator Style
  const getNavClass = (tab: string) => 
    `flex-1 flex flex-col items-center justify-center py-2.5 rounded-2xl transition-all relative group ${activeTab === tab ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-500'}`;

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 pb-32 sm:pb-0 font-sans selection:bg-indigo-100" dir="rtl">
         
         <NotificationToast isVisible={toastConfig.visible} title={toastConfig.title} message={toastConfig.message} type={toastConfig.type} onClose={() => setToastConfig(prev => ({ ...prev, visible: false }))} />
         
         <NotificationPermissionModal isOpen={isNotificationModalOpen} onClose={() => setIsNotificationModalOpen(false)} onAllow={() => { Notification.requestPermission().then(p => { if(p==='granted') { setNotificationsEnabled(true); localStorage.setItem(NOTIF_PREF_KEY, 'true'); } setIsNotificationModalOpen(false); }); }} />
         
         <ManualEntryModal isOpen={isManualModalOpen} onClose={() => { setIsManualModalOpen(false); setEditingAppointment(null); }} onSave={(a) => { if(editingAppointment) { const u = appointments.map(x => x.id === a.id ? a : x); setAppointments(u); localStorage.setItem(STORAGE_KEY, JSON.stringify(u)); setEditingAppointment(null); hapticFeedback('medium'); } else { handleAddAppointment(a); } setIsManualModalOpen(false); }} enableCommercial={commercialMode} initialData={editingAppointment} />
         
         <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={confirmDelete} />
         
         <ArchiveModal isOpen={isArchiveModalOpen} onClose={() => setIsArchiveModalOpen(false)} archivedAppointments={archivedAppointments} onRestore={handleRestore} onDelete={(id) => setDeleteId(id)} />
         
         <SettingsPanel isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} darkMode={darkMode} setDarkMode={setDarkMode} notificationsEnabled={notificationsEnabled} toggleNotifications={toggleNotifications} commercialMode={commercialMode} setCommercialMode={setCommercialMode} onExportCSV={handleExportToCSV} onExportCalendar={handleExportCalendar} onImportCSV={() => fileInputRef.current?.click()} onOpenArchive={() => { openModalWithHistory(setIsArchiveModalOpen); }} installPrompt={deferredPrompt} onInstall={handleInstallClick} />
         
         <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleImportCSV} />

         <div className="max-w-4xl mx-auto sm:py-8 px-4">
            <header className="sticky top-0 z-30 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-xl transition-all duration-300 ease-in-out pt-safe py-4 mb-6">
               <div className="relative flex items-center justify-center px-4">
                 <div className="flex flex-col items-center justify-center">
                    <h1 className="text-3xl font-black tracking-tight leading-tight flex items-baseline gap-2 mb-1">
                        <span className="text-slate-800 dark:text-white">المحامي</span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-l from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 pb-2">الذكي</span>
                    </h1>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-[0.3em] uppercase">SMART LAWYER</span>
                 </div>
                 <button onClick={() => { hapticFeedback('light'); openModalWithHistory(setIsSettingsOpen); }} className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-sm active:scale-90 transition-all"><Settings className="w-5 h-5" /></button>
               </div>
            </header>

            <main className="animate-fadeIn">
              {activeTab === 'dashboard' && (
                 <div 
                   onClick={() => { hapticFeedback('medium'); setEditingAppointment(null); openModalWithHistory(setIsManualModalOpen); }} 
                   className="mb-8 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-[2rem] p-8 text-white shadow-2xl shadow-indigo-200 dark:shadow-none cursor-pointer active:scale-[0.97] transition-all relative overflow-hidden group"
                 >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-10 translate-x-10 group-hover:scale-110 transition-transform"></div>
                    <div className="relative z-10 flex items-center justify-between">
                      <div><h2 className="text-2xl font-black mb-1">إضافة موعد جديد</h2><p className="text-indigo-100 text-sm font-medium opacity-90">سجل جلسة أو إجراء قانوني يدوياً</p></div>
                      <div className="bg-white/20 p-4 rounded-[1.5rem] backdrop-blur-md border border-white/20 shadow-inner group-hover:bg-white/30 transition-colors"><Plus className="w-8 h-8 text-white" strokeWidth={3} /></div>
                    </div>
                 </div>
              )}

              {activeTab === 'calendar' ? (
                 <div className="animate-scaleIn">
                   <WeeklyCalendar appointments={activeAppointments} onDateSelect={(d) => { hapticFeedback('light'); setSelectedDate(d); }} selectedDate={selectedDate} />
                   <div className="space-y-4 pb-24">
                     <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2 text-lg px-2"><div className="w-2 h-6 bg-indigo-500 rounded-full"></div>مواعيد اليوم المختار</h3>
                     {sorted.filter(a => selectedDate && new Date(a.date).toDateString() === selectedDate.toDateString()).length > 0 ? (
                       sorted.filter(a => selectedDate && new Date(a.date).toDateString() === selectedDate.toDateString()).map(appt => (<AppointmentCard key={appt.id} appointment={appt} onDelete={(id) => setDeleteId(id)} onEdit={handleEdit} onArchive={handleArchive} />))
                     ) : (
                       <div className="py-20 flex flex-col items-center justify-center text-center opacity-40"><CalendarIcon className="w-16 h-16 mb-4" /><p className="font-bold">لا توجد مواعيد مبرمجة</p></div>
                     )}
                   </div>
                 </div>
              ) : (
                 <div className="animate-fadeIn">
                   <div className="flex flex-col gap-5 mb-8">
                      <SearchInput value={searchQuery} onChange={setSearchQuery} onClear={() => setSearchQuery('')} />
                      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide px-1">
                        <button onClick={() => { hapticFeedback('light'); setFilterType('All'); }} className={`px-6 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all shadow-sm active:scale-95 ${filterType === 'All' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'}`}>الكل</button>
                        <button onClick={() => { hapticFeedback('light'); setFilterType('Today'); }} className={`px-6 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all shadow-sm active:scale-95 ${filterType === 'Today' ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'}`}>اليوم</button>
                        {CASE_GROUPS.filter(g => commercialMode || g.label !== 'قضايا الأعمال').map(g => (<button key={g.label} onClick={() => { hapticFeedback('light'); setFilterType(g.label); }} className={`px-6 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all shadow-sm active:scale-95 ${filterType === g.label ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'}`}>{g.label}</button>))}
                      </div>
                   </div>
                   <div className="space-y-4 pb-24">
                      {sorted.length > 0 ? sorted.map(appt => (<AppointmentCard key={appt.id} appointment={appt} onDelete={(id) => setDeleteId(id)} onEdit={handleEdit} onArchive={handleArchive} />)) : (<div className="py-24 text-center text-slate-400 font-bold">لم يتم العثور على أي بيانات</div>)}
                   </div>
                 </div>
              )}
            </main>
         </div>

         {/* Bottom Navigation Bar - Android Modern Style */}
         <nav className="fixed bottom-0 left-0 right-0 sm:left-1/2 sm:-translate-x-1/2 sm:max-w-md z-40 pb-safe px-4 mb-6">
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-white/20 dark:border-slate-700/50 rounded-[2.5rem] shadow-2xl p-2 flex justify-between items-center relative h-20">
               
               <button onClick={() => { hapticFeedback('light'); setActiveTab('dashboard'); }} className={getNavClass('dashboard')}>
                  {activeTab === 'dashboard' && <div className="absolute inset-x-3 inset-y-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl z-0 animate-scaleIn"></div>}
                  <Home className={`w-6 h-6 relative z-10 transition-all ${activeTab === 'dashboard' ? 'scale-110' : ''}`} />
                  <span className="text-[10px] font-black relative z-10 mt-1">الرئيسية</span>
               </button>

               <button onClick={() => { hapticFeedback('light'); setActiveTab('calendar'); }} className={getNavClass('calendar')}>
                  {activeTab === 'calendar' && <div className="absolute inset-x-3 inset-y-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl z-0 animate-scaleIn"></div>}
                  <CalendarIcon className={`w-6 h-6 relative z-10 transition-all ${activeTab === 'calendar' ? 'scale-110' : ''}`} />
                  <span className="text-[10px] font-black relative z-10 mt-1">الجدول</span>
               </button>

               <div className="relative mx-1">
                 <button 
                   onClick={() => { hapticFeedback('heavy'); setEditingAppointment(null); openModalWithHistory(setIsManualModalOpen); }} 
                   className="w-14 h-14 bg-indigo-600 rounded-[1.5rem] text-white shadow-xl flex items-center justify-center active:scale-90 transition-all border-4 border-white dark:border-slate-900 -mt-2"
                 >
                   <Plus className="w-8 h-8" strokeWidth={3} />
                 </button>
               </div>

               <button onClick={() => { hapticFeedback('light'); setActiveTab('history'); }} className={getNavClass('history')}>
                  {activeTab === 'history' && <div className="absolute inset-x-3 inset-y-1 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl z-0 animate-scaleIn"></div>}
                  <History className={`w-6 h-6 relative z-10 transition-all ${activeTab === 'history' ? 'scale-110' : ''}`} />
                  <span className="text-[10px] font-black relative z-10 mt-1">السجل</span>
               </button>

               <button onClick={() => { hapticFeedback('light'); openModalWithHistory(setIsSettingsOpen); }} className="flex-1 flex flex-col items-center justify-center py-2.5 rounded-2xl text-slate-400 relative">
                  <Settings className="w-6 h-6" />
                  <span className="text-[10px] font-black mt-1">المزيد</span>
               </button>

            </div>
         </nav>
      </div>
    </div>
  );
}

export default App;
