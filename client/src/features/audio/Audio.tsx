import { Button, Card, CardContent, Typography, Slider, Grid } from '@material-ui/core';
import { VolumeUp, VolumeDown } from '@material-ui/icons';
import React, {useState, useEffect, useRef} from 'react';

import { createDelay } from '../../audio/effectNodes';

export function Audio(props: any) {

  return (
    <div>
      <AudioStatus />
    </div>
  );
}

function AudioStatus() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [freq1, setFreq1] = useState(261.63)
  // const [freq2, setFreq2] = useState(329.63)
  // const [freq3, setFreq3] = useState(196.0)
  const [mainVolume, setMainVolume] = useState(0.2)

  const audioContextRef = useRef();
  const osc1Ref = useRef();
  // const osc2Ref = useRef();
  // const osc3Ref = useRef();
  const mainGainRef = useRef();

  // Effects
  // const effectDelay = useRef();
  // const effectVibrato = useRef();

  useEffect(() => {
    const AudioContext = window.AudioContext;
    var aCtx = new AudioContext();
    
    const mainGainNode = aCtx.createGain();
    // @ts-ignore
    mainGainRef.current = mainGainNode;
    mainGainNode.gain.value = mainVolume;
    mainGainNode.connect(aCtx.destination);
    
    // const delayNode = createDelay(aCtx, 1.2)
    const delayNode = createDelay(aCtx)
    // effectDelay.current = delayNode;
    // // @ts-ignore
    // effectDelay.current.connect(mainGainNode)

    // const vibratoNode = createVibrato(aCtx, 3.5, 0.03, 0.002)
    
    delayNode.connect(mainGainNode)
    // const filterNode = createFilterLFO(aCtx)
    // effectVibrato.current = filterNode;
    // // @ts-ignore
    // effectVibrato.current.connect(delayNode)

    const osc1 = aCtx.createOscillator();
    // const osc2 = aCtx.createOscillator();
    // const osc3 = aCtx.createOscillator();
    // @ts-ignore
    osc1Ref.current = osc1;
    // @ts-ignore
    // osc2Ref.current = osc3;
    // @ts-ignore
    // osc3Ref.current = osc2;

    osc1.frequency.value = freq1;
    // osc2.frequency.value = freq2;
    // osc3.frequency.value = freq3;
    osc1.type = 'sawtooth';
    // osc2.type = 'sawtooth';
    // osc3.type = 'sawtooth';
    osc1.connect(delayNode);
    // osc2.connect(delayNode);
    // osc3.connect(delayNode);
    osc1.start();
    // osc2.start();
    // osc3.start();

    // @ts-ignore
    audioContextRef.current = aCtx;
    aCtx.suspend();

    return function cleanup(){
      osc1.disconnect(delayNode)
      // osc2.disconnect(delayNode)
      // osc3.disconnect(delayNode)
      console.log('stop')
    }
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
    setIsPlaying((play) => !play);
  };

  const freq1Change = (_event: any, newValue: any) => {
    setFreq1(newValue);
    // @ts-ignore
    osc1Ref.current.frequency.value = newValue;
  };
  // const freq2Change = (_event: any, newValue: any) => {
  //   setFreq2(newValue);
  //   // @ts-ignore
  //   osc2Ref.current.frequency.value = newValue;
  // };
  // const freq3Change = (_event: any, newValue: any) => {
  //   setFreq3(newValue);
  //   // @ts-ignore
  //   osc3Ref.current.frequency.value = newValue;
  // };
  const volumeChange = (_event: any, newValue: any) => {
    setMainVolume(newValue);
    // @ts-ignore
    mainGainRef.current.gain.value = newValue;
  };

  return (
    <Card variant="outlined">
      <CardContent>
        <Typography color="textSecondary" gutterBottom>
        </Typography>
        <Typography variant="h5" component="h2">
          Audio Controls
        </Typography>
        <Button variant="contained" color="primary" onClick={playPause}>
          {isPlaying ? "Pause" : "Play"}
        </Button>
        <Typography variant="h6" component="p">
            Frequency 1: {String(freq1)} Hz
        </Typography>
        <Slider value={freq1} onChange={freq1Change} min={0} max={2000} step={10} valueLabelDisplay="on" />
        {/* <Typography variant="h6" component="p">
            Frequency 2: {String(freq2)} Hz
        </Typography>
        <Slider value={freq2} onChange={freq2Change} min={0} max={2000} step={10} valueLabelDisplay="on" />
        <Typography variant="h6" component="p">
            Frequency 3: {String(freq3)} Hz
        </Typography>
        <Slider value={freq3} onChange={freq3Change} min={0} max={2000} step={10} valueLabelDisplay="on" /> */}
        <Grid container spacing={2}>
          <Grid item>
            <VolumeDown />
          </Grid>
          <Grid item xs>
            <Slider value={mainVolume} onChange={volumeChange} min={0} max={0.4} step={0.025} />
          </Grid>
          <Grid item>
            <VolumeUp />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  )
}