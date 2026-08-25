export type UserRole = 'patient' | 'caregiver';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  caregiverCode?: string; // Generated code e.g. MED-4821 for patients
  connectionCode?: string; // Alias for caregiverCode
  createdAt: string;
  settings?: UserSettings;
}

export interface UserSettings {
  voiceReminders: boolean;
  browserNotifications: boolean;
  gracePeriodMinutes: number; // 10, 20, 30, 60 min (default 30)
  fontSizePreference?: 'normal' | 'large' | 'extra-large';
}

export type FrequencyType = 'Once' | 'Daily' | 'Twice Daily' | 'Three Times Daily' | 'Custom';

export type FoodInstructionType = 
  | 'Before food' 
  | 'After food' 
  | 'With food' 
  | 'No instruction'
  | 'After breakfast'
  | 'After lunch'
  | 'After dinner'
  | 'Before breakfast'
  | 'Before dinner'
  | 'Bedtime';

export interface Medicine {
  id: string;
  userId: string;
  name: string;
  dosage: string;
  time: string; // HH:mm format e.g. "08:00" or comma separated for multiple times
  frequency: FrequencyType;
  foodInstruction: FoodInstructionType;
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD (optional)
  notes?: string;
  active: boolean;
  createdAt: string;
}

export type LogStatus = 'upcoming' | 'taken' | 'snoozed' | 'missed';

export interface MedicineLog {
  id: string;
  medicineId: string;
  userId: string;
  medicineName: string;
  dosage: string;
  foodInstruction: FoodInstructionType;
  scheduledTime: string; // Full ISO string or date + HH:mm
  status: LogStatus;
  actionTime?: string; // When taken/snoozed/missed
  takenAt?: string; // Alias for actionTime when status is taken
  snoozeUntil?: string; // When snoozed until
  snoozeCount?: number;
  notes?: string;
  createdAt: string;
}

export type CaregiverLinkStatus = 'pending' | 'approved' | 'declined';

export interface CaregiverLink {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  caregiverId: string;
  caregiverName: string;
  caregiverEmail: string;
  status: CaregiverLinkStatus;
  connectionCode: string;
  createdAt: string;
  updatedAt?: string;
}

export type CaregiverConnection = CaregiverLink;

export interface AIReminderParseResult {
  name: string;
  dosage: string;
  time: string;
  frequency: FrequencyType;
  foodInstruction: FoodInstructionType;
  notes?: string;
  confidence: number;
}

export interface DaySummary {
  totalScheduled: number;
  taken: number;
  upcoming: number;
  snoozed: number;
  missed: number;
  responseRate: number; // percentage (0 - 100)
}
