'use client';

import * as React from 'react';
import {
    CssBaseline,
    AppBar,
    Toolbar,
    Typography,
    Box,
    Container,
    Button,
    IconButton,
    Drawer,
    List,
    ListItem,
    ListItemText,
    useMediaQuery,
    useTheme
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../theme/theme';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ContactsProvider } from '@/context/contactsContext';
import { MdMenu, MdHome, MdContacts } from 'react-icons/md';
import { ErrorBoundary } from 'react-error-boundary';

interface NavItem {
    name: string;
    path: string;
    icon: React.ReactNode;
}

const ErrorFallback = ({ error }: { error: Error }) => (
    <Container sx={{ py: 5 }}>
        <Typography variant="h5" color="error" gutterBottom>
            Something went wrong:
        </Typography>
        <Typography variant="body1">{error.message}</Typography>
        <Button
            variant="contained"
            color="primary"
            onClick={() => window.location.assign('/')}
            sx={{ mt: 2 }}
        >
            Go to Home Page
        </Button>
    </Container>
);

const NAV_ITEMS: NavItem[] = [
    { name: 'Home', path: '/', icon: <MdHome /> },
    { name: 'Contacts', path: '/contact', icon: <MdContacts /> },
];

const NavigationBar = ({
                           isMobile,
                           handleDrawerToggle,
                           pathname
                       }: {
    isMobile: boolean;
    handleDrawerToggle: () => void;
    pathname: string;
}) => (
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

                {isMobile ? (
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="end"
                        onClick={handleDrawerToggle}
                    >
                        <MdMenu />
                    </IconButton>
                ) : (
                    <Box sx={{ display: 'flex' }}>
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
                )}
            </Toolbar>
        </Container>
    </AppBar>
);

const SideDrawer = ({
                        mobileOpen,
                        handleDrawerToggle,
                        pathname
                    }: {
    mobileOpen: boolean;
    handleDrawerToggle: () => void;
    pathname: string;
}) => {
    const drawerContent = (
        <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
            <Typography variant="h6" sx={{ my: 2 }}>
                Contact Manager
            </Typography>
            <List>
                {NAV_ITEMS.map((item) => (
                    <Link
                        key={item.name}
                        href={item.path}
                        passHref
                        style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                        <ListItem
                            sx={{
                                backgroundColor: pathname === item.path
                                    ? 'rgba(25, 118, 210, 0.4)'
                                    : 'transparent',
                                borderRadius: 1
                            }}
                        >
                            <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
                                {item.icon}
                            </Box>
                            <ListItemText primary={item.name} />
                        </ListItem>
                    </Link>
                ))}
            </List>
        </Box>
    );

    return (
        <Drawer
            anchor="right"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
                keepMounted: true
            }}
            sx={{
                display: { xs: 'block', sm: 'none' },
                '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
            }}
        >
            {drawerContent}
        </Drawer>
    );
};

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
            <Typography variant="body2" color="text.secondary">
                © {new Date().getFullYear()} Contact Manager App. All rights reserved.
            </Typography>
        </Container>
    </Box>
);

export default function RootLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const muiTheme = useTheme();
    const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
    const [mobileOpen, setMobileOpen] = React.useState(false);

    const handleDrawerToggle = React.useCallback(() => {
        setMobileOpen((prevState) => !prevState);
    }, []);

    return (
        <html lang="en" suppressHydrationWarning>
        <head>
            <meta name="viewport" content="width=device-width, initial-scale=1" />
        </head>
        <body>
        <AppRouterCacheProvider>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
                    <ContactsProvider>
                        <NavigationBar
                            isMobile={isMobile}
                            handleDrawerToggle={handleDrawerToggle}
                            pathname={pathname as string}
                        />

                        <SideDrawer
                            mobileOpen={mobileOpen}
                            handleDrawerToggle={handleDrawerToggle}
                            pathname={pathname as string}
                        />

                        <Box
                            component="main"
                            sx={{
                                flexGrow: 1,
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            <ErrorBoundary FallbackComponent={ErrorFallback}>
                                {children}
                            </ErrorBoundary>
                        </Box>

                        <Footer />
                    </ContactsProvider>
                </Box>
            </ThemeProvider>
        </AppRouterCacheProvider>
        </body>
        </html>
    );
}
