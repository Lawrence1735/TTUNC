import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';
import { initPerformanceMonitoring } from './utils/performanceMonitoring';
import '../styles/globals.css';
import '../styles/accessibility.css';

if (typeof window !== 'undefined') {
  initPerformanceMonitoring();
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ErrorBoundary>
  </React.StrictMode>
);