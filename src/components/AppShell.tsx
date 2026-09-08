'use client';

import { useCallback, useState, type ReactNode } from 'react';
import { Box } from '@mui/material';
import { usePathname } from 'next/navigation';
import NavigationBar from './NavigationBar';
import SideDrawer from './SideDrawer';
import Footer from './Footer';

const AppShell = ({ children }: { children: ReactNode }) => {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleDrawerToggle = useCallback(() => {
        setMobileOpen((prevState) => !prevState);
    }, []);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <NavigationBar handleDrawerToggle={handleDrawerToggle} pathname={pathname} />

            <SideDrawer
                mobileOpen={mobileOpen}
                handleDrawerToggle={handleDrawerToggle}
                pathname={pathname}
            />

            <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                {children}
            </Box>

            <Footer />
        </Box>
    );
};

export default AppShell;
