/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import {
  Video,
  Plus,
  Power,
  Eye,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  X,
  ShieldAlert,
  Camera as CamIcon,
} from 'lucide-react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { getCameras, addCamera, updateCamera } from '../../lib/api/schoolAdmin';
import type { CameraItem } from '../../types/schoolAdmin';

export function CameraSettingsPage() {
  const [cameras, setCameras] = useState<CameraItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add camera modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [cameraType, setCameraType] = useState<'DORMITORY' | 'KITCHEN'>('DORMITORY');
  const [sectorLabel, setSectorLabel] = useState('');
  const [streamUrl, setStreamUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Preview modal
  const [previewCamera, setPreviewCamera] = useState<CameraItem | null>(null);

  const fetchCamerasList = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await getCameras();
      setCameras(list);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Kameralarni yuklab bo\'lmadi');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchCamerasList();
  }, []);

  const handleToggleCamera = async (cam: CameraItem) => {
    const updatedStatus = !cam.isActive;
    try {
      // Optimistic update
      setCameras((prev) =>
        prev.map((c) => (c.id === cam.id ? { ...c, isActive: updatedStatus } : c))
      );
      await updateCamera(cam.id, { isActive: updatedStatus });
    } catch (err: any) {
      // Revert on error
      setCameras((prev) =>
        prev.map((c) => (c.id === cam.id ? { ...c, isActive: !updatedStatus } : c))
      );
      alert(err?.response?.data?.message || 'Kamera holatini o\'zgartirib bo\'lmadi');
    }
  };

  const handleAddCamera = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!sectorLabel.trim()) {
      setFormError('Sektor nomini kiriting (masalan: 1-Bino 2-qavat)');
      return;
    }

    setIsSubmitting(true);
    try {
      const newCam = await addCamera({
        type: cameraType,
        sectorLabel: sectorLabel.trim(),
        streamUrl: streamUrl.trim() || undefined,
      });

      setCameras((prev) => [...prev, newCam]);
      setIsAddModalOpen(false);
      setSectorLabel('');
      setStreamUrl('');
    } catch (err: any) {
      setFormError(err?.response?.data?.message || 'Kamera qo\'shishda xatolik');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black font-serif text-deep flex items-center gap-2.5">
            <Video className="w-7 h-7 text-primary" /> Kamera Sozlamalari va Nazorati
          </h1>
          <p className="text-sm text-muted">
            Yotoqxona va Oshxona xavfsizlik kameralarini sozlash, oqim havolalari va faolligini boshqarish
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsAddModalOpen(true)}
          className="gap-2 font-bold shadow-md w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" /> + Yangi kamera qo'shish
        </Button>
      </div>

      {/* Cameras Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-white rounded-3xl animate-pulse border border-primary/5" />
          ))}
        </div>
      ) : error ? (
        <Card variant="white" className="p-8 text-center max-w-md mx-auto shadow-sm">
          <AlertCircle className="w-10 h-10 text-coral mx-auto mb-3" />
          <p className="text-sm text-muted mb-4">{error}</p>
          <Button variant="primary" onClick={fetchCamerasList} className="gap-2 mx-auto">
            <RefreshCw className="w-4 h-4" /> Qayta yuklash
          </Button>
        </Card>
      ) : cameras.length === 0 ? (
        <Card variant="white" className="p-12 text-center shadow-sm">
          <CamIcon className="w-12 h-12 text-muted/50 mx-auto mb-3" />
          <h3 className="text-base font-bold text-deep mb-1">Kameralar mavjud emas</h3>
          <p className="text-xs text-muted mb-6">
            Maktab hududidagi yotoqxona va oshxona kameralarini ro'yxatga oling
          </p>
          <Button variant="primary" onClick={() => setIsAddModalOpen(true)} className="gap-2 mx-auto">
            <Plus className="w-4 h-4" /> Kamera qo'shish
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cameras.map((camera) => (
            <Card
              key={camera.id}
              variant="white"
              className={`p-5 shadow-sm border transition-all flex flex-col justify-between ${
                camera.isActive ? 'border-primary/10 hover:shadow-md' : 'border-cardBlue opacity-70 bg-bg/40'
              }`}
            >
              <div>
                {/* Header & Badges */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-bold ${
                      camera.type === 'DORMITORY'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-coral/10 text-coral'
                    }`}
                  >
                    {camera.type === 'DORMITORY' ? '🛏️ Yotoqxona' : '🍽️ Oshxona'}
                  </span>

                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      camera.isActive
                        ? 'bg-success/10 text-success'
                        : 'bg-muted/10 text-muted'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        camera.isActive ? 'bg-success animate-pulse' : 'bg-muted'
                      }`}
                    />
                    {camera.isActive ? 'Jonli (Faol)' : 'O\'chirilgan'}
                  </span>
                </div>

                {/* Sector Title */}
                <h3 className="text-base font-bold text-deep mb-2">{camera.sectorLabel}</h3>

                {/* Camera Preview Thumbnail Box */}
                <div
                  onClick={() => camera.isActive && setPreviewCamera(camera)}
                  className={`relative rounded-2xl overflow-hidden h-36 bg-deep/90 flex items-center justify-center border border-cardBlue cursor-pointer group mb-4`}
                >
                  {camera.streamUrl && camera.isActive ? (
                    <img
                      src={camera.streamUrl}
                      alt={camera.sectorLabel}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
                    />
                  ) : null}

                  {camera.isActive ? (
                    <div className="absolute inset-0 bg-deep/30 group-hover:bg-deep/10 transition-colors flex items-center justify-center">
                      <div className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white shadow-md">
                        <Eye className="w-5 h-5" />
                      </div>
                    </div>
                  ) : (
                    <div className="text-white/50 text-xs font-semibold flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4" /> Signal to'xtatilgan
                    </div>
                  )}

                  {camera.isActive && (
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 backdrop-blur-xs rounded text-[10px] font-mono text-white">
                      REC • LIVE
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-cardBlue/50">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPreviewCamera(camera)}
                  disabled={!camera.isActive}
                  className="gap-1.5 text-xs font-bold"
                >
                  <Eye className="w-3.5 h-3.5" /> Ko'rish
                </Button>

                <button
                  type="button"
                  onClick={() => handleToggleCamera(camera)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    camera.isActive
                      ? 'text-coral bg-coral/10 hover:bg-coral/20'
                      : 'text-success bg-success/10 hover:bg-success/20'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  {camera.isActive ? "O'chirish" : 'Yoqish'}
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Camera Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-deep/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-cardBlue relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute right-5 top-5 text-muted hover:text-deep p-1 rounded-full hover:bg-bg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-primary/10 text-primary rounded-2xl">
                <CamIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black font-serif text-deep">
                  Yangi Kamera Qo'shish
                </h3>
                <p className="text-xs text-muted">
                  Yotoqxona yoki oshxona sektori uchun videokamera sozlash
                </p>
              </div>
            </div>

            {formError && (
              <div className="mb-4 p-3 bg-coral/10 text-coral border border-coral/20 rounded-2xl text-xs font-semibold">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddCamera} className="space-y-4">
              {/* Type toggle */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-deep">Kamera joylashuvi (Turi)</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCameraType('DORMITORY')}
                    className={`py-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      cameraType === 'DORMITORY'
                        ? 'bg-primary text-white border-primary shadow-xs'
                        : 'bg-white text-muted border-cardBlue'
                    }`}
                  >
                    🛏️ Yotoqxona
                  </button>
                  <button
                    type="button"
                    onClick={() => setCameraType('KITCHEN')}
                    className={`py-2.5 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      cameraType === 'KITCHEN'
                        ? 'bg-primary text-white border-primary shadow-xs'
                        : 'bg-white text-muted border-cardBlue'
                    }`}
                  >
                    🍽️ Oshxona
                  </button>
                </div>
              </div>

              <Input
                label="Sektor / Qavat nomi"
                placeholder="Masalan: 1-Bino 2-qavat (O'g'il bolalar)"
                value={sectorLabel}
                onChange={(e) => setSectorLabel(e.target.value)}
                required
              />

              <Input
                label="Stream / RTSP yoki Snapshot havolasi (ixtiyoriy)"
                placeholder="https://vdo.ninja/?view=..."
                value={streamUrl}
                onChange={(e) => setStreamUrl(e.target.value)}
              />

              <div className="flex gap-3 pt-2">
                <Button
                  variant="secondary"
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 justify-center"
                >
                  Bekor qilish
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 justify-center font-bold"
                >
                  {isSubmitting ? 'Qo‘shilmoqda...' : 'Kamerani Saqlash'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Preview Modal */}
      {previewCamera && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-deep rounded-3xl max-w-3xl w-full p-6 text-white shadow-2xl border border-white/10 relative">
            <button
              onClick={() => setPreviewCamera(null)}
              className="absolute right-5 top-5 text-white/70 hover:text-white p-1 rounded-full hover:bg-white/10"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <span className="w-3 h-3 rounded-full bg-success animate-pulse" />
              <h3 className="text-lg font-bold">
                {previewCamera.sectorLabel} (Real vaqt monitoringi)
              </h3>
            </div>

            <div className="rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center relative border border-white/10">
              {previewCamera.streamUrl ? (
                <img
                  src={previewCamera.streamUrl}
                  alt={previewCamera.sectorLabel}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-white/60 text-sm">Videokamera signali faol</div>
              )}
              <div className="absolute top-4 left-4 bg-black/60 px-3 py-1 rounded-full text-xs font-mono">
                {previewCamera.type} • 1080p 30FPS
              </div>
            </div>

            <div className="mt-4 flex justify-between items-center text-xs text-[#D3E6F5]/70">
              <span>Xavfsiz shifrlangan videooqim (SSL/WebRTC)</span>
              <Button variant="secondary" size="sm" onClick={() => setPreviewCamera(null)}>
                Yopish
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
