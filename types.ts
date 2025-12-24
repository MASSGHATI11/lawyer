
export enum CaseType {
  Family = 'Family',
  Appeal = 'Appeal',
  Criminal = 'Criminal',
  Traffic = 'Traffic',
  Civil = 'Civil',
  RealEstate = 'RealEstate',
  Urgent = 'Urgent',
  Misdemeanor = 'Misdemeanor',
  Flagrante = 'Flagrante',
  Commercial = 'Commercial',
  Other = 'Other'
}

export interface User {
  name: string;
  email: string;
  avatar: string;
}

export interface Appointment {
  id: string;
  clientName: string;
  clientPhone?: string; 
  fileNumber?: string; 
  caseType: CaseType;
  date: string; // ISO 8601 string
  description: string;
  createdAt: number;
  archived?: boolean;
}

export const CASE_COLORS: Record<CaseType, string> = {
  [CaseType.Family]: 'bg-purple-100 text-purple-800 border-purple-200',
  [CaseType.Appeal]: 'bg-blue-100 text-blue-800 border-blue-200',
  [CaseType.Criminal]: 'bg-red-100 text-red-800 border-red-200',
  [CaseType.Traffic]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  [CaseType.Civil]: 'bg-teal-100 text-teal-800 border-teal-200',
  [CaseType.RealEstate]: 'bg-amber-100 text-amber-800 border-amber-200',
  [CaseType.Urgent]: 'bg-rose-100 text-rose-800 border-rose-200',
  [CaseType.Misdemeanor]: 'bg-slate-200 text-slate-800 border-slate-300',
  [CaseType.Flagrante]: 'bg-orange-100 text-orange-800 border-orange-200',
  [CaseType.Commercial]: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  [CaseType.Other]: 'bg-gray-100 text-gray-800 border-gray-200',
};

export const CASE_TYPE_LABELS_AR: Record<CaseType, string> = {
  [CaseType.Family]: 'أحوال شخصية',
  [CaseType.Appeal]: 'استئناف',
  [CaseType.Criminal]: 'جنايات',
  [CaseType.Traffic]: 'مرور',
  [CaseType.Civil]: 'مدني',
  [CaseType.RealEstate]: 'عقاري',
  [CaseType.Urgent]: 'استعجالي',
  [CaseType.Misdemeanor]: 'جنحي',
  [CaseType.Flagrante]: 'تلبسي',
  [CaseType.Commercial]: 'تجارية',
  [CaseType.Other]: 'أخرى',
};

export interface CaseGroup {
  label: string;
  types: CaseType[];
}

export const CASE_GROUPS: CaseGroup[] = [
  {
    label: 'قضايا الأسرة',
    types: [CaseType.Family]
  },
  {
    label: 'القضايا الزجرية والجنائية',
    types: [CaseType.Criminal, CaseType.Misdemeanor, CaseType.Flagrante, CaseType.Traffic]
  },
  {
    label: 'القضايا المدنية والعقارية',
    types: [CaseType.Civil, CaseType.RealEstate]
  },
  {
    label: 'قضايا الأعمال',
    types: [CaseType.Commercial]
  },
  {
    label: 'المساطر والاستعجالي',
    types: [CaseType.Appeal, CaseType.Urgent]
  },
  {
    label: 'أخرى',
    types: [CaseType.Other]
  }
];
