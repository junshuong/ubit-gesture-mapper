import { Button, ButtonBase, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, makeStyles, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@material-ui/core';
import * as tf from '@tensorflow/tfjs';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { store } from '../../app/store';
import cfg from '../../config.json';
import { Audio } from '../audio/Audio';
import { setIsPlaying } from '../audio/audioSlice';
import { activate, GestureState, selectActiveModel, setActiveModel } from './activeModelSlice';

const useStyles = makeStyles({
  root: {
    margin: 20,
    padding: 10,
    "& > p": {
      padding: "5px"
    }
  },
  table: {
  },
  link: {
    textDecoration: "none"
  }
})

export function Model(props: { match: { params: { id: any } }, history: string[] }) {
  const id = props.match.params.id;
  const activeModel = useSelector(selectActiveModel);
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [createName, setCreateName] = useState("");

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleRemove = (id: number) => {
    removeModel(id).then(() => {
      props.history.push('/models');
    });
  };

  const handleCreateGesture = () => {
    createGesture(createName, id, activeModel.gestures.length + 1);
  }

  useEffect(() => {
    fetchModel(id);
  }, [id])

  const [weightMap, setWeightMap] = useState({});

  return (
    <div>
      <Paper className={classes.root} variant="outlined">
        <Typography variant="h4">{activeModel["name"]}</Typography>
        <Typography variant="body1">Description: {activeModel.description}</Typography>
        <Button color="secondary" variant="contained" onClick={() => handleRemove(id)}>
          <Typography>Delete Model</Typography>
        </Button>
      </Paper>
      <Paper className={classes.root} variant="outlined">
        <Typography variant="h4">Gestures</Typography>
        <Button onClick={handleClickOpen} variant="contained" color="primary">Add Gesture</Button>
        <GestureTable gestures={activeModel.gestures} />
      </Paper>
      <Paper className={classes.root} variant="outlined">
        <Typography variant="h4">Loading the model</Typography>
        <Typography variant="body1">Enable the model using the button below and the status of the ouput will be indicated on the checkboxes below.</Typography>
        <Button color="primary" variant="contained" onClick={() => {
          loadModel(activeModel.id).then((res) => {
            setWeightMap(res);
          })
        }
        }><Typography>Load Model</Typography></Button>
        <Typography>Is Active <Checkbox disabled checked={activeModel.isActive} /></Typography>
        <ModelOutput weightMap={weightMap} />
      </Paper>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle id="form-dialog-title">Create Model</DialogTitle>
        <DialogContent>
          <TextField
            onChange={(e) => setCreateName(e.target.value)}
            autoFocus
            margin="dense"
            id="name"
            label="Name"
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={() => {
            handleClose();
            createGesture(createName, activeModel.id, activeModel.gestures.length + 1);
          }
          } color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
      <Audio />
    </div>
  );
}

function createGesture(name: string, model_id: number, classification: number) {
  let payload = {
    name: name,
    id: model_id,
    classification: classification
  }
  axios.post(`${cfg.server_url}/create_gesture`, payload).then(() => {
    fetchModel(model_id);
  }).catch((err) => {
    console.error(err);
  })
}

const GestureTable = (props: { gestures: GestureState[] }) => {
  const classes = useStyles();

  return (
    <TableContainer component={Paper}>
      <Table className={classes.table} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell align="right">Name</TableCell>
            <TableCell align="right">Classification</TableCell>
            <TableCell align="right"></TableCell>
            <TableCell align="right"></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.gestures.map((gesture) => (
            <TableRow key={gesture.id}>
              <TableCell component="th" scope="row">
                {gesture.id}
              </TableCell>
              <TableCell align="right">{gesture.name}</TableCell>
              <TableCell align="right">{gesture.classification}</TableCell>
              <TableCell align="right">
                <Link to={`/recorder/${gesture.model}/${gesture.id}`} className={classes.link}>
                  <Button color="primary" variant="contained">
                    Record
                  </Button>
                </Link>
              </TableCell>
              <TableCell align="right">
                <Button onClick={() => removeGesture(gesture.id, gesture.model)} color="primary" variant="contained">Remove</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function removeGesture(id: number, model_id: number) {
  let payload = {
    gesture_id: id
  }
  axios.post(`${cfg.server_url}/remove_gesture`, payload).then(() => {
    fetchModel(model_id);
  }).catch((err) => {
    console.error(err);
  })
}

async function loadModel(id: number) {
  console.info("Requesting Tensorflow model...");
  const weightsManifest: any = await fetchWeightsManifest(id);
  const weightMap = await tf.io.loadWeights(weightsManifest, `${cfg.server_url}/get_model_part/${id}`);
  store.dispatch(activate());
  return await weightMap;
}

function ModelOutput(props: { weightMap: {} }) {
  const activeModel = useSelector(selectActiveModel);
  const dispatch = useDispatch();

  const [on, setOn] = useState(0);
  const [off, setOff] = useState(0);

  let flattened: number[] = []

  activeModel.history.accelerometer.forEach(el => {
    flattened.push(el.x)
    flattened.push(el.y)
    flattened.push(el.z)
  });

  if (flattened.length === 30 * 6) {
    forwardPass(props.weightMap, flattened).then((output: any) => {
      setOn(output[0]);
      setOff(output[1]);
    })
  }

  const triggerAudio = () => {
    const trigger = on > off;
    dispatch(setIsPlaying([trigger]));
    return trigger;
  }

  return (
    <div>
      <Typography>Triggered <Checkbox disabled checked={triggerAudio()} /></Typography>
      <div>On</div>
      <div>{on}</div>
      <div>Off</div>
      <div>{off}</div>
    </div>
  );
}

async function forwardPass(weightMapPromise: tf.NamedTensorMap, data: number[]) {

  const weightMap = await weightMapPromise;

  if (Object.keys(weightMap).length < 1) return [0, 0];

  const input = tf.tensor2d(data, [1, 120])

  const fc1_bias = weightMap['StatefulPartitionedCall/sequential/dense/BiasAdd/ReadVariableOp'];
  const fc1_weight = weightMap['StatefulPartitionedCall/sequential/dense/MatMul/ReadVariableOp'];
  const fc2_bias = weightMap['StatefulPartitionedCall/sequential/dense_1/BiasAdd/ReadVariableOp']
  const fc2_weight = weightMap['StatefulPartitionedCall/sequential/dense_1/MatMul/ReadVariableOp']
  // const fc3 = weightMap['StatefulPartitionedCall/sequential/flatten/Const']
  const itf1 = tf.matMul(input, fc1_weight).add(fc1_bias);
  const f1tf2 = tf.matMul(itf1, fc2_weight).add(fc2_bias);
  return await f1tf2.flatten().array();
}

function fetchWeightsManifest(id: number) {
  return axios.post(`${cfg.server_url}/get_trained_model`, { id: id }).then((res) => {
    return (res.data['weightsManifest']);
  }).catch((err) => { return err; });
}

export function fetchModel(id: number) {
  console.info("Fetching model...");
  axios.get(`${cfg.server_url}/get_model/${id}`).then((res) => {
    console.log(res);
    store.dispatch(setActiveModel(res.data));
  }).catch((err) => {
    console.error(err);
  });
}

function removeModel(id: number) {
  console.info("Removing model...");
  return axios.post(`${cfg.server_url}/delete_model`, { id: id });
}