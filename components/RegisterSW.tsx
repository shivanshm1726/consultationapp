'use client';
import { useEffect } from 'react';

export default function RegisterSW() {
  useEffect(() => {
    // Check if we're in a StackBlitz/WebContainer environment
    const isStackBlitz = typeof window !== 'undefined' && 
      (window.location.hostname.includes('stackblitz') || 
       window.location.hostname.includes('webcontainer'));
    
    if ('serviceWorker' in navigator && !isStackBlitz) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/service-worker.js')
          .then((reg) => {
            console.log('✅ Service Worker registered:', reg);
          })
          .catch((err) => {
            console.error('❌ Service Worker registration failed:', err);
          });
      });
    } else if (isStackBlitz) {
      console.log('ℹ️ Service Worker registration skipped (StackBlitz environment)');
    }
  }, []);

  return null;
}
