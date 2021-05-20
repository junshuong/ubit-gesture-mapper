import { store } from '../app/store';
import { setAlert } from '../features/alert/alertSlice';
import { connect, disconnect, setAccelerometerData, setButtonAState, setButtonBState, setMagnetometerData, setTemperature } from '../features/microbit/microbitSlice';
import { setAccelerometerGestureHistory, setMangetometerGestureHistory } from '../features/models/activeModelSlice';
import services from './services.json';

const enabledServices: BluetoothServiceUUID[] = [
    services.accelerometer.uuid,
    services.magnetometer.uuid
];

export let uBit: uBitDevice;

/**
 * Class representing a microbit device.
 */
class uBitDevice {
    device!: BluetoothDevice;
    server!: BluetoothRemoteGATTServer;

    accelerometerService!: BluetoothRemoteGATTService;
    accelerometerData!: BluetoothRemoteGATTCharacteristic;
    accelerometerPeriod!: BluetoothRemoteGATTCharacteristic;

    buttonService!: BluetoothRemoteGATTService;
    buttonAState!: BluetoothRemoteGATTCharacteristic;
    buttonBState!: BluetoothRemoteGATTCharacteristic;

    magnetometerService!: BluetoothRemoteGATTService;
    magnetometerBearing!: BluetoothRemoteGATTCharacteristic;
    magnetometerCalibration!: BluetoothRemoteGATTCharacteristic;
    magnetometerData!: BluetoothRemoteGATTCharacteristic;
    magnetometerPeriod!: BluetoothRemoteGATTCharacteristic;

    temperatureService!: BluetoothRemoteGATTService;
    temperatureTemp!: BluetoothRemoteGATTCharacteristic;
    temperaturePeriod!: BluetoothRemoteGATTCharacteristic;

    constructor() {
        this.initialize();
    }

    async enableButtonA(service: BluetoothRemoteGATTService) {
        this.buttonAState = await service.getCharacteristic(services.button.characteristics.buttonAState.uuid);
        this.buttonAState.startNotifications();
        this.buttonAState.addEventListener('characteristicvaluechanged', buttonAChanged);
    }

    async enableButtonB(service: BluetoothRemoteGATTService) {
        this.buttonBState = await this.buttonService.getCharacteristic(services.button.characteristics.buttonBState.uuid);
        this.buttonBState.startNotifications();
        this.buttonBState.addEventListener('characteristicvaluechanged', buttonBChanged);
    }

    async enableButtons(server: BluetoothRemoteGATTServer) {
        console.log("enabling buttons now");
        this.buttonService = await server.getPrimaryService(services.button.uuid);
        setTimeout(() => { this.enableButtonA(this.buttonService) }, 500)
        setTimeout(() => { this.enableButtonB(this.buttonService) }, 1000)
    }

    async enableAccelerometerData(service: BluetoothRemoteGATTService) {
        this.accelerometerData = await this.accelerometerService.getCharacteristic(services.accelerometer.characteristics.accelerometerData.uuid);
        this.accelerometerData.startNotifications();
        this.accelerometerData.addEventListener('characteristicvaluechanged', accelerometerDataChanged);
    }

    async enableAccelerometer(server: BluetoothRemoteGATTServer) {
        this.accelerometerService = await server.getPrimaryService(services.accelerometer.uuid);
        setTimeout(() => { this.enableAccelerometerData(this.accelerometerService) }, 200)
    }

    async enableMagnetometerBearing(service: BluetoothRemoteGATTService) {
        this.magnetometerBearing = await service.getCharacteristic(services.magnetometer.characteristics.magnetometerBearing.uuid);
        this.magnetometerBearing.startNotifications();
        this.magnetometerBearing.addEventListener('characteristicvaluechanged', magnetometerBearingChanged);
    }

    async enableMagnetometerCalibration(service: BluetoothRemoteGATTService) {
        this.magnetometerCalibration = await service.getCharacteristic(services.magnetometer.characteristics.magnetometerCalibration.uuid);
        this.magnetometerCalibration.startNotifications();
        this.magnetometerCalibration.addEventListener('characteristicvaluechanged', magnetometerCalibrationChanged);
    }

    async enableMagnetometerData(service: BluetoothRemoteGATTService) {
        this.magnetometerData = await service.getCharacteristic(services.magnetometer.characteristics.magnetometerData.uuid);
        this.magnetometerData.startNotifications();
        this.magnetometerData.addEventListener('characteristicvaluechanged', magnetometerDataChanged);
    }

    async enableMagnetometer(server: BluetoothRemoteGATTServer) {
        this.magnetometerService = await this.server.getPrimaryService(services.magnetometer.uuid);
        setTimeout(() => { this.enableMagnetometerBearing(this.magnetometerService) }, 200)
        setTimeout(() => { this.enableMagnetometerCalibration(this.magnetometerService) }, 400)
        setTimeout(() => { this.enableMagnetometerData(this.magnetometerService) }, 600)
    }

    async enableTemperatureTemp(service: BluetoothRemoteGATTService) {
        this.temperatureTemp = await this.temperatureService.getCharacteristic(services.temperature.characteristics.temperature.uuid);
        this.temperatureTemp.startNotifications();
        this.temperatureTemp.addEventListener('characteristicvaluechanged', temperatureChanged);
    }

    async enableTemperature(server: BluetoothRemoteGATTServer) {
        this.temperatureService = await server.getPrimaryService(services.temperature.uuid);
        setTimeout(() => { this.enableTemperatureTemp(this.temperatureService) }, 200)
    }

    processServices(server: BluetoothRemoteGATTServer, allServices: any) {
        console.log("In process services");
        setTimeout(() => {
            let currentService = allServices.shift();
            if (currentService !== undefined) {
                currentService(server);
            }
            if (allServices.length > 0) {
                this.processServices(server, allServices);
            }
        }, 2000);
    }

    async initialize() {
        try {
            // Connect to device and server.
            this.device = await navigator.bluetooth.requestDevice({
                filters: [{ namePrefix: "BBC micro:bit" }],
                optionalServices: enabledServices
            });
            this.device.addEventListener('gattserverdisconnected', onMicrobitDisconnect);
            if (this.device.gatt === undefined) {
                throw new Error("Problem connecting to bluetooth server.");
            }
            this.server = await this.device.gatt.connect();
            store.dispatch(connect());
            store.dispatch(setAlert(["Microbit Connected", "info"]));

            let allServices = [
                () => { this.enableAccelerometer(this.server) },
                () => { this.enableMagnetometer(this.server) },
            ];
            this.processServices(this.server, allServices);
        } catch (error) {
            store.dispatch(setAlert([error.message, "error"]));
            console.log(error);
        }
    }
}

/**
 * Call this function to connect to a microbit.
 */
export function connectMicrobitDevice() {
    try {
        if (!navigator.bluetooth) {
            store.dispatch(setAlert(["Bluetooth is not supported on this browser configuration", "error"]));
            throw new Error("Bluetooth is not supported on this browser configuration");
        }
        uBit = new uBitDevice();
    } catch (error) {
        console.log(error);
    }
}

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

function magnetometerBearingChanged(event: any) {
    const val = event.target.value.getInt16(0, true);
    store.dispatch(setMagnetometerBearing(val));
}

function magnetometerCalibrationChanged(event: any) {
    const val = event.target.value.getInt8(0);
    store.dispatch(setMagnetometerCalibration(val));
}

async function buttonAChanged(event: any) {
    const val = event.target.value.getInt8(0);
    store.dispatch(setButtonAState(val));
}

async function buttonBChanged(event: any) {
    const val = event.target.value.getInt8(0);
    store.dispatch(setButtonBState(val));
}

function temperatureChanged(event: any) {
    const t = event.target.value.getInt8(0);
    store.dispatch(setTemperature(t));
}

/**
 * Call this function to disconnect any connected microbit.
 * @returns 
 */
export function disconnectMicrobit() {
    if (!uBit || !uBit.device || !uBit.device.gatt) {
        store.dispatch(setAlert(["There is no device connected", "info"]));
        return;
    }
    uBit.device.gatt.disconnect();
}

/**
 * Called when the microbit is disconected.
 */
function onMicrobitDisconnect() {
    store.dispatch(setAlert(["Microbit was disconnected", "info"]));
    store.dispatch(disconnect());
}


function setMagnetometerBearing(val: any): any {
    throw new Error('Function not implemented.');
}

function setMagnetometerCalibration(val: any): any {
    throw new Error('Function not implemented.');
}

