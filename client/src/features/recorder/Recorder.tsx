import { CChart } from '@coreui/react-chartjs';
import { Button, Checkbox, makeStyles, TextField, Typography } from '@material-ui/core';
import Axios from 'axios';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import cfg from '../../config.json'
import { store } from '../../app/store';
import { AccelerometerState, clearHistory, selectHistory, setTicks } from '../microbit/microbitSlice';

const useStyles = makeStyles((theme) => ({
    sendForm: {
        padding: 10,
    },
    recordForm: {
        '& > *': {
            margin: theme.spacing(1),
            width: '25ch',
        },
    }
}));

export function Recorder() {
    const history = useSelector(selectHistory);
    const classes = useStyles();

    const [countdown, setCountdown] = useState(3);
    const [ticks, setTicks] = useState(20);
    const [checked, setChecked] = useState(false);
    const [frames, setFrames] = useState(10);
    const [lastFrame, setLastFrame] = useState(0);

    return (
        <div>
            <div className={classes.recordForm}>
                <TextField label="Record Countdown" defaultValue={countdown} onChange={(e) => setCountdown(parseInt(e.target.value))} />
                <TextField label="Ticks to Record" defaultValue={ticks} onChange={(e) => setTicks(parseInt(e.target.value))} />
                <Button variant="contained" color="primary" onClick={() => recordTicks(ticks, countdown)}>Record Ticks</Button>
            </div>
            <DataChart/>
            <div className={classes.sendForm}>
                <TextField label="Minimum Frames" defaultValue={frames} onChange={(e) => setFrames(parseInt(e.target.value))} />
                <TextField label="Final Frame" defaultValue={lastFrame} onChange={(e) => setLastFrame(parseInt(e.target.value))} />
                <Typography>Is correct: <Checkbox onChange={(e) => setChecked(e.target.checked)} /></Typography>
                <Button variant="contained" color="primary" onClick={() => postGesture(ticks, checked, history, frames, lastFrame)}>Send Data</Button>
            </div>
        </div>
    )
}

function DataChart() {
    const history = useSelector(selectHistory);
    const historySplit = splitHistory(history);

    return (
        <CChart
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
                aspectRatio: 1.5,
                animation: false
            }}
            labels={historySplit.indexs}
        />
    );
}


/**
 * Posts a gesture to the server.
 */
function postGesture(ticks: number, checked: boolean, data: AccelerometerState[], frames: number, lastFrame: number) {
    data = data.slice(lastFrame - frames, lastFrame);

    let payload = {
        tickCount: ticks,
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