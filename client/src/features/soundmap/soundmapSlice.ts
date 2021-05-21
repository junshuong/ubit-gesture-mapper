import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';

interface MappingState {
    gesture_id: number,
    withFile: boolean,
    fileName: string,
}


interface SoundmapState {
    gestures: MappingState[]
}


const initialState: SoundmapState = {
    gestures: []
}



export const availableAudioFiles = [
    {
        fileName: "cars-honking-sound",
        name: "Car Honk",
    },
    {
        fileName: "ding-sound",
        name: "Ding",
    },
    {
        fileName: "heart-beat-sound",
        name: "Heart Beat",
    },
    {
        fileName: "outer-space-atmos-sound",
        name: "Outer Space",
    }
]

export const modelSlice = createSlice({
    name: 'model',
    initialState,
    reducers: {
        addGestureMapping: (state, action: PayloadAction<MappingState>) => {
            // Safely add - check for existing mapping
            state.gestures.forEach((element, index) => {
                if (element.gesture_id === action.payload.gesture_id) {
                    state.gestures[index] = action.payload;
                    return;
                }
            });
            state.gestures.push(action.payload);
        }
    }
})

export const selectGestureMappings = (state: RootState) => state.soundmap.gestures;

export const { addGestureMapping } = modelSlice.actions;

export default modelSlice.reducer;