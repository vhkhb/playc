import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { VendorStackParamList } from '../types';
import VendorDashboardScreen from '../screens/vendor/VendorDashboardScreen';
import ManageVenueScreen from '../screens/vendor/ManageVenueScreen';
import ManageSlotsScreen from '../screens/vendor/ManageSlotsScreen';
import VendorBookingsScreen from '../screens/vendor/VendorBookingsScreen';
import ManageServicesScreen from '../screens/vendor/ManageServicesScreen';
import PaymentSettingsScreen from '../screens/vendor/PaymentSettingsScreen';
import Colors from '../constants/colors';

const Stack = createNativeStackNavigator<VendorStackParamList>();

const VendorNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: Colors.white,
        headerTitleStyle: {
          fontWeight: '600',
        },
        contentStyle: { backgroundColor: Colors.background },
      }}
    >
      <Stack.Screen
        name="VendorDashboard"
        component={VendorDashboardScreen}
        options={{ title: 'Vendor Dashboard' }}
      />
      <Stack.Screen
        name="ManageVenue"
        component={ManageVenueScreen}
        options={({ route }) => ({
          title: route.params?.venueId ? 'Edit Venue' : 'Add Venue',
        })}
      />
      <Stack.Screen
        name="ManageSlots"
        component={ManageSlotsScreen}
        options={{ title: 'Manage Slots' }}
      />
      <Stack.Screen
        name="VendorBookings"
        component={VendorBookingsScreen}
        options={{ title: 'Bookings' }}
      />
      <Stack.Screen
        name="ManageServices"
        component={ManageServicesScreen}
        options={{ title: 'Extra Services' }}
      />
      <Stack.Screen
        name="PaymentSettings"
        component={PaymentSettingsScreen}
        options={{ title: 'Payment Settings' }}
      />
    </Stack.Navigator>
  );
};

export default VendorNavigator;
