import React from 'react';
import { Button } from '@mui/material';

const SubmitButton = ({ onClick, label, sx }) => (
  <Button type="submit" variant="contained" color="primary" onClick={onClick} sx={sx}>
    {label}
  </Button>
);

export default SubmitButton;
