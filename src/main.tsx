import React, { StrictMode, Component, ReactNode, ErrorInfo } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Universal Canvas roundRect safe implementation to prevent runtime crashes in all browser engines
if (typeof window !== 'undefined' && typeof CanvasRenderingContext2D !== 'undefined') {
  const nativeRoundRect = CanvasRenderingContext2D.prototype.roundRect;
  CanvasRenderingContext2D.prototype.roundRect = function (
    x: number,
    y: number,
    w: number,
    h: number,
    radii?: number | number[]
  ) {
    if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(w) || !Number.isFinite(h)) {
      return this;
    }
    let r = 0;
    if (typeof radii === 'number') r = Math.max(0, radii);
    else if (Array.isArray(radii) && radii.length > 0) r = Math.max(0, radii[0] || 0);
    const maxRadius = Math.min(Math.abs(w), Math.abs(h)) / 2;
    if (r > maxRadius) r = maxRadius;

    if (nativeRoundRect) {
      try {
        nativeRoundRect.call(this, x, y, w, h, r);
        return this;
      } catch {
        // Fall back to custom path below if native roundRect throws
      }
    }

    this.beginPath();
    this.moveTo(x + r, y);
    this.lineTo(x + w - r, y);
    this.quadraticCurveTo(x + w, y, x + w, y + r);
    this.lineTo(x + w, y + h - r);
    this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    this.lineTo(x + r, y + h);
    this.quadraticCurveTo(x, y + h, x, y + h - r);
    this.lineTo(x, y + r);
    this.quadraticCurveTo(x, y, x + r, y);
    this.closePath();
    return this;
  };
}

// Tactical Error Boundary prevents white screen of death and offers instant safe reload
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

class TacticalErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error?.message || 'Unknown runtime error' };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('TacticalErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    try {
      localStorage.removeItem('zombie_survival_last_stand_save_v1');
    } catch (e) {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-[100dvh] bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center select-none">
          <div className="max-w-md w-full bg-slate-900 border-2 border-red-600 rounded-2xl p-6 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-red-950 border border-red-500 mx-auto flex items-center justify-center text-red-400 font-bold text-xl mb-3">
              ⚠
            </div>
            <h2 className="text-xl font-bold font-mono tracking-wider text-red-400 mb-1">
              SYSTEM MALFUNCTION
            </h2>
            <p className="text-xs text-slate-400 font-mono mb-4">
              Tactical interface encountered a runtime error:
            </p>
            <div className="bg-black/80 border border-red-900/60 p-3 rounded-lg text-[11px] font-mono text-red-300 text-left overflow-auto max-h-32 mb-5">
              {this.state.errorMessage}
            </div>
            <button
              onClick={this.handleReload}
              className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 active:scale-95 text-white font-bold font-mono text-sm tracking-wider uppercase shadow-lg shadow-red-950 transition cursor-pointer"
            >
              RESET & RESTART MISSION
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TacticalErrorBoundary>
      <App />
    </TacticalErrorBoundary>
  </StrictMode>,
);
