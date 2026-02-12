import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  MainTabParamList,
  HomeStackParamList,
  ExploreStackParamList,
  HostStackParamList,
  CommunityStackParamList,
  ProfileStackParamList,
} from '../types';
import { useAppSelector } from '../store';
import Colors from '../constants/colors';

// Home Stack Screens
import HomeScreen from '../screens/home/HomeScreen';
import VenueDetailScreen from '../screens/explore/VenueDetailScreen';
import GameDetailScreen from '../screens/game/GameDetailScreen';
import SlotSelectionScreen from '../screens/booking/SlotSelectionScreen';
import BookingConfirmationScreen from '../screens/booking/BookingConfirmationScreen';
import MyBookingsScreen from '../screens/booking/MyBookingsScreen';
import PublicProfileScreen from '../screens/profile/PublicProfileScreen';

// Explore Stack Screens
import ExploreScreen from '../screens/explore/ExploreScreen';
import MapViewScreen from '../screens/explore/MapViewScreen';

// Host Stack Screens
import HostGameScreen from '../screens/game/HostGameScreen';
import InvitePlayersScreen from '../screens/game/InvitePlayersScreen';
import UpcomingGamesScreen from '../screens/game/UpcomingGamesScreen';

// Community Stack Screens
import CommunitiesScreen from '../screens/community/CommunitiesScreen';
import CommunityDetailScreen from '../screens/community/CommunityDetailScreen';
import CreateCommunityScreen from '../screens/community/CreateCommunityScreen';
import MemberListScreen from '../screens/community/MemberListScreen';

// Profile Stack Screens
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';

// Vendor Navigator
import VendorNavigator from './VendorNavigator';

const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const ExploreStack = createNativeStackNavigator<ExploreStackParamList>();
const HostStack = createNativeStackNavigator<HostStackParamList>();
const CommunityStack = createNativeStackNavigator<CommunityStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

const screenOptions = {
  headerStyle: { backgroundColor: Colors.primary },
  headerTintColor: Colors.white,
  headerTitleStyle: { fontWeight: '600' as const },
  contentStyle: { backgroundColor: Colors.background },
};

function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={screenOptions}>
      <HomeStack.Screen
        name="HomeScreen"
        component={HomeScreen}
        options={{ title: 'PlayC' }}
      />
      <HomeStack.Screen
        name="VenueDetail"
        component={VenueDetailScreen}
        options={{ title: 'Venue Details' }}
      />
      <HomeStack.Screen
        name="GameDetail"
        component={GameDetailScreen}
        options={{ title: 'Game Details' }}
      />
      <HomeStack.Screen
        name="SlotSelection"
        component={SlotSelectionScreen}
        options={{ title: 'Select Slot' }}
      />
      <HomeStack.Screen
        name="BookingConfirmation"
        component={BookingConfirmationScreen}
        options={{ title: 'Booking Confirmed', headerBackVisible: false }}
      />
      <HomeStack.Screen
        name="MyBookings"
        component={MyBookingsScreen}
        options={{ title: 'My Bookings' }}
      />
      <HomeStack.Screen
        name="PublicProfile"
        component={PublicProfileScreen}
        options={{ title: 'Profile' }}
      />
    </HomeStack.Navigator>
  );
}

function ExploreStackScreen() {
  return (
    <ExploreStack.Navigator screenOptions={screenOptions}>
      <ExploreStack.Screen
        name="ExploreScreen"
        component={ExploreScreen}
        options={{ title: 'Explore Venues' }}
      />
      <ExploreStack.Screen
        name="VenueDetail"
        component={VenueDetailScreen}
        options={{ title: 'Venue Details' }}
      />
      <ExploreStack.Screen
        name="MapView"
        component={MapViewScreen}
        options={{ title: 'Map View' }}
      />
      <ExploreStack.Screen
        name="SlotSelection"
        component={SlotSelectionScreen}
        options={{ title: 'Select Slot' }}
      />
      <ExploreStack.Screen
        name="BookingConfirmation"
        component={BookingConfirmationScreen}
        options={{ title: 'Booking Confirmed', headerBackVisible: false }}
      />
    </ExploreStack.Navigator>
  );
}

function HostStackScreen() {
  return (
    <HostStack.Navigator screenOptions={screenOptions}>
      <HostStack.Screen
        name="HostGame"
        component={HostGameScreen}
        options={{ title: 'Host a Game' }}
      />
      <HostStack.Screen
        name="GameDetail"
        component={GameDetailScreen}
        options={{ title: 'Game Details' }}
      />
      <HostStack.Screen
        name="InvitePlayers"
        component={InvitePlayersScreen}
        options={{ title: 'Invite Players' }}
      />
      <HostStack.Screen
        name="UpcomingGames"
        component={UpcomingGamesScreen}
        options={{ title: 'Upcoming Games' }}
      />
    </HostStack.Navigator>
  );
}

function CommunityStackScreen() {
  return (
    <CommunityStack.Navigator screenOptions={screenOptions}>
      <CommunityStack.Screen
        name="CommunitiesScreen"
        component={CommunitiesScreen}
        options={{ title: 'Communities' }}
      />
      <CommunityStack.Screen
        name="CommunityDetail"
        component={CommunityDetailScreen}
        options={{ title: 'Community' }}
      />
      <CommunityStack.Screen
        name="CreateCommunity"
        component={CreateCommunityScreen}
        options={{ title: 'Create Community' }}
      />
      <CommunityStack.Screen
        name="MemberList"
        component={MemberListScreen}
        options={{ title: 'Members' }}
      />
      <CommunityStack.Screen
        name="PublicProfile"
        component={PublicProfileScreen}
        options={{ title: 'Profile' }}
      />
    </CommunityStack.Navigator>
  );
}

function ProfileStackScreen() {
  return (
    <ProfileStack.Navigator screenOptions={screenOptions}>
      <ProfileStack.Screen
        name="ProfileScreen"
        component={ProfileScreen}
        options={{ title: 'My Profile' }}
      />
      <ProfileStack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ title: 'Edit Profile' }}
      />
      <ProfileStack.Screen
        name="MyBookings"
        component={MyBookingsScreen}
        options={{ title: 'My Bookings' }}
      />
      <ProfileStack.Screen
        name="PublicProfile"
        component={PublicProfileScreen}
        options={{ title: 'Profile' }}
      />
    </ProfileStack.Navigator>
  );
}

const MainNavigator: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const isVendor = user?.role === 'vendor';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.tabActive,
        tabBarInactiveTintColor: Colors.tabInactive,
        tabBarStyle: {
          backgroundColor: Colors.tabBackground,
          borderTopWidth: 1,
          borderTopColor: Colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = 'home';
          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Explore':
              iconName = focused ? 'compass' : 'compass-outline';
              break;
            case 'Host':
              iconName = focused ? 'plus-circle' : 'plus-circle-outline';
              break;
            case 'Communities':
              iconName = focused ? 'account-group' : 'account-group-outline';
              break;
            case 'Profile':
              iconName = focused ? 'account' : 'account-outline';
              break;
            case 'Vendor':
              iconName = focused ? 'store' : 'store-outline';
              break;
          }
          return <Icon name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStackScreen} />
      <Tab.Screen name="Explore" component={ExploreStackScreen} />
      <Tab.Screen name="Host" component={HostStackScreen} />
      <Tab.Screen name="Communities" component={CommunityStackScreen} />
      {isVendor && (
        <Tab.Screen
          name="Vendor"
          component={VendorNavigator}
          options={{ title: 'My Business' }}
        />
      )}
      <Tab.Screen name="Profile" component={ProfileStackScreen} />
    </Tab.Navigator>
  );
};

export default MainNavigator;
