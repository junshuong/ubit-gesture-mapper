import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { RootState } from "../../app/store";
import { AccelerometerState, MagnetometerState } from "../microbit/microbitSlice";

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
    history: {
        accelerometer: AccelerometerState[],
        magnetometer: MagnetometerState[],
    }
}

const initialState: ActiveModelState = {
    id: 0,
    name: "",
    gestures: [],
    tickCount: 0,
    description: "",
    isActive: false,
    triggered: false,
    history: {
        accelerometer: [],
        magnetometer: []
    }
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
        setAccelerometerGestureHistory: (state, action: PayloadAction<AccelerometerState>) => {
            if (state.isActive) {
                let l: number = state.history.accelerometer.length;
                if (l <= state.tickCount && state.tickCount > 0) {
                    state.history.accelerometer.push(action.payload);
                }
                if (l > state.tickCount) {
                    state.history.accelerometer.shift();
                }
            }
        },
        setMangetometerGestureHistory: (state, action: PayloadAction<MagnetometerState>) => {
            if (state.isActive) {
                let l: number = state.history.magnetometer.length;
                if (l <= state.tickCount && state.tickCount > 0) {
                    state.history.magnetometer.push(action.payload);
                }
                if (l > state.tickCount) {
                    state.history.magnetometer.shift();
                }
            }
        }
    }
});

export const selectActiveModel = (state: RootState) => {
    return state.activeModel;
};
export const selectActiveModelName = (state: RootState) => state.activeModel.name;

export const { setAccelerometerGestureHistory, setMangetometerGestureHistory,setActiveModel, activate, deactivate, trigger } = activeModelSlice.actions;

export default activeModelSlice.reducer;

