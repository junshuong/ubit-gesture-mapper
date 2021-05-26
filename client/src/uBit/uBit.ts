import { store } from '../app/store';
import { setAlert } from '../features/alert/alertSlice';
import { setAccelerometerData, setMagnetometerData } from '../features/microbit/microbitSlice';
import { setAccelerometerGestureHistory, setMangetometerGestureHistory } from '../features/models/activeModelSlice';
import services from './services.json';

var device!: BluetoothDevice;

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function connectMicrobitDevice() {
    device = await navigator.bluetooth.requestDevice({
        filters: [{ namePrefix: "BBC micro:bit" }],
        optionalServices: [
            services.accelerometer.uuid,
            services.magnetometer.uuid
        ]
    });
    await sleep(1000)
    console.log("Device is allegedly existing and returned by the navigator.");
    device.addEventListener('gattserverdisconnected', onMicrobitDisconnect);
    await sleep(1000)
    if (device.gatt === undefined) {
        throw new Error("GATT Server is undefined");
    }
    let server = await device.gatt.connect();
    
    if (!server || server === undefined) {
        console.error("Error connecting to GATT server");
        return;
    }
    console.log("Device is allegedly connected.");
    enableServices(server);
    store.dispatch(setAlert(["Microbit Connected", "info"]));
}


export function disconnectMicrobit() {
    if (!device) {
        store.dispatch(setAlert(["There is no device connected", "info"]));
        return;
    }
    console.log("Disconnecting from mirobit device...");
    if (device.gatt?.connected === true) {
        device.gatt?.disconnect();
        onMicrobitDisconnect();
    } else {
        console.log("Device is already disconnected");
    }
}

function onMicrobitDisconnect() {
    store.dispatch(setAlert(["Microbit was disconnected", "info"]));
}

/*************************************************************************/
/* Hooks for when there are characteristic changes
/*************************************************************************/

/**
 * Event called when accelerometer data characteristic changes.
 * @param event 
 */
function accelerometerDataChanged(event: any) {
    let x = event.target.value.getInt16(0, true);
    let y = event.target.value.getInt16(2, true);
    let z = event.target.value.getInt16(4, true);
    store.dispatch(setAccelerometerData({ x: x, y: y, z: z }));
    store.dispatch(setAccelerometerGestureHistory({ x: x, y: y, z: z }));
}

function magnetometerDataChanged(event: any) {
    let x = event.target.value.getInt16(0, true);
    let y = event.target.value.getInt16(1, true);
    let z = event.target.value.getInt16(2, true);
    store.dispatch(setMagnetometerData({ x: x, y: y, z: z }));
    store.dispatch(setMangetometerGestureHistory({ x: x, y: y, z: z }));
}

/*************************************************************************/
/* Enabling microbit services 
/*************************************************************************/

async function enableServices(server: BluetoothRemoteGATTServer) {
    enableAccelerometer(server);
    setTimeout(() => {
        enableMagnetometer(server);
    }, 2000);
}

async function enableMagnetometerData(service: BluetoothRemoteGATTService) {
    const magnetometerData = await service.getCharacteristic(services.magnetometer.characteristics.magnetometerData.uuid);
    magnetometerData.startNotifications();
    magnetometerData.addEventListener('characteristicvaluechanged', magnetometerDataChanged);
}

async function enableMagnetometer(server: BluetoothRemoteGATTServer) {
    console.log("Enabling Magnetometer Service");
    const magnetometerService = await server.getPrimaryService(services.magnetometer.uuid);
    enableMagnetometerData(magnetometerService);
}


async function enableAccelerometer(server: BluetoothRemoteGATTServer) {
    console.log("Enabling Accelerometer Service");
    const accelerometerService = await server.getPrimaryService(services.accelerometer.uuid);
    const accelerometerData = await accelerometerService.getCharacteristic(services.accelerometer.characteristics.accelerometerData.uuid);
    accelerometerData.startNotifications();
    accelerometerData.addEventListener('characteristicvaluechanged', accelerometerDataChanged);
}