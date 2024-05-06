import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';

const Dues = ({ dues }) => {
  const { amtYouOwe, amtYouAreOwed } = dues;
  console.log(amtYouOwe);
  const StyledPaper = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(2),
    color: theme.palette.text.primary,
  }));

  const message1 = `Total amount that you owe 0x ${amtYouOwe} SF.`;

  return (
    <Box sx={{ flexGrow: 1, overflow: 'hidden', px: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <StyledPaper
            sx={{
              my: 1,
              mx: 'auto',
              p: 2,
            }}
          >
            <Grid container wrap="nowrap" spacing={2}>
              <Grid item xs zeroMinWidth>
                <Typography noWrap sx={{ color: '#3AEAB5', fontSize:'13px', fontFamily:'Tahoma' }}>{message1}</Typography>
                <Typography noWrap sx={{ color: '#3AEAB5', fontSize:'13px', fontFamily:'Tahoma' }}>{message1}</Typography>
                <Typography noWrap sx={{ color: '#3AEAB5', fontSize:'13px', fontFamily:'Tahoma' }}>{message1}</Typography>
              </Grid>
            </Grid>
          </StyledPaper>
        </Grid>
    
      </Grid>
    </Box>
  );
};

export default Dues;
