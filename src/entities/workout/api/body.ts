export interface BodyWeightLog {
  id: string;
  date: string;
  weight: number;
}

export interface BodyMeasurements {
  cintura: number;
  peito: number;
  bracoD: number;
  bracoE: number;
  coxaD: number;
  coxaE: number;
  quadril: number;
  panturrilha: number;
}

export interface BodyMeasurement {
  id: string;
  date: string;
  measurements: BodyMeasurements;
}

export interface ProgressPhoto {
  id: string;
  date: string;
  imageDataUrl: string;
  label: 'frente' | 'costas' | 'lado';
}

export interface Achievement {
  id: string;
  key: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progress: number;
  target: number;
}
