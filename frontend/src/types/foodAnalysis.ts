export interface DetectedFood {
  name: string;
  estimatedCalories: number;
  category: 'sabzavot' | 'oqsil' | 'uglevod' | 'shirinlik' | 'ichimlik' | 'boshqa' | string;
}

export type HealthScore = 'BALANCED' | 'NEEDS_ATTENTION' | 'UNKNOWN';
export type AnalysisStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
export type CaptureStatus = 'PENDING' | 'SUCCESS' | 'CAMERA_OFFLINE' | 'CAPTURE_FAILED';

export interface FoodAnalysisItem {
  id: string;
  cameraId: string;
  cameraLabel?: string;
  schoolId: string;
  schoolName?: string;
  frameUrls: string[];
  status: AnalysisStatus;
  detectedFoods: DetectedFood[];
  totalCalories: number | null;
  healthScore: HealthScore;
  aiNote: string | null;
  errorMessage?: string | null;
  retryCount?: number;
  capturedAt: string;
  analyzedAt?: string | null;
  createdAt: string;
}

export type FoodAnalysisCardState = 'loading' | 'empty' | 'error' | 'success' | 'partial';
