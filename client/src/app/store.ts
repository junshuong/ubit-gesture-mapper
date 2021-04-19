import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import microbitReducer from '../features/microbit/microbitSlice';
import alertReducer from '../features/alert/alertSlice';
import modelReducer from '../features/models/modelSlice';
import activeModelReducer from '../features/models/activeModelSlice';

export const store = configureStore({
  reducer: {
    microbit: microbitReducer,
    alert: alertReducer,
    models: modelReducer,
    activeModel: activeModelReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;