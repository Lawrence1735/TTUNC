import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { initPerformanceMonitoring } from './utils/performanceMonitoring';
import '../styles/globals.css';
import '../styles/accessibility.css';

// Initialize performance monitoring for production metrics
if (typeof window !== 'undefined') {
  initPerformanceMonitoring();
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);