export function calcPenalty(debt: number, daysOverdue: number): number {
  if (!Number.isFinite(debt) || debt < 0) {
    throw new Error('INVALID_DEBT');
  }
  if (!Number.isInteger(daysOverdue) || daysOverdue < 0) {
    throw new Error('INVALID_DAYS');
  }
  if (daysOverdue <= 3) return 0;
  return debt * 0.001 * (daysOverdue - 3);
}

