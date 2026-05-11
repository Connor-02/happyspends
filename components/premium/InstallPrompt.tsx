'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { isInstallPromptDismissed, dismissInstallPrompt } from '@/lib/premiumStorage';

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<Event & { prompt: () => void; userChoice: Promise<{ outcome: string }> } | null>(null);
  const [show, setShow] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Already dismissed
    if (isInstallPromptDismissed()) return;
    // Already installed
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    // iOS detection
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsIOS(ios);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as any);
      setShow(true);
    };

    if (ios) {
      // Show iOS instructions after a short delay
      const timer = setTimeout(() => setShow(true), 4000);
      return () => clearTimeout(timer);
    }

    window.addEventListener('beforeinstallprompt', handler);
    // Show even if event didn't fire (some browsers) after 5s
    const fallback = setTimeout(() => {
      if (!deferredPrompt && !ios) {
        // Don't show if no prompt available
      }
    }, 5000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      clearTimeout(fallback);
    };
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSInstructions(true);
      return;
    }
    if (!deferredPrompt) return;
    setInstalling(true);
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstalled(true);
      setShow(false);
    }
    setInstalling(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShow(false);
    dismissInstallPrompt();
  };

  if (!show && !showIOSInstructions) return null;

  if (showIOSInstructions) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="card p-4 border-2 border-pink-200 dark:border-pink-900"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">Install HappySpends on iOS</p>
              <ol className="mt-2 space-y-1">
                <li className="text-xs text-gray-600 dark:text-gray-300">1. Tap the <strong>Share</strong> button (⬆️) in Safari</li>
                <li className="text-xs text-gray-600 dark:text-gray-300">2. Scroll and tap <strong>"Add to Home Screen"</strong></li>
                <li className="text-xs text-gray-600 dark:text-gray-300">3. Tap <strong>"Add"</strong> to install!</li>
              </ol>
            </div>
            <button onClick={() => { setShowIOSInstructions(false); handleDismiss(); }} className="text-gray-400 hover:text-gray-600 shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  if (!deferredPrompt && !isIOS) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="card p-4 border-2 border-pink-200 dark:border-pink-900 bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/20 dark:to-purple-950/20"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl gradient-pink flex items-center justify-center text-2xl shrink-0">
              📲
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-900 dark:text-white">Install HappySpends</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Add to your home screen for the best experience
              </p>
            </div>
            <button onClick={handleDismiss} className="text-gray-400 hover:text-gray-600 shrink-0 ml-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex gap-2 mt-3">
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleInstall}
              disabled={installing}
              className="flex-1 bg-pink-500 hover:bg-pink-600 text-white text-sm font-bold py-2.5 rounded-xl transition-colors disabled:opacity-60"
            >
              {installing ? 'Installing…' : '📲 Install App'}
            </motion.button>
            <button
              onClick={handleDismiss}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm text-gray-500 font-medium"
            >
              Later
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
