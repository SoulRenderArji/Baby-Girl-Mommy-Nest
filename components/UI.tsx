import React, { ReactNode, ErrorInfo } from 'react';
import { XCircle } from 'lucide-react';

// --- BUTTON ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'check' | 'food' | 'water' | 'comfort' | 'tapo' | 'medical' | 'rules' | 'walk' | 'google' | 'ghost' | 'sos' | 'hygiene';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button: React.FC<ButtonProps> = ({ onClick, variant = 'primary', className = '', children, size = 'md', disabled = false, ...props }) => {
  const baseStyle = "font-bold rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg relative overflow-hidden group select-none outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900";
  
  const variants = {
    primary: "bg-pink-500 text-white hover:bg-pink-400 border-b-4 border-pink-700 active:border-b-0 active:translate-y-1 focus:ring-pink-500", 
    secondary: "bg-indigo-500 text-white hover:bg-indigo-400 border-b-4 border-indigo-700 active:border-b-0 active:translate-y-1 focus:ring-indigo-500",
    check: "bg-emerald-500 text-white hover:bg-emerald-400 border-b-4 border-emerald-700 active:border-b-0 active:translate-y-1 focus:ring-emerald-500",
    food: "bg-amber-500 text-white hover:bg-amber-400 border-b-4 border-amber-700 active:border-b-0 active:translate-y-1 focus:ring-amber-500",
    water: "bg-cyan-500 text-white hover:bg-cyan-400 border-b-4 border-cyan-700 active:border-b-0 active:translate-y-1 focus:ring-cyan-500",
    comfort: "bg-purple-500 text-white hover:bg-purple-400 border-b-4 border-purple-700 active:border-b-0 active:translate-y-1 focus:ring-purple-500",
    tapo: "bg-orange-500 text-white hover:bg-orange-400 border-b-4 border-orange-700 active:border-b-0 active:translate-y-1 focus:ring-orange-500",
    medical: "bg-rose-500 text-white hover:bg-rose-400 border-b-4 border-rose-700 active:border-b-0 active:translate-y-1 focus:ring-rose-500",
    rules: "bg-slate-700 text-white hover:bg-slate-600 border-b-4 border-slate-900 active:border-b-0 active:translate-y-1 focus:ring-slate-500",
    walk: "bg-emerald-600 text-white hover:bg-emerald-500 border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1 focus:ring-emerald-500",
    google: "bg-blue-600 text-white hover:bg-blue-500 border-b-4 border-blue-800 active:border-b-0 active:translate-y-1 focus:ring-blue-500",
    ghost: "bg-slate-800/50 text-pink-300 hover:bg-slate-700/50 shadow-none border-transparent",
    sos: "bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:from-rose-400 hover:to-pink-500 border-b-4 border-rose-800 active:border-b-0 active:translate-y-1 shadow-rose-900/50",
    hygiene: "bg-pink-600 text-white hover:bg-pink-500 border-b-4 border-pink-800 active:border-b-0 active:translate-y-1 focus:ring-pink-600",
  };
  
  const sizes = { sm: "px-3 py-2 text-sm", md: "px-4 py-4 text-base", lg: "px-6 py-6 text-xl", icon: "p-3" };
  
  const variantClass = variants[variant] || variants.primary;
  const sizeClass = sizes[size] || sizes.md;

  return (
    <button onClick={onClick} disabled={disabled} className={`${baseStyle} ${variantClass} ${sizeClass} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`} {...props}>
      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-2xl" />
      <span className="relative z-10 flex items-center justify-center gap-2 w-full">{children}</span>
    </button>
  );
};

// --- CARD ---
export const Card: React.FC<{ children: ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-3xl p-5 shadow-xl transition-all duration-300 ${className}`}>
    {children}
  </div>
);

// --- BADGE ---
export const Badge: React.FC<{ children: ReactNode; className?: string }> = ({ children, className = '' }) => (
  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${className}`}>
    {children}
  </span>
);

// --- VISUALIZER ---
export const AudioVisualizer: React.FC<{ isActive: boolean }> = ({ isActive }) => {
    return (
        <div className="flex items-end justify-center gap-1 h-8">
            <div className={`w-1.5 bg-rose-400 rounded-full transition-all duration-300 ${isActive ? 'animate-[bounce_0.8s_infinite] h-6' : 'h-1.5'}`}></div>
            <div className={`w-1.5 bg-pink-400 rounded-full transition-all duration-300 ${isActive ? 'animate-[bounce_1.2s_infinite] h-8' : 'h-1.5'}`}></div>
            <div className={`w-1.5 bg-purple-400 rounded-full transition-all duration-300 ${isActive ? 'animate-[bounce_1s_infinite] h-5' : 'h-1.5'}`}></div>
            <div className={`w-1.5 bg-indigo-400 rounded-full transition-all duration-300 ${isActive ? 'animate-[bounce_1.4s_infinite] h-7' : 'h-1.5'}`}></div>
        </div>
    );
}

// --- ERROR BOUNDARY ---
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = { hasError: false, errorInfo: null };

  public static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("MommySync Crash Report:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    localStorage.removeItem('geminiCareTasks');
    localStorage.removeItem('geminiCareRules');
    localStorage.removeItem('geminiCareJournal');
    localStorage.removeItem('geminiCareAppts');
    localStorage.removeItem('geminiCareDiaperLog'); // Clear diaper log on reset
    this.setState({ hasError: false });
    window.location.reload();
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center font-sans text-slate-200">
          <div className="bg-rose-900/20 p-6 rounded-3xl border border-rose-500/30 max-w-md w-full animate-in fade-in zoom-in duration-300">
            <XCircle size={48} className="mx-auto text-rose-400 mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Oops! A little stumble.</h2>
            <p className="text-slate-400 mb-6 text-sm">
              The app got confused. Don't worry, we can fix it.
            </p>
            <button onClick={this.handleReset} className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 px-4 rounded-xl transition-all active:scale-95 shadow-lg shadow-rose-900/20">
              Reset & Restart App
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}