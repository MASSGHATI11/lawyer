
import React from 'react';
import { Appointment } from '../types';
import AppointmentCard from './AppointmentCard';
import { X, Archive, Inbox } from 'lucide-react';

interface ArchiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  archivedAppointments: Appointment[];
  onRestore: (id: string) => void;
  onDelete: (id: string) => void;
}

const ArchiveModal: React.FC<ArchiveModalProps> = ({ isOpen, onClose, archivedAppointments, onRestore, onDelete }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-slate-50 dark:bg-slate-900 animate-fadeIn" dir="rtl">
        {/* Header */}
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 p-4 pt-safe flex items-center justify-between shadow-sm sticky top-0 z-10">
             <div className="flex items-center gap-3">
                <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-xl text-amber-600 dark:text-amber-400">
                    <Archive className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-black text-slate-800 dark:text-white">الأرشيف</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">القضايا المؤرشفة ({archivedAppointments.length})</p>
                </div>
             </div>
             <button 
                onClick={onClose} 
                className="w-10 h-10 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition-colors active:scale-95"
             >
                <X className="w-6 h-6" />
             </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-safe">
            {archivedAppointments.length > 0 ? (
                archivedAppointments.map(appt => (
                    <AppointmentCard 
                        key={appt.id} 
                        appointment={appt} 
                        onDelete={onDelete} 
                        onRestore={onRestore}
                        isArchived={true}
                    />
                ))
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-60 pb-20">
                    <div className="w-24 h-24 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                        <Inbox className="w-12 h-12 text-slate-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-2">الأرشيف فارغ</h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
                        عندما تقوم بأرشفة قضية، ستظهر هنا للرجوع إليها لاحقاً بدلاً من حذفها نهائياً.
                    </p>
                </div>
            )}
        </div>
    </div>
  );
};

export default ArchiveModal;
