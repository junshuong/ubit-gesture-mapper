import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import microbitReducer from '../features/microbit/microbitSlice';
import alertReducer from '../features/alert/alertSlice';

export const store = configureStore({
  reducer: {
    microbit: microbitReducer,
    alert: alertReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;