
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerSW } from './utils/serviceWorker'

console.log("Main.tsx is loading");
console.log("React:", React);
console.log("React version:", React.version);

// Validate React before proceeding
if (!React || typeof React.createElement !== 'function' || typeof React.useState !== 'function') {
  console.error("React is not properly loaded or hooks are not available");
  document.body.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: system-ui;">
      <div style="text-align: center;">
        <h1 style="color: #dc2626; font-size: 1.5rem; margin-bottom: 1rem;">React Loading Error</h1>
        <p style="color: #6b7280; margin-bottom: 1rem;">React could not be loaded properly. Please refresh the page.</p>
        <button onclick="window.location.reload()" style="background: #3b82f6; color: white; padding: 0.5rem 1rem; border: none; border-radius: 0.375rem; cursor: pointer;">
          Refresh Page
        </button>
      </div>
    </div>
  `;
  throw new Error("React is not properly loaded");
}

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

try {
  const root = createRoot(rootElement);
  root.render(<App />);
  console.log("App rendered successfully");
} catch (error) {
  console.error("Failed to render App:", error);
  rootElement.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: system-ui;">
      <div style="text-align: center;">
        <h1 style="color: #dc2626; font-size: 1.5rem; margin-bottom: 1rem;">Render Error</h1>
        <p style="color: #6b7280; margin-bottom: 1rem;">Failed to render the application. Please refresh the page.</p>
        <button onclick="window.location.reload()" style="background: #3b82f6; color: white; padding: 0.5rem 1rem; border: none; border-radius: 0.375rem; cursor: pointer;">
          Refresh Page
        </button>
      </div>
    </div>
  `;
}
