import { CChart } from '@coreui/react-chartjs';
import { Button, Checkbox, CircularProgress, makeStyles, Paper, Slider, Typography, withStyles } from '@material-ui/core';
import Axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { store } from '../../app/store';
import cfg from '../../config.json';
import { AccelerometerState, clearHistory, selectHistory, setTicks } from '../microbit/microbitSlice';
import { selectActiveModel } from '../models/activeModelSlice';
import { fetchModel } from '../models/Model';

const useStyles = makeStyles((theme) => ({
  sendForm: {
    padding: 10,
  },
  recordForm: {
    padding: "10px 15% 15px 15%",
    '& > p': {
      padding: 10
    },
    '& > *': {
      margin: theme.spacing(0),
    },
  },
  root: {
    margin: 20
  },
  title: {
    padding: 20,
    margin: 20
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

export function Recorder(props: { match: { params: { id: any } }, history: string[] }) {
  const history = useSelector(selectHistory);
  const classes = useStyles();
  const activeModel = useSelector(selectActiveModel);

  const id = props.match.params.id;

  const [countdown, setCountdown] = useState(3);
  const [ticks, setTicks] = useState(activeModel.tickCount);
  const [checked, setChecked] = useState(true);

  const [frames, setFrames] = useState<number>(activeModel.tickCount);

  useEffect(() => {
    if (activeModel.name === "") {
      fetchModel(id);
    } else {
      setTicks(activeModel.tickCount);
      setFrames(activeModel.tickCount);
    }
  }, [activeModel.name, activeModel.tickCount, id])

  const handleChange = (event: any, value: number | number[]) => {
    if (!Array.isArray(value) && value >= activeModel.tickCount) {
      setFrames(value);
    }
  };

  if (activeModel.name !== "") {
    return (
      <div className={classes.root}>
        <Paper variant="outlined" className={classes.title}>
          <Typography variant="h4">{activeModel.name}</Typography>
        </Paper>
        <Paper variant="outlined" className={classes.root}>
          <div className={classes.recordForm}>
            <Typography>Capture Frames</Typography>
            <CleanSlider valueLabelDisplay="on" defaultValue={3} min={0} max={10} onChange={(e, v) => setCountdown(!Array.isArray(v) ? v : v[0])} />
            <Typography>Ticks to Record</Typography>
            <CleanSlider valueLabelDisplay="on" defaultValue={activeModel.tickCount} min={activeModel.tickCount} max={activeModel.tickCount + 100} onChange={(e, v) => setTicks(!Array.isArray(v) ? v : v[0])} />
            <Button variant="contained" color="primary" onClick={() => recordTicks(ticks, countdown)}>Record Ticks</Button>
          </div>
        </Paper>
        <DataChart />
        <Paper variant="outlined" className={classes.root}>
          <div className={classes.sendForm}>
            <Typography className={classes.label}>Countdown</Typography>
            <CleanSlider suppressContentEditableWarning suppressHydrationWarning valueLabelDisplay="on" value={frames} defaultValue={activeModel.tickCount} min={0} max={ticks} onChange={handleChange} marks={[{ value: frames - activeModel.tickCount }]} />
            <Typography>Is correct: <Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)} /></Typography>
            <Button variant="contained" color="primary" onClick={() => postGesture(checked, history, frames - activeModel.tickCount, frames)}>Send Data</Button>
          </div>
        </Paper>
      </div>
    );
  }
  return (
      <CircularProgress className={classes.progress}/>
  )
}

function DataChart() {
  const history = useSelector(selectHistory);
  const historySplit = splitHistory(history);
  const classes = useStyles();

  return (
    <CChart
      className={classes.root}
      type="line"
      datasets={[
        {
          label: 'Accelerometer X',
          backgroundColor: 'rgba(179,181,198,0.2)',
          borderColor: 'rgba(179,181,198,1)',
          pointBackgroundColor: 'rgba(179,181,198,1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(179,181,198,1)',
          tooltipLabelColor: 'rgba(179,181,198,1)',
          data: historySplit.xs
        },
        {
          label: 'Accelerometer Y',
          backgroundColor: 'rgba(255,99,132,0.2)',
          borderColor: 'rgba(255,99,132,1)',
          pointBackgroundColor: 'rgba(255,99,132,1)',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: 'rgba(255,99,132,1)',
          tooltipLabelColor: 'rgba(255,99,132,1)',
          data: historySplit.ys
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
          data: historySplit.zs
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
 * Posts a gesture to the server.
 */
function postGesture(checked: boolean, data: AccelerometerState[], frames: number, lastFrame: number) {
  data = data.slice(lastFrame - frames, lastFrame);
  let payload = {
    checked: checked,
    data: data
  }

  Axios.post(`${cfg.server_url}/gesture`, payload).then((res) => {
    console.log(res.data);
  }).catch((res) => {
    console.log(res);
  })
}

function recordTicks(ticks: number, countdown: number) {
  setTimeout(() => {
    store.dispatch(clearHistory())
    store.dispatch(setTicks(ticks));
  }, countdown * 1000)
}

function splitHistory(history: AccelerometerState[]) {
  var indexs: number[] = [];
  var xs: number[] = [];
  var ys: number[] = [];
  var zs: number[] = [];
  var i: number = 0;
  history.forEach(el => {
    indexs.push(i);
    xs.push(el.x);
    ys.push(el.y);
    zs.push(el.z);
    i++;
  });
  return { indexs: indexs, xs: xs, ys: ys, zs: zs }
}