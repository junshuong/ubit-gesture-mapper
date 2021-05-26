import { Button, Typography } from "@material-ui/core";
import { NamedTensorMap } from "@tensorflow/tfjs";
import axios from "axios";
import React, { useState, useCallback, useEffect } from "react";
import { store } from "../../app/store";
import { activate, setGestureTrigger } from "./activeModelSlice";
import cfg from '../../config.json';
import * as tf from '@tensorflow/tfjs';

export default function ModelOutput() {
    const [active, setActive] = useState(false);
    const [weightMap, setWeightMap] = useState<NamedTensorMap>();
    const [timer, setTimer] = useState(500);

    async function loadModel() {
        console.info("Requesting Tensorflow model...");
        let id = store.getState().activeModel.id;
        const manifestResponse = await axios.post(`${cfg.server_url}/get_trained_model`, { id: id });
        const weightsManifest = manifestResponse.data["weightsManifest"];
        console.log(weightsManifest);
        const weightMap = await tf.io.loadWeights(weightsManifest, `${cfg.server_url}/get_model_part/${id}`);
        store.dispatch(activate());
        setActive(true);
        console.info("Weight map set.");
        return weightMap;
    }

    const runCheck = useCallback(() => {
        let ah = store.getState().activeModel.history.accelerometer;
        let mh = store.getState().activeModel.history.magnetometer;

        if (ah.length !== 30 || mh.length !== 30) {
            console.log(ah.length, mh.length);
            return;
        }
        let formatted = [];
        for (var i = 0; i < 30; i++) {
            formatted.push([ah[i].x, ah[i].y, ah[i].z, mh[i].x, mh[i].y, mh[i].z])
        }
        formatted = formatted.flat();
        const output = forwardPass(weightMap!, formatted);
        const triggered = highest(output);
        console.log(triggered);
        if (triggered !== 0) {
            store.dispatch(setGestureTrigger(triggered));
        }
    }, [weightMap]);

    const highest = (arr: any) => {
       return arr.indexOf(Math.max(...arr));
    }

    function forwardPass(weightMap: tf.NamedTensorMap, data: number[]) {
        if (Object.keys(weightMap).length < 1) {
            console.error("Weight map gone wrong");
            return [0, 0]
        };
        const input = tf.tensor2d(data, [1, 180])

        const fc1_bias = weightMap['StatefulPartitionedCall/sequential/dense/BiasAdd/ReadVariableOp'];
        const fc1_weight = weightMap['StatefulPartitionedCall/sequential/dense/MatMul/ReadVariableOp'];
        const fc2_bias = weightMap['StatefulPartitionedCall/sequential/dense_1/BiasAdd/ReadVariableOp']
        const fc2_weight = weightMap['StatefulPartitionedCall/sequential/dense_1/MatMul/ReadVariableOp']

        const itf1 = tf.matMul(input, fc1_weight).add(fc1_bias);
        const f1tf2 = tf.matMul(itf1, fc2_weight).add(fc2_bias);
        return f1tf2.dataSync();
    }

    const handleClickLoadModel = () => {
        loadModel().then((res) => {
            setWeightMap(res);
        });
    }

    useEffect(() => {
        let interval: number | undefined = undefined;
        if (active) {
            // @ts-ignore
            interval = setInterval(() => {
                runCheck();
            }, timer);
        } else if (!active && timer !== 0) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [active, weightMap, timer, runCheck]);

    return (
        <div>
            <Button color="primary" variant="contained" onClick={handleClickLoadModel}>
                <Typography>Load Model</Typography></Button>
        </div>
    );
}