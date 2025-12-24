
import React, { useState, useEffect } from 'react';
import { Appointment, CASE_COLORS, CaseType, CASE_TYPE_LABELS_AR } from '../types';
import { ChevronRight, ChevronLeft, Calendar as CalendarIcon, RotateCcw } from 'lucide-react';

interface WeeklyCalendarProps {
  appointments: Appointment[];
  onDateSelect: (date: Date) => void;
  selectedDate: Date | null;
}

const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({ appointments, onDateSelect, selectedDate }) => {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(new Date());

  // Helper to get the start of the week (Monday)
  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is sunday
    return new Date(d.setDate(diff));
  };

  useEffect(() => {
    // Initialize to the start of the current week
    setCurrentWeekStart(getStartOfWeek(new Date()));
  }, []);

  const changeWeek = (direction: 'next' | 'prev') => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeekStart(newDate);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentWeekStart(getStartOfWeek(today));
    onDateSelect(today);
  };

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(currentWeekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getDate() === d2.getDate() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getFullYear() === d2.getFullYear();
  };

  const today = new Date();

  // Helper to get a solid color for the indicator bar based on case type
  const getIndicatorColor = (caseType: CaseType) => {
    const styles = CASE_COLORS[caseType] || '';
    if (styles.includes('purple')) return 'bg-purple-500';
    if (styles.includes('blue')) return 'bg-blue-500';
    if (styles.includes('red')) return 'bg-red-500';
    if (styles.includes('yellow')) return 'bg-yellow-500';
    if (styles.includes('teal')) return 'bg-teal-500';
    if (styles.includes('amber')) return 'bg-amber-500';
    if (styles.includes('rose')) return 'bg-rose-500';
    if (styles.includes('slate')) return 'bg-slate-500';
    if (styles.includes('orange')) return 'bg-orange-500';
    if (styles.includes('cyan')) return 'bg-cyan-500';
    if (styles.includes('gray')) return 'bg-gray-500';
    return 'bg-indigo-500';
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden mb-6 transition-all animate-fadeIn select-none">
      {/* Header Controls */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-2">
           <div className="bg-indigo-50 dark:bg-indigo-900/30 p-2 rounded-xl text-indigo-600 dark:text-indigo-400">
             <CalendarIcon className="w-5 h-5" />
           </div>
           <span className="font-bold text-base sm:text-lg text-slate-800 dark:text-white">
             {currentWeekStart.toLocaleDateString('ar-MA', { month: 'long', year: 'numeric' })}
           </span>
        </div>
        
        <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900 rounded-lg p-1 border border-slate-100 dark:border-slate-700/50">
          <button 
            onClick={() => changeWeek('prev')}
            className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-colors text-slate-500 dark:text-slate-400 active:scale-95"
            aria-label="الأسبوع السابق"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button 
            onClick={goToToday}
            className="px-3 py-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-colors flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden xs:inline">اليوم</span>
          </button>
          <button 
            onClick={() => changeWeek('next')}
            className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-md transition-colors text-slate-500 dark:text-slate-400 active:scale-95"
            aria-label="الأسبوع التالي"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Days Grid */}
      <div className="flex sm:grid sm:grid-cols-7 divide-x divide-x-reverse divide-slate-100 dark:divide-slate-700 overflow-x-auto snap-x snap-mandatory scrollbar-hide">
        {days.map((dayDate) => {
          const isToday = isSameDay(dayDate, today);
          const isSelected = selectedDate && isSameDay(dayDate, selectedDate);
          
          const dayAppointments = appointments.filter(a => isSameDay(new Date(a.date), dayDate));

          return (
            <div 
              key={dayDate.toISOString()}
              onClick={() => onDateSelect(dayDate)}
              className={`
                flex-shrink-0 w-[16%] sm:w-auto min-w-[75px] sm:min-w-0 snap-start
                min-h-[120px] sm:min-h-[140px] p-2 flex flex-col gap-2 cursor-pointer transition-colors group relative
                ${isSelected ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'}
              `}
            >
               {/* Day Header */}
               <div className="flex flex-col items-center gap-1 mb-1">
                 <span className={`text-[10px] font-bold ${isToday ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`}>
                   {dayDate.toLocaleDateString('ar-MA', { weekday: 'short' })}
                 </span>
                 <span className={`
                    w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full text-xs sm:text-sm font-bold transition-all
                    ${isToday 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-300 dark:shadow-indigo-900/50' 
                      : isSelected 
                        ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                        : 'text-slate-700 dark:text-slate-300 group-hover:bg-white dark:group-hover:bg-slate-600'}
                 `}>
                   {dayDate.getDate()}
                 </span>
               </div>

               {/* Appointments Dots/Bars */}
               <div className="flex flex-col gap-1.5 w-full overflow-hidden flex-1">
                 {dayAppointments.slice(0, 4).map((apt) => (
                   <div 
                      key={apt.id}
                      className="relative pl-1.5 pr-2 py-1.5 rounded-lg w-full shadow-sm bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col justify-center"
                   >
                     {/* Colored Bar Indicator */}
                     <div className={`absolute top-0 bottom-0 right-0 w-1 ${getIndicatorColor(apt.caseType)}`} />
                     
                     {/* Client Name */}
                     <span className="truncate text-slate-700 dark:text-slate-200 font-bold text-[9px] leading-tight mr-1">
                        {apt.clientName}
                     </span>
                     
                     {/* Case Type (Optional: very small) */}
                     {/* <span className="truncate text-slate-400 text-[8px] mr-1">
                        {CASE_TYPE_LABELS_AR[apt.caseType]}
                     </span> */}
                   </div>
                 ))}
                 
                 {/* Visual indicator for overflow if no space */}
                 {dayAppointments.length > 4 && (
                   <div className="mt-auto flex justify-center">
                     <span className="text-[9px] text-slate-400 font-bold bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">
                       +{dayAppointments.length - 4}
                     </span>
                   </div>
                 )}
               </div>
               
               {/* Selection Indicator */}
               {isSelected && (
                 <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500 rounded-t-full mx-4"></div>
               )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyCalendar;
