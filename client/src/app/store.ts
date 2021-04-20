import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import microbitReducer from '../features/microbit/microbitSlice';
import alertReducer from '../features/alert/alertSlice';
import modelReducer from '../features/models/modelSlice';
import activeModelReducer from '../features/models/activeModelSlice';
import audioReducer from '../features/audio/audioSlice';

export const store = configureStore({
  reducer: {
    microbit: microbitReducer,
    alert: alertReducer,
    models: modelReducer,
    activeModel: activeModelReducer,
    audio: audioReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;