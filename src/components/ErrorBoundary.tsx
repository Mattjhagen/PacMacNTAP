import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[Global Error Boundary] Caught uncaught runtime error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 relative font-sans font-light select-none">
          <div className="absolute top-[25%] left-1/2 -translate-x-1/2 w-[60vw] h-[30vh] radial-glow-gradient pointer-events-none z-0" />
          <div className="absolute inset-0 bg-grid-pattern opacity-15 z-0 animate-grid-drift" />
          
          <div className="relative z-10 w-full max-w-md border border-white/5 bg-neutral-950/40 backdrop-blur-md rounded-xl p-8 shadow-xl text-center space-y-6">
            <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-lg border border-red-500/20 bg-red-950/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[9px] uppercase font-mono tracking-widest text-brand-gray-500 block">
                System Interface Protection
              </span>
              <h2 className="font-display text-xl font-semibold text-white">
                Something didn't load right.
              </h2>
              <p className="text-xs text-brand-gray-400 font-light leading-relaxed">
                The application encountered an unexpected rendering anomaly. Your account status and lines remain active and unaffected.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={this.handleReload}
                className="flex-1 py-3 text-center text-xs font-semibold text-black bg-white hover:bg-brand-gray-200 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reload Page
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex-1 py-3 text-center text-xs font-mono border border-white/10 hover:border-white/20 rounded-lg transition-all cursor-pointer"
              >
                Return Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
