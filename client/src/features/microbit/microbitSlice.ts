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

interface MicrobitState {
    id: string,
    connected: boolean,
    ticks: number,
    completedTicks: number,
    accelerometer: AccelerometerState,
    acclerometerHistory: AccelerometerState[],
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
    ticks: 0,
    completedTicks: 0,
    accelerometer: {
        x: 0,
        y: 0,
        z: 0
    },
    acclerometerHistory: [],
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
            if (state.ticks > 0 && state.completedTicks < state.ticks) {
                state.acclerometerHistory.push({ x: action.payload.x, y: action.payload.y, z: action.payload.z });
                state.completedTicks = state.completedTicks + 1;
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
        },
        setMagnetometerBearing: (state, action: PayloadAction<number>) => {
            state.magnetometer.bearing = action.payload;
        },
        setMagnetometerCalibration: (state, action: PayloadAction<number>) => {
            state.magnetometer.calibration = action.payload;
        },
        clearHistory: (state) => {
            state.acclerometerHistory = [];
            state.completedTicks = 0;
        },
        setTicks: (state, action: PayloadAction<number>) => {
            state.ticks = action.payload;
        }
    },
});

export const selectAccelerometerData = (state: RootState) => state.microbit.accelerometer;
export const selectButtonData = (state: RootState) => state.microbit.button;
export const selectTemperature = (state: RootState) => state.microbit.temperature;
export const selectMagnetometerData = (state: RootState) => state.microbit.magnetometer.data;
export const selectMagnetometerBearing = (state: RootState) => state.microbit.magnetometer.bearing;
export const selectMagnetometerCalibration = (state: RootState) => state.microbit.magnetometer.calibration;
export const selectHistory = (state: RootState) => state.microbit.acclerometerHistory;


export const selectConnected = (state: RootState) => state.microbit.connected;

export const { setTicks, clearHistory, connect, disconnect, setMagnetometerData, setTemperature, setAccelerometerData, setButtonAState, setButtonBState } = microbitSlice.actions;

export default microbitSlice.reducer;