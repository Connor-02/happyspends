'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  requestNotificationPermission,
  getNotificationPermission,
} from '@/lib/notificationService';
import {
  hasAskedNotificationPermission,
  markNotificationPermissionAsked,
} from '@/lib/premiumStorage';

export function NotificationPermissionBanner() {
  const [show, setShow] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [granted, setGranted] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'default') return;
    if (hasAskedNotificationPermission()) return;
    // Show after 3s
    const t = setTimeout(() => setShow(true), 3000);
    return () => clearTimeout(t);
  }, []);

  const handleEnable = async () => {
    setRequesting(true);
    markNotificationPermissionAsked();
    const result = await requestNotificationPermission();
    setRequesting(false);
    if (result === 'granted') {
      setGranted(true);
      setTimeout(() => setShow(false), 1500);
    } else {
      setShow(false);
    }
  };

  const handleDismiss = () => {
    markNotificationPermissionAsked();
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="card p-4 border-2 border-blue-200 dark:border-blue-900 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl gradient-blue flex items-center justify-center text-xl shrink-0">
              🔔
            </div>
            <div className="flex-1">
              {granted ? (
                <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                  <p className="text-sm font-bold text-emerald-600">Notifications enabled! ✓</p>
                  <p className="text-xs text-gray-500 mt-0.5">We'll remind you to check in daily.</p>
                </motion.div>
              ) : (
                <>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">Enable reminders</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Get daily check-in reminders and bill alerts to stay on track.
                  </p>
                  <div className="flex gap-2 mt-3">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handleEnable}
                      disabled={requesting}
                      className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold py-2 rounded-xl transition-colors disabled:opacity-60"
                    >
                      {requesting ? 'Requesting…' : 'Enable reminders'}
                    </motion.button>
                    <button
                      onClick={handleDismiss}
                      className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-xs text-gray-500 font-medium"
                    >
                      Not now
                    </button>
                  </div>
                </>
              )}
            </div>
            {!granted && (
              <button onClick={handleDismiss} className="text-gray-300 hover:text-gray-500 shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
