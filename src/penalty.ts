const GRACE_DAYS = 3;
const DAILY_RATE = 0.001;

export function calcPenalty(debt: number, daysOverdue: number): number {
  if (!Number.isFinite(debt) || debt < 0) {
    throw new Error('INVALID_DEBT');
  }
  if (!Number.isInteger(daysOverdue) || daysOverdue < 0) {
    throw new Error('INVALID_DAYS');
  }
  if (daysOverdue <= GRACE_DAYS) return 0;
  const penalty = debt * DAILY_RATE * (daysOverdue - GRACE_DAYS);
  return Math.min(penalty, debt * 0.5);
}