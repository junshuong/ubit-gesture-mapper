import { CChart } from '@coreui/react-chartjs';
import { Button, Checkbox, CircularProgress, makeStyles, Paper, Slider, Typography, withStyles } from '@material-ui/core';
import { default as axios, default as Axios } from 'axios';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { store } from '../../app/store';
import cfg from '../../config.json';
import { AccelerometerState, ActiveHistoryState, clearHistory, MagnetometerState, selectHistory } from '../microbit/microbitSlice';

const useStyles = makeStyles((theme) => ({
  sendForm: {
    margin: 10,
  },
  recordSec: {
    paddingTop: 10,
    paddingLeft: 10,
    paddingRight: 10,
    marginLeft: 10,
    marginRight: 10,
    maxHeight: "100px"
  },
  recordForm: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr 1fr",
    gridTemplateRows: "1fr 1fr 1fr",
    gap: "5px 5px",
    gridTemplateAreas: `"l1 v1 v1 b1" "l2 v2 v2 b1" ". . . ."`
  },
  l2: {
    gridArea: "l2",
    textAlign: "left",
    display: "flex",
    alignItems: "center",
  },
  l1: {
    gridArea: "l1",
    textAlign: "left",
    display: "flex",
    alignItems: "center",
  },
  v1: { gridArea: "v1", width: "auto", marginRight: 10 },
  v2: { gridArea: "v2", width: "auto", marginRight: 10 },
  b1: { gridArea: "b1"},
  root: {
    margin: 10
  },
  title: {
    padding: 10,
    margin: 10
  },
  label: {
    paddingBottom: 10
  },
  progress: {
    position: "absolute",
    top: "50%",
    left: "50%"
  }
}));

interface ActiveGesture {
  id: number,
  model: number,
  name: string,
  classification: number
}

const initialActiveState: ActiveGesture = {
  id: 0,
  model: 0,
  name: '',
  classification: 0
}

export function Recorder(props: { match: { params: { model_id: number, gesture_id: number } }, history: string[] }) {
  const history = useSelector(selectHistory);
  const classes = useStyles();
  const [activeGesture, setActiveGesture] = useState(initialActiveState);
  const gesture_id = props.match.params.gesture_id;
  const [countdown, setCountdown] = useState(3);
  const [ticks, setTicks] = useState(30);
  const [checked, setChecked] = useState(true);
  const [frames, setFrames] = useState(30);

  const fetchGesture = () => {
    axios.get(`${cfg.server_url}/get_gesture/${gesture_id}`).then((res) => {
      setActiveGesture(res.data);
    }).catch((err) => {
      console.error(err);
    })
  }

  useEffect(() => {
    if (activeGesture.name === "") {
      fetchGesture();
    } else {
      setFrames(30); 
    }
  }, [activeGesture])

  const handleChange = (event: any, value: number | number[]) => {
    if (!Array.isArray(value) && value >= 30) {
      setFrames(value);
    }
  };

  const handleSendData = () => {
    postGesture(activeGesture.id, activeGesture.classification, history, frames);
  }

  if (activeGesture.name === "") {
    return (
      <CircularProgress className={classes.progress} />
    );
  }
  
  return (
    <div className={classes.root}>
      <Paper variant="outlined" className={classes.title}>
        <Typography variant="h5">{activeGesture.name}</Typography>
      </Paper>
      <Paper variant="outlined" className={classes.recordSec}>
        <div className={classes.recordForm}>
          <Typography className={classes.l1}>Countdown</Typography>
          <CleanSlider className={classes.v1} valueLabelDisplay="on" defaultValue={3} min={0} max={10} onChange={(e, v) => setCountdown(!Array.isArray(v) ? v : v[0])} />
         
          <Typography className={classes.l2}>Ticks</Typography>
          <CleanSlider className={classes.v2} valueLabelDisplay="on" defaultValue={30} min={30} max={30 + 100} onChange={(e, v) => setTicks(!Array.isArray(v) ? v : v[0])} />
          <Button className={classes.b1} size="small" variant="contained" color="primary" onClick={() => recordTicks(countdown)}>Record</Button>
        </div>
      </Paper>
      <DataChart />
      <MagnetChart/>
      <Paper variant="outlined" className={classes.root}>
        <div className={classes.sendForm}>
          <Typography className={classes.label}>Capture Frames</Typography>
          <CleanSlider suppressContentEditableWarning suppressHydrationWarning valueLabelDisplay="on" value={frames} defaultValue={30} min={0} max={ticks} onChange={handleChange} marks={[{ value: frames - 30}]} />
          <Typography>Is correct: <Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)} /></Typography>
          <Button variant="contained" color="primary" onClick={handleSendData}>Send Data</Button>
        </div>
      </Paper>
    </div>
  );
}

function DataChart() {
  const history = useSelector(selectHistory);
  const historySplit = splitHistory(history);
  const classes = useStyles();

  function splitHistory(data: ActiveHistoryState, recursed: number = 0) {
    var indexs: number[] = [];
    var axs: number[] = [];
    var ays: number[] = [];
    var azs: number[] = [];
    var i: number = 0;

    let accel = data.accelerometerHistory;

    for (i = 0; i < accel.length; i++) {
      indexs.push(i);
      axs.push(accel[i].x);
      ays.push(accel[i].y);
      azs.push(accel[i].z);
    }
    return { indexs: indexs, axs: axs, ays: ays, azs: azs}
  }

  return (
    <CChart
      className={classes.root}
      type="line"
      datasets={[
        {
          label: 'Accelerometer X',
          backgroundColor: 'rgba(68,69,69,0.2)',
          borderColor: 'rgba(68,69,69,1)',
          pointBackgroundColor: 'rgba(68,69,69,1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(68,69,69,1)',
          tooltipLabelColor: 'rgba(68,69,69,1)',
          data: historySplit.axs
        },
        {
          label: 'Accelerometer Y',
          backgroundColor: 'rgba(181,255,233,0.2)',
          borderColor: 'rgba(181,255,233,1)',
          pointBackgroundColor: 'rgba(181,255,233,1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(181,255,233,1)',
          tooltipLabelColor: 'rgba(181,255,233,1)',
          data: historySplit.ays
        },
        {
          label: 'Accelerometer Z',
          backgroundColor: 'rgba(179,181,255,0.2)',
          borderColor: 'rgba(179,181,255,1)',
          pointBackgroundColor: 'rgba(179,181,255,1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(179,181,255,1)',
          tooltipLabelColor: 'rgba(179,181,255,1)',
          data: historySplit.azs
        }
      ]}
      options={{
        aspectRatio: 2,
        animation: false
      }}
      labels={historySplit.indexs}
    />
  );
}

function MagnetChart() {
  const history = useSelector(selectHistory);
  const historySplit = splitHistory(history);
  const classes = useStyles();

  function splitHistory(data: ActiveHistoryState) {
    var indexs: number[] = [];
    var mxs: number[] = [];
    var mys: number[] = [];
    var mzs: number[] = [];
    var i: number = 0;
    let ma = data.magnetometerHistory;

    for (i = 0; i < ma.length; i++) {
      indexs.push(i);
      mxs.push(data.magnetometerHistory[i].x);
      mys.push(data.magnetometerHistory[i].y);
      mzs.push(data.magnetometerHistory[i].z);
    }
    return { indexs: indexs, mxs: mxs, mys: mys, mzs: mzs }
  }

  return (
    <CChart
      className={classes.root}
      type="line"
      datasets={[
        {
          label: 'Magnetometer X',
          backgroundColor: 'rgba(125,130,184,0.2)',
          borderColor: 'rgba(125,130,184,1)',
          pointBackgroundColor: 'rgba(125,130,184,1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(125,130,184,1)',
          tooltipLabelColor: 'rgba(125,130,184,1)',
          data: historySplit.mxs
        },
        {
          label: 'Magnetometer Y',
          backgroundColor: 'rgba(229,195,209,0.2)',
          borderColor: 'rgba(229,195,209,1)',
          pointBackgroundColor: 'rgba(229,195,209,1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(229,195,209,1)',
          tooltipLabelColor: 'rgba(229,195,209,1)',
          data: historySplit.mys
        },
        {
          label: 'Magnetometer Z',
          backgroundColor: 'rgba(97,63,117,0.2)',
          borderColor: 'rgba(97,63,117,1)',
          pointBackgroundColor: 'rgba(97,63,117,1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(97,63,117,1)',
          tooltipLabelColor: 'rgba(97,63,117,1)',
          data: historySplit.mzs
        }
      ]}
      options={{
        aspectRatio: 2,
        animation: false
      }}
      labels={historySplit.indexs}
    />
  );
}

const CleanSlider = withStyles({
  valueLabel: {
    top: -16,
    '& *': {
      background: 'transparent',
      color: '#000',
    },
  },
  mark: {
    backgroundColor: 'currentColor',
    height: 16,
    width: 1,
    marginTop: -8,
  }
})(Slider);



/**
 * Posts a capture to the server.
 */
function postGesture(gesture_id: number, classification: number, data: ActiveHistoryState, lastFrame: number) {
  let acclerometerData: AccelerometerState[] = data.accelerometerHistory.slice(lastFrame - 30, lastFrame);
  let magnetometerData: MagnetometerState[] = data.magnetometerHistory.slice(lastFrame - 30, lastFrame);
  let payload = {
    classification: classification,
    acclerometerData: acclerometerData,
    magnetometerData: magnetometerData,
    gesture_id: gesture_id
  }

  Axios.post(`${cfg.server_url}/add_capture`, payload).then(() => {
  }).catch((res) => {
    console.log(res);
  });
}

function recordTicks(countdown: number) {
  setTimeout(() => {
    store.dispatch(clearHistory())
  }, countdown * 1000);
}

