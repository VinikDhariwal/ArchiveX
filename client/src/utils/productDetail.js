const SPEC_LABELS = {
  engine: 'Engine',
  power: 'Power',
  torque: 'Torque',
  transmission: 'Transmission',
  drivetrain: 'Drivetrain',
  bodyStyle: 'Body',
  acceleration: '0–100',
  topSpeed: 'Top speed',
  productionUnits: 'Production units',
  productionPeriod: 'Production period',
  modelGeneration: 'Generation',
  displacement: 'Displacement',
  weight: 'Weight',
  movement: 'Movement',
  caliber: 'Caliber',
  caseMaterial: 'Case',
  caseSize: 'Diameter',
  waterResistance: 'Water resistance',
  bracelet: 'Bracelet',
  dialColor: 'Dial',
};

export function formatSpecLabel(key) {
  return SPEC_LABELS[key] || key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());
}

export function getSessionKey() {
  const storageKey = 'archivex_session_key';
  try {
    const existing = window.localStorage.getItem(storageKey);
    if (existing) return existing;
    const next = `sess_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
    window.localStorage.setItem(storageKey, next);
    return next;
  } catch {
    return `sess_${Date.now().toString(36)}`;
  }
}
