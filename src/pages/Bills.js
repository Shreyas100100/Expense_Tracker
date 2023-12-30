// Bills.js
import React, { useState, useEffect } from 'react';
import { Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { collection, getDocs, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

export default function Bills(){
    return(
        <>
        <h1>BILLS</h1>
        </>
    );
};
