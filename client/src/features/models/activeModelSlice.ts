import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { RootState } from "../../app/store";
import { AccelerometerState, MagnetometerState } from "../microbit/microbitSlice";

export interface GestureState {
    id: number,
    name: string,
    classification: number,
    model: number,
    captures: GestureCaptureState[]
}

interface DataTickState {
    x: number,
    y: number,
    z: number
}

interface GestureCaptureState {
    dataTicks: DataTickState[]
}

export interface HistoryState {
    accelerometer: AccelerometerState[],
    magnetometer: MagnetometerState[],
}

export interface ActiveModelState {
    id: number,
    name: string,
    gestures: GestureState[],
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
            console.log("Setting gestures as ");
            console.log(action.payload.gestures);
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
                if (l <= 30) {
                    state.history.accelerometer.push(action.payload);
                }
                if (l > 30) {
                    state.history.accelerometer.shift();
                }
            }
        },
        setMangetometerGestureHistory: (state, action: PayloadAction<MagnetometerState>) => {
            if (state.isActive) {
                let l: number = state.history.magnetometer.length;
                if (l <= 30) {
                    state.history.magnetometer.push(action.payload);
                }
                if (l > 30) {
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
export const selectHistory = (state: RootState) => state.activeModel.history;

export const { setAccelerometerGestureHistory, setMangetometerGestureHistory,setActiveModel, activate, deactivate, trigger } = activeModelSlice.actions;

export default activeModelSlice.reducer;

