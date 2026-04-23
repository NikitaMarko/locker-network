import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper, CircularProgress } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useBooking } from '../../../hooks/useBooking';
import { Paths } from '../../../config/paths/paths';

export function PaymentSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { pollOperation } = useBooking();

    const operationId = searchParams.get('operationId');



    const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
        operationId ? 'loading' : 'success'
    );

    useEffect(() => {

        if (!operationId) return;

        pollOperation(operationId)
            .then(() => setStatus('success'))
            .catch(() => setStatus('error'));
    }, [operationId, pollOperation]);

    return (
        <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3, bgcolor: '#f8fafc' }}>
            <Paper elevation={0} sx={{ p: 6, borderRadius: 4, maxWidth: 500, width: '100%', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                {status === 'loading' ? (
                    <Box>
                        <CircularProgress size={64} sx={{ color: '#6baf5c', mb: 3 }} />
                        <Typography variant="h5" fontWeight={800}>Confirming Payment...</Typography>
                    </Box>
                ) : (
                    <Box>
                        <CheckCircleOutlineIcon sx={{ fontSize: 88, color: '#10b981', mb: 2 }} />
                        <Typography variant="h4" fontWeight={900} mb={4}>Payment Successful!</Typography>
                        <Button
                            variant="contained"
                            fullWidth
                            onClick={() => navigate(`${Paths.USER}/my-bookings`)}
                            sx={{ bgcolor: '#6baf5c', py: 1.5, fontWeight: 700, borderRadius: 3 }}
                        >
                            Go to My Bookings
                        </Button>
                    </Box>
                )}
            </Paper>
        </Box>
    );
}