import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';

export interface AccelerometerState {
    x: number,
    y: number,
    z: number
}

export interface MagnetometerState {
    x: number,
    y: number,
    z: number
}

export interface ActiveHistoryState {
    accelerometerHistory : AccelerometerState[],
    magnetometerHistory: MagnetometerState[],
}

interface MicrobitState {
    id: string,
    connected: boolean,
    ticks: number,
    completedAccelTicks: number,
    completedMagnetTicks: number,
    accelerometer: AccelerometerState,
    history: ActiveHistoryState,
    button: {
        a: number,
        b: number
    },
    temperature: number,
    magnetometer: {
        data: {
            x: number,
            y: number,
            z: number
        },
        calibration: number,
        bearing: number
    }
}

const initialState: MicrobitState = {
    id: "",
    connected: false,
    ticks: 30,
    completedAccelTicks: 0,
    completedMagnetTicks: 0,
    accelerometer: {
        x: 0,
        y: 0,
        z: 0
    },
    history: {
        accelerometerHistory: [],
        magnetometerHistory: [],
    },
    button: {
        a: 0,
        b: 0
    },
    temperature: 0,
    magnetometer: {
        data: {
            x: 0,
            y: 0,
            z: 0
        },
        calibration: 0,
        bearing: 0,
    }
}

export const microbitSlice = createSlice({
    name: 'microbit',
    initialState,
    reducers: {
        connect: state => {
            state.connected = true;
        },
        disconnect: state => {
            state.connected = false;
        },
        setAccelerometerData: (state, action: PayloadAction<{ x: number, y: number, z: number }>) => {
            state.accelerometer.x = action.payload.x;
            state.accelerometer.y = action.payload.y;
            state.accelerometer.z = action.payload.z;

            // if (state.history.accelerometerHistory.length < 30) {
            //     state.history.accelerometerHistory.push({ x: action.payload.x, y: action.payload.y, z: action.payload.z });
            // } else {
            //     state.history.accelerometerHistory.push({ x: action.payload.x, y: action.payload.y, z: action.payload.z });
            //     state.history.accelerometerHistory.pop();
            // }

            if (state.completedAccelTicks < 30) {
                state.history.accelerometerHistory.push({ x: action.payload.x, y: action.payload.y, z: action.payload.z });
                state.completedAccelTicks = state.completedAccelTicks + 1;
            }
        },
        setButtonAState: (state, action: PayloadAction<number>) => {
            state.button.a = action.payload;
        },
        setButtonBState: (state, action: PayloadAction<number>) => {
            state.button.b = action.payload;
        },
        setTemperature: (state, action: PayloadAction<number>) => {
            state.temperature = action.payload;
        },
        setMagnetometerData: (state, action: PayloadAction<{x:number, y:number, z:number}>) => {
            state.magnetometer.data.x = action.payload.x;
            state.magnetometer.data.y = action.payload.y;
            state.magnetometer.data.z = action.payload.z;

            if (state.completedMagnetTicks < 30) {
                state.history.magnetometerHistory.push({ x: action.payload.x, y: action.payload.y, z: action.payload.z });
                state.completedMagnetTicks = state.completedMagnetTicks + 1;
            }
        },
        setMagnetometerBearing: (state, action: PayloadAction<number>) => {
            state.magnetometer.bearing = action.payload;
        },
        setMagnetometerCalibration: (state, action: PayloadAction<number>) => {
            state.magnetometer.calibration = action.payload;
        },
        clearHistory: (state) => {
            state.history.accelerometerHistory = [];
            state.history.magnetometerHistory = [];
            state.completedAccelTicks = 0;
            state.completedMagnetTicks = 0;
        }
    },
});

export const selectAccelerometerData = (state: RootState) => state.microbit.accelerometer;

export const selectButtonData = (state: RootState) => state.microbit.button;
export const selectTemperature = (state: RootState) => state.microbit.temperature;
export const selectMagnetometerData = (state: RootState) => state.microbit.magnetometer.data;
export const selectMagnetometerBearing = (state: RootState) => state.microbit.magnetometer.bearing;
export const selectMagnetometerCalibration = (state: RootState) => state.microbit.magnetometer.calibration;
export const selectHistory = (state: RootState) => state.microbit.history;


export const selectConnected = (state: RootState) => state.microbit.connected;

export const { clearHistory, connect, disconnect, setMagnetometerData, setTemperature, setAccelerometerData, setButtonAState, setButtonBState } = microbitSlice.actions;

export default microbitSlice.reducer;