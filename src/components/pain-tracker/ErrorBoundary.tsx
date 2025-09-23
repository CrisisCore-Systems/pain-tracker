import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Pain tracker error:', error);
    console.error('Component stack:', errorInfo.componentStack);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Determine development mode in a safe way for both Vite (import.meta.env)
      // and Node-ish environments (process.env). Keep this logic local and
      // guarded so referencing `process` in the browser won't throw.
      const isDev = (() => {
        try {
          if (typeof (import.meta as any) !== 'undefined' && (import.meta as any).env) {
            return (import.meta as any).env.MODE === 'development' || (import.meta as any).env.NODE_ENV === 'development';
          }
        } catch (e) {
          // import.meta may not be available in some transpilation targets
        }

        try {
          if (typeof process !== 'undefined' && (process as any).env) {
            return (process as any).env.NODE_ENV === 'development';
          }
        } catch (e) {
          // process may not be available in the browser
        }

        return false;
      })();

      return (
        <div role="alert" className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
          <h2 className="text-lg font-semibold text-red-700 mb-2">Something went wrong</h2>
          <p className="text-red-600 mb-4">We encountered an error while displaying this component.</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
          {isDev && this.state.error && (
            <pre className="mt-4 p-4 bg-red-100 rounded text-sm text-red-800 overflow-auto">
              {this.state.error.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
} 