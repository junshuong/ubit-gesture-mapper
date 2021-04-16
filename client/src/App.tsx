import { AppBar, Button, makeStyles, Toolbar, Typography } from '@material-ui/core';
import React from 'react';
import { BrowserRouter as Router, Link, Route, Switch } from 'react-router-dom';
import './App.css';
import { Alert } from './features/alert/Alert';
import { MicrobitData } from './features/microbit/MicrobitData';
import { Recorder } from './features/recorder/Recorder';
import { connectMicrobitDevice, disconnectMicrobit } from './uBit/uBit';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1
  },
  link: {
    color: "unset"
  },
}));


function App() {
  return (
    <Router>
      <div className="App">
        <RecordHeader />
        <Alert />
        <Switch>
          <Route exact path="/record">
            <Recorder />
          </Route>
          <Route path="/">
            <DataHeader />
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
        <Typography variant="h6" className={classes.title}>
          uBit Data Sender
          </Typography>
        <Link to="/" className={classes.link}>
          <Button color="inherit">
            View Microbit
          </Button>
        </Link>
        <Link to="/record" className={classes.link}>
          <Button color="inherit">
            Data Recorder
          </Button>
        </Link>
      </Toolbar>
    </AppBar>
  )
}

function DataHeader() {
  const classes = useStyles();
  return (
    <AppBar color="default" position="static" className={classes.root}>
      <Toolbar>
        <Button color="inherit" onClick={connectMicrobitDevice}>
          Pair MicroBit
          </Button>
        <Button color="inherit" onClick={disconnectMicrobit}>
          Disconnect MicroBit
          </Button>
      </Toolbar>
    </AppBar>
  );
}

export default App;
