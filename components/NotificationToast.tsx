
import React, { useEffect } from 'react';
import { Bell, CheckCircle, X, Info, AlertTriangle } from 'lucide-react';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

interface NotificationToastProps {
  isVisible: boolean;
  title: string;
  message: string;
  type?: NotificationType;
  onClose: () => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ 
  isVisible, 
  title, 
  message, 
  type = 'info', 
  onClose 
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000); // Auto close after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/90 border-green-200 dark:border-green-800 text-green-800 dark:text-green-100';
      case 'warning':
        return 'bg-orange-50 dark:bg-orange-900/90 border-orange-200 dark:border-orange-800 text-orange-800 dark:text-orange-100';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/90 border-red-200 dark:border-red-800 text-red-800 dark:text-red-100';
      default:
        return 'bg-white dark:bg-slate-800 border-indigo-100 dark:border-slate-700 text-slate-800 dark:text-white shadow-xl';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success': return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-6 h-6 text-orange-500" />;
      case 'error': return <AlertTriangle className="w-6 h-6 text-red-500" />;
      default: return <Bell className="w-6 h-6 text-indigo-500" />;
    }
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm md:max-w-md px-4 animate-slideDown pointer-events-none">
      <div 
        className={`pointer-events-auto flex items-start gap-4 p-4 rounded-2xl border shadow-2xl backdrop-blur-md transition-all duration-300 ${getStyles()}`}
        dir="rtl"
      >
        <div className="shrink-0 pt-0.5">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm mb-1">{title}</h4>
          <p className="text-sm opacity-90 leading-relaxed whitespace-pre-line">{message}</p>
        </div>
        <button 
          onClick={onClose}
          className="shrink-0 p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4 opacity-60" />
        </button>
      </div>
    </div>
  );
};

export default NotificationToast;
