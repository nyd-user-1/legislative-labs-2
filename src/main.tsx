
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerSW } from './utils/serviceWorker'

console.log("Main.tsx is loading");
console.log("Root element:", document.getElementById("root"));

// Register service worker for caching
registerSW({
  onSuccess: () => {
    console.log('Service worker registered successfully');
  },
  onUpdate: () => {
    console.log('New content available, consider refreshing');
  }
});

createRoot(document.getElementById("root")!).render(<App />);
