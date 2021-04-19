import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { RootState } from "../../app/store";


interface GestureState {
    id: number,
    classification: boolean,
    dataTicks: DataTickState[]
}

interface DataTickState {
    x: number,
    y: number,
    z: number
}

export interface ActiveModelState {
    id: number,
    name: string,
    gestures: GestureState[],
    tickCount: number,
    description: string
}

const initialState: ActiveModelState = {
    id: 0,
    name: "",
    gestures: [],
    tickCount: 0,
    description: ""
}

export const activeModelSlice = createSlice({
    name: 'activeModel',
    initialState,
    reducers: {
        setActiveModel: (state, action: PayloadAction<ActiveModelState>) => {
            state.id = action.payload.id;
            state.name = action.payload.name;
            state.description = action.payload.description;
            state.tickCount = action.payload.tickCount;
            state.gestures = action.payload.gestures;
        }
    }
})

export const selectActiveModel = (state: RootState) => {
    console.log("Selected model");
    return state.activeModel;
};
export const selectActiveModelName = (state: RootState) => state.activeModel.name;

export const { setActiveModel } = activeModelSlice.actions;

export default activeModelSlice.reducer;

