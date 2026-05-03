import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service here
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleRefresh = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 font-['Plus_Jakarta_Sans']">
          <div className="max-w-md w-full text-center">
            <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-50 text-red-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Terjadi Kesalahan</h1>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Maaf, aplikasi mengalami masalah yang tidak terduga. Kami telah mencatat kesalahan ini untuk diperbaiki.
            </p>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleRefresh}
                className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98]"
              >
                Muat Ulang Halaman
              </button>
              
              <button
                onClick={() => this.setState({ hasError: false })}
                className="w-full py-3 px-6 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl transition-all active:scale-[0.98]"
              >
                Coba Lagi
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <div className="mt-10 p-4 bg-gray-900 rounded-lg text-left overflow-auto max-h-48">
                <p className="text-xs font-mono text-red-400">{this.state.error?.toString()}</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
