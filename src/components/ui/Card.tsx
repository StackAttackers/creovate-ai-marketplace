import React from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
}

export function Card({ className, hover = true, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200 bg-white shadow-sm',
        hover &&
          'transition-all duration-300 hover:bg-white hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-500/5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
