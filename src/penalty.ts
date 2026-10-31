const GRACE_DAYS = 3;
const DAILY_RATE = 0.001;
const MAX_PENALTY_SHARE = 0.5;

const round2 = (n: number): number => Math.round(n * 100) / 100;

function assertValidDebt(debt: number): void {
  if (!Number.isFinite(debt) || debt < 0) {
    throw new Error('INVALID_DEBT');
  }
}

function assertValidDays(daysOverdue: number): void {
  if (!Number.isInteger(daysOverdue) || daysOverdue < 0) {
    throw new Error('INVALID_DAYS');
  }
}

export function calcChargeableDays(daysOverdue: number): number {
  return Math.max(daysOverdue - GRACE_DAYS, 0);
}

export function calcPenalty(debt: number, daysOverdue: number): number {
  assertValidDebt(debt);
  assertValidDays(daysOverdue);
  const penalty = debt * DAILY_RATE * calcChargeableDays(daysOverdue);
  return round2(Math.min(penalty, debt * MAX_PENALTY_SHARE));
}