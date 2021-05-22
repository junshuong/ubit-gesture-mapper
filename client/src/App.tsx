import { AppBar, Button, makeStyles, Toolbar, Typography } from '@material-ui/core';
import React from 'react';
import { useDispatch } from 'react-redux';
import { BrowserRouter as Router, Link, Route, Switch } from 'react-router-dom';
import './App.css';
import { Alert } from './features/alert/Alert';
import { setAlert } from './features/alert/alertSlice';
import { MicrobitData } from './features/microbit/MicrobitData';
import { Model } from './features/models/Model';
import { Models } from './features/models/Models';
import { Recorder } from './features/recorder/Recorder';
import Soundmap from './features/soundmap/Soundmap';
import { connectMicrobitDevice, disconnectMicrobit } from './uBit/uBit';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  grow: {
    flexGrow: 1,
  },
  link: {
    color: "unset"
  },
}));


function App() {
  const classes = useStyles();
  const dispatch = useDispatch();

  function connect() {
    if (!navigator.bluetooth) {
      dispatch(setAlert(["Bluetooth not supported in this browser", "error"]));
      return;
    }
    connectMicrobitDevice();
  }

  return (
    <Router>
      <div className="App">
        <RecordHeader />
        <Alert />
        <Switch>
          <Route exact path="/recorder/:model_id/:gesture_id" component={Recorder} />
          <Route exact path="/models">
            <Models />
          </Route>
          <Route exact path="/soundmap/:gesture_id" component={Soundmap} />
          <Route exact path="/model/:id" component={Model} />
          <Route path="/">
            <AppBar color="default" position="static" className={classes.root}>
              <Toolbar>
                <Button color="inherit" onClick={connect}>
                  Pair MicroBit
                </Button>
                <Button color="inherit" onClick={disconnectMicrobit}>
                  Disconnect MicroBit
                </Button>
              </Toolbar>
            </AppBar>
           <MicrobitData />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}

function RecordHeader() {
  const classes = useStyles();
  return (
    <AppBar position="static" className={classes.root}>
      <Toolbar>
        <Typography variant="h6">
          μBit
        </Typography>
        <div className={classes.grow} ></div>
        <Link to="/" className={classes.link}>
          <Button color="inherit">
            Microbit
          </Button>
        </Link>
        <Link to="/models" className={classes.link}>
          <Button color="inherit">
            Models
          </Button>
        </Link>
      </Toolbar>
    </AppBar>
  )
}

export default App;
