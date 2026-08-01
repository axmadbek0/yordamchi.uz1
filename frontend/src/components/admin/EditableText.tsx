/**
 * EditableText — inline matn tahrirlash (optimistic + rollback)
 */

import { useEffect, useState, type CSSProperties } from 'react';
import { Pencil, Loader2 } from 'lucide-react';
import { useEditMode } from './EditModeProvider';
import { useSiteContent } from '@/hooks/useSiteContent';

interface EditableTextProps {
  contentKey: string;
  defaultValue: string;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  className?: string;
  style?: CSSProperties;
}

export function EditableText({
  contentKey,
  defaultValue,
  as = 'p',
  className = '',
  style,
}: EditableTextProps) {
  const { isEditMode } = useEditMode();
  const { value, updateValue, status } = useSiteContent(contentKey, defaultValue);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const Tag = as;

  if (!isEditMode) {
    return (
      <Tag className={className} style={style}>
        {value}
      </Tag>
    );
  }

  if (isEditing) {
    return (
      <div className={`relative border-2 border-dashed border-primary rounded-lg p-2 bg-white/90 ${className}`}>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="w-full bg-white rounded p-2 text-deep text-sm min-h-[80px] border border-primary/10 focus:outline-none focus:border-primary"
          autoFocus
        />
        <div className="flex gap-2 mt-2 items-center">
          <button
            type="button"
            disabled={status === 'saving'}
            onClick={() => {
              void updateValue(draft).then(() => setIsEditing(false));
            }}
            className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-deep cursor-pointer disabled:opacity-60"
          >
            {status === 'saving' ? 'Saqlanmoqda...' : 'Saqlash'}
          </button>
          <button
            type="button"
            onClick={() => {
              setDraft(value);
              setIsEditing(false);
            }}
            className="px-3 py-1.5 rounded-lg border border-primary/20 text-deep text-xs font-bold hover:bg-bg cursor-pointer"
          >
            Bekor qilish
          </button>
          {status === 'saving' && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`group relative inline-block max-w-full cursor-pointer rounded-lg hover:bg-primary/5 px-1 -mx-1 ${className}`}
      onClick={() => setIsEditing(true)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') setIsEditing(true);
      }}
    >
      <Tag className={className} style={style}>
        {value}
      </Tag>
      <Pencil className="opacity-0 group-hover:opacity-100 transition-opacity ml-1.5 inline w-4 h-4 text-primary align-middle" />
    </div>
  );
}
