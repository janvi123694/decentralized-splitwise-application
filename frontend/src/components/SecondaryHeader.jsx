import * as React from 'react';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';

const SecondaryHeader = ({ dues,debtsMap, DID }) => {
  const { amtYouOwe, amtYouAreOwed } = dues;
  console.log(debtsMap);
  const StyledPaper = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(2),
    color: theme.palette.text.primary,
  }));

  const message1 = `Total amount you owe : ${amtYouOwe} SF.  Total amount you are owed : ${amtYouAreOwed} SF  `;

  return (
    <Box sx={{ flexGrow: 1, overflow: 'hidden', px: 3 }}>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <StyledPaper
            sx={{
              my: 1,
              mx: 'auto',
              p: 2,
            }}
          >
            <Grid container wrap="nowrap" spacing={2}>
              <Grid item>
                {/* <Avatar>SW</Avatar> */}
              </Grid>
              <Grid item xs zeroMinWidth>
                <Typography noWrap sx={{ color: '#3AEAB5', fontSize:'13px', fontFamily:'Tahoma' }}>{message1}</Typography>
                {Object.entries(debtsMap).map(([person, { amountOwed, NFTID }]) => (
                  <Typography key={person} noWrap sx={{ color: '#3AEAB5', fontSize: '13px', fontFamily: 'Tahoma' }}>
                    You owe {Number(amountOwed)} SF to {person}. NFT ID: {NFTID}
                  </Typography>
                ))}

                </Grid>
            </Grid>
          </StyledPaper>
        </Grid>
        <Grid item xs={6}>
          <StyledPaper
            sx={{
              my: 1,
              mx: 'auto',
              p: 2,
            }}
          >
            <Grid container wrap="nowrap" spacing={2}>
              <Grid item>
               
              </Grid>
              <Grid item xs zeroMinWidth>
                <Typography noWrap sx={{ color: '#3AEAB5', fontSize:'13px'  ,fontFamily:'Tahoma'}}> Your Decentralized ID : {DID}
</Typography>
              </Grid>
            </Grid>
          </StyledPaper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default SecondaryHeader;
