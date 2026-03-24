export function calculateHadlockEFW(dbp: number, cc: number, ca: number, cf: number): number | null {
  if (!dbp || !cc || !ca || !cf) return null;
  
  // Convert mm to cm
  const BPD = dbp / 10;
  const HC = cc / 10;
  const AC = ca / 10;
  const FL = cf / 10;

  // Hadlock 4 formula: Log10(Weight) = 1.3596 - (0.00386 * AC * FL) + (0.0064 * HC) + (0.00061 * BPD * AC) + (0.0424 * AC) + (0.174 * FL)
  const log10Weight = 1.3596 - (0.00386 * AC * FL) + (0.0064 * HC) + (0.00061 * BPD * AC) + (0.0424 * AC) + (0.174 * FL);
  
  const weight = Math.pow(10, log10Weight);
  return Math.round(weight);
}

export function calculateHadlockGA(dbp: number, cc: number, ca: number, cf: number): { weeks: number, days: number } | null {
  if (!dbp || !cc || !ca || !cf) return null;
  
  // Convert mm to cm
  const BPD = dbp / 10;
  const HC = cc / 10;
  const AC = ca / 10;
  const FL = cf / 10;

  // Hadlock formulas for GA in weeks
  const gaBPD = 9.54 + 1.482 * BPD + 0.1676 * Math.pow(BPD, 2);
  const gaHC = 8.96 + 0.540 * HC + 0.0003 * Math.pow(HC, 3);
  const gaAC = 8.14 + 0.753 * AC + 0.0036 * Math.pow(AC, 2);
  const gaFL = 10.35 + 2.460 * FL + 0.170 * Math.pow(FL, 2);

  const avgGA = (gaBPD + gaHC + gaAC + gaFL) / 4;
  
  const weeks = Math.floor(avgGA);
  const days = Math.round((avgGA - weeks) * 7);
  
  // Handle overflow of days
  if (days === 7) {
    return { weeks: weeks + 1, days: 0 };
  }
  
  return { weeks, days };
}

export function calculateHadlockGAFromCRL(crl: number): { weeks: number, days: number } | null {
  if (!crl) return null;
  
  // Convert mm to cm
  const CRL = crl / 10;
  
  // Hadlock 1992 formula for GA from CRL (CRL in cm, GA in weeks)
  // ln(GA) = 1.684969 + 0.315646*CRL - 0.049306*CRL^2 + 0.004057*CRL^3 - 0.00012045*CRL^4
  const lnGA = 1.684969 + (0.315646 * CRL) - (0.049306 * Math.pow(CRL, 2)) + (0.004057 * Math.pow(CRL, 3)) - (0.00012045 * Math.pow(CRL, 4));
  
  const exactWeeks = Math.exp(lnGA);
  const weeks = Math.floor(exactWeeks);
  const days = Math.round((exactWeeks - weeks) * 7);
  
  if (days === 7) {
    return { weeks: weeks + 1, days: 0 };
  }
  
  return { weeks, days };
}

// Barcelona Percentile calculation (Approximation using Hadlock Mean and SD, which is standard when exact LMS tables aren't provided, 
// but we'll use the WHO/Hadlock Z-score method. CV for Hadlock is 12% (0.12))
export function calculatePercentile(efw: number, weeks: number, days: number): number | null {
  if (!efw || !weeks) return null;
  
  const exactWeeks = weeks + (days / 7);
  
  // Expected EFW by Hadlock: ln(EFW) = 0.578 + 0.332*GA - 0.00354*GA^2
  const expectedLnEFW = 0.578 + 0.332 * exactWeeks - 0.00354 * Math.pow(exactWeeks, 2);
  const expectedEFW = Math.exp(expectedLnEFW);
  
  // Hadlock CV is 12%
  const sd = expectedEFW * 0.12;
  
  const zScore = (efw - expectedEFW) / sd;
  
  // Convert Z-score to percentile using error function approximation
  const percentile = 0.5 * (1 + erf(zScore / Math.sqrt(2))) * 100;
  
  return Math.round(percentile);
}

export function calculateDPP(weeks: number, days: number): string | null {
  if (isNaN(weeks) || isNaN(days)) return null;
  
  const totalGestationalDays = (weeks * 7) + days;
  const remainingDays = 280 - totalGestationalDays; // 40 weeks = 280 days
  
  const today = new Date();
  const dppDate = new Date(today.getTime() + remainingDays * 24 * 60 * 60 * 1000);
  
  const day = String(dppDate.getDate()).padStart(2, '0');
  const month = String(dppDate.getMonth() + 1).padStart(2, '0');
  const year = dppDate.getFullYear();
  
  return `${day}/${month}/${year}`;
}

// Helper for error function
function erf(x: number): number {
  // Save the sign of x
  const sign = (x >= 0) ? 1 : -1;
  x = Math.abs(x);

  // Constants
  const a1 =  0.254829592;
  const a2 = -0.284496736;
  const a3 =  1.421413741;
  const a4 = -1.453152027;
  const a5 =  1.061405429;
  const p  =  0.3275911;

  // A&S formula 7.1.26
  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return sign * y;
}
