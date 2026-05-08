'use client';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none';

  const variants = {
    primary:
      'gradient-pink text-white focus:ring-pink-400 shadow-md shadow-pink-200 dark:shadow-pink-900/30',
    secondary:
      'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 focus:ring-gray-300',
    ghost:
      'bg-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:ring-gray-200',
    danger:
      'bg-red-500 text-white hover:bg-red-600 focus:ring-red-400 shadow-md shadow-red-200',
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3 gap-2',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      className={cn(base, variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      type={props.type ?? 'button'}
      onClick={props.onClick}
      onFocus={props.onFocus}
      onBlur={props.onBlur}
      id={props.id}
      aria-label={props['aria-label']}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      ) : null}
      {children}
    </motion.button>
  );
}

interface FABProps {
  onClick: () => void;
  icon?: React.ReactNode;
}

export function FAB({ onClick, icon }: FABProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      whileHover={{ scale: 1.05 }}
      onClick={onClick}
      className="fixed bottom-24 right-5 z-40 w-14 h-14 gradient-pink text-white rounded-full shadow-xl shadow-pink-300/50 dark:shadow-pink-900/40 flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-pink-300"
      aria-label="Add transaction"
    >
      {icon ?? (
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      )}
    </motion.button>
  );
}
