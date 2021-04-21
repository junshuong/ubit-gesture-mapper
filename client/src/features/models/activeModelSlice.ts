import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { RootState } from "../../app/store";
import { AccelerometerState } from "../microbit/microbitSlice";

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
    description: string,
    isActive: boolean,
    triggered: boolean,
    history: AccelerometerState[]
}

const initialState: ActiveModelState = {
    id: 0,
    name: "",
    gestures: [],
    tickCount: 0,
    description: "",
    isActive: false,
    triggered: false,
    history: []
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
        },
        activate: state => {
            state.isActive = true;
        },
        deactivate: state => {
            state.isActive = false;
        },
        trigger: (state, action: PayloadAction<boolean>) => {
            state.triggered = action.payload;
        },
        setGestureHistory: (state, action: PayloadAction<AccelerometerState>) => {
            if (state.isActive) {
                if (state.history.length <= state.tickCount && state.tickCount > 0) {
                    state.history.push(action.payload);
                }
                if (state.history.length > state.tickCount) {
                    state.history.shift();
                }
            }
        }
    }
});

export const selectActiveModel = (state: RootState) => {
    return state.activeModel;
};
export const selectActiveModelName = (state: RootState) => state.activeModel.name;

export const { setGestureHistory, setActiveModel, activate, deactivate, trigger } = activeModelSlice.actions;

export default activeModelSlice.reducer;

