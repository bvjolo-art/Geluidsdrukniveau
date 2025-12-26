import { AcousticParams, AcousticResult, CalculationModel, ContourLevel } from '../types';

/**
 * Calculates Sound Pressure Level (Lp) from Sound Power Level (Lw) and distance (r).
 * Assumes Hemispherical propagation (Q=2) by default as it's most common for equipment on the ground.
 * Formula: Lp = Lw - 20*log10(r) - 8
 */
export const calculateSoundPressure = (
  params: AcousticParams,
  model: CalculationModel = CalculationModel.HEMISPHERICAL
): number => {
  const { soundPower, distance } = params;
  
  // Prevent log(0) or negative distance
  const r = Math.max(distance, 0.1); 

  const correction = model === CalculationModel.HEMISPHERICAL ? 8 : 11;
  const lp = soundPower - 20 * Math.log10(r) - correction;

  return parseFloat(lp.toFixed(1));
};

/**
 * Calculates the radius at which a specific Sound Pressure Level occurs.
 * Derived from: Lp = Lw - 20*log10(r) - correction
 * => 20*log10(r) = Lw - Lp - correction
 * => log10(r) = (Lw - Lp - correction) / 20
 * => r = 10^((Lw - Lp - correction) / 20)
 */
export const calculateDistanceForPressure = (
  targetLp: number,
  soundPower: number,
  model: CalculationModel = CalculationModel.HEMISPHERICAL
): number => {
  const correction = model === CalculationModel.HEMISPHERICAL ? 8 : 11;
  const exponent = (soundPower - targetLp - correction) / 20;
  return Math.pow(10, exponent);
};

export const generateContours = (
  soundPower: number,
  limits: { db: number; label: string }[],
  model: CalculationModel = CalculationModel.HEMISPHERICAL
): ContourLevel[] => {
  const contours: ContourLevel[] = [];

  limits.forEach(limit => {
    // Only calculate if the source is louder than the limit + correction, 
    // otherwise the radius is technically 0 or undefined (mathematically negative log results)
    // However, Lw is usually > Lp. 
    
    // Check if physically possible (Sound Power must be higher than Target Pressure + Correction factor roughly)
    // The formula r = 10^((Lw - Lp - 8) / 20). If Lw - Lp - 8 is negative, r < 1. 
    // We just calculate it regardless.
    
    const r = calculateDistanceForPressure(limit.db, soundPower, model);
    
    contours.push({
      radius: r,
      db: limit.db,
      label: limit.label
    });
  });

  return contours.sort((a, b) => a.radius - b.radius); // Sort small radius to large radius
};