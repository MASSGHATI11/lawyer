
import React, { useState, useEffect, useRef } from 'react';
import { Appointment, CaseType, CASE_TYPE_LABELS_AR, CASE_GROUPS } from '../types';
import { 
  X, Save, User, Calendar, AlignLeft, 
  Scale, Phone, Hash, Clock, Check, 
  Briefcase, Gavel, Car, Home, ShieldAlert, 
  Siren, Building2, HelpCircle, Users, Zap,
  ChevronDown, CalendarDays
} from 'lucide-react';

interface ManualEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appt: Appointment) => void;
  enableCommercial: boolean;
  initialData?: Appointment | null;
}

const getCaseIcon = (type: CaseType) => {
  const props = { className: "w-6 h-6 mb-2" };
  switch (type) {
    case CaseType.Family: return <Users {...props} />;
    case CaseType.Appeal: return <Scale {...props} />;
    case CaseType.Criminal: return <Gavel {...props} />;
    case CaseType.Traffic: return <Car {...props} />;
    case CaseType.Civil: return <Briefcase {...props} />;
    case CaseType.RealEstate: return <Home {...props} />;
    case CaseType.Urgent: return <Zap {...props} />;
    case CaseType.Misdemeanor: return <ShieldAlert {...props} />;
    case CaseType.Flagrante: return <Siren {...props} />;
    case CaseType.Commercial: return <Building2 {...props} />;
    default: return <HelpCircle {...props} />;
  }
};

const ManualEntryModal: React.FC<ManualEntryModalProps> = ({ isOpen, onClose, onSave, enableCommercial, initialData }) => {
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [fileNumber, setFileNumber] = useState('');
  const [caseType, setCaseType] = useState<CaseType>(CaseType.Other);
  
  const [datePart, setDatePart] = useState('');
  const [timePart, setTimePart] = useState('09:00');
  
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Generate next 30 days for Date Slider
  const dateSlots = React.useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, []);

  // Generate 30-minute intervals from 08:00 to 18:00 for Time Slider
  const timeSlots = React.useMemo(() => {
    const slots = [];
    for (let i = 8; i <= 18; i++) {
      slots.push(`${i.toString().padStart(2, '0')}:00`);
      slots.push(`${i.toString().padStart(2, '0')}:30`);
    }
    return slots;
  }, []);

  useEffect(() => {
    if (isOpen) {
        if (initialData) {
            setClientName(initialData.clientName);
            setClientPhone(initialData.clientPhone || '');
            setFileNumber(initialData.fileNumber || '');
            setCaseType(initialData.caseType);
            setDescription(initialData.description);
            
            const d = new Date(initialData.date);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            setDatePart(`${year}-${month}-${day}`);
            
            const hours = String(d.getHours()).padStart(2, '0');
            const minutes = String(d.getMinutes()).padStart(2, '0');
            setTimePart(`${hours}:${minutes}`);
        } else {
            resetForm();
            // Default to tomorrow
            const d = new Date();
            d.setDate(d.getDate() + 1);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            setDatePart(`${year}-${month}-${day}`);
        }
        if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }
  }, [isOpen, initialData]);

  const resetForm = () => {
    setClientName('');
    setClientPhone('');
    setFileNumber('');
    setCaseType(CaseType.Other);
    setDatePart('');
    setTimePart('09:00');
    setDescription('');
    setError(null);
  };

  const formatDateValue = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !datePart || !timePart) {
      setError('يرجى تعبئة الحقول الأساسية (الاسم، التاريخ، الوقت)');
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
      return;
    }

    const combinedDate = new Date(`${datePart}T${timePart}`);

    const newAppt: Appointment = {
      id: initialData ? initialData.id : crypto.randomUUID(),
      clientName,
      clientPhone: clientPhone.trim() || undefined,
      fileNumber: fileNumber.trim() || undefined,
      caseType,
      date: combinedDate.toISOString(),
      description: description.trim() || 'لا توجد تفاصيل إضافية',
      createdAt: initialData ? initialData.createdAt : Date.now(),
    };

    onSave(newAppt);
    onClose();
  };

  // Filter out Commercial if disabled, and exclude 'Other' to handle it separately
  const filteredGroups = CASE_GROUPS
    .map(group => ({
      ...group,
      types: group.types.filter(type => 
        (type !== CaseType.Commercial || enableCommercial) && type !== CaseType.Other
      )
    }))
    .filter(group => group.types.length > 0 && group.label !== 'أخرى');

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="bg-white dark:bg-slate-900 w-full sm:max-w-xl sm:rounded-[2rem] rounded-t-[2.5rem] shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[85vh] overflow-hidden border border-slate-100 dark:border-slate-800 transition-all"
        dir="rtl"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 z-10 sticky top-0">
          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight leading-none">
                {initialData ? 'تعديل الملف' : 'قضية جديدة'}
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-bold">إدخال بيانات الجلسة والموكل</p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-slate-800 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all active:scale-95"
          >
            <X className="w-6 h-6" strokeWidth={2.5} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-8 scrollbar-hide pb-safe bg-slate-50/50 dark:bg-slate-900">
          
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-sm font-bold p-4 rounded-2xl border border-red-100 dark:border-red-800 flex items-center gap-3 animate-slideDown">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              {error}
            </div>
          )}

          {/* Section 1: Case Type */}
          <div className="space-y-4">
             {filteredGroups.map((group) => (
                <div key={group.label} className="space-y-2">
                  <h4 className="text-[10px] font-bold text-slate-400 px-1">{group.label}</h4>
                  <div className="grid grid-cols-2 gap-3">
                    {group.types.map((type) => {
                      const isSelected = caseType === type;
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setCaseType(type)}
                          className={`
                            relative flex flex-col items-center justify-center py-6 px-4 rounded-2xl transition-all duration-200 border-2
                            ${isSelected 
                              ? 'bg-white dark:bg-slate-800 border-indigo-600 shadow-xl shadow-indigo-100 dark:shadow-none z-10' 
                              : 'bg-white dark:bg-slate-800 border-transparent text-slate-500 dark:text-slate-400 hover:border-slate-200 dark:hover:border-slate-700 shadow-sm'}
                          `}
                        >
                           <div className={`transition-transform duration-200 ${isSelected ? 'text-indigo-600 scale-110' : ''}`}>
                             {getCaseIcon(type)}
                           </div>
                           <span className={`text-xs font-bold ${isSelected ? 'text-indigo-600' : 'text-slate-600 dark:text-slate-300'}`}>
                             {CASE_TYPE_LABELS_AR[type]}
                           </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
             ))}

             <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setCaseType(CaseType.Other)}
                  className={`
                    w-full relative flex items-center justify-center gap-3 py-4 px-6 rounded-2xl transition-all duration-200 border-2
                    ${caseType === CaseType.Other
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-200 dark:shadow-none' 
                      : 'bg-white dark:bg-slate-800 border-transparent text-slate-500 dark:text-slate-400 hover:border-slate-200 dark:hover:border-slate-700 shadow-sm'}
                  `}
                >
                   <HelpCircle className="w-5 h-5" />
                   <span className="font-bold">أخرى</span>
                   {caseType === CaseType.Other && <ChevronDown className="w-5 h-5 absolute left-4" />}
                </button>
             </div>
          </div>

          <div className="w-full h-px bg-slate-200/50 dark:bg-slate-800"></div>

          {/* Section 2: Date & Time - Slider UI */}
          <div className="space-y-5">
             <div className="flex items-center gap-2">
                 <Clock className="w-5 h-5 text-slate-400" />
                 <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400">تاريخ وتوقيت الجلسة</h3>
             </div>
             
             <div className="bg-white dark:bg-slate-800 p-2 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700/50">
                 
                 {/* Date Slider */}
                 <div className="p-2 space-y-3">
                    <div className="flex items-center justify-between px-1">
                       <div className="flex items-center gap-3 w-full">
                          <span className="text-xs font-bold text-slate-400 shrink-0">التاريخ</span>
                          <input
                               type="date"
                               value={datePart}
                               onChange={(e) => setDatePart(e.target.value)}
                               className="flex-1 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white text-xs font-bold rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-mono tracking-wide"
                           />
                       </div>
                    </div>

                    <div className="flex gap-2 overflow-x-auto scrollbar-hide py-2 snap-x" dir="ltr">
                       {dateSlots.map((date) => {
                          const val = formatDateValue(date);
                          const isSelected = val === datePart;
                          const dayName = date.toLocaleDateString('ar-MA', { weekday: 'short' });
                          const dayNum = date.getDate();
                          
                          return (
                              <button
                                key={date.toISOString()}
                                type="button"
                                onClick={() => setDatePart(val)}
                                className={`
                                  flex-shrink-0 flex flex-col items-center justify-center w-[4.5rem] h-[5rem] rounded-2xl transition-all snap-start border-2
                                  ${isSelected 
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/30 transform scale-105 z-10' 
                                    : 'bg-slate-50 dark:bg-slate-700/30 text-slate-500 dark:text-slate-400 border-transparent hover:border-indigo-200 dark:hover:border-indigo-900'}
                                `}
                              >
                                <span className={`text-[10px] font-bold ${isSelected ? 'text-indigo-100' : 'text-slate-400 dark:text-slate-500'}`}>{dayName}</span>
                                <span className="text-2xl font-black mt-0.5 font-sans">{dayNum}</span>
                              </button>
                          );
                       })}
                    </div>
                 </div>

                 <div className="h-px bg-slate-100 dark:bg-slate-700 mx-4 my-1"></div>

                 {/* Time Slider */}
                 <div className="p-2 space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-3 w-full">
                           <span className="text-xs font-bold text-slate-400 shrink-0">التوقيت</span>
                           <input
                               type="time"
                               value={timePart}
                               onChange={(e) => setTimePart(e.target.value)}
                               className="flex-1 bg-slate-50 dark:bg-slate-700/50 text-slate-900 dark:text-white text-xs font-bold rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all font-mono tracking-wide"
                           />
                        </div>
                    </div>
                    <div className="flex gap-2 overflow-x-auto scrollbar-hide py-2 snap-x" dir="ltr">
                      {timeSlots.map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setTimePart(t)}
                          className={`
                            flex-shrink-0 px-6 py-3 rounded-xl text-sm font-bold transition-all snap-center border-2 font-mono
                            ${timePart === t 
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/30' 
                              : 'bg-slate-50 dark:bg-slate-700/30 text-slate-500 dark:text-slate-400 border-transparent hover:border-indigo-200 dark:hover:border-indigo-900'}
                          `}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                 </div>
             </div>
          </div>

          <div className="w-full h-px bg-slate-200/50 dark:bg-slate-800"></div>

          {/* Section 3: Client Info */}
          <div className="space-y-4">
             <div className="flex items-center gap-2">
                 <User className="w-5 h-5 text-slate-400" />
                 <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400">بيانات الموكل</h3>
             </div>
             
             <div className="grid grid-cols-1 gap-4">
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="اسم الموكل"
                  className="w-full px-4 py-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-indigo-500 focus:ring-0 text-slate-900 dark:text-white font-bold transition-all outline-none"
                />
                
                <div className="grid grid-cols-2 gap-4">
                    <input
                      type="tel"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="رقم الهاتف"
                      className="w-full px-4 py-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-indigo-500 focus:ring-0 text-slate-900 dark:text-white font-medium transition-all outline-none text-right dir-ltr"
                    />
                    <input
                      type="text"
                      value={fileNumber}
                      onChange={(e) => setFileNumber(e.target.value)}
                      placeholder="رقم الملف"
                      className="w-full px-4 py-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-indigo-500 focus:ring-0 text-slate-900 dark:text-white font-medium transition-all outline-none"
                    />
                </div>
             </div>
          </div>

          {/* Section 4: Notes */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
                 <AlignLeft className="w-5 h-5 text-slate-400" />
                 <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400">ملاحظات</h3>
             </div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="تفاصيل إضافية حول الجلسة..."
              rows={3}
              className="w-full p-4 rounded-2xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 focus:border-indigo-500 focus:ring-0 text-slate-900 dark:text-white transition-all resize-none leading-relaxed outline-none"
            />
          </div>

        </div>

        {/* Sticky Footer */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 z-10 sticky bottom-0">
          <div className="flex gap-3">
             <button
              type="button"
              onClick={onClose}
              className="px-6 py-4 rounded-2xl font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
             >
               إلغاء
             </button>
             <button
              onClick={handleSubmit}
              className="flex-1 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg shadow-xl shadow-indigo-200 dark:shadow-none transition-all active:scale-[0.98] flex items-center justify-center gap-2"
             >
               <Save className="w-5 h-5" />
               {initialData ? 'حفظ التعديلات' : 'حفظ القضية'}
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualEntryModal;
