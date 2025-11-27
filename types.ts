export interface Task {
  id: number;
  text: string;
  completed: boolean;
  type: 'hygiene' | 'food' | 'water' | 'meds' | 'comfort' | 'medical' | 'general';
  time?: string;
  timestamp?: string;
}

export interface JournalEntry {
  id: number;
  text: string;
  date: string;
}

export interface Appointment {
  id: number;
  date: string; // Format: "Oct 28, 2025"
  time: string; // Format: "1:00 PM"
  title: string;
  location: string;
  description: string;
  type: 'medical' | 'general';
}

export type ViewMode = 'phone' | 'walk' | 'comfort' | 'rules' | 'journal' | 'appts' | 'watch';

export interface MommyMessageData {
  text: string;
  timestamp: number;
}
