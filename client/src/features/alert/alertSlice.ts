import { Color } from '@material-ui/lab/Alert';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';

interface AlertState {
    message: string | void,
    open: boolean,
    severity: Color | undefined
}

const initialState: AlertState = {
    message: undefined,
    open: false,
    severity: "success"
}

export const alertSlice = createSlice({
    name: 'alert',
    initialState: initialState,
    reducers: {
        setAlert: (state, action: PayloadAction<[string, Color]>) => {
            state.message = action.payload[0];
            state.severity = action.payload[1];
            state.open = true
        },
        switchOpen: state => {
            state.open = !state.open
        }
    }
})

export const selectAlert = (state: RootState) => state.alert;

export const selectOpen = (state: RootState) => state.alert.open;

export const { setAlert, switchOpen } = alertSlice.actions;

export default alertSlice.reducer;
