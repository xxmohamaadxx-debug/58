
import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleClearCache = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
          <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full border border-red-100">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">حدث خطأ</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              واجه التطبيق خطأ غير متوقع. يرجى إعادة تحميل الصفحة.
            </p>
            
            <div className="bg-gray-100 p-4 rounded-md text-left mb-6 overflow-auto max-h-40 text-xs font-mono text-gray-700">
              {this.state.error && this.state.error.toString()}
            </div>

            <div className="flex flex-col gap-3">
              <Button onClick={this.handleReload} className="w-full">
                إعادة تحميل الصفحة
              </Button>
              <Button onClick={this.handleClearCache} variant="outline" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50">
                مسح الذاكرة المؤقتة وإعادة التعيين
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
