import { Collapse, IconButton } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import MuiAlert from '@material-ui/lab/Alert';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectAlert,
  switchOpen
} from './alertSlice';

export function Alert() {
  const dispatch = useDispatch();
  const alert = useSelector(selectAlert);
  if (alert.message) {
    return (
      <Collapse in={alert.open}>
        <MuiAlert severity={alert.severity} action={
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={() => {
              dispatch(switchOpen())
            }}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        }>
          {alert.message}
        </MuiAlert>
      </Collapse>
    )
  }
  return (<div></div>);
}