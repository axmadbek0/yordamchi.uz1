/**
 * Global inline-edit rejimi (admin/editor)
 * Yoqish: ?editor=1 yoki localStorage yordamchi_content_editor=1
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useAuth } from '@/lib/auth';

const FLAG_KEY = 'yordamchi_content_editor';

interface EditModeContextValue {
  canEdit: boolean;
  isEditMode: boolean;
  setEditMode: (on: boolean) => void;
  toggleEditMode: () => void;
}

const EditModeContext = createContext<EditModeContextValue | null>(null);

function readEditorFlag(): boolean {
  try {
    if (typeof window === 'undefined') return false;
    if (localStorage.getItem(FLAG_KEY) === '1') return true;
    const params = new URLSearchParams(window.location.search);
    if (params.get('editor') === '1') {
      localStorage.setItem(FLAG_KEY, '1');
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function EditModeProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [editorUnlocked, setEditorUnlocked] = useState(() => readEditorFlag());
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    setEditorUnlocked(readEditorFlag());
  }, []);

  const canEdit = editorUnlocked || user?.role === 'admin';

  useEffect(() => {
    if (!canEdit) setIsEditMode(false);
  }, [canEdit]);

  const setEditMode = useCallback(
    (on: boolean) => {
      if (!canEdit) return;
      setIsEditMode(on);
    },
    [canEdit]
  );

  const toggleEditMode = useCallback(() => {
    setEditMode(!isEditMode);
  }, [isEditMode, setEditMode]);

  const value = useMemo(
    () => ({ canEdit, isEditMode, setEditMode, toggleEditMode }),
    [canEdit, isEditMode, setEditMode, toggleEditMode]
  );

  return <EditModeContext.Provider value={value}>{children}</EditModeContext.Provider>;
}

export function useEditMode(): EditModeContextValue {
  const ctx = useContext(EditModeContext);
  if (!ctx) {
    return {
      canEdit: false,
      isEditMode: false,
      setEditMode: () => undefined,
      toggleEditMode: () => undefined,
    };
  }
  return ctx;
}

/** Dev/admin: tahrirlash huquqini ochish */
export function unlockContentEditor() {
  localStorage.setItem(FLAG_KEY, '1');
  window.location.reload();
}

export function lockContentEditor() {
  localStorage.removeItem(FLAG_KEY);
  window.location.reload();
}
