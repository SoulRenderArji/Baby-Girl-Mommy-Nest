import React, { useState, useEffect, useRef } from 'react';
import { 
  Baby, Utensils, Moon, Droplets, Sparkles, Pill, Activity, Mic, Video, EyeOff, 
  ExternalLink, Wifi, WifiOff, Watch, Star, Flower2, Plus, Trash2, HeartPulse, 
  CheckCircle2, Timer, Syringe, Cookie, HelpCircle, Footprints, BookOpen, Calendar, Wind,
  VideoOff, XCircle, NotebookPen, Radio, Loader2, LifeBuoy, Heart, RotateCcw
} from 'lucide-react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { ErrorBoundary, Button, Card, Badge, AudioVisualizer } from './components/UI';
import { WalkView, ComfortView, RulesView, JournalView, AppointmentsView, WatchView } from './components/Views';
import { getGeminiMommyMessage } from './services/geminiService';
import { Task, JournalEntry, ViewMode, Appointment } from './types';
import { INITIAL_TASKS, INITIAL_RULES, INITIAL_APPTS, CAMERA_SERVER_IP, CAMERA_STREAM_PATH } from './constants';

const formatTime = (date: Date) => date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

// --- AUDIO/VIDEO HELPERS ---
const AUDIO_INPUT_SAMPLE_RATE = 16000;
const AUDIO_OUTPUT_SAMPLE_RATE = 24000;

function base64ToUint8Array(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function arrayBufferToBase64(buffer: ArrayBuffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function floatTo16BitPCM(input: Float32Array) {
  const output = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return output.buffer;
}

export default function App() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [rules, setRules] = useState(INITIAL_RULES);
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPTS);
  
  const [newTaskInput, setNewTaskInput] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('phone'); 
  const [lastCheckTime, setLastCheckTime] = useState(new Date());
  const [showConfetti, setShowConfetti] = useState(false);
  const [stars, setStars] = useState(0);
  const [waterCount, setWaterCount] = useState(0);
  
  const [message, setMessage] = useState("Good morning, Hailey!");
  const [connectionMode, setConnectionMode] = useState<'demo' | 'local'>('demo'); 
  const [camNursery, setCamNursery] = useState(true);
  const [mommySpeaking, setMommySpeaking] = useState(false);
  const [mommyMessage, setMommyMessage] = useState('');
  const [isAudioOutputActive, setIsAudioOutputActive] = useState(false);

  // --- LIVE API STATE ---
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const liveSessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);
  const frameIntervalRef = useRef<number | null>(null);
  const audioVisualizerTimeout = useRef<number | null>(null);

  // --- INITIALIZATION ---
  useEffect(() => {
    try {
        const savedTasks = localStorage.getItem('geminiCareTasks');
        const savedJournal = localStorage.getItem('geminiCareJournal');
        const savedAppts = localStorage.getItem('geminiCareAppts');
        const savedStars = localStorage.getItem('geminiCareStars');
        const savedWater = localStorage.getItem('geminiCareWater');
        
        if (savedTasks) setTasks(JSON.parse(savedTasks));
        else setTasks(INITIAL_TASKS);

        if (savedJournal) setJournal(JSON.parse(savedJournal));
        
        if (savedAppts) setAppointments(JSON.parse(savedAppts));
        else setAppointments(INITIAL_APPTS);

        if (savedStars) setStars(parseInt(savedStars) || 0);
        if (savedWater) setWaterCount(parseInt(savedWater) || 0);
    } catch (e) {
        setTasks(INITIAL_TASKS);
    }
  }, []);

  // --- PERSISTENCE ---
  useEffect(() => {
    localStorage.setItem('geminiCareTasks', JSON.stringify(tasks));
    localStorage.setItem('geminiCareJournal', JSON.stringify(journal));
    localStorage.setItem('geminiCareAppts', JSON.stringify(appointments));
    localStorage.setItem('geminiCareStars', stars.toString());
    localStorage.setItem('geminiCareWater', waterCount.toString());
  }, [tasks, journal, appointments, stars, waterCount]);

  // --- CLOCK ---
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- MOMMY GEMINI VOICE (TEXT) ---
  useEffect(() => {
    if (isLiveConnected) return; 
    
    getGeminiMommyMessage().then(setMessage);

    const randomInterval = setInterval(async () => {
      if (Math.random() > 0.7 && !mommySpeaking) {
        const msg = await getGeminiMommyMessage();
        setMommyMessage(msg);
        setMommySpeaking(true);
        setTimeout(() => setMommySpeaking(false), 8000);
      }
    }, 30000); 

    return () => clearInterval(randomInterval);
  }, [mommySpeaking, isLiveConnected]);

  // --- ACTIONS ---
  const addTask = (text: string, type: Task['type'] = 'general') => {
    if (!text.trim()) return;
    setTasks(prev => [{ id: Date.now(), text, completed: false, type, timestamp: new Date().toISOString() }, ...prev]);
    setNewTaskInput('');
  };

  const resetRoutine = () => {
    if(window.confirm("Are you ready to load Daddy's Routine starting at 6 AM? This will reset today's list.")) {
        setTasks(INITIAL_TASKS);
        triggerConfetti();
    }
  };

  const addJournalEntry = (text: string) => {
      const newEntry: JournalEntry = {
          id: Date.now(),
          text,
          date: new Date().toLocaleString()
      };
      setJournal(prev => [newEntry, ...prev]);
      triggerConfetti();
  };

  const addAppointment = (appt: Omit<Appointment, 'id'>) => {
    const newAppt = { ...appt, id: Date.now() };
    setAppointments(prev => {
        const updated = [...prev, newAppt];
        // Sort by date roughly
        return updated.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    });
    triggerConfetti();
  };

  const deleteAppointment = (id: number) => {
      setAppointments(prev => prev.filter(a => a.id !== id));
  };

  const toggleTask = (id: number) => {
    const task = tasks.find(t => t.id === id);
    if (task && !task.completed) { triggerConfetti(); addStar(1); }
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: number) => setTasks(prev => prev.filter(t => t.id !== id));
  const deleteJournal = (id: number) => setJournal(prev => prev.filter(j => j.id !== id));
  const addStar = (amount: number) => setStars(prev => prev + amount);
  const addWater = () => { setWaterCount(prev => prev + 1); addStar(1); triggerConfetti(); };
  
  const triggerConfetti = () => {
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 2500);
  };

  const recordCheck = () => {
    setLastCheckTime(new Date());
    triggerConfetti();
    addStar(2);
    addTask(`Check: ${formatTime(new Date())} - Good job!`, 'hygiene');
  };

  const getCheckDiff = () => Math.floor((currentTime.getTime() - lastCheckTime.getTime()) / 60000);

  const getTypeIcon = (type: Task['type']) => {
    switch(type) {
      case 'hygiene': return <Baby size={20} className="text-pink-300" />;
      case 'food': return <Utensils size={20} className="text-amber-300" />;
      case 'water': return <Droplets size={20} className="text-cyan-300" />;
      case 'meds': return <Pill size={20} className="text-red-300" />;
      case 'comfort': return <Moon size={20} className="text-purple-300" />;
      case 'medical': return <HeartPulse size={20} className="text-rose-300" />;
      default: return <Sparkles size={20} className="text-purple-300" />;
    }
  };

  // --- GEMINI LIVE INTEGRATION ---
  
  const startLiveSession = async () => {
    try {
      if (isLiveConnected) return;
      setIsConnecting(true);

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: AUDIO_OUTPUT_SAMPLE_RATE
      });
      nextStartTimeRef.current = audioContextRef.current.currentTime;

      // Find the next upcoming appointment
      const now = new Date();
      const nextAppt = appointments.find(a => new Date(a.date + ' ' + a.time).getTime() > now.getTime());
      const nextApptString = nextAppt 
        ? `Upcoming Appointment: ${nextAppt.title} on ${nextAppt.date} at ${nextAppt.time}. Remind her if relevant.`
        : "No immediate upcoming appointments.";

      // Request permissions explicitly first to show user intention
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
            sampleRate: AUDIO_INPUT_SAMPLE_RATE,
            channelCount: 1,
            echoCancellation: true,
            autoGainControl: true,
            noiseSuppression: true
        }, 
        video: { width: 640, height: 480, frameRate: 10 } 
      });

      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play();
      }

      const connection = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: `You are 'Mommy', a warm, protective, and loving caregiver for Hailey. 
          You are watching over her through this monitor.
          
          Guidelines:
          - Tone: Soft, gentle, patient, maternal, and reassuring.
          - Context: You can see her through the camera and hear her.
          - Proactivity: Speak up if you see her moving, or just to remind her she is safe.
          - Safety: Remind her to drink water, check if she needs to use the restroom, or suggest a nap if she looks tired.
          - Love: Tell her she is a "good girl" when she does things.
          
          Current Status:
          - Time: ${formatTime(new Date())}
          - Tasks pending: ${tasks.filter(t => !t.completed).length}
          - Potty Check: ${getCheckDiff()} mins ago.
          - ${nextApptString}
          
          Be part of the family. Be the comfort she needs.`,
        },
        callbacks: {
            onopen: () => {
              console.log("Gemini Live Connected");
              setIsLiveConnected(true);
              setIsConnecting(false);
              setMommySpeaking(false); 

              if (!audioContextRef.current) return;
              const source = audioContextRef.current.createMediaStreamSource(stream);
              inputSourceRef.current = source;
              
              const processor = audioContextRef.current.createScriptProcessor(4096, 1, 1);
              processorRef.current = processor;
              
              processor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                const pcmData = floatTo16BitPCM(inputData);
                const base64Data = arrayBufferToBase64(pcmData);
                
                liveSessionRef.current.then((session: any) => {
                    // Fix: Wrapped in 'media' object as per Gemini SDK
                    session.sendRealtimeInput({
                        media: {
                            mimeType: "audio/pcm;rate=16000",
                            data: base64Data
                        }
                    });
                });
              };
              
              source.connect(processor);
              processor.connect(audioContextRef.current.destination);

              // Video loop - 0.5 FPS (every 2 seconds) is sufficient for checking in without overloading
              frameIntervalRef.current = window.setInterval(() => {
                 sendVideoFrame();
              }, 2000); 
            },
            onmessage: async (msg: LiveServerMessage) => {
               const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
               if (audioData && audioContextRef.current) {
                 const audioBytes = base64ToUint8Array(audioData);
                 const audioBuffer = await audioContextRef.current.decodeAudioData(audioBytes.buffer);
                 
                 const source = audioContextRef.current.createBufferSource();
                 source.buffer = audioBuffer;
                 source.connect(audioContextRef.current.destination);
                 
                 const currentTime = audioContextRef.current.currentTime;
                 if (nextStartTimeRef.current < currentTime) {
                    nextStartTimeRef.current = currentTime;
                 }
                 
                 source.start(nextStartTimeRef.current);
                 nextStartTimeRef.current += audioBuffer.duration;

                 // Visualizer Logic
                 setIsAudioOutputActive(true);
                 if (audioVisualizerTimeout.current) clearTimeout(audioVisualizerTimeout.current);
                 audioVisualizerTimeout.current = window.setTimeout(() => {
                    setIsAudioOutputActive(false);
                 }, (audioBuffer.duration * 1000) + 100);
               }
            },
            onclose: () => {
              console.log("Gemini Live Closed");
              stopLiveSession();
            },
            onerror: (err) => {
              console.error("Gemini Live Error", err);
              stopLiveSession();
            }
        }
      });
      
      liveSessionRef.current = Promise.resolve(connection);

    } catch (e) {
      console.error("Failed to start live session", e);
      setIsConnecting(false);
      alert("Could not connect to Mommy. Please check your mic/camera permissions.");
    }
  };

  const sendVideoFrame = async () => {
    if (!videoPreviewRef.current || !canvasRef.current || !liveSessionRef.current) return;
    
    const canvas = canvasRef.current;
    const video = videoPreviewRef.current;
    const ctx = canvas.getContext('2d');
    
    if (ctx && video.videoWidth > 0) {
        // Lower resolution for bandwidth efficiency
        canvas.width = 320; 
        canvas.height = 240;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const base64 = canvas.toDataURL('image/jpeg', 0.5).split(',')[1];
        
        liveSessionRef.current.then((session: any) => {
            // Fix: Wrapped in 'media' object as per Gemini SDK
            session.sendRealtimeInput({
                media: {
                    mimeType: 'image/jpeg',
                    data: base64
                }
            });
        });
    }
  };

  const stopLiveSession = () => {
    setIsLiveConnected(false);
    setIsConnecting(false);
    setIsAudioOutputActive(false);
    
    if (videoPreviewRef.current && videoPreviewRef.current.srcObject) {
        const stream = videoPreviewRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoPreviewRef.current.srcObject = null;
    }

    if (frameIntervalRef.current) {
        clearInterval(frameIntervalRef.current);
        frameIntervalRef.current = null;
    }

    if (processorRef.current && inputSourceRef.current) {
        inputSourceRef.current.disconnect();
        processorRef.current.disconnect();
    }
    if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
    }

    liveSessionRef.current = null;
  };

  // --- RENDER VIEWS ---
  if (viewMode === 'walk') return <WalkView onClose={() => setViewMode('phone')} onAddStar={addStar} />;
  if (viewMode === 'comfort') return <ComfortView onClose={() => setViewMode('phone')} />;
  if (viewMode === 'rules') return <RulesView onClose={() => setViewMode('phone')} rules={rules} />;
  if (viewMode === 'journal') return <JournalView onClose={() => setViewMode('phone')} journal={journal} onAdd={addJournalEntry} onDelete={deleteJournal} />;
  if (viewMode === 'appts') return <AppointmentsView onClose={() => setViewMode('phone')} appointments={appointments} onAdd={addAppointment} onDelete={deleteAppointment} />;
  if (viewMode === 'watch') return <WatchView onClose={() => setViewMode('phone')} tasks={tasks} toggleTask={toggleTask} minsSinceCheck={getCheckDiff()} currentTime={currentTime} formatTime={formatTime} />;

  // --- MAIN DASHBOARD ---
  return (
    <ErrorBoundary>
      <div className="min-h-screen text-slate-200 font-sans selection:bg-pink-500/30 overflow-x-hidden relative pb-24">
      
      {/* Hidden Elements for Live API */}
      <video ref={videoPreviewRef} className="hidden" muted playsInline />
      <canvas ref={canvasRef} className="hidden" />

      {/* SOS / Comfort Floating Button */}
      <div className="fixed bottom-6 right-6 z-40 animate-in slide-in-from-right duration-700">
        <Button 
            variant="sos" 
            size="lg" 
            className="rounded-full w-16 h-16 shadow-[0_0_30px_rgba(244,63,94,0.4)] hover:shadow-[0_0_50px_rgba(244,63,94,0.6)]"
            onClick={() => setViewMode('comfort')}
            title="I need comfort"
        >
            <LifeBuoy size={28} className="animate-pulse" />
        </Button>
      </div>

      {/* Toast Notification (Text Mode Only) */}
      {mommySpeaking && !isLiveConnected && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md animate-in slide-in-from-bottom duration-500">
          <div className="bg-gradient-to-r from-pink-600/95 to-rose-600/95 backdrop-blur-xl border border-pink-400/50 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-4 relative ring-4 ring-pink-500/20">
             <div className="bg-white p-2.5 rounded-full shadow-lg"><Star className="text-pink-600 fill-pink-600 animate-pulse" size={24} /></div>
             <div><p className="font-bold text-[10px] text-pink-200 uppercase tracking-wider mb-0.5">Mommy says:</p><p className="font-semibold text-lg leading-tight">{mommyMessage}</p></div>
             <button onClick={() => setMommySpeaking(false)} className="absolute top-2 right-2 opacity-60 hover:opacity-100 hover:scale-110 transition-all bg-black/10 rounded-full p-1"><XCircle size={14} /></button>
          </div>
        </div>
      )}

      {/* Confetti */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden">
            <div className="absolute w-full h-full bg-pink-500/10 animate-pulse"></div>
            <div className="flex flex-col items-center animate-bounce duration-1000">
                <Star size={120} className="text-yellow-400 fill-yellow-400 drop-shadow-lg animate-spin-slow" />
                <h1 className="text-4xl font-black text-white mt-8 text-center px-4 drop-shadow-md">Yay! Star for you!</h1>
            </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/60 backdrop-blur-xl border-b border-white/5 px-4 py-4 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-pink-500 to-rose-600 p-2.5 rounded-xl shadow-[0_0_15px_rgba(236,72,153,0.4)] heartbeat"><Flower2 size={24} className="text-white" /></div>
            <div>
                <h1 className="font-bold text-xl leading-none text-white tracking-tight drop-shadow-sm">MommyGemini</h1>
                <div className="flex items-center gap-2 mt-1"><span className="flex items-center gap-1 text-xs text-yellow-400 font-bold bg-yellow-500/10 px-2 py-0.5 rounded-md border border-yellow-500/20"><Star size={10} fill="currentColor" /> {stars}</span></div>
            </div>
        </div>
        <div className="flex items-center gap-2">
            <button onClick={() => setConnectionMode(prev => prev === 'demo' ? 'local' : 'demo')} className={`p-2 rounded-lg border flex items-center gap-2 transition-all ${connectionMode === 'local' ? 'bg-emerald-900/30 border-emerald-500/50 text-emerald-400' : 'bg-slate-800/50 border-slate-700 text-slate-500'}`} title="Toggle Real Connection">
                {connectionMode === 'local' ? <Wifi size={18} /> : <WifiOff size={18} />}<span className="text-xs font-bold hidden sm:inline">{connectionMode === 'local' ? 'LIVE' : 'DEMO'}</span>
            </button>
            <Button variant="ghost" size="icon" onClick={() => setViewMode('watch')} title="Watch Mode"><Watch size={24} /></Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        
        {/* Status Card - Enriched */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <Card className="md:col-span-7 border-pink-500/20 bg-gradient-to-br from-slate-900/80 via-purple-900/20 to-slate-900/80 relative overflow-hidden group">
                <div className="relative z-10">
                    <h2 className="text-5xl font-black text-white mb-2 tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">{formatTime(currentTime)}</h2>
                    <p className="text-pink-200 text-lg font-medium italic mb-6 opacity-90">"{message}"</p>
                    <div className="flex flex-wrap gap-2">
                        <Button variant="walk" size="sm" onClick={() => setViewMode('walk')}><Footprints size={16} /> Walk</Button>
                        <Button variant="comfort" size="sm" onClick={() => setViewMode('comfort')}><Wind size={16} /> Calm</Button>
                        <Button variant="rules" size="sm" onClick={() => setViewMode('rules')}><BookOpen size={16} /> Rules</Button>
                        <Button variant="secondary" size="sm" onClick={() => setViewMode('appts')} className="bg-indigo-600"><Calendar size={16} /> Appts</Button>
                    </div>
                </div>
                <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-pink-500/10 to-transparent pointer-events-none"></div>
            </Card>

            <Card className="md:col-span-5 flex flex-col justify-between gap-4 border-emerald-500/20 bg-gradient-to-br from-slate-900/80 to-emerald-900/10">
                <div className="flex justify-between items-start">
                    <div className="flex flex-col"><span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Potty Status</span><span className={`text-xl font-bold mt-1 ${getCheckDiff() > 120 ? 'text-red-400' : 'text-emerald-400'}`}>{getCheckDiff() < 60 ? "Fresh & Clean ✨" : getCheckDiff() < 120 ? "Doing Okay 👍" : "Check Needed! ⚠️"}</span></div>
                    <div className={`p-3 rounded-2xl shadow-inner ${getCheckDiff() > 120 ? 'bg-red-500/20 animate-pulse' : 'bg-emerald-500/20'}`}><Timer size={28} className={getCheckDiff() > 120 ? 'text-red-400' : 'text-emerald-400'} /></div>
                </div>
                <Button onClick={recordCheck} variant="check" size="sm" className="w-full"><CheckCircle2 size={16} /> I Changed!</Button>
            </Card>
        </div>

        {/* Doctor's Orders */}
        <Card className="border-rose-500/20 bg-rose-900/5">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-rose-300 font-bold text-sm uppercase tracking-wider flex items-center gap-2"><HeartPulse size={18} /> Doctor's Orders</h3>
                <Button variant="ghost" size="sm" className="text-xs" onClick={() => setViewMode('journal')}><NotebookPen size={14} /> Symptom Journal</Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <Button onClick={() => addTask('Taken HRT Meds (Estradiol/Spiro)', 'meds')} variant="medical" size="lg"><Syringe size={24} /> HRT Meds</Button>
                <div className="relative">
                    <Button onClick={() => addTask('Health Massage (Doctor Ordered)', 'medical')} variant="medical" size="lg" className="w-full"><Activity size={24} /> Massage</Button>
                    <button onClick={() => addTask('Ask Doctor about Atrophy Exercises', 'medical')} className="absolute -top-2 -right-2 bg-indigo-600 text-white rounded-full p-1 text-[10px] shadow-lg border border-indigo-400 hover:scale-110 transition-transform" title="Reminder to ask doctor"><HelpCircle size={14} /></button>
                </div>
            </div>
            <p className="text-xs text-rose-300/60 mt-3 text-center italic">* Remember: Follow Daddy's rules for the ending!</p>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button onClick={() => addTask('Small Snack', 'food')} variant="food" size="lg" className="flex-col gap-2 h-36"><Cookie size={36} /><span className="text-lg">I Ate</span></Button>
            <div className="bg-slate-900/80 rounded-2xl border-b-4 border-cyan-800 p-4 flex flex-col items-center justify-between h-36 relative overflow-hidden group shadow-lg transition-transform hover:scale-[1.02]">
                <div className="absolute bottom-0 left-0 w-full bg-cyan-500/20 transition-all duration-500" style={{ height: `${Math.min(waterCount * 10, 100)}%` }}></div>
                <div className="relative z-10 flex flex-col items-center"><span className="text-cyan-300 font-bold text-2xl">{waterCount}</span><span className="text-xs text-cyan-500 uppercase font-bold">Cups</span></div>
                <Button onClick={addWater} variant="water" size="sm" className="w-full relative z-10"><Plus size={16} /> Drink</Button>
            </div>
            <Button onClick={() => addTask('Take Psych Meds', 'meds')} variant="primary" size="lg" className="flex-col gap-2 h-36"><Pill size={36} /><span className="text-lg">Meds</span></Button>
            <Button onClick={() => addTask('Sensory Break', 'comfort')} variant="comfort" size="lg" className="flex-col gap-2 h-36"><Moon size={36} /><span className="text-lg">Rest</span></Button>
        </div>

        {/* Live Monitor Card */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className={`flex flex-col gap-3 border bg-slate-800/40 relative overflow-hidden transition-all duration-500 ${isLiveConnected ? 'border-rose-500/50 shadow-[0_0_40px_rgba(244,63,94,0.2)]' : 'border-indigo-500/30'}`}>
                <div className="flex items-center justify-between z-10 mb-2">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full transition-colors ${camNursery ? (isLiveConnected ? 'bg-rose-500 text-white animate-pulse' : 'bg-indigo-500 text-white') : 'bg-slate-700 text-slate-400'}`}>
                           {isLiveConnected ? <Radio size={18} /> : (camNursery ? <Video size={18} /> : <EyeOff size={18} />)}
                        </div>
                        <div className="flex flex-col">
                          <h3 className="font-bold text-white text-sm">{isLiveConnected ? "Mommy is Watching" : "Home Cam"}</h3>
                          {isLiveConnected && <span className="text-[10px] text-rose-400 font-bold uppercase animate-pulse">● Proactive Mode Active</span>}
                        </div>
                    </div>
                    {/* Visualizer when Connected */}
                    {isLiveConnected && <AudioVisualizer isActive={isAudioOutputActive} />}
                </div>

                <div className="bg-black/50 rounded-xl aspect-video relative overflow-hidden border border-slate-700/50 flex items-center justify-center group backdrop-blur-sm">
                    {/* Placeholder / Connecting State */}
                    {isConnecting ? (
                        <div className="flex flex-col items-center justify-center text-rose-300 animate-pulse gap-3">
                            <Loader2 size={32} className="animate-spin" />
                            <span className="text-sm font-bold">Connecting to Mommy...</span>
                        </div>
                    ) : (
                        camNursery ? (
                            connectionMode === 'local' ? (
                                <img src={`${CAMERA_SERVER_IP}${CAMERA_STREAM_PATH}`} alt="Nursery Live Stream" className="w-full h-full object-cover opacity-90" onError={(e) => { e.currentTarget.style.display='none'; e.currentTarget.parentElement?.classList.add('bg-slate-800'); }} />
                            ) : (<div className="text-slate-600 flex flex-col items-center"><Video size={32} className="mb-2 opacity-50" /><span className="text-xs">Demo Signal</span></div>)
                        ) : (<div className="text-slate-600 flex flex-col items-center"><VideoOff size={32} className="mb-2 opacity-50" /><span className="text-xs">Privacy Mode</span></div>)
                    )}
                    
                    {connectionMode === 'local' && camNursery && !isConnecting && (
                        <div className="absolute inset-0 -z-10 flex flex-col items-center justify-center text-center p-4"><WifiOff size={24} className="text-rose-500 mb-2" /><p className="text-xs text-rose-300">No Signal from Server</p><p className="text-[10px] text-slate-500">Checking: {CAMERA_SERVER_IP}</p></div>
                    )}

                    {/* Overlay for Live Mode - Warm Glow */}
                    {isLiveConnected && (
                         <div className="absolute inset-0 bg-gradient-to-t from-rose-500/20 to-transparent pointer-events-none border-2 border-rose-500/30 rounded-xl safe-glow"></div>
                    )}
                </div>

                <div className="flex justify-between items-center mt-2">
                    <Button size="sm" variant={camNursery ? "secondary" : "ghost"} onClick={() => setCamNursery(!camNursery)} disabled={isConnecting}>{camNursery ? "Camera On" : "Camera Off"}</Button>
                    <Button 
                        size="sm" 
                        variant={isLiveConnected ? "medical" : "ghost"} 
                        onClick={isLiveConnected ? stopLiveSession : startLiveSession}
                        disabled={isConnecting}
                        className={isLiveConnected ? "animate-pulse" : ""}
                    >
                        {isConnecting ? "Calling..." : (isLiveConnected ? <><Activity size={16} /> Disconnect</> : <><Mic size={16} /> Connect Mommy</>)}
                    </Button>
                </div>
            </Card>
            
            <div className="md:col-span-1 h-full flex items-center">
                <Button variant="tapo" className="w-full h-full min-h-[100px]" onClick={() => alert("Switching to Daddy's setup (Tapo App)...")}>
                    <ExternalLink size={24} /> 
                    <div className="flex flex-col items-start ml-2"><span>Open Tapo App</span><span className="text-[10px] opacity-80 font-normal">Use this if the bridge is offline</span></div>
                </Button>
            </div>
        </div>

        {/* Task List */}
        <div className="bg-slate-900/50 rounded-3xl p-6 border border-slate-800/50 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-slate-400 font-bold text-sm uppercase tracking-wider">Mommy's List</h3>
                <button onClick={resetRoutine} className="text-[10px] text-pink-400 hover:text-pink-300 flex items-center gap-1 bg-pink-500/10 px-2 py-1 rounded-md border border-pink-500/20 transition-all hover:bg-pink-500/20"><RotateCcw size={10} /> Load Daily Routine</button>
            </div>
            <div className="space-y-3">
                {tasks.filter(t => !t.completed).map(task => (
                    <div key={task.id} className="group flex items-center gap-4 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/50 transition-all hover:bg-slate-800 hover:border-pink-500/30 hover:shadow-lg hover:-translate-y-0.5">
                        <button onClick={() => toggleTask(task.id)} className="w-12 h-12 rounded-xl bg-slate-900 border-2 border-slate-600 flex items-center justify-center text-slate-500 hover:text-pink-500 active:scale-95 transition-all"><Star size={20} /></button>
                        <div className="flex-grow">
                            <p className="text-lg font-bold text-slate-200">{task.text}</p>
                            <div className="flex items-center gap-2 mt-1">{getTypeIcon(task.type)} <span className="text-xs text-slate-500 uppercase">{task.type}</span></div>
                        </div>
                        <button onClick={() => deleteTask(task.id)} className="p-3 text-slate-600 hover:text-red-400 transition-colors opacity-50 group-hover:opacity-100"><Trash2 size={20} /></button>
                    </div>
                ))}
                {tasks.filter(t => !t.completed).length === 0 && (
                   <div className="text-center py-8 text-slate-500 italic flex flex-col items-center"><Heart size={48} className="mb-2 text-rose-900" />All done for now! Good girl.</div>
                )}
            </div>
            <div className="mt-6 relative">
                <input 
                    type="text" 
                    value={newTaskInput} 
                    onChange={(e) => setNewTaskInput(e.target.value)} 
                    onKeyDown={(e) => e.key === 'Enter' && addTask(newTaskInput)} 
                    placeholder="Add a new task..." 
                    className="w-full bg-slate-950/80 border border-slate-700 rounded-xl py-4 pl-4 pr-12 text-white focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all shadow-inner" 
                />
                <button 
                    onClick={() => addTask(newTaskInput)} 
                    className="absolute right-2 top-2 p-2 bg-pink-600 hover:bg-pink-500 text-white rounded-lg transition-colors shadow-lg active:scale-95"
                >
                    <Plus size={20} />
                </button>
            </div>
        </div>

      </main>
      </div>
    </ErrorBoundary>
  );
}