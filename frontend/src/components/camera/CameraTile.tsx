/**
 * CameraTile — yotoqxona/oshxona kamera katakchasi (umumiy)
 * Mavjud "Yotoqxona kuzatuvi" uslubidan ajratilgan
 */

import { Video } from 'lucide-react';
import { Badge } from '../ui/Badge';

export interface CameraTileProps {
  cameraLabel: string;
  sectorLabel: string;
  status: 'FAOL' | 'FAOL EMAS';
  isLive: boolean;
  timestamp: string;
  thumbnailUrl?: string;
  onClick: () => void;
}

export function CameraTile({
  cameraLabel,
  sectorLabel,
  status,
  isLive,
  timestamp,
  thumbnailUrl,
  onClick,
}: CameraTileProps) {
  const isActive = status === 'FAOL';

  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-white rounded-3xl border border-cardBlue overflow-hidden shadow-sm flex flex-col text-left w-full cursor-pointer hover:shadow-md hover:border-primary/25 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      <div className="bg-black relative aspect-video flex items-center justify-center">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <Video className="w-12 h-12 text-white/20 relative z-[1]" />
        )}

        {isLive && (
          <div className="absolute top-4 right-4 flex items-center gap-2 z-[2]">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-white text-xs font-mono bg-black/50 px-2 py-1 rounded">
              LIVE
            </span>
          </div>
        )}

        <div className="absolute bottom-4 right-4 z-[2]">
          <span className="text-white/80 text-xs font-mono bg-black/50 px-2 py-1 rounded">
            {timestamp}
          </span>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none z-[1]" />
      </div>

      <div className="p-4 flex items-center justify-between bg-white border-t border-cardBlue/50">
        <div>
          <h4 className="font-bold text-deep text-sm">{cameraLabel}</h4>
          <p className="text-xs text-muted">{sectorLabel}</p>
        </div>
        <Badge
          variant={isActive ? 'success' : 'muted'}
          className="text-[10px] uppercase"
        >
          {status}
        </Badge>
      </div>
    </button>
  );
}
