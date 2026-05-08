'use client';
import { cn } from '@/lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  gradient?: boolean;
}

export function Card({ children, className, onClick, gradient }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'card p-4',
        gradient && 'gradient-pink text-white border-0',
        onClick && 'cursor-pointer hover:shadow-md transition-shadow',
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h3 className={cn('text-sm font-medium text-gray-500 dark:text-gray-400 mb-1', className)}>{children}</h3>;
}

export function CardValue({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn('text-2xl font-bold tabular-nums', className)}>{children}</p>;
}
