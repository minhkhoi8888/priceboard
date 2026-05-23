export const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export const getAmountFromAllocation = (maxAmount: number, allocation: number) =>
  (maxAmount * allocation) / 100;

export const getAllocationFromAmount = (amount: number, maxAmount: number) =>
  maxAmount > 0 ? Math.round((amount / maxAmount) * 100) : 0;
