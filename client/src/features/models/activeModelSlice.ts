import { createSlice, PayloadAction } from "@reduxjs/toolkit"
import { RootState } from "../../app/store";
import { AccelerometerState, MagnetometerState } from "../microbit/microbitSlice";

export interface GestureState {
    id: number,
    name: string,
    classification: number,
    model: number,
    using_file: boolean,
    sound_file: string,
    frequency: number,
    strength: number,
    volume: number,
    captures: GestureCaptureState[]
    triggered: boolean,
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
                if (state.history.accelerometer.length <= 30) {
                    state.history.accelerometer.push(action.payload);
                }
                if (state.history.accelerometer.length > 30) {
                    state.history.accelerometer.shift();
                }
            }
        },
        setMangetometerGestureHistory: (state, action: PayloadAction<MagnetometerState>) => {
            if (state.isActive) {
                if (state.history.magnetometer.length <= 30) {
                    state.history.magnetometer.push(action.payload);
                }
                if (state.history.magnetometer.length > 30) {
                    state.history.magnetometer.shift();
                }
            }
        },
        setGestureTrigger: (state, action: PayloadAction<number>) => {
            state.gestures[action.payload-1].triggered = true;
            setTimeout(() => {
                state.gestures[action.payload-1].triggered = false;
            }, 2000)
        }
    }
});

export const selectActiveModel = (state: RootState) => {
    return state.activeModel;
};
export const selectActiveModelName = (state: RootState) => state.activeModel.name;
export const selectHistory = (state: RootState) => state.activeModel.history;
export const selectGestureTrigger = (state: RootState, action: PayloadAction<number>) => {
    return state.activeModel.gestures[action.payload].triggered;
}


export const { setGestureTrigger, setAccelerometerGestureHistory, setMangetometerGestureHistory,setActiveModel, activate, deactivate, trigger } = activeModelSlice.actions;

export default activeModelSlice.reducer;

