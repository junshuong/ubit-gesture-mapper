import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';

interface AudioSlice {
    isPlaying: boolean;
    mainGain: number;
    effectLevel: number;
    freq1: number;
}

const initialState: AudioSlice = {
    isPlaying: false,
    mainGain: 0.2,
    effectLevel: 1.0,
    freq1: 261.63
};

export const audioSlice = createSlice({
    name: 'audio',
    initialState: initialState,
    reducers: {
        setIsPlaying: (state, action: PayloadAction<[boolean]>) => {
            state.isPlaying = action.payload[0];
        },
        toggleIsPlaying: (state) => {
            state.isPlaying = !state.isPlaying;
        },
        setMainGain: (state, action: PayloadAction<[number]>) => {
            state.mainGain = action.payload[0];
        },
        setEffectLevel: (state, action: PayloadAction<[number]>) => {
            state.effectLevel = action.payload[0];
        },
        setFreq1: (state, action: PayloadAction<[number]>) => {
            state.freq1 = action.payload[0];
        }
    }
});

export const selectIsPlaying = (state: RootState) => state.audio.isPlaying;
export const selectMainGain = (state: RootState) => state.audio.mainGain;
export const selectEffectLevel = (state: RootState) => state.audio.effectLevel;
export const selectFreq1 = (state: RootState) => state.audio.freq1;

export const { setIsPlaying, toggleIsPlaying, setMainGain, setEffectLevel, setFreq1 } = audioSlice.actions;

export default audioSlice.reducer;
