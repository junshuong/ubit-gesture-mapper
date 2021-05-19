import { Button, Checkbox, IconButton, makeStyles, Paper, Tooltip, Typography } from '@material-ui/core';
import InfoIcon from '@material-ui/icons/Info';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { store } from '../../app/store';
import cfg from '../../config.json';
import { activate, selectActiveModel, setActiveModel } from './activeModelSlice';
import * as tf from '@tensorflow/tfjs';
import { setIsPlaying } from '../audio/audioSlice';
import { Audio } from '../audio/Audio';

const useStyles = makeStyles({
    root: {
        margin: 20,
        padding: 10,
        "& > p": {
            padding: "5px"
        }
    },
})

export function Model(props: { match: { params: { id: any } }, history: string[] }) {
    const id = props.match.params.id;
    const activeModel = useSelector(selectActiveModel);
    const classes = useStyles();

    const handleRemove = (id: number) => {
        removeModel(id).then(() => {
            props.history.push('/models');
        });
    };

    useEffect(() => {
        fetchModel(id);
    }, [id])

    const [weightMap, setWeightMap] = useState({});

    return (
        <div>
            <Paper className={classes.root} variant="outlined">
                <Typography variant="h4">{activeModel["name"]}</Typography>
                <Typography variant="body1">Tick Count: {activeModel.tickCount}</Typography>
                <Typography variant="body1">Description: {activeModel.description}</Typography>
                <Button color="secondary" variant="contained" onClick={() => handleRemove(id)}>
                    <Typography>Delete Model</Typography>
                </Button>
            </Paper>
            <Paper className={classes.root} variant="outlined">
            <Typography variant="h4">Gestures</Typography>
                <Typography variant="body1">Count: {activeModel.gestures.length}</Typography>
                <Typography variant="body1">
                    Accuracy: 0%
                        <Tooltip title="Warning: may be inaccurate with a low amount of gestures recorded.">
                            <IconButton aria-label="delete">
                                <InfoIcon />
                            </IconButton>
                        </Tooltip>
                </Typography>
                <Link to={`/recorder/${activeModel.id}`}>
                    <Button color="primary" variant="contained">
                        Add Gestures
                    </Button>
                </Link>
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
                <ModelOutput weightMap={weightMap}/>
            </Paper>
            <Audio/>
        </div>
    );
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

    if (flattened.length === activeModel.tickCount * 3 && activeModel.tickCount !== 0) {
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

    return(
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
    axios.post(`${cfg.server_url}/get_model`, { id: id }).then((res) => {
        store.dispatch(setActiveModel(res.data));
    }).catch((err) => {
        console.error(err);
    });
}

function removeModel(id: number) {
    console.info("Removing model...");
    return axios.post(`${cfg.server_url}/delete_model`, { id: id });
}