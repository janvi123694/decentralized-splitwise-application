import React, { useState } from 'react';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const CustomAlert = ({ open, onClose, severity, message }) => {
    return (
        <Snackbar open={open} autoHideDuration={6000} onClose={onClose}>
            <MuiAlert
                elevation={6}
                variant="filled"
                onClose={onClose}
                severity={severity}
                sx={{ width: '100%' }}
            >
                {message}
            </MuiAlert>
        </Snackbar>
    );
};

export default CustomAlert;
