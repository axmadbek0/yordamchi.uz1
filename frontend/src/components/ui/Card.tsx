/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/generateCredentials';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'white' | 'blue' | 'outlined';
}

export function Card({ children, variant = 'white', className = '', ...props }: CardProps) {
  const styles = {
    white: 'bg-white shadow-md shadow-primary/5 rounded-2xl p-6 border border-primary/5',
    blue: 'bg-cardBlue/60 rounded-2xl p-6 border border-primary/10',
    outlined: 'border-2 border-primary/15 rounded-2xl p-6 bg-transparent',
  };

  return (
    <div className={cn(styles[variant], className)} {...props}>
      {children}
    </div>
  );
}
