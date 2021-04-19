import { Button, Card, CardActionArea, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, Grid, makeStyles, Paper, TextField, Typography } from '@material-ui/core';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import cfg from '../../config.json';
import { store } from '../../app/store';
import { selectModels, setModels } from './modelSlice';

const useStyles = makeStyles({
  root: {
    padding: 40
  },
  button: {
    marginBottom: 20
  },
  link: {
    textDecoration: "none"
  }
})

export function Models(this: any) {
  const [open, setOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createTickCount, setCreateTickCount] = useState(0);
  const [createDescription, setCreateDescription] = useState("");

  const models = useSelector(selectModels);

  useEffect(() => {
    renderModels();
  }, [])

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const classes = useStyles();

  return (
    <div className={classes.root}>
      <Button className={classes.button} variant="outlined" color="primary" onClick={handleClickOpen}>
        Add New Model
      </Button>
      <Grid container spacing={3}>
        {models.map((model) => (
          <ModelCard key={model.id} name={model.name} id={model.id} description={model.description}/>
        ))}
      </Grid>
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
          <TextField
            onChange={(e) => setCreateDescription(e.target.value)}
            margin="dense"
            id="description"
            label="Description"
            fullWidth
          />
          <TextField
            onChange={(e) => setCreateTickCount(parseInt(e.target.value))}
            margin="dense"
            id="tickCount"
            label="Tick Count"
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={() => {
            handleClose();
            postModel(createName, createDescription, createTickCount);
          }
          } color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

function ModelCard(props: any) {
  const classes = useStyles();

  return (
    <Grid key={props.id} item xs={6} sm={3}>
      <Link to={`/model/${props.id}`} className={classes.link}>
        <Paper>
          <Card variant="outlined">
            <CardActionArea>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Model
                </Typography>
                <Typography variant="h5">
                  {props.name}
                </Typography>
                <Typography variant="body1">
                  {props.description}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Paper>
      </Link>
    </Grid>
  )
}

function renderModels() {
  axios.get(`${cfg.server_url}/get_models`).then((res) => {
    store.dispatch(setModels(res.data["models"]))
  }).catch((err) => {
    console.log(err);
  })
}

function postModel(name: string, description: string, tickCount: number) {
  let payload = {
    name: name,
    description: description,
    tickCount: tickCount
  }
  axios.post(`${cfg.server_url}/create_model`, payload).then(() => {
    renderModels();
  }).catch((err) => {
    console.log(err);
  })
}