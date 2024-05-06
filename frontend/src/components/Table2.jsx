import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

const Table2 = () => {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
  };

  const handleSaveExpense = () => {
    // Add your logic to save the expense
    handleClose(); // Close the modal after saving
  };

  const handleAddParticipant = () => {
    // Add your logic to handle adding a participant
  };

  return (
    <div>
      <Button onClick={handleOpen}>Open modal</Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Add Expense
          </Typography>
          <TextField
            label="Category"
            fullWidth
            margin="normal"
            variant="outlined"
          />
          <TextField
            label="Purpose"
            fullWidth
            margin="normal"
            variant="outlined"
          />
          <TextField
            label="Amount"
            fullWidth
            margin="normal"
            variant="outlined"
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
            }}
          />
          <TextField
            label="Participant"
            fullWidth
            margin="normal"
            variant="outlined"
          />
          <Button  
           variant="outlined"      
           size="small"
           onClick={handleAddParticipant}>
            Add Participant
          </Button>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
            <Button variant="contained" size="small" onClick={handleClose} style={{ marginRight: '8px' }}>
              Close
            </Button>
            <Button variant="contained" size="small" onClick={handleSaveExpense}>
              Save
            </Button>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default Table2;
