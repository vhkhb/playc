import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import Card from '../../components/common/Card';
import Badge from '../../components/common/Badge';
import EmptyState from '../../components/common/EmptyState';
import { COLORS } from '../../constants/colors';

type Props = NativeStackScreenProps<any, 'PaymentSettings'>;

interface Transaction {
  id: string;
  date: string;
  bookingRef: string;
  amount: number;
  commission: number;
  net: number;
  status: string;
}

const PaymentSettingsScreen: React.FC<Props> = () => {
  const { myVenues } = useSelector((state: RootState) => state.vendor);
  const [transactions] = useState<Transaction[]>([]);

  // Summary data (would come from API)
  const summary = {
    totalEarnings: 0,
    totalCommission: 0,
    netRevenue: 0,
    commissionType: 'PERCENTAGE',
    commissionValue: 10,
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Commission Info */}
      <Card style={styles.commissionCard}>
        <View style={styles.commissionHeader}>
          <Text style={styles.commissionIcon}>💰</Text>
          <Text style={styles.commissionTitle}>Platform Commission</Text>
        </View>
        <View style={styles.commissionDetails}>
          <View style={styles.commissionItem}>
            <Text style={styles.commissionLabel}>Type</Text>
            <Badge
              label={summary.commissionType}
              variant={summary.commissionType === 'PERCENTAGE' ? 'primary' : 'warning'}
            />
          </View>
          <View style={styles.commissionItem}>
            <Text style={styles.commissionLabel}>Rate</Text>
            <Text style={styles.commissionRate}>
              {summary.commissionType === 'PERCENTAGE'
                ? `${summary.commissionValue}%`
                : `$${summary.commissionValue.toFixed(2)} per booking`}
            </Text>
          </View>
        </View>
        <Text style={styles.commissionNote}>
          Commission is automatically deducted from each booking. Rates are configured by the platform admin.
        </Text>
      </Card>

      {/* Revenue Summary */}
      <Text style={styles.sectionTitle}>Revenue Summary</Text>
      <View style={styles.summaryRow}>
        <Card style={styles.summaryCard}>
          <Text style={styles.summaryValue}>${summary.totalEarnings.toFixed(2)}</Text>
          <Text style={styles.summaryLabel}>Total Earnings</Text>
        </Card>
        <Card style={styles.summaryCard}>
          <Text style={[styles.summaryValue, { color: COLORS.warning }]}>
            ${summary.totalCommission.toFixed(2)}
          </Text>
          <Text style={styles.summaryLabel}>Commission Paid</Text>
        </Card>
        <Card style={styles.summaryCard}>
          <Text style={[styles.summaryValue, { color: COLORS.primary }]}>
            ${summary.netRevenue.toFixed(2)}
          </Text>
          <Text style={styles.summaryLabel}>Net Revenue</Text>
        </Card>
      </View>

      {/* Pricing by Venue */}
      <Text style={styles.sectionTitle}>Pricing by Venue</Text>
      {myVenues.length > 0 ? (
        myVenues.map((venue: any) => (
          <Card key={venue.id} style={styles.venueCard}>
            <Text style={styles.venueName}>{venue.name}</Text>
            <Text style={styles.venueSport}>{venue.sportType}</Text>
            <View style={styles.priceRange}>
              <Text style={styles.priceLabel}>Slot Price Range</Text>
              <Text style={styles.priceValue}>
                ${venue.minPrice?.toFixed(2) || '0.00'} - ${venue.maxPrice?.toFixed(2) || '0.00'}
              </Text>
            </View>
          </Card>
        ))
      ) : (
        <Card style={styles.emptyCard}>
          <Text style={styles.emptyText}>No venues added yet</Text>
        </Card>
      )}

      {/* Payment History */}
      <View style={styles.historyHeader}>
        <Text style={styles.sectionTitle}>Payment History</Text>
        <TouchableOpacity style={styles.exportBtn}>
          <Text style={styles.exportBtnText}>Export</Text>
        </TouchableOpacity>
      </View>

      {transactions.length > 0 ? (
        transactions.map((txn) => (
          <Card key={txn.id} style={styles.txnCard}>
            <View style={styles.txnHeader}>
              <View>
                <Text style={styles.txnRef}>#{txn.bookingRef}</Text>
                <Text style={styles.txnDate}>{txn.date}</Text>
              </View>
              <Badge label={txn.status} variant={txn.status === 'PAID' ? 'success' : 'warning'} />
            </View>
            <View style={styles.txnDetails}>
              <View style={styles.txnItem}>
                <Text style={styles.txnLabel}>Amount</Text>
                <Text style={styles.txnValue}>${txn.amount.toFixed(2)}</Text>
              </View>
              <View style={styles.txnItem}>
                <Text style={styles.txnLabel}>Commission</Text>
                <Text style={[styles.txnValue, { color: COLORS.warning }]}>
                  -${txn.commission.toFixed(2)}
                </Text>
              </View>
              <View style={styles.txnItem}>
                <Text style={styles.txnLabel}>Net</Text>
                <Text style={[styles.txnValue, { color: COLORS.primary }]}>
                  ${txn.net.toFixed(2)}
                </Text>
              </View>
            </View>
          </Card>
        ))
      ) : (
        <EmptyState
          icon="📊"
          title="No Transactions"
          message="Your payment history will appear here once you start receiving bookings"
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: 16, paddingBottom: 40 },
  commissionCard: {
    padding: 20,
    backgroundColor: '#F3E8FF',
    borderWidth: 1,
    borderColor: '#D8B4FE',
  },
  commissionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  commissionIcon: { fontSize: 24, marginRight: 10 },
  commissionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  commissionDetails: { marginBottom: 12 },
  commissionItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  commissionLabel: { fontSize: 14, color: COLORS.textSecondary },
  commissionRate: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  commissionNote: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 16, fontStyle: 'italic' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginTop: 24, marginBottom: 12 },
  summaryRow: { flexDirection: 'row', gap: 10 },
  summaryCard: { flex: 1, padding: 14, alignItems: 'center' },
  summaryValue: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  summaryLabel: { fontSize: 11, color: COLORS.textSecondary, marginTop: 4, textAlign: 'center' },
  venueCard: { padding: 14, marginBottom: 8 },
  venueName: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  venueSport: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  priceRange: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: COLORS.border },
  priceLabel: { fontSize: 13, color: COLORS.textSecondary },
  priceValue: { fontSize: 14, fontWeight: '600', color: COLORS.primary },
  emptyCard: { padding: 20, alignItems: 'center' },
  emptyText: { fontSize: 14, color: COLORS.textSecondary },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 12 },
  exportBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, backgroundColor: COLORS.primaryLight },
  exportBtnText: { fontSize: 13, fontWeight: '600', color: COLORS.primary },
  txnCard: { padding: 14, marginBottom: 8 },
  txnHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  txnRef: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  txnDate: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  txnDetails: { flexDirection: 'row', backgroundColor: COLORS.background, borderRadius: 8, padding: 10 },
  txnItem: { flex: 1, alignItems: 'center' },
  txnLabel: { fontSize: 11, color: COLORS.textSecondary },
  txnValue: { fontSize: 13, fontWeight: '600', color: COLORS.text, marginTop: 2 },
});

export default PaymentSettingsScreen;
