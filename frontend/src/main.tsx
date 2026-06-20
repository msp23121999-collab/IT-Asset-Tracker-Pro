import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { mockEmployees, mockAssets } from '@/lib/mock-data';

// --- Local Storage Database Seeding (Simulating Firestore local cache) ---
try {
  if (!localStorage.getItem('mock_employees')) {
    localStorage.setItem('mock_employees', JSON.stringify(mockEmployees));
  }
  if (!localStorage.getItem('mock_assets')) {
    localStorage.setItem('mock_assets', JSON.stringify(mockAssets));
  }
} catch (error) {
  console.error('Failed to seed local storage database:', error);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
