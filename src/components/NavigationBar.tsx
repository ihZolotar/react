'use client';

import { AppBar, Box, Button, Container, IconButton, Toolbar, Typography } from '@mui/material';
import Link from 'next/link';
import { MdContacts, MdMenu } from 'react-icons/md';
import { NAV_ITEMS } from './NavItems';

interface NavigationBarProps {
    handleDrawerToggle: () => void;
    pathname: string;
}

const NavigationBar = ({ handleDrawerToggle, pathname }: NavigationBarProps) => (
    <AppBar position="static">
        <Container maxWidth="lg">
            <Toolbar disableGutters>
                <Typography
                    variant="h6"
                    component="div"
                    sx={{
                        flexGrow: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                    }}
                >
                    <Link href="/" passHref style={{
                        textDecoration: 'none',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <MdContacts size={24} style={{ marginRight: '8px' }} />
                        Contact Manager
                    </Link>
                </Typography>

                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="end"
                    onClick={handleDrawerToggle}
                    sx={{ display: { xs: 'inline-flex', sm: 'none' } }}
                >
                    <MdMenu />
                </IconButton>

                <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
                    {NAV_ITEMS.map((item) => (
                        <Link
                            key={item.name}
                            href={item.path}
                            passHref
                            style={{ textDecoration: 'none' }}
                        >
                            <Button
                                color="inherit"
                                startIcon={item.icon}
                                sx={{
                                    ml: 1,
                                    backgroundColor: pathname === item.path
                                        ? 'rgba(255, 255, 255, 0.4)'
                                        : 'transparent',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.2)'
                                    }
                                }}
                            >
                                {item.name}
                            </Button>
                        </Link>
                    ))}
                </Box>
            </Toolbar>
        </Container>
    </AppBar>
);

export default NavigationBar;
