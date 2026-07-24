import React from 'react';
import { reportError } from '../lib/errorReporting';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    reportError(error, { componentStack: errorInfo?.componentStack || null });
  }

  render() {
    if (this.state.hasError) {
      // reportError() above already redirects to /error — this is just the
      // brief fallback shown in the instant before that navigation lands.
      return null;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
