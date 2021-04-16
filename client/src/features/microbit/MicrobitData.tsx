import { Card, CardContent, Typography } from '@material-ui/core';
import React from 'react';
import { useSelector } from 'react-redux';
import {
  selectAccelerometerData,

  selectButtonData,



  selectMagnetometerBearing, selectMagnetometerCalibration, selectMagnetometerData, selectTemperature
} from './microbitSlice';


export function MicrobitData(props: any) {

  return (
    <div>
      <Acceleration />
      <Temperature />
      <Buttons />
      <Magnetometer/>
    </div>
  );
}

function Temperature() {
  const temperatureData = useSelector(selectTemperature);

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography color="textSecondary" gutterBottom>
        </Typography>
        <Typography variant="h5" component="h2">
          Temperature
        </Typography>
        <Typography color="textSecondary">
          Data
        </Typography>
        <Typography variant="body2" component="p">
          Temperature : {temperatureData}
        </Typography>
      </CardContent>
    </Card>
  )
}

function Magnetometer() {
  const magnetometerData = useSelector(selectMagnetometerData);
  const magnetometerBearing = useSelector(selectMagnetometerBearing);
  const magnetometerCalibration = useSelector(selectMagnetometerCalibration);
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography color="textSecondary" gutterBottom>
        </Typography>
        <Typography variant="h5" component="h2">
          Magnetometer
        </Typography>
        <Typography color="textSecondary">
          Data
        </Typography>
        <Typography variant="body2" component="p">
          x : {magnetometerData.x} | 
          y : {magnetometerData.y} | 
          z : {magnetometerData.z}
        </Typography>
        <Typography color="textSecondary">
          Bearing
        </Typography>
        <Typography variant="body2" component="p">
          {magnetometerBearing}
        </Typography>
        <Typography color="textSecondary">
          Calibration
        </Typography>
        <Typography variant="body2" component="p">
          {magnetometerCalibration}
        </Typography>
      </CardContent>
    </Card>
  )
}

function Buttons() {
  const buttonData = useSelector(selectButtonData);
  return (
    <Card variant="outlined">
      <CardContent>
        <Typography color="textSecondary" gutterBottom>
        </Typography>
        <Typography variant="h5" component="h2">
          Button
        </Typography>
        <Typography color="textSecondary">
          Data
        </Typography>
        <Typography variant="body2" component="p">
          Button A : {buttonData.a ? "Pressed" : "Not Pressed"} <br/>
          Button B : {buttonData.b ? "Pressed" : "Not Pressed"}
        </Typography>
      </CardContent>
    </Card>
  )
}

function Acceleration() {
  const accelerometerData = useSelector(selectAccelerometerData);

  return (
    <Card variant="outlined">
        <CardContent>
          <Typography color="textSecondary" gutterBottom>
          </Typography>
          <Typography variant="h5" component="h2">
            Accelerometer
          </Typography>
          <Typography color="textSecondary">
            Data
          </Typography>
          <Typography variant="body2" component="p">
            x : {accelerometerData.x} | 
            y : {accelerometerData.y} | 
            z : {accelerometerData.z}
          </Typography>
        </CardContent>
      </Card>
  )
}