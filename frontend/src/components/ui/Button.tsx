/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/generateCredentials';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'coral' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseStyle = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary/95 shadow-sm rounded-full',
    secondary: 'bg-cardBlue text-deep hover:bg-cardBlue/80 rounded-full',
    coral: 'bg-coral text-white hover:bg-coral/95 shadow-sm rounded-full',
    outline: 'border-2 border-primary/20 text-primary hover:bg-primary/5 rounded-full',
    ghost: 'text-deep hover:bg-primary/5 rounded-full',
  };

  const sizes = {
    sm: 'px-4 py-1.5 text-sm min-h-[36px]',
    md: 'px-6 py-2.5 text-base min-h-[48px]', // Min 48px touch target
    lg: 'px-8 py-3.5 text-lg min-h-[54px]',
  };

  return (
    <button
      className={cn(
        baseStyle,
        variants[variant],
        sizes[size],
        fullWidth ? 'w-full' : '',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
