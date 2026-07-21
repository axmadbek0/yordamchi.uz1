/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/generateCredentials';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = '', id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-deep pl-1">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            'w-full px-4 py-3 text-base text-ink bg-white border-2 border-primary/10 rounded-xl focus:border-primary focus:outline-none transition-all placeholder-muted/50 min-h-[48px]',
            error ? 'border-coral focus:border-coral' : '',
            className
          )}
          {...props}
        />
        {error && <span className="text-sm font-medium text-coral pl-1">{error}</span>}
        {!error && helperText && <span className="text-xs text-muted pl-1">{helperText}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
