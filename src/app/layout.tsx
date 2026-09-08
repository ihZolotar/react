import type { Metadata } from 'next';
import AppProviders from '@/components/AppProviders';
import AppShell from '@/components/AppShell';

export const metadata: Metadata = {
    title: {
        default: 'Contact Manager',
        template: '%s · Contact Manager',
    },
    description: 'Add, edit and organize your contacts in one place.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body>
                <AppProviders>
                    <AppShell>{children}</AppShell>
                </AppProviders>
            </body>
        </html>
    );
}
