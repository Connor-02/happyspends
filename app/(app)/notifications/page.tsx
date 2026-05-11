'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  loadPremiumStore,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  dismissNotification,
  notifTypeIcon,
} from '@/lib/premiumStorage';
import type { AppNotification } from '@/types/premium';

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const typeColors: Record<string, string> = {
  reminder: 'bg-pink-100 dark:bg-pink-900/30 text-pink-600',
  bill: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600',
  subscription: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
  goal: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600',
  warning: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600',
  insight: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600',
  achievement: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const load = useCallback(() => {
    setNotifications(getNotifications());
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleMarkRead = (id: string) => {
    markNotificationRead(id);
    load();
  };

  const handleDismiss = (id: string) => {
    dismissNotification(id);
    load();
  };

  const handleMarkAll = () => {
    markAllNotificationsRead();
    load();
  };

  const filtered = filter === 'unread' ? notifications.filter((n) => !n.read) : notifications;
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="px-4 pt-6 pb-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Notifications</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAll}
            className="text-xs font-semibold text-pink-500 hover:text-pink-600 transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['all', 'unread'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-all capitalize ${
              filter === f
                ? 'bg-pink-500 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
            }`}
          >
            {f}
            {f === 'unread' && unreadCount > 0 && (
              <span className="ml-1.5 bg-white/30 text-white text-xs rounded-full px-1.5">{unreadCount}</span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <EmptyNotifications filter={filter} />
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filtered.map((n) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
              >
                <NotificationItem
                  notification={n}
                  onRead={() => handleMarkRead(n.id)}
                  onDismiss={() => handleDismiss(n.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Settings link */}
      <div className="pt-2">
        <Link
          href="/settings"
          className="flex items-center justify-center gap-2 text-sm text-gray-400 hover:text-pink-500 transition-colors py-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Manage notification settings
        </Link>
      </div>
    </div>
  );
}

function NotificationItem({
  notification: n,
  onRead,
  onDismiss,
}: {
  notification: AppNotification;
  onRead: () => void;
  onDismiss: () => void;
}) {
  const iconBg = typeColors[n.type] ?? typeColors.reminder;
  const priorityBorder =
    n.priority === 'high'
      ? 'border-l-4 border-l-red-400'
      : n.priority === 'medium'
      ? 'border-l-4 border-l-amber-400'
      : '';

  const content = (
    <div
      className={`card p-4 flex items-start gap-3 ${priorityBorder} ${
        !n.read ? 'bg-pink-50/50 dark:bg-pink-950/20' : ''
      } cursor-pointer`}
      onClick={!n.read ? onRead : undefined}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0 ${iconBg}`}>
        {notifTypeIcon(n.type)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {!n.read && <span className="w-2 h-2 rounded-full bg-pink-500 shrink-0 mt-1" />}
            <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">{n.title}</p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onDismiss(); }}
            className="text-gray-300 dark:text-gray-600 hover:text-gray-500 transition-colors shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{n.message}</p>
        <p className="text-xs text-gray-300 dark:text-gray-600 mt-1">{timeAgo(n.createdAt)}</p>
      </div>
    </div>
  );

  if (n.actionLink) return <Link href={n.actionLink}>{content}</Link>;
  return content;
}

function EmptyNotifications({ filter }: { filter: string }) {
  return (
    <div className="text-center py-16">
      <div className="text-5xl mb-3">{filter === 'unread' ? '✅' : '🔔'}</div>
      <p className="text-base font-semibold text-gray-700 dark:text-gray-200">
        {filter === 'unread' ? "All caught up!" : "No notifications yet"}
      </p>
      <p className="text-sm text-gray-400 mt-1">
        {filter === 'unread'
          ? "You're on top of everything."
          : "Notifications will appear here as you use the app."}
      </p>
    </div>
  );
}
