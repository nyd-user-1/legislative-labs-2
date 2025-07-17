
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerSW } from './utils/serviceWorker'

console.log("Main.tsx is loading");
console.log("React:", React);
console.log("React version:", React.version);

// Ensure React is available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).React = React;
}

const rootElement = document.getElementById("root");
console.log("Root element:", rootElement);

if (!rootElement) {
  throw new Error("Root element not found");
}

// Register service worker for caching
registerSW({
  onSuccess: () => {
    console.log('Service worker registered successfully');
  },
  onUpdate: () => {
    console.log('New content available, consider refreshing');
  }
});

// Ensure we have a valid React instance before creating root
if (!React || typeof React.createElement !== 'function') {
  throw new Error("React is not properly loaded");
}

const root = createRoot(rootElement);
root.render(<App />);
