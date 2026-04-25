import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Box, Typography, Button, CircularProgress, Paper } from "@mui/material";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useBooking } from "../../../hooks/useBooking.ts";
import { Paths } from "../../../config/paths/paths.ts";

export function PaymentSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { pollOperation } = useBooking();

    const opId = searchParams.get('operationId');
    const bId = searchParams.get('bookingId');
    const finalId = opId || bId;


    const [status, setStatus] = useState<'loading' | 'success' | 'error'>(
        finalId ? 'loading' : 'error'
    );
    const polled = useRef(false);

    useEffect(() => {
        if (!finalId) {
            return;
        }

        if (polled.current) return;
        polled.current = true;


        pollOperation(finalId, 'PAYMENT_CONFIRM')
            .then((op) => {
                console.log(" Оплата подтверждена бэкендом!", op);
                setStatus('success');
            })
            .catch((err) => {
                console.error(" Ошибка подтверждения оплаты:", err);
                setStatus('error');
            });

    }, [finalId, pollOperation]);

    return (
        <Box sx={{ pt: '100px', display: 'flex', justifyContent: 'center', px: 2 }}>
            <Paper sx={{ p: 6, borderRadius: 4, textAlign: 'center', maxWidth: 500, width: '100%' }}>
                {status === 'loading' && (
                    <>
                        <CircularProgress size={60} sx={{ color: '#6baf5c', mb: 3 }} />
                        <Typography variant="h5" fontWeight={800}>Confirming your payment...</Typography>
                        <Typography color="text.secondary">Please wait, do not close this window.</Typography>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <CheckCircleOutlineIcon sx={{ fontSize: 80, color: '#6baf5c', mb: 2 }} />
                        <Typography variant="h4" fontWeight={900} mb={1}>Payment Successful!</Typography>
                        <Typography color="text.secondary" mb={4}>Your locker is now ready to use.</Typography>
                        <Button
                            variant="contained"
                            fullWidth
                            onClick={() => navigate(`${Paths.USER}/my-bookings`)}
                            sx={{ bgcolor: '#6baf5c', fontWeight: 700, py: 1.5, borderRadius: 2 }}
                        >
                            View My Bookings
                        </Button>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <ErrorOutlineIcon sx={{ fontSize: 80, color: '#ef4444', mb: 2 }} />
                        <Typography variant="h4" fontWeight={900} mb={1}>Payment Error</Typography>
                        <Typography color="text.secondary" mb={4}>We couldn't confirm your payment. Please try again or contact support.</Typography>
                        <Button
                            variant="outlined"
                            fullWidth
                            onClick={() => navigate(Paths.USER)}
                            sx={{ fontWeight: 700, py: 1.5, borderRadius: 2 }}
                        >
                            Return to Dashboard
                        </Button>
                    </>
                )}
            </Paper>
        </Box>
    );
}