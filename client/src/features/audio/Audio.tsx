import { Button, Card, CardContent, Typography, Slider, Grid } from '@material-ui/core';
import { VolumeUp, VolumeDown } from '@material-ui/icons';
import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { createDelay } from '../../audio/effectNodes';
import { selectIsPlaying, selectMainGain, setMainGain, toggleIsPlaying, setFreq1, selectFreq1, selectEffectLevel, setEffectLevel } from './audioSlice';

export function Audio(props: any) {
    return (
        <div>
            <AudioStatus />
        </div>
    );
}

function AudioStatus() {
    const dispatch = useDispatch();

    const isPlaying = useSelector(selectIsPlaying);
    const mainGain = useSelector(selectMainGain);
    const effectLevel = useSelector(selectEffectLevel);
    const freq1 = useSelector(selectFreq1);

    const audioContextRef = useRef();
    const osc1Ref = useRef();
    const mainGainRef = useRef();
    const dryGainRef = useRef();
    const wetGainRef = useRef();

    useEffect(() => {
        const AudioContext = window.AudioContext;
        var aCtx = new AudioContext();

        const mainGainNode = aCtx.createGain();
        // @ts-ignore
        mainGainRef.current = mainGainNode;
        mainGainNode.gain.value = mainGain;
        mainGainNode.connect(aCtx.destination);

        // Create wet and dry gains
        const dryGain = aCtx.createGain();
        const wetGain = aCtx.createGain();

        // @ts-ignore
        dryGainRef.current = dryGain;
        // @ts-ignore
        wetGainRef.current = wetGain;

        dryGain.connect(mainGainNode);
        wetGain.connect(mainGainNode);

        const delayNode = createDelay(aCtx);

        delayNode.connect(wetGain);

        const osc1 = aCtx.createOscillator();
        // @ts-ignore
        osc1Ref.current = osc1;

        osc1.frequency.value = freq1;
        osc1.type = 'sine';
        osc1.connect(delayNode);
        osc1.connect(dryGain);

        dryGain.gain.value = Math.cos(1.0 * 0.5 * Math.PI);
        wetGain.gain.value = Math.cos((1.0 - 1.0) * 0.5 * Math.PI);
        osc1.start();

        // @ts-ignore
        audioContextRef.current = aCtx;
        aCtx.suspend();

        return function cleanup() {
            osc1.disconnect(delayNode);
            console.log('stop');
        };
        // eslint-disable-next-line
    }, []);

    const playPause = () => {
        if (isPlaying) {
            // @ts-ignore
            audioContextRef.current.suspend();
        } else {
            // @ts-ignore
            audioContextRef.current.resume();
        }
        dispatch(toggleIsPlaying());
    };

    const freq1Change = (_event: any, newValue: any) => {
        dispatch(setFreq1([newValue]));
        // @ts-ignore
        osc1Ref.current.frequency.value = newValue;
    };
    const volumeChange = (_event: any, newValue: any) => {
        dispatch(setMainGain([newValue]));
        // @ts-ignore
        mainGainRef.current.gain.value = newValue;
    };

    function crossfade(_event: any, newValue: any) {
        dispatch(setEffectLevel([newValue]))
        // Equal-power crossfade
        var gain1 = Math.cos(newValue * 0.5 * Math.PI);
        var gain2 = Math.cos((1.0 - newValue) * 0.5 * Math.PI);

        // @ts-ignore
        dryGainRef.current.gain.value = gain1;
        // @ts-ignore
        wetGainRef.current.gain.value = gain2;
    }

    return (
        <Card variant="outlined">
            <CardContent>
                <Typography color="textSecondary" gutterBottom></Typography>
                <Typography variant="h5" component="h2">
                    Audio Controls
                </Typography>
                <Button variant="contained" color="primary" onClick={playPause}>
                    {isPlaying ? 'Pause' : 'Play'}
                </Button>
                <Typography variant="h6" component="p">
                    Frequency 1: {String(freq1)} Hz
                </Typography>
                <Slider value={freq1} onChange={freq1Change} min={0} max={2000} step={10} valueLabelDisplay="on" />
                <Typography variant="h6" component="p">
                    Effect Strength {String(effectLevel)}
                </Typography>
                <Slider value={effectLevel} onChange={crossfade} min={0.0} max={1.0} step={0.01} />
                <Grid container spacing={2}>
                    <Grid item>
                        <VolumeDown />
                    </Grid>
                    <Grid item xs>
                        <Slider value={mainGain} onChange={volumeChange} min={0} max={0.4} step={0.025} />
                    </Grid>
                    <Grid item>
                        <VolumeUp />
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
}
