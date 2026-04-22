import { useState, useEffect } from "react";
import { Paper, Box, Typography, Stack, Chip, Button, Alert } from "@mui/material";

export function UserBookingCard({ booking, locker, onExtend, onPayDebt }: any) {
    const [timeLeftMs, setTimeLeftMs] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            const end = new Date(booking.expectedEndTime).getTime();
            setTimeLeftMs(Math.max(0, end - Date.now()));
        }, 1000);
        return () => clearInterval(timer);
    }, [booking.expectedEndTime]);

    const formatTime = (ms: number) => {
        const h = Math.floor(ms / 3600000);
        const m = Math.floor((ms / 60000) % 60);
        const s = Math.floor((ms / 1000) % 60);
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };


    const isVariant1 = locker.status === 'OCCUPIED' && booking.status === 'ACTIVE';
    const isVariant2 = locker.status === 'EXPIRED' && booking.status === 'EXPIRED';
    const isVariant3 = locker.status === 'AVAILABLE' && booking.status === 'EXPIRED';

    const isCriticalTime = timeLeftMs < 7200000;

    return (
        <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #e2e8f0' }}>
            <Stack direction="row" justifyContent="space-between" mb={2}>
                <Box>
                    <Typography variant="h4" fontWeight={900}>#{locker.code}</Typography>
                    <Chip label={locker.size} size="small" sx={{ mt: 1 }} />
                </Box>

                {isVariant1 && (
                    <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" color="text.secondary">Time remaining</Typography>
                        <Typography variant="h5" fontWeight={800} color={isCriticalTime ? "error" : "inherit"}>
                            {formatTime(timeLeftMs)}
                        </Typography>
                    </Box>
                )}
            </Stack>


            {isVariant1 && (
                <Button
                    variant="contained"
                    fullWidth
                    onClick={onExtend}
                    sx={{ bgcolor: '#6baf5c', borderRadius: 2, fontWeight: 700 }}
                >
                    Extend Booking
                </Button>
            )}


            {isVariant2 && (
                <Box>
                    <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                        Your rental has expired. Please pay the debt to access your items.
                    </Alert>
                    <Button
                        variant="contained"
                        fullWidth
                        color="error"
                        onClick={onPayDebt}
                        sx={{ borderRadius: 2, fontWeight: 700 }}
                    >
                        Pay Debt & Extend
                    </Button>
                </Box>
            )}


            {isVariant3 && (
                <Box sx={{ p: 2, bgcolor: '#fef2f2', borderRadius: 2, border: '1px solid #fee2e2' }}>
                    <Typography variant="body2" color="error" fontWeight={700} mb={1}>
                        Oops! Your rental period has ended and you didn't extend it in time.
                    </Typography>
                    <Typography variant="body2">
                        Your items have been moved to our warehouse. To retrieve them and pay the debt, please contact:
                        <Typography component="div" fontWeight={900} mt={1}>📞 055-555-55-55</Typography>
                    </Typography>
                </Box>
            )}
        </Paper>
    );
}