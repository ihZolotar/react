import { Button, Container, Typography } from '@mui/material';
import Link from 'next/link';

export default function NotFound() {
    return (
        <Container sx={{ py: 5 }}>
            <Typography variant="h5" gutterBottom>
                Page not found
            </Typography>

            <Typography variant="body1" sx={{ mb: 2 }}>
                The page you are looking for does not exist.
            </Typography>

            <Link href="/" passHref style={{ textDecoration: 'none' }}>
                <Button variant="contained" color="primary">
                    Go to Home Page
                </Button>
            </Link>
        </Container>
    );
}
