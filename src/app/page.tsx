'use client';

import React from 'react';
import {Box, Button, Container, Typography, Paper} from '@mui/material';
import Link from 'next/link';
import {MdContacts} from 'react-icons/md';

const HomePage = () => {
    return (
        <Container maxWidth="md">
            <Paper elevation={3} sx={{mt: 5, p: 4, borderRadius: 3}}>
                <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    textAlign="center"
                    py={3}
                >
                    <Box sx={{mb: 3, color: 'primary.main'}}>
                        <MdContacts size={64}/>
                    </Box>
                    <Typography
                        variant="h4"
                        gutterBottom
                        sx={{fontSize: {xs: '1.5rem', sm: '2rem', md: '2.25rem'}}}
                    >
                        Welcome to the Contact Manager App
                    </Typography>
                    <Typography
                        variant="body1"
                        gutterBottom
                        sx={{maxWidth: '80%', mb: 4}}
                    >
                        Manage your contacts efficiently. Add, edit, and organize your contact information all in one
                        place.
                    </Typography>
                    <Link href="/contact" passHref style={{textDecoration: 'none'}}>
                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            startIcon={<MdContacts/>}
                            sx={{px: 4, py: 1.5, borderRadius: 2}}
                        >
                            Go to Contacts
                        </Button>
                    </Link>
                </Box>
            </Paper>
        </Container>
    );
};

export default HomePage;
