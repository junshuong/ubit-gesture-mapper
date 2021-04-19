import { Button, IconButton, makeStyles, Paper, Tooltip, Typography } from '@material-ui/core';
import InfoIcon from '@material-ui/icons/Info';
import axios from 'axios';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { store } from '../../app/store';
import cfg from '../../config.json';
import { selectActiveModel, setActiveModel } from './activeModelSlice';

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
        </div>
    );
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