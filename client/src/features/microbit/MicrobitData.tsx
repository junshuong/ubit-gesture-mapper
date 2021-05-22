import { Card, CardContent, Typography } from '@material-ui/core';
import React from 'react';
import { useSelector } from 'react-redux';
import { selectAccelerometerData, selectMagnetometerData } from './microbitSlice';


export function MicrobitData(props: any) {
  

  return (
    <div>
      <Acceleration />
      <Magnetometer />
    </div>
  );
}

function Magnetometer() {
  const magnetometerData = useSelector(selectMagnetometerData);

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