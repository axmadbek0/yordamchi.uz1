/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ReactNode } from 'react';
import { cn } from '../../lib/generateCredentials';

interface BadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'coral' | 'muted' | 'cardBlue' | 'success' | 'warning' | 'danger';
  className?: string;
}

export function Badge({ children, variant = 'primary', className = '' }: BadgeProps) {
  const styles = {
    primary: 'bg-primary/10 text-primary border border-primary/20',
    coral: 'bg-coral/10 text-coral border border-coral/20',
    muted: 'bg-muted/10 text-muted border border-muted/20',
    cardBlue: 'bg-cardBlue text-deep border border-primary/15',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide uppercase',
        styles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
