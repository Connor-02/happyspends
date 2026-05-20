'use client';
import { useEffect } from 'react';

/**
 * Registers the next-pwa service worker in App Router layouts.
 * next-pwa's built-in `register: true` only works with Pages Router (_app.js).
 * This component handles registration explicitly for the App Router.
 */
export function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.warn('[SW] Registration failed:', err);
    });
  }, []);

  return null;
}
