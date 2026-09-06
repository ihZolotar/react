'use client';

import type { ReactNode } from 'react';
import { CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import theme from '@/theme/theme';

const AppProviders = ({ children }: { children: ReactNode }) => (
    <AppRouterCacheProvider>
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {children}
        </ThemeProvider>
    </AppRouterCacheProvider>
);

export default AppProviders;
