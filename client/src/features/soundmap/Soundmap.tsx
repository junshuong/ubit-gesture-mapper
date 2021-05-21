import { Checkbox, makeStyles, MenuItem, Paper, Select, Typography } from '@material-ui/core';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import cfg from '../../config.json';
import { GestureState } from '../models/activeModelSlice';
import { availableAudioFiles, selectGestureMappings } from './soundmapSlice';


const useStyles = makeStyles((theme) => ({
    root: {
        margin: 10
    },
}));

const initialActiveState: GestureState = {
    id: 0,
    name: "",
    classification: 0,
    model: 0,
    using_file: false,
    sound_file: "",
    frequency: 0,
    strength: 0,
    volume: 0,
    captures: []
}


export default function Soundmap(props: { match: { params: { gesture_id: number } }, history: string[] }) {
    const classes = useStyles();
    const gesture_id: number = props.match.params.gesture_id;
    const [activeGesture, setActiveGesture] = useState(initialActiveState);
    const [fileChecked, setFileChecked] = useState(false);
    const mappings = useSelector(selectGestureMappings);
    const [file, setFile] = useState("");

    useEffect(() => {
        axios.get(`${cfg.server_url}/get_gesture/${gesture_id}`).then((res) => {
            setActiveGesture(res.data);
        }).catch((err) => {
            console.error(err);
        })
    }, [gesture_id]);

    function updateGestureMapping() {
        let payload = {
            gesture_id: activeGesture.id,
            using_file: activeGesture.using_file,
            file_name: activeGesture.sound_file,
        }
        axios.post(`${cfg.server_url}/update_mapping`, payload).then((res) => {
            console.log(res);
        }).catch((err) => {
            console.error(err);
        });
    }

    const handleSetFileChecked = () => {
        let tempState = activeGesture;
        tempState.using_file = !fileChecked;
        setActiveGesture(tempState);
        setFileChecked(!fileChecked);
        updateGestureMapping();
    }

    const handleSelectChange = (event: React.ChangeEvent<{ value: any }>) => {
        console.log("setting file value as:  " + event.target.value);
        let tempState = activeGesture;
        tempState.sound_file = event.target.value;
        setActiveGesture(tempState);
        setFile(event.target.value);
        updateGestureMapping();
    }

    return (
        <div>
            <Paper variant="outlined" className={classes.root}>
                <Typography variant="h5">Sound Mapping</Typography>
                <Typography variant="caption">for gesture `{activeGesture.name}'</Typography>
                <Typography>Currently set as a {
                    (activeGesture.using_file ? "file mapping" : "direct sound mapping")
                }</Typography>
            </Paper>
            <Paper variant="outlined" className={classes.root}>
                <Typography variant="h6">File Mapping</Typography>
                <Checkbox checked={fileChecked} onClick={handleSetFileChecked} />
                <Select value={file} onChange={handleSelectChange}>
                    {availableAudioFiles.map(file => (
                        <MenuItem key={file.fileName} value={file.fileName}>{file.name}</MenuItem>
                    ))}
                </Select>
            </Paper>
            <Paper variant="outlined" className={classes.root}>
                <Typography variant="h6">WebAudio Mapping</Typography>
            </Paper>
        </div>

    )
}