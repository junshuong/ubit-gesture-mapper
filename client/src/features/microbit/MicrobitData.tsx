import { Card, CardContent, Chip, createStyles, makeStyles, Typography } from '@material-ui/core';
import React from 'react';
import { useSelector } from 'react-redux';
import { selectAccelerometerData, selectMagnetometerData } from './microbitSlice';

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      flexWrap: 'wrap',
      '& > *': {
        margin: theme.spacing(0.5),
      },
    },
    chips: {
      '& > *': {
        margin: theme.spacing(0.5),
        minWidth: "80px"
      },
    }
  }),
);

export function MicrobitData(props: any) {
  const classes = useStyles();
  
  return (
    <div className={classes.root}>
      <Acceleration />
      <Magnetometer />
    </div>
  );
}

function Magnetometer() {
  const magnetometerData = useSelector(selectMagnetometerData);
  const classes = useStyles();
  return (
    <Card variant="outlined" className={classes.root}>
      <CardContent className={classes.chips}>
        <Typography variant="h5" component="h2">
          Magnetometer
        </Typography>
        <Typography color="textSecondary" gutterBottom>
          x y z
        </Typography>
        <Chip label={magnetometerData.x} />
        <Chip label={magnetometerData.y} />
        <Chip label={magnetometerData.z} />
      </CardContent>
    </Card>
  )
}

function Acceleration() {
  const accelerometerData = useSelector(selectAccelerometerData);
  const classes = useStyles();
  return (
    <Card variant="outlined" className={classes.root}>
      <CardContent  className={classes.chips}>
        <Typography variant="h5" component="h2">
          Accelerometer
        </Typography>
        <Typography color="textSecondary" gutterBottom>
          x y z
        </Typography>
        <Chip label={accelerometerData.x} />
        <Chip label={accelerometerData.y} />
        <Chip label={accelerometerData.z} />
      </CardContent>
    </Card>
  )
}