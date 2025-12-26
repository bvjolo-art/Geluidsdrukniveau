export interface AcousticParams {
  soundPower: number; // Lw in dB
  distance: number;   // r in meters
}

export interface AcousticResult {
  soundPressure: number; // Lp in dB
  contours: ContourLevel[];
}

export interface ContourLevel {
  radius: number;
  db: number;
  label?: string; // e.g., "Dag", "Nacht"
}

export enum CalculationModel {
  HEMISPHERICAL = "HEMISPHERICAL", // Q=2 (ground source)
  SPHERICAL = "SPHERICAL"          // Q=1 (free space)
}

export interface AIAnalysisResponse {
  analysis: string;
  recommendations: string[];
}