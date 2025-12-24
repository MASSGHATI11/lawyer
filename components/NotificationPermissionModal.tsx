
import React from 'react';
import { Bell, ShieldCheck, X } from 'lucide-react';

interface NotificationPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAllow: () => void;
}

const NotificationPermissionModal: React.FC<NotificationPermissionModalProps> = ({ isOpen, onClose, onAllow }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-100 dark:border-slate-800 scale-100 transition-all relative" dir="rtl">
        <button 
          onClick={onClose}
          className="absolute top-4 left-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 text-center">
          <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-indigo-50 dark:border-indigo-800/50">
             <Bell className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-slate-800 dark:text-white mb-3">تفعيل التنبيهات الذكية</h3>
          <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">
            اسمح للتطبيق بإرسال إشعارات لتذكيرك بمواعيد الجلسات قبل 24 ساعة وقبل ساعة واحدة من الموعد.
            <br />
            <span className="text-xs text-slate-400 mt-2 block font-medium">لن تفوتك أي جلسة مهمة بعد الآن!</span>
          </p>
          
          <div className="flex flex-col gap-3">
            <button
              onClick={onAllow}
              className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-5 h-5" />
              سماح بالإشعارات
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl text-slate-500 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm"
            >
              ليس الآن
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPermissionModal;
