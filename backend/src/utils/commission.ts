import { CommissionType, CommissionConfig, CommissionResult } from '../types';

/**
 * Calculate commission based on the configured type (FIXED or PERCENTAGE).
 *
 * @param slotPrice  - The base price of the slot being booked
 * @param config     - Commission configuration with type and value
 * @returns            CommissionResult with all computed amounts
 */
export function calculateCommission(
  slotPrice: number,
  config: CommissionConfig
): CommissionResult {
  let commissionAmount: number;

  if (config.type === CommissionType.FIXED) {
    // Fixed commission: deduct a flat amount (capped at the slot price)
    commissionAmount = Math.min(config.value, slotPrice);
  } else {
    // Percentage commission: value represents a percentage (e.g. 10 = 10%)
    commissionAmount = (slotPrice * config.value) / 100;
  }

  // Round to two decimal places to avoid floating-point artefacts
  commissionAmount = Math.round(commissionAmount * 100) / 100;

  const totalAmount = slotPrice;
  const vendorAmount = Math.round((totalAmount - commissionAmount) * 100) / 100;

  return {
    commissionAmount,
    commissionType: config.type,
    totalAmount,
    vendorAmount,
  };
}

/**
 * Parse a CommissionType string coming from the database / environment.
 * Falls back to PERCENTAGE if the value is unrecognised.
 */
export function parseCommissionType(value: string): CommissionType {
  const upper = value.toUpperCase();
  if (upper === 'FIXED') return CommissionType.FIXED;
  return CommissionType.PERCENTAGE;
}
