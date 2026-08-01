/**
 * useSiteContent — optimistic update + avtomatik rollback
 */

import { useCallback, useEffect, useState } from 'react';
import { fetchSiteContent, saveSiteContent } from '@/lib/siteContentApi';

export type ContentSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export function useSiteContent(key: string, fallback: string) {
  const [value, setValue] = useState(fallback);
  const [status, setStatus] = useState<ContentSaveStatus>('idle');

  useEffect(() => {
    let cancelled = false;
    fetchSiteContent(key)
      .then((data) => {
        if (!cancelled) setValue(data?.value ?? fallback);
      })
      .catch(() => {
        if (!cancelled) setValue(fallback);
      });
    return () => {
      cancelled = true;
    };
  }, [key, fallback]);

  const updateValue = useCallback(
    async (newValue: string) => {
      const previousValue = value;
      setValue(newValue);
      setStatus('saving');
      try {
        await saveSiteContent(key, newValue);
        setStatus('saved');
        window.setTimeout(() => setStatus('idle'), 1500);
        return true;
      } catch {
        setValue(previousValue);
        setStatus('error');
        window.dispatchEvent(
          new CustomEvent('yordamchi:toast', {
            detail: {
              type: 'error',
              message: "Saqlab bo'lmadi, avvalgi matn qaytarildi. Qaytadan urinib ko'ring.",
            },
          })
        );
        window.setTimeout(() => setStatus('idle'), 2500);
        throw new Error('save_failed');
      }
    },
    [key, value]
  );

  return { value, updateValue, status, setValue };
}
