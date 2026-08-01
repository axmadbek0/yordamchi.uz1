/**
 * EditableImage — rasm yuklash, preview, rollback
 */

import { useEffect, useRef, useState } from 'react';
import { Pencil, Loader2, ImageIcon } from 'lucide-react';
import { useEditMode } from './EditModeProvider';
import { useSiteContent } from '@/hooks/useSiteContent';

interface EditableImageProps {
  contentKey: string;
  defaultSrc: string;
  alt: string;
  className?: string;
}

export function EditableImage({ contentKey, defaultSrc, alt, className = '' }: EditableImageProps) {
  const { isEditMode } = useEditMode();
  const { value, updateValue, status, setValue } = useSiteContent(contentKey, defaultSrc);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setPreview(null);
  }, [value]);

  const displaySrc = preview ?? value ?? defaultSrc;

  const onPick = () => {
    if (!isEditMode) return;
    inputRef.current?.click();
  };

  const onFile = (file: File | undefined) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || '');
      setPreview(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const onSave = async () => {
    if (!preview) return;
    const previous = value;
    setUploading(true);
    setProgress(15);
    const tick = window.setInterval(() => {
      setProgress((p) => Math.min(p + 18, 90));
    }, 200);

    try {
      await updateValue(preview);
      setProgress(100);
      setPreview(null);
    } catch {
      setValue(previous);
      setPreview(null);
    } finally {
      window.clearInterval(tick);
      setUploading(false);
      setProgress(0);
    }
  };

  const onCancel = () => setPreview(null);

  if (!isEditMode) {
    return <img src={displaySrc} alt={alt} className={className} />;
  }

  return (
    <div className="relative group rounded-3xl overflow-hidden">
      <img src={displaySrc} alt={alt} className={className} />
      <button
        type="button"
        onClick={onPick}
        className="absolute inset-0 bg-deep/0 group-hover:bg-deep/35 transition-colors flex items-center justify-center cursor-pointer"
        aria-label="Rasmni almashtirish"
      >
        <span className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 bg-white text-deep text-xs font-bold px-3 py-2 rounded-xl shadow-lg">
          <Pencil className="w-3.5 h-3.5 text-primary" />
          Rasmni almashtirish
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onFile(e.target.files?.[0])}
      />

      {preview && (
        <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur rounded-xl p-3 shadow-lg border border-primary/10">
          {(uploading || status === 'saving') && (
            <div className="mb-2">
              <div className="h-1.5 bg-primary/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[10px] text-muted mt-1 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Yuklanmoqda...
              </p>
            </div>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              disabled={uploading}
              onClick={() => void onSave()}
              className="flex-1 py-2 rounded-lg bg-primary text-white text-xs font-bold cursor-pointer disabled:opacity-60"
            >
              Saqlash
            </button>
            <button
              type="button"
              disabled={uploading}
              onClick={onCancel}
              className="flex-1 py-2 rounded-lg border border-primary/20 text-deep text-xs font-bold cursor-pointer"
            >
              Bekor qilish
            </button>
          </div>
        </div>
      )}

      {!preview && (
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="inline-flex items-center gap-1 bg-white/90 text-[10px] font-bold text-primary px-2 py-1 rounded-full">
            <ImageIcon className="w-3 h-3" /> Tahrirlash
          </span>
        </div>
      )}
    </div>
  );
}
