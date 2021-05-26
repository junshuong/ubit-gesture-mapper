import { Button, Checkbox, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, makeStyles, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@material-ui/core';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { store } from '../../app/store';
import cfg from '../../config.json';
import MiniAudio from '../audio/MiniAudio';
import { GestureState, selectActiveModel, setActiveModel } from './activeModelSlice';
import ModelOutput from './ModelRunner';

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

export function Model(props: { match: { params: { id: number } }, history: string[] }) {
  const id = props.match.params.id;
  const activeModel = useSelector(selectActiveModel);
  const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [enabled, setEnabled] = useState(false);

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
    axios.get(`${cfg.server_url}/get_model/${id}`).then((res) => {
      store.dispatch(setActiveModel(res.data));
      setEnabled(true);
    }).catch((err) => {
      console.error(err);
    });
  }, [id])

  if (!enabled) {
    return (<CircularProgress />)
  }

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

export function fetchModel(id: number) {
  axios.get(`${cfg.server_url}/get_model/${id}`).then((res) => {
    store.dispatch(setActiveModel(res.data));
  }).catch((err) => {
    console.error(err);
  });
}

function removeModel(id: number) {
  console.info("Removing model...");
  return axios.post(`${cfg.server_url}/delete_model`, { id: id });
}