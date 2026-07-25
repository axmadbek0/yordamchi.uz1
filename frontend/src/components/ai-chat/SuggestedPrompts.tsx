/**
 * SuggestedPrompts — Role & Page-based dynamic prompt chips
 */

import React from 'react';
import { Sparkles } from 'lucide-react';

interface SuggestedPromptsProps {
  role: 'teacher' | 'parent' | 'guest';
  currentPage: string;
  onSelectPrompt: (promptText: string) => void;
}

export const SuggestedPrompts: React.FC<SuggestedPromptsProps> = ({
  role,
  currentPage,
  onSelectPrompt,
}) => {
  const getPrompts = () => {
    if (role === 'teacher') {
      if (currentPage.includes('profile')) {
        return [
          "Kunlik holat yozuvlarini qanday yaxshiroq yozsam bo'ladi?",
          "Ota-onaga qanday xabar yuborsam tushunarli bo'ladi?",
          "AI yozuv uslubini qanday moslashtiraman?",
        ];
      }
      return [
        "Sinfdagi sensor sezgirligi yuqori o'quvchiga qanday yordam berish kerak?",
        "Bugungi hisobot tahlilida AI izohlarini qanday yaxshilash mumkin?",
        "Ota-onalar bilan ijobiy muloqot o'rnatish bo'yicha maslahat",
      ];
    } else if (role === 'parent') {
      if (currentPage.includes('profile')) {
        return [
          "Farzandimning bugungi holatini tushuntirib bering",
          "AI grafikdagi ranglar nimani anglatadi?",
          "Maktab bilan qanday bog'lanaman?",
        ];
      }
      return [
        "Mayda motorika uchun uydagi 3 ta eng sodda mashq",
        "Farzandim charchagan bo'lsa, kechqurun nima qilish lozim?",
        "Nutq ko'nikmasini oshirish bo'yicha tavsiya bering",
      ];
    }

    return [
      "Yordamchi med imkoniyatlari nimadan iborat?",
      "Daun sindromli bolalar bilan qanday mashqlar bajariladi?",
      "Maktab-internati tizimi qanday ishlaydi?",
    ];
  };

  const prompts = getPrompts();

  return (
    <div className="space-y-1.5 py-2">
      <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted uppercase tracking-wider px-1">
        <Sparkles className="w-3 h-3 text-coral" />
        Tavsiya etilgan savollar:
      </div>
      <div className="flex flex-wrap gap-1.5">
        {prompts.map((prompt, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectPrompt(prompt)}
            className="text-left text-xs bg-white hover:bg-coral/5 text-deep border border-primary/10 hover:border-coral/30 px-3 py-1.5 rounded-full transition-all duration-150 cursor-pointer shadow-xs hover:shadow-sm"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
};
