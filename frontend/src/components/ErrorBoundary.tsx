/**
 * ErrorBoundary — qatlamli himoya (App / sahifa / widget)
 */

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { logErrorToService } from '@/lib/errorLogger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  name?: string;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    logErrorToService(error, { componentStack: info.componentStack, name: this.props.name });
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="p-6 text-center bg-white rounded-2xl border border-primary/10 m-4">
            <p className="text-deep font-semibold mb-2">Bu bo‘limni ko‘rsatishda muammo bo‘ldi.</p>
            <p className="text-xs text-muted mb-4">
              Qolgan sahifa ishlayveradi. Qaytadan urinib ko‘ring.
            </p>
            <button
              type="button"
              onClick={() => this.setState({ hasError: false })}
              className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-bold cursor-pointer hover:bg-deep"
            >
              Qaytadan urinib ko‘rish
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
