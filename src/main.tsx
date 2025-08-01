import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log("Main.tsx is loading");
console.log("Root element:", document.getElementById("root"));

createRoot(document.getElementById("root")!).render(<App />);
