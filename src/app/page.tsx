'use client';

import React from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import Link from 'next/link';

const HomePage = () => {
    return (
        <Container maxWidth="md">
            <Box textAlign="center" py={5}>
                <Typography variant="h4" gutterBottom>
                    Welcome to the Contact Manager App
                </Typography>
                <Typography variant="body1" gutterBottom>
                    Manage your contacts efficiently. Click below to view and manage your contacts.
                </Typography>
                <Link href="/contact" passHref>
                    <Button variant="contained" color="primary" size="large">
                        Go to Contacts
                    </Button>
                </Link>
            </Box>
        </Container>
    );
};

export default HomePage;
