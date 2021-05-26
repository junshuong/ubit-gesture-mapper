import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';

interface ModelState {
    id: number,
    name: string,
    description: string
}

interface ModelPageState {
    models: ModelState[]
}

const initialState: ModelPageState = {
    models: []
}

export const modelSlice = createSlice({
    name: 'model',
    initialState,
    reducers: {
        setModels: (state, action: PayloadAction<[ModelState]>) => {
            state.models = action.payload;
        }
    }
});

export const selectModels = (state: RootState) => state.models.models;

export const { setModels } = modelSlice.actions;

export default modelSlice.reducer;