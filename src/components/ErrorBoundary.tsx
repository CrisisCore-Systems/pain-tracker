import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home, Heart } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * Trauma-informed error boundary with gentle, supportive messaging.
 * Designed to reduce anxiety when errors occur.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary:', error, errorInfo);
  }

  handleRefresh = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div 
            className="min-h-screen flex items-center justify-center p-4"
            style={{ 
              background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.98) 0%, rgba(30, 41, 59, 0.95) 100%)' 
            }}
            role="alert"
            aria-live="assertive"
          >
            <div 
              className="max-w-md w-full text-center p-8 rounded-2xl"
              style={{
                background: 'rgba(30, 41, 59, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
              }}
            >
              {/* Gentle icon */}
              <div 
                className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-6"
                style={{ 
                  background: 'rgba(245, 158, 11, 0.15)',
                  border: '1px solid rgba(245, 158, 11, 0.3)'
                }}
              >
                <AlertCircle className="h-8 w-8 text-amber-400" aria-hidden="true" />
              </div>

              {/* Trauma-informed messaging */}
              <h2 className="text-xl font-semibold text-white mb-3">
                We hit a small bump
              </h2>
              
              <p className="text-slate-400 mb-2">
                Something unexpected happened, but your data is safe.
              </p>
              
              <p className="text-slate-500 text-sm mb-6">
                This isn't your fault. These things happen sometimes, and we're here to help you get back on track.
              </p>

              {/* Supportive actions */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={this.handleRefresh}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-200 min-h-[44px]"
                  style={{
                    background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
                    boxShadow: '0 4px 15px rgba(14, 165, 233, 0.3)'
                  }}
                >
                  <RefreshCw className="h-4 w-4" aria-hidden="true" />
                  Try Again
                </button>
                
                <button
                  onClick={this.handleGoHome}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-slate-300 transition-all duration-200 min-h-[44px]"
                  style={{
                    background: 'rgba(51, 65, 85, 0.5)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <Home className="h-4 w-4" aria-hidden="true" />
                  Go Home
                </button>
              </div>

              {/* Reassurance footer */}
              <div 
                className="mt-6 pt-6 flex items-center justify-center gap-2 text-xs text-slate-500"
                style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}
              >
                <Heart className="h-3 w-3 text-rose-400" aria-hidden="true" />
                <span>Your wellbeing matters to us</span>
              </div>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
