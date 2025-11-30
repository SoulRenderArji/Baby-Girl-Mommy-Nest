import React, { useState } from 'react';
import { 
  Footprints, ShieldCheck, Volume2, VolumeX, XCircle, CheckCircle2, Wind, BookOpen, Lock, 
  NotebookPen, Trash2, Save, Calendar, CalendarPlus, Clock, Smartphone, Heart, Star, MapPin, Plus, ScrollText, ClipboardList
} from 'lucide-react';
import { Button, Card, Badge } from './UI';
import { Task, JournalEntry, Appointment, DiaperLogEntry } from '../types';

// --- HELPER FUNCTIONS ---
const speak = (text: string) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(v => v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Google US English'));
    if (femaleVoice) utterance.voice = femaleVoice;
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    window.speechSynthesis.speak(utterance);
  }
};

const vibrate = (pattern: number[]) => {
  if (typeof navigator.vibrate === 'function') {
    navigator.vibrate(pattern);
  }
};

const createGoogleCalendarLink = (event: Appointment) => {
    const { title, date, time, location, description } = event;
    try {
        const dateStr = `${date} ${time}`;
        const startDate = new Date(dateStr);
        const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); 
        const format = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, "");
        const start = format(startDate);
        const end = format(endDate);
        return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${start}/${end}&details=${encodeURIComponent(description || '')}&location=${encodeURIComponent(location || '')}`;
    } catch (e) {
        return "https://calendar.google.com/calendar/";
    }
};

const getRelativeTime = (dateStr: string) => {
    try {
        const today = new Date();
        today.setHours(0,0,0,0);
        const target = new Date(dateStr);
        target.setHours(0,0,0,0);
        const diffTime = target.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return "Passed";
        if (diffDays === 0) return "Today!";
        if (diffDays === 1) return "Tomorrow";
        return `In ${diffDays} days`;
    } catch (e) {
        return "";
    }
}

const formatDateTime = (isoString: string) => {
  try {
    const date = new Date(isoString);
    return date.toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
  } catch {
    return isoString;
  }
};

// --- VIEW COMPONENTS ---

export const WalkView = ({ onClose, onAddStar }: { onClose: () => void, onAddStar: (n: number) => void }) => {
    const [voiceEnabled, setVoiceEnabled] = useState(false);
    return (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center p-6 animate-in fade-in duration-500 overflow-y-auto">
             <div className="w-full flex justify-between items-center mb-8 max-w-md">
                <div className="flex items-center gap-2">
                    <Footprints className="text-emerald-400" size={32} />
                    <h1 className="text-2xl font-bold text-white">Walk Mode</h1>
                </div>
                <Button variant="ghost" onClick={onClose}><XCircle /> End Walk</Button>
             </div>

             <div className="flex flex-col items-center gap-6 w-full max-w-md mt-4">
                <div className="text-center mb-4">
                    <p className="text-slate-400 text-lg">Mommy is with you.</p>
                    <p className="text-emerald-400 text-sm font-bold mt-1 animate-pulse">● CONNECTED</p>
                </div>

                <Button 
                    variant="google" 
                    size="lg" 
                    className="w-full h-32 text-xl flex-col gap-2 shadow-[0_0_30px_rgba(59,130,246,0.3)]"
                    onClick={() => {
                        speak("You are safe. You are dry. You are doing a great job.");
                        vibrate([100, 50, 100]);
                    }}
                >
                    <ShieldCheck size={48} />
                    I'm Anxious
                </Button>

                <Button 
                    variant="walk" 
                    size="lg" 
                    className="w-full h-24 text-xl flex-col gap-2"
                    onClick={() => {
                        speak("Good job taking a step. Keep going.");
                        onAddStar(1);
                        vibrate([50]);
                    }}
                >
                    <Footprints size={36} />
                    Check In
                </Button>

                 <Card className="w-full border-slate-700 bg-slate-900/50 mt-4">
                    <h3 className="text-slate-400 font-bold text-xs uppercase mb-2">Safety Reminder</h3>
                    <p className="text-white text-lg font-medium leading-tight">
                        "I checked before I left. I am safe. I have my phone. I can go home anytime."
                    </p>
                 </Card>

                 <div className="flex items-center gap-4 mt-4 bg-slate-800 p-3 rounded-full px-6">
                    <span className="text-sm text-slate-300 font-bold">Voice:</span>
                    <button onClick={() => { setVoiceEnabled(!voiceEnabled); speak(voiceEnabled ? "Voice off" : "Voice on"); }} className={`${voiceEnabled ? 'text-emerald-400' : 'text-slate-500'} transition-colors`}>
                        {voiceEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
                    </button>
                 </div>
             </div>
        </div>
    );
};

export const ComfortView = ({ onClose }: { onClose: () => void }) => (
    <div className="fixed inset-0 z-50 bg-indigo-950 flex flex-col items-center justify-center text-center p-6 animate-in fade-in duration-500">
        <div className="absolute top-4 right-4"><Button variant="ghost" onClick={onClose}><CheckCircle2 /> I feel better</Button></div>
        <h2 className="text-3xl font-bold text-indigo-200 mb-8">Breathe with Mommy</h2>
        <div className="relative group">
            <div className="w-64 h-64 bg-indigo-500/20 rounded-full animate-[ping_4s_ease-in-out_infinite] absolute inset-0"></div>
            <div className="w-64 h-64 bg-indigo-400/20 rounded-full animate-[ping_4s_ease-in-out_infinite_1s] absolute inset-0"></div>
            <div className="w-64 h-64 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.5)] relative animate-[pulse_4s_ease-in-out_infinite]"><Wind size={64} className="text-white opacity-80" /></div>
        </div>
        <p className="mt-12 text-xl text-indigo-200 max-w-md animate-pulse">Breathe in slowly... hold... and let it all go.<br/><span className="text-sm mt-4 block opacity-70">You are safe here, Hailey.</span></p>
    </div>
);

export const RulesView = ({ onClose, rules }: { onClose: () => void, rules: string[] }) => (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center text-center p-6 animate-in fade-in duration-500 overflow-y-auto">
        <div className="absolute top-4 right-4"><Button variant="ghost" onClick={onClose}><XCircle /> Close</Button></div>
        <Card className="max-w-md w-full border-slate-600 bg-slate-900 my-auto">
            <div className="flex justify-center mb-4"><div className="p-4 bg-slate-800 rounded-full"><BookOpen size={32} className="text-slate-300" /></div></div>
            <h2 className="text-2xl font-bold text-white mb-6">House Rules</h2>
            <div className="text-left space-y-4">
                {rules.map((rule, idx) => (
                    <div key={idx} className="flex gap-3 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                        <Lock size={18} className="text-rose-400 mt-1 flex-shrink-0" />
                        <span className="text-slate-200 font-medium">{rule}</span>
                    </div>
                ))}
            </div>
            <p className="text-xs text-slate-500 mt-6">Protocols authorized by Daddy.</p>
        </Card>
    </div>
);

export const JournalView = ({ onClose, journal, onAdd, onDelete }: { onClose: () => void, journal: JournalEntry[], onAdd: (t: string) => void, onDelete: (id: number) => void }) => {
    const [input, setInput] = useState('');
    return (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center p-6 animate-in fade-in duration-500 overflow-y-auto">
            <div className="w-full max-w-lg flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2"><NotebookPen className="text-rose-400"/> Symptom Journal</h2>
                <Button variant="ghost" onClick={onClose}><XCircle /> Close</Button>
            </div>
            <Card className="max-w-lg w-full border-rose-500/30 bg-slate-900 mb-6">
                <div className="flex flex-col gap-3">
                    <textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="How does your body feel? Any pain? Vent here..." className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white min-h-[100px] focus:outline-none focus:ring-2 focus:ring-rose-500 resize-none" />
                    <Button onClick={() => { if(input.trim()) { onAdd(input); setInput(''); } }} variant="medical" className="w-full"><Save size={18} /> Save Entry</Button>
                </div>
            </Card>
            <div className="w-full max-w-lg space-y-3 pb-8">
                {journal.length === 0 && <p className="text-slate-500 text-center italic">No entries yet. Write down how you feel.</p>}
                {journal.map((entry) => (
                    <div key={entry.id} className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl relative group transition-all hover:border-slate-600">
                        <p className="text-xs text-rose-300 font-bold mb-1">{entry.date}</p>
                        <p className="text-slate-200 whitespace-pre-wrap">{entry.text}</p>
                        <button onClick={() => onDelete(entry.id)} className="absolute top-2 right-2 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-2"><Trash2 size={16} /></button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const AppointmentsView = ({ onClose, appointments, onAdd, onDelete }: { onClose: () => void, appointments: Appointment[], onAdd: (appt: Omit<Appointment, 'id'>) => void, onDelete: (id: number) => void }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [location, setLocation] = useState('');

    const handleAdd = () => {
        if (!title || !date) return;
        // Basic formatting
        const formattedDate = new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        
        onAdd({
            title,
            date: formattedDate,
            time: time || 'All Day',
            location: location || 'Home',
            description: '',
            type: 'general'
        });
        
        setTitle('');
        setDate('');
        setTime('');
        setLocation('');
        setIsAdding(false);
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center p-6 animate-in fade-in duration-500 overflow-y-auto">
            <div className="w-full max-w-lg flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2"><Calendar className="text-indigo-400"/> Appointments</h2>
                <Button variant="ghost" onClick={onClose}><XCircle /> Close</Button>
            </div>

            {/* Add Form */}
            {isAdding ? (
                <Card className="max-w-lg w-full border-indigo-500/30 bg-slate-900 mb-6 animate-in slide-in-from-top duration-300">
                    <h3 className="text-indigo-200 font-bold mb-4 flex items-center gap-2"><Plus size={18} /> New Appointment</h3>
                    <div className="space-y-3">
                        <input type="text" placeholder="What is it? (e.g. Dentist)" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        <div className="grid grid-cols-2 gap-3">
                            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <input type="text" placeholder="Where? (e.g. Clinic)" value={location} onChange={(e) => setLocation(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        <div className="flex gap-2 mt-2">
                             <Button onClick={handleAdd} variant="secondary" className="flex-1">Save</Button>
                             <Button onClick={() => setIsAdding(false)} variant="ghost" className="flex-1">Cancel</Button>
                        </div>
                    </div>
                </Card>
            ) : (
                <Button onClick={() => setIsAdding(true)} variant="secondary" className="w-full max-w-lg mb-6 shadow-indigo-500/20"><Plus size={18}/> Add New Appointment</Button>
            )}

            <div className="w-full max-w-lg space-y-3 pb-8">
                {appointments.map((appt) => {
                    const relativeTime = getRelativeTime(appt.date);
                    return (
                        <Card key={appt.id} className="border-indigo-500/30 bg-slate-900/80 group relative">
                            {relativeTime && (
                                <Badge className={`absolute -top-3 left-4 border border-slate-900 shadow-md ${relativeTime === 'Today!' ? 'bg-rose-500 text-white animate-pulse' : 'bg-indigo-600 text-white'}`}>
                                    {relativeTime}
                                </Badge>
                            )}
                            <div className="flex gap-4 items-center mt-2">
                                <div className="bg-indigo-900/50 p-3 rounded-xl border border-indigo-500/30 text-center min-w-[70px]">
                                    <span className="block text-xs text-indigo-300 font-bold uppercase">{appt.date.split(' ')[0]}</span>
                                    <span className="block text-2xl text-white font-bold">{appt.date.split(' ')[1].replace(',','')}</span>
                                </div>
                                <div className="flex-grow">
                                    <h3 className="text-lg font-bold text-white leading-tight">{appt.title}</h3>
                                    <p className="text-sm text-indigo-200 flex items-center gap-1 mt-1"><Clock size={12}/> {appt.time}</p>
                                    <p className="text-xs text-slate-400 mt-1 mb-2">{appt.location}</p>
                                    <a 
                                        href={createGoogleCalendarLink(appt)} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-[10px] font-bold bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-500 transition-colors"
                                    >
                                        <CalendarPlus size={12} /> Add to Google Calendar
                                    </a>
                                </div>
                            </div>
                            <button onClick={() => onDelete(appt.id)} className="absolute top-3 right-3 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-2"><Trash2 size={16} /></button>
                        </Card>
                    );
                })}
                {appointments.length === 0 && <p className="text-slate-500 text-center italic mt-8">No upcoming appointments. Relax, baby girl.</p>}
            </div>
        </div>
    );
};

export const DiaperLogView = ({ onClose, diaperLog, onAdd, onDelete }: { onClose: () => void, diaperLog: DiaperLogEntry[], onAdd: (status: DiaperLogEntry['status']) => void, onDelete: (id: number) => void }) => {
  const [status, setStatus] = useState<DiaperLogEntry['status']>('wet');

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center p-6 animate-in fade-in duration-500 overflow-y-auto">
      <div className="w-full max-w-lg flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2"><ScrollText className="text-pink-400"/> Diaper Log</h2>
        <Button variant="ghost" onClick={onClose}><XCircle /> Close</Button>
      </div>

      <Card className="max-w-lg w-full border-pink-500/30 bg-slate-900 mb-6">
        <h3 className="text-pink-200 font-bold mb-4 flex items-center gap-2"><ClipboardList size={18} /> Log New Change</h3>
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <Button 
              variant={status === 'wet' ? 'water' : 'ghost'} 
              onClick={() => setStatus('wet')} 
              className="flex-1"
            >
              Wet
            </Button>
            <Button 
              variant={status === 'soiled' ? 'food' : 'ghost'} 
              onClick={() => setStatus('soiled')} 
              className="flex-1"
            >
              Soiled
            </Button>
            <Button 
              variant={status === 'mixed' ? 'primary' : 'ghost'} 
              onClick={() => setStatus('mixed')} 
              className="flex-1"
            >
              Mixed
            </Button>
          </div>
          <Button onClick={() => { onAdd(status); }} variant="primary" className="w-full"><Save size={18} /> Record Change</Button>
        </div>
      </Card>

      <div className="w-full max-w-lg space-y-3 pb-8">
        {diaperLog.length === 0 && <p className="text-slate-500 text-center italic">No diaper entries yet. Let's log your first one!</p>}
        {diaperLog.map((entry) => (
          <div key={entry.id} className="bg-slate-800/50 border border-slate-700 p-4 rounded-xl relative group transition-all hover:border-slate-600">
            <p className="text-xs text-pink-300 font-bold mb-1">{formatDateTime(entry.timestamp)}</p>
            <p className="text-slate-200 capitalize">Status: <Badge className={`${entry.status === 'wet' ? 'bg-cyan-500/20 text-cyan-300' : entry.status === 'soiled' ? 'bg-amber-500/20 text-amber-300' : 'bg-pink-500/20 text-pink-300'}`}>{entry.status}</Badge></p>
            <button onClick={() => onDelete(entry.id)} className="absolute top-2 right-2 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity p-2"><Trash2 size={16} /></button>
          </div>
        ))}
      </div>
    </div>
  );
};


export const WatchView = ({ onClose, tasks, toggleTask, minsSinceCheck, currentTime, formatTime }: { onClose: () => void, tasks: Task[], toggleTask: (id: number) => void, minsSinceCheck: number, currentTime: Date, formatTime: (d: Date) => string }) => {
    const nextTask = tasks.find(t => !t.completed);
    return (
        <div className="fixed inset-0 z-[60] bg-black flex items-center justify-center font-sans animate-in fade-in duration-300">
            <div className="relative w-80 h-80 rounded-full bg-slate-900 border-4 border-slate-800 flex flex-col items-center justify-center text-center p-6 shadow-[0_0_50px_rgba(236,72,153,0.3)] overflow-hidden">
                <div className="text-6xl font-black text-white mb-2 tracking-tighter drop-shadow-lg">{formatTime(currentTime)}</div>
                <div className="mb-4 flex items-center gap-2">
                     <Badge className={`${minsSinceCheck > 120 ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300'}`}>Check: {minsSinceCheck}m</Badge>
                </div>
                {nextTask ? (
                    <div className="flex flex-col items-center w-full px-4 animate-in slide-in-from-bottom duration-500">
                        <p className="text-pink-200 text-sm font-medium line-clamp-1 mb-3">{nextTask.text}</p>
                        <button onClick={() => toggleTask(nextTask.id)} className="bg-pink-500 hover:bg-pink-400 text-white rounded-full p-4 shadow-lg active:scale-90 transition-transform"><CheckCircle2 size={28} /></button>
                    </div>
                ) : (
                    <div className="text-emerald-400 flex flex-col items-center animate-bounce"><Heart size={40} className="mb-2 text-pink-500 fill-pink-500" /><span className="text-base font-bold">Good Girl!</span></div>
                )}
                <button onClick={onClose} className="absolute bottom-6 text-slate-600 hover:text-white transition-colors"><Smartphone size={24} /></button>
            </div>
        </div>
    );
};