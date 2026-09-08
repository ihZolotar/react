'use client';

import { Box, Container, Typography } from '@mui/material';

const Footer = () => (
    <Box
        component="footer"
        sx={{
            py: 3,
            textAlign: 'center',
            backgroundColor: (theme) => theme.palette.grey[100],
            mt: 'auto'
        }}
    >
        <Container maxWidth="lg">
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                © {new Date().getFullYear()} Contact Manager App. All rights reserved.
            </Typography>
        </Container>
    </Box>
);

export default Footer;
