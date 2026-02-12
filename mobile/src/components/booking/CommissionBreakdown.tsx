import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

interface CommissionBreakdownProps {
  subtotal: number;
  commissionType: 'FIXED' | 'PERCENTAGE';
  commissionValue: number;
  commissionAmount: number;
  total: number;
  currency?: string;
  extraServicesTotal?: number;
}

const CommissionBreakdown: React.FC<CommissionBreakdownProps> = ({
  subtotal,
  commissionType,
  commissionValue,
  commissionAmount,
  total,
  currency = '$',
  extraServicesTotal = 0,
}) => {
  const commissionLabel =
    commissionType === 'PERCENTAGE'
      ? `Platform Fee (${commissionValue}%)`
      : `Platform Fee (Fixed)`;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Price Breakdown</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Slot Price</Text>
        <Text style={styles.value}>
          {currency}{subtotal.toFixed(2)}
        </Text>
      </View>

      {extraServicesTotal > 0 && (
        <View style={styles.row}>
          <Text style={styles.label}>Extra Services</Text>
          <Text style={styles.value}>
            {currency}{extraServicesTotal.toFixed(2)}
          </Text>
        </View>
      )}

      <View style={styles.row}>
        <Text style={styles.label}>{commissionLabel}</Text>
        <Text style={styles.commissionValue}>
          +{currency}{commissionAmount.toFixed(2)}
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.row}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>
          {currency}{total.toFixed(2)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  commissionValue: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.warning,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
});

export default CommissionBreakdown;
