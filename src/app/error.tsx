'use client';

import { Button, Container, Typography } from '@mui/material';

interface ErrorProps {
    error: Error & { digest?: string };
    retry: () => void;
}

export default function Error({ error, retry }: ErrorProps) {
    return (
        <Container sx={{ py: 5 }}>
            <Typography variant="h5" color="error" gutterBottom>
                Something went wrong
            </Typography>

            <Typography variant="body1" sx={{ mb: 1 }}>
                {error.message}
            </Typography>

            {error.digest && (
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                    Reference: {error.digest}
                </Typography>
            )}

            <Button variant="contained" color="primary" onClick={retry} sx={{ mt: 2 }}>
                Try again
            </Button>
        </Container>
    );
}
