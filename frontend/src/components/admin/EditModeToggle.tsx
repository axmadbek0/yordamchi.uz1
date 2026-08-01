/**
 * EditModeToggle — yuqori panelda tahrirlashni yoqish/o‘chirish
 */

import { Pencil, Eye } from 'lucide-react';
import { useEditMode, unlockContentEditor, lockContentEditor } from './EditModeProvider';

export function EditModeToggle() {
  const { canEdit, isEditMode, toggleEditMode } = useEditMode();

  if (!canEdit) {
    // Yashirin: Ctrl+Shift+E bilan editor ochish (dev)
    return (
      <button
        type="button"
        className="fixed bottom-4 left-4 z-[70] w-8 h-8 opacity-0 hover:opacity-40"
        title="Ctrl+Shift+E"
        onClick={() => {
          if (window.confirm('Kontent tahrirlash rejimini ochasizmi?')) {
            unlockContentEditor();
          }
        }}
        aria-hidden
      />
    );
  }

  return (
    <div className="fixed bottom-5 left-5 z-[70] flex flex-col gap-2">
      <button
        type="button"
        onClick={toggleEditMode}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold shadow-lg border transition-all cursor-pointer ${
          isEditMode
            ? 'bg-coral text-white border-coral'
            : 'bg-white text-deep border-primary/15 hover:border-primary/40'
        }`}
      >
        {isEditMode ? <Eye className="w-4 h-4" /> : <Pencil className="w-4 h-4 text-primary" />}
        {isEditMode ? 'Ko‘rish rejimi' : 'Tahrirlashni yoqish'}
      </button>
      {isEditMode && (
        <button
          type="button"
          onClick={() => lockContentEditor()}
          className="text-[10px] text-muted bg-white/90 px-3 py-1.5 rounded-xl border border-primary/10 cursor-pointer hover:text-deep"
        >
          Editor huquqini yopish
        </button>
      )}
    </div>
  );
}
