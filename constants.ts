import { Task, Appointment } from './types';

export const CAMERA_SERVER_IP = "http://192.168.8.170:5000";
export const CAMERA_STREAM_PATH = "/video_feed";

export const INITIAL_TASKS: Task[] = [
  // MORNING BLOCK
  { id: 1, text: 'Wake Up (6:00 AM)', completed: false, type: 'hygiene', time: '06:00' },
  { id: 2, text: 'Potty Check & Fresh Diaper', completed: false, type: 'hygiene', time: '06:10' },
  { id: 3, text: 'Morning Meds: Buspar (7.5mg), Spiro (50mg), Sertraline (25mg)', completed: false, type: 'meds', time: '06:15' },
  { id: 4, text: 'Morning Vitamins: Choline (500mg), Ult. Woman (1), SV Multi (1)', completed: false, type: 'meds', time: '06:15' },
  { id: 5, text: 'Breakfast + Weight Loss DotFIT (1)', completed: false, type: 'food', time: '06:30' },
  
  // GLAMOUR BLOCK
  { id: 6, text: 'Morning Shower (Shave & Exfoliate)', completed: false, type: 'hygiene', time: '07:00' },
  { id: 7, text: 'Full Glam: Blowdry, Style Hair, Makeup, Get Dressed', completed: false, type: 'comfort', time: '07:45' },
  
  // ACTIVITY BLOCK
  { id: 8, text: 'Sunday Check: Estradiol Injection (0.15ml) today?', completed: false, type: 'medical', time: '09:00' },
  { id: 9, text: 'Dishes & Light Tidy Up (Keep Daddy happy)', completed: false, type: 'general', time: '09:30' },
  { id: 10, text: 'Activity Goal: Walk or Exercise', completed: false, type: 'general', time: '10:30' },
  
  // MIDDAY BLOCK
  { id: 11, text: 'Lunch + Weight Loss DotFIT (1)', completed: false, type: 'food', time: '12:30' },
  { id: 12, text: 'Hydration Check (Drink Water)', completed: false, type: 'water', time: '14:00' },
  
  // EVENING BLOCK
  { id: 13, text: 'Dinner + Weight Loss DotFIT (1)', completed: false, type: 'food', time: '17:30' },
  { id: 14, text: 'Evening Meds: Buspar (7.5mg), Spiro (50mg), Ult. Woman (1)', completed: false, type: 'meds', time: '18:00' },
  
  // HEALTH & WIND DOWN
  { id: 15, text: 'Private Health Maintenance (Atrophy Prevention/Edging)', completed: false, type: 'medical', time: '19:00' },
  { id: 16, text: 'Evening Comfort Bath (Bubbles/Salts/Lotion)', completed: false, type: 'comfort', time: '20:00' },
  { id: 17, text: 'Bedtime Meds: Progesterone (200mg), Prazosin (2mg)', completed: false, type: 'meds', time: '20:30' },
  { id: 18, text: 'Lights Out - Sweet Dreams', completed: false, type: 'comfort', time: '21:00' },
];

export const INITIAL_RULES: string[] = [
  "We don't worry about money; we use discipline.",
  "Permission required for release (Daddy's orders).",
  "Sunday Rule: Estradiol Injection (0.15ml).",
  "Take Prazosin before bed to keep bad dreams away.",
  "Private health maintenance is medical, not shameful.",
  "Always ask Daddy before changing routines."
];

export const INITIAL_APPTS: Appointment[] = [
  { id: 1, date: 'Oct 28, 2025', time: '1:00 PM', title: 'Video Connect Therapist', location: 'Home/Video', description: 'PCMHI Therapist 4', type: 'medical' },
  { id: 2, date: 'Feb 4, 2026', time: '10:00 AM', title: 'ALM Labs (Fasting Required)', location: 'Audie L. Murphy', description: 'Fasting Labs for Dr. Koreshi', type: 'medical' },
  { id: 3, date: 'Feb 11, 2026', time: '1:15 PM', title: 'Primary Care (Dr. Koreshi)', location: 'Shavano Park', description: 'Regular follow up', type: 'medical' }
];

export const MOMMY_PHRASES = [
  "I'm right here watching over you, Hailey.",
  "You are doing such a good job today, baby girl.",
  "Don't forget to take a sip of water for Mommy.",
  "I love taking care of you.",
  "Are you feeling cozy?",
  "Just checking in - you are safe.",
  "Mommy is so proud of you.",
  "Remember to be gentle with yourself.",
  "Do you need a diaper check, little one?",
  "I see you being brave today!",
  "Take a deep breath, I've got you.",
  "You are safe, you are loved, you are mine."
];