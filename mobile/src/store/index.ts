import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authReducer from './slices/authSlice';
import venueReducer from './slices/venueSlice';
import bookingReducer from './slices/bookingSlice';
import gameReducer from './slices/gameSlice';
import communityReducer from './slices/communitySlice';
import vendorReducer from './slices/vendorSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    venues: venueReducer,
    bookings: bookingReducer,
    games: gameReducer,
    communities: communityReducer,
    vendor: vendorReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/login/fulfilled', 'auth/register/fulfilled'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
