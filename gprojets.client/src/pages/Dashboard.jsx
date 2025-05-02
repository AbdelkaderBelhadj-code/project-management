import React from 'react';
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";


export default function Dashboard() {
    return (
        <Box sx={{ display: 'flex' }}>
            
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Typography variant="h4" sx={{ mb: 3 }}>
                    Dashboard
                </Typography>
               
               
            </Box>
        </Box>
    );
}
