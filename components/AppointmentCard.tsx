
import React, { useState } from 'react';
import { Appointment, CASE_COLORS, CASE_TYPE_LABELS_AR, CaseType } from '../types';
import { Calendar, Clock, Users, Scale, Gavel, Car, HelpCircle, ChevronDown, ChevronUp, Phone, Briefcase, Home, Zap, Siren, ShieldAlert, Building2, Edit3, MoreVertical, Hash, Archive, RefreshCw, Trash2 } from 'lucide-react';

interface AppointmentCardProps {
  appointment: Appointment;
  onDelete: (id: string) => void;
  onEdit?: (id: string) => void;
  onArchive?: (id: string) => void;
  onRestore?: (id: string) => void;
  isReminder?: boolean;
  isArchived?: boolean;
}

const hapticFeedback = (intensity: 'light' | 'medium' | 'heavy' = 'light') => {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    const patterns = { light: 10, medium: 20, heavy: 40 };
    navigator.vibrate(patterns[intensity]);
  }
};

const getCaseIcon = (type: CaseType) => {
  const iconProps = { className: "w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" };
  switch (type) {
    case CaseType.Family: return <Users {...iconProps} />;
    case CaseType.Appeal: return <Scale {...iconProps} />;
    case CaseType.Criminal: return <Gavel {...iconProps} />;
    case CaseType.Traffic: return <Car {...iconProps} />;
    case CaseType.Civil: return <Briefcase {...iconProps} />;
    case CaseType.RealEstate: return <Home {...iconProps} />;
    case CaseType.Urgent: return <Zap {...iconProps} />;
    case CaseType.Misdemeanor: return <ShieldAlert {...iconProps} />;
    case CaseType.Flagrante: return <Siren {...iconProps} />;
    case CaseType.Commercial: return <Building2 {...iconProps} />;
    default: return <HelpCircle {...iconProps} />;
  }
};

const getPriorityDot = (type: CaseType) => {
  if (type === CaseType.Urgent) {
    return (
      <span className="flex h-2 w-2 relative shrink-0" title="حالة مستعجلة">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-600 border border-white dark:border-red-900"></span>
      </span>
    );
  }
  if ([CaseType.Criminal, CaseType.Flagrante, CaseType.Appeal].includes(type)) {
     return <span className="w-2 h-2 rounded-full bg-orange-500 shrink-0 border border-white dark:border-orange-900"></span>;
  }
  return null;
};

const getBorderColorClass = (type: CaseType) => {
  const styles = CASE_COLORS[type] || '';
  if (styles.includes('purple')) return 'border-r-purple-500';
  if (styles.includes('blue')) return 'border-r-blue-500';
  if (styles.includes('red')) return 'border-r-red-500';
  if (styles.includes('yellow')) return 'border-r-yellow-500';
  if (styles.includes('teal')) return 'border-r-teal-500';
  if (styles.includes('amber')) return 'border-r-amber-500';
  if (styles.includes('rose')) return 'border-r-rose-500';
  if (styles.includes('slate')) return 'border-r-slate-500';
  if (styles.includes('orange')) return 'border-r-orange-500';
  if (styles.includes('cyan')) return 'border-r-cyan-500';
  if (styles.includes('gray')) return 'border-r-gray-500';
  return 'border-r-indigo-500';
};

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, onDelete, onEdit, onArchive, onRestore, isReminder = false, isArchived = false }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  const dateObj = new Date(appointment.date);
  const dateStr = dateObj.toLocaleDateString('ar-MA', { weekday: 'short', month: 'short', day: 'numeric' });
  const timeStr = dateObj.toLocaleTimeString('ar-MA', { hour: 'numeric', minute: '2-digit' });

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  const hasLongDescription = appointment.description && appointment.description.length > 60;

  return (
    <div className={`group relative bg-white dark:bg-slate-800 rounded-[2rem] p-5 transition-all duration-200 border-r-[5px] ${getBorderColorClass(appointment.caseType)} ${
      isReminder && !isArchived 
        ? 'border-y border-l border-orange-100 dark:border-orange-900/30 shadow-xl shadow-orange-100/30' 
        : 'border-y border-l border-slate-100 dark:border-slate-700/50 shadow-sm hover:shadow-lg'
    } ${isArchived ? 'opacity-80' : ''} active:scale-[0.98] cursor-pointer`}>
      
      <div className="flex justify-between items-start border-b border-slate-50 dark:border-slate-700/50 pb-3 mb-4">
         <div className="flex gap-2">
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-xl text-[10px] font-black">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{dateStr}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-2 rounded-xl text-[10px] font-black">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{timeStr}</span>
            </div>
         </div>

         <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  hapticFeedback('light');
                  setShowMenu(!showMenu);
                }}
                className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors active:bg-slate-200 dark:active:bg-slate-600 text-slate-400`}
              >
                <MoreVertical className="w-5 h-5" />
              </button>

              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setShowMenu(false); }} />
                  <div className="absolute top-10 left-0 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-700 z-20 overflow-hidden animate-scaleIn">
                    {!isArchived && onEdit && (
                      <button onClick={(e) => { e.stopPropagation(); hapticFeedback('light'); setShowMenu(false); onEdit(appointment.id); }} className="w-full flex items-center gap-3 px-4 py-3.5 text-xs font-black text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 border-b border-slate-50 dark:border-slate-700/50"><Edit3 className="w-4 h-4 text-indigo-500" />تعديل البيانات</button>
                    )}
                    {!isArchived && onArchive && (
                      <button onClick={(e) => { e.stopPropagation(); hapticFeedback('medium'); setShowMenu(false); onArchive(appointment.id); }} className="w-full flex items-center gap-3 px-4 py-3.5 text-xs font-black text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 border-b border-slate-50 dark:border-slate-700/50"><Archive className="w-4 h-4" />أرشفة الملف</button>
                    )}
                    {isArchived && onRestore && (
                      <button onClick={(e) => { e.stopPropagation(); hapticFeedback('medium'); setShowMenu(false); onRestore(appointment.id); }} className="w-full flex items-center gap-3 px-4 py-3.5 text-xs font-black text-green-600 hover:bg-green-50"><RefreshCw className="w-4 h-4" />استعادة الملف</button>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); hapticFeedback('heavy'); setShowMenu(false); onDelete(appointment.id); }} className="w-full flex items-center gap-3 px-4 py-3.5 text-xs font-black text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"><Trash2 className="w-4 h-4" />حذف نهائي</button>
                  </div>
                </>
              )}
        </div>
      </div>

      <div className="flex items-start gap-4">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black shrink-0 shadow-inner ${isReminder && !isArchived ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300'}`}>
          {getInitials(appointment.clientName)}
        </div>

        <div className="flex-1 min-w-0 flex flex-col gap-2">
           <h3 className="text-lg font-black text-slate-800 dark:text-white truncate tracking-tight">{appointment.clientName}</h3>
           <div className="flex items-center gap-2 flex-wrap">
             <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black border bg-white dark:bg-slate-900 ${CASE_COLORS[appointment.caseType]}`}>
                  {getCaseIcon(appointment.caseType)}
                  {CASE_TYPE_LABELS_AR[appointment.caseType]}
                  {getPriorityDot(appointment.caseType)}
             </span>
             {appointment.clientPhone && (
                <a href={`tel:${appointment.clientPhone}`} className="inline-flex items-center gap-1.5 text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-2.5 py-1 rounded-lg" onClick={(e) => { hapticFeedback('light'); e.stopPropagation(); }}>
                  <Phone className="w-3.5 h-3.5" />
                  <span dir="ltr">{appointment.clientPhone}</span>
                </a>
              )}
           </div>
        </div>
      </div>

      <div className="mt-4" onClick={(e) => { if(hasLongDescription) { e.stopPropagation(); hapticFeedback('light'); setIsExpanded(!isExpanded); } }}>
         <div className={`bg-slate-50/80 dark:bg-slate-900/40 rounded-2xl border border-slate-100 dark:border-slate-700/30 overflow-hidden`}>
             <div className="px-4 py-3 flex gap-3">
                 <div className="w-1 rounded-full bg-slate-200 dark:bg-slate-700 self-stretch"></div>
                 <p className={`text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed ${!isExpanded ? 'line-clamp-2' : ''}`} dir="auto">{appointment.description}</p>
             </div>
             {hasLongDescription && (
                 <div className="px-4 pb-3 flex justify-end">
                     <span className="text-[10px] font-black text-indigo-500 flex items-center gap-1">{isExpanded ? 'طي التفاصيل' : 'عرض الكل'} {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}</span>
                 </div>
             )}
         </div>
      </div>

      <div className="mt-4 flex justify-between items-center bg-slate-50 dark:bg-slate-900/60 p-3 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
         <div className="flex items-center gap-1.5 text-slate-400"><Hash className="w-4 h-4" /><span className="text-[10px] font-black uppercase">رقم الملف القضائي</span></div>
         <span className="text-sm font-black font-mono text-slate-800 dark:text-slate-200 tracking-widest" dir="ltr">{appointment.fileNumber || '---/---/--'}</span>
      </div>
    </div>
  );
};

export default AppointmentCard;
