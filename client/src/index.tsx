import React from 'react';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { hydrateRoot, createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import ErrorBoundary from './components/ErrorBoundary';
const queryClient = new QueryClient();

const rootElement = document.getElementById('root') as HTMLElement;

if (rootElement.hasChildNodes()) {
  hydrateRoot(
    rootElement,
    <ErrorBoundary>
      <HelmetProvider>
        <Router>
          <QueryClientProvider client={queryClient}>
            <App />
          </QueryClientProvider>
        </Router>
      </HelmetProvider>
    </ErrorBoundary>
  );
} else {
  const root = createRoot(rootElement);
  root.render(
    <ErrorBoundary>
      <HelmetProvider>
        <Router>
          <QueryClientProvider client={queryClient}>
            <App />
          </QueryClientProvider>
        </Router>
      </HelmetProvider>
    </ErrorBoundary>
  );
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
