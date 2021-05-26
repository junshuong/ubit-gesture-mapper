import { Button, makeStyles, Paper, Typography } from "@material-ui/core";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { store } from "../../app/store";
import cfg from "../../config.json";
import { GestureState } from "../models/activeModelSlice";

const useStyles = makeStyles({
    root: {
      margin: 20,
      padding: 10,
      "& > p": {
        padding: "5px"
      }
    },
    table: {
    },
    link: {
      textDecoration: "none"
    }
  })

export default function MiniAudio(props: { gesture: GestureState }) {
    const classes = useStyles();
    const gesture = props.gesture;

    const trigger = store.getState().activeModel.gestures[gesture.classification - 1].triggered;

    const [source, setSource] = useState<AudioBufferSourceNode>();
    const [playing, setPlaying] = useState(false);

    const context = new AudioContext();

    function loadAudioFile() {
        axios.get(`${cfg.server_url}/get_audio_file/${gesture.sound_file}`, { responseType: "arraybuffer" }).then((res: any) => {
            var newSource = context.createBufferSource();
            context.decodeAudioData(res.data, function (buffer) {
                newSource.buffer = buffer;
                newSource.connect(context.destination);
                setSource(newSource);
            });
        }).catch((err) => {
            console.error(err);
        });
    }

    function handlePlaySound() {
        if (!source || !context) return;
        if (!playing) {
            source.start(0);
        } else {
            source.stop(0);
            loadAudioFile();
        }
        setPlaying(!playing);
    }

    useEffect(() => {
        handlePlaySound();
    }, [trigger])

    useEffect(() => {
        if (gesture.using_file) {
            loadAudioFile()
        }
    }, [])

    if (gesture.using_file) {
        return (
            <Paper className={classes.root} variant="outlined">
                <Typography>
                    <b>{gesture.name}</b> - playing {gesture.sound_file} ACTIVE {trigger ? "YES" : "NO"}
                </Typography>
                <Button variant="outlined" onClick={handlePlaySound}>Play Sound</Button>
            </Paper>
        );
    }


    return (
        <Paper className={classes.root} variant="outlined">
            {gesture.name}
        </Paper>
    )
}