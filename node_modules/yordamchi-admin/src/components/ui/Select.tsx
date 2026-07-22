/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/generateCredentials';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string | number; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', id, ...props }, ref) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-deep pl-1">
            {label}
          </label>
        )}
        <select
          id={selectId}
          ref={ref}
          className={cn(
            'w-full px-4 py-3 text-base text-ink bg-white border-2 border-primary/10 rounded-xl focus:border-primary focus:outline-none transition-all min-h-[48px] cursor-pointer appearance-none bg-[url(\'data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%231B6FA8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E\')] bg-[length:1.25em] bg-[right_1rem_center] bg-no-repeat',
            error ? 'border-coral focus:border-coral' : '',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && <span className="text-sm font-medium text-coral pl-1">{error}</span>}
      </div>
    );
  }
);

Select.displayName = 'Select';
