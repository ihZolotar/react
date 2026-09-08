'use client';

import { Box, Drawer, List, ListItem, ListItemText, Typography } from '@mui/material';
import Link from 'next/link';
import { NAV_ITEMS } from './NavItems';

interface SideDrawerProps {
    mobileOpen: boolean;
    handleDrawerToggle: () => void;
    pathname: string;
}

const SideDrawer = ({ mobileOpen, handleDrawerToggle, pathname }: SideDrawerProps) => (
    <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
    >
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
    </Drawer>
);

export default SideDrawer;
