import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';

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
    console.error("Uncaught runtime error caught by PacMac ErrorBoundary:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.hash = '#/';
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <section className="relative min-h-[80vh] flex items-center justify-center px-6 bg-black text-left">
          <div className="absolute inset-0 bg-white/[0.003] pointer-events-none" />
          <div className="max-w-md w-full border border-white/10 bg-white/[0.01] rounded-2xl p-6 md:p-8 backdrop-blur-md space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
                <ShieldAlert className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <span className="font-mono text-[9px] text-red-400 uppercase tracking-widest block font-bold">
                  FATAL SYSTEM FAULT // REACT EXCEPTION
                </span>
                <h3 className="font-display text-lg font-bold text-white mt-0.5">
                  Something exploded. Probably JavaScript.
                </h3>
              </div>
            </div>

            <div className="p-4 border border-white/5 bg-black/60 rounded-xl space-y-2 font-mono text-[10px] text-brand-gray-400">
              <p className="text-white font-semibold">Error Diagnostics:</p>
              <p className="leading-relaxed break-words bg-white/[0.02] p-2 rounded border border-white/5">
                {this.state.error?.toString() || 'Unknown runtime render exception.'}
              </p>
              <p className="text-brand-gray-500 pt-1">
                Refreshes usually resolve client rendering synchronization bugs. Unlike legacy telecom support, we don't put you on hold.
              </p>
            </div>

            <button
              onClick={this.handleReset}
              className="w-full py-3.5 text-center text-xs font-mono font-semibold text-black bg-white hover:bg-brand-gray-150 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Re-sync App Workspace
            </button>
          </div>
        </section>
      );
    }

    return this.props.children;
  }
}
