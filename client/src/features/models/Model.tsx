import { Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, makeStyles, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@material-ui/core';
import * as tf from '@tensorflow/tfjs';
import { NamedTensorMap } from '@tensorflow/tfjs';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { store } from '../../app/store';
import cfg from '../../config.json';
import { activate, GestureState, selectActiveModel, selectGestureTrigger, setActiveModel, setGestureTrigger } from './activeModelSlice';

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

  function sendTrainModel() {
    let payload = {
      id: activeModel.id
    }
    axios.post(`${cfg.server_url}/train_model`, payload).then((res) => {
      console.log(res);
    }).catch((err) => {
      console.error(err);
    });
  }

  useEffect(() => {
    fetchModel(id);
  }, [id])


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
        {/* <Typography variant="h4">Loading the model</Typography>
        <Typography variant="body1">Enable the model using the button below and the status of the ouput will be indicated on the checkboxes below.</Typography> */}

        <Button color="primary" variant="contained" onClick={sendTrainModel}>
          Train Model
        </Button>
        <Typography>Is Active <Checkbox disabled checked={activeModel.isActive} /></Typography>
        <ModelOutput />
      </Paper>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle id="form-dialog-title">Create Gesture</DialogTitle>
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
      {activeModel.gestures.map((gesture) => (
        <MiniAudio key={gesture.id} gesture={gesture} />
      ))}
    </div>
  );
}

function MiniAudio(props: { gesture: GestureState }) {
  const classes = useStyles();
  const gesture = props.gesture;

  const trigger = store.getState().activeModel.gestures[gesture.classification - 1].triggered;

  const [source, setSource] = useState<AudioBufferSourceNode>();
  const [playing, setPlaying] = useState(false);

  const context = new AudioContext();

  function loadAudioFile() {
    axios.get(`${cfg.server_url}/get_audio_file/${gesture.sound_file}`, { responseType: "arraybuffer" }).then((res: any) => {
      var newSource = context.createBufferSource();
      context.decodeAudioData(res.data, function (buffer) {
        newSource.buffer = buffer;
        newSource.connect(context.destination);
        setSource(newSource);
      });
    }).catch((err) => {
      console.error(err);
    });
  }

  function handlePlaySound() {
    if (!source || !context) return;
    if (!playing) {
      source.start(0);
    } else {
      source.stop(0);
      loadAudioFile();
    }
    setPlaying(!playing);
  }

  useEffect(() => {
    handlePlaySound();
  }, [trigger])

  useEffect(() => {
    if (gesture.using_file) {
      loadAudioFile()
    }
  }, [])

  if (gesture.using_file) {
    return (
      <Paper className={classes.root} variant="outlined">
        <Typography>
          <b>{gesture.name}</b> - playing {gesture.sound_file} ACTIVE {trigger ? "YES" : "NO"}
        </Typography>
        <Button variant="outlined" onClick={handlePlaySound}>Play Sound</Button>
      </Paper>
    );
  }


  return (
    <Paper className={classes.root} variant="outlined">
      {gesture.name}
    </Paper>
  )
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
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell align="center">Soundmap</TableCell>
            <TableCell align="center">Training</TableCell>
            <TableCell align="right">Delete</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.gestures.map((gesture) => (
            <TableRow key={gesture.id}>
              <TableCell>{gesture.name}</TableCell>
              <TableCell align="center">
                <Link to={`/soundmap/${gesture.id}`} className={classes.link}>
                  <Button color="primary" variant="contained">
                    Map
                  </Button>
                </Link>
              </TableCell>
              <TableCell align="center">
                <Link to={`/recorder/${gesture.model}/${gesture.id}`} className={classes.link}>
                  <Button color="primary" variant="contained">
                    Record
                  </Button>
                </Link>
              </TableCell>
              <TableCell align="right">
                <Button onClick={() => removeGesture(gesture.id, gesture.model)} color="secondary" variant="contained">Remove</Button>
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


function indexOfMax(arr: number[]) {
  if (arr.length === 0) {
      return -1;
  }

  var max = arr[0];
  var maxIndex = 0;

  for (var i = 1; i < arr.length; i++) {
      if (arr[i] > max) {
          maxIndex = i;
          max = arr[i];
      }
  }

  return maxIndex;
}



function ModelOutput() {

  const [active, setActive] = useState(false);
  const [weightMap, setWeightMap] = useState<NamedTensorMap>();

  async function loadModel(id: number) {
    console.info("Requesting Tensorflow model...");
    const weightsManifest = await fetchWeightsManifest(id);
    const weightMap = await tf.io.loadWeights(weightsManifest, `${cfg.server_url}/get_model_part/${id}`);
    store.dispatch(activate());
    setActive(true);
    console.info("Weight map set.");
    return weightMap;
  }


  function startCheck() {
    setTimeout(() => {
      let ah = store.getState().activeModel.history.accelerometer;
      let mh = store.getState().activeModel.history.magnetometer;

      if (ah.length != 30 || mh.length != 30) {
        console.log(ah.length, mh.length);
        startCheck();
        return;
      }

      let formatted = [];
      for (var i = 0; i < 30; i++) {
        formatted.push([ah[i].x, ah[i].y, ah[i].z, mh[i].x, mh[i].y, mh[i].z])
      }
      formatted = formatted.flat();
      forwardPass(weightMap!, formatted).then((output: any) => {
        let max = indexOfMax(output);
        console.log("Max was " + max);
        if (max !== 0) {
          store.dispatch(setGestureTrigger(max))
        }
      });
      startCheck();
    }, 200);
  }

  useEffect(() => {
      console.log("Starting up...");

      startCheck();
  }, [active, weightMap]);

  return (
    <div>
      <Button color="primary" variant="contained" onClick={() => {
        loadModel(store.getState().activeModel.id).then((res) => {
          setWeightMap(res);
        });
      }
      }><Typography>Load Model</Typography></Button>
    </div>
  );
}

async function forwardPass(weightMap: tf.NamedTensorMap, data: number[]) {
  if (Object.keys(weightMap).length < 1) {
    console.error("Weight map gone wrong");
    return [0, 0]
  };
  const input = tf.tensor2d(data, [1, 180])

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