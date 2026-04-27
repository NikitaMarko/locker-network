import { useState, useEffect } from "react";
import { Paper, Box, Typography, Stack, Chip, Button, Alert } from "@mui/material";
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useLockers } from "../../../hooks/useLockers.ts";

export function ActiveLockerCard({ locker: booking }: { locker: any }) {
    const { cancelBooking } = useLockers();


    const [timeLeft, setTimeLeft] = useState(() =>
        booking.expectedEndTime ? "Calculating..." : "No end time"
    );
    const [timerStatus, setTimerStatus] = useState<"active" | "canExtend" | "expired" | "heavilyOverdue" | "noTime">(() =>
        booking.expectedEndTime ? "active" : "noTime"
    );
    const bookingId = booking.bookingId || booking.id;
    const lockerId = booking.lockerBoxId || booking.lockerBox?.id || '???';
    const stationId = booking.stationId || booking.station?.id || 'N/A';
    const size = booking.size || booking.lockerBox?.size || 'N/A';
    const city = booking.station?.city || '';
    const address = booking.station?.address || '';
    const locationString = city && address
        ? `${city}, ${address}`
        : `Station ID: ${stationId.slice(-6).toUpperCase()}`;


    const handlePayDebt = (bId: string) => {
        console.log(">>> Инициирована оплата задолженности:", bId);
        alert("Redirecting to Stripe to pay the debt...");
    };

    const handleExtend = (bId: string) => {
        console.log(">>> Инициировано продление брони:", bId);
        alert("Opening extension modal... (API needs to be connected)");
    };

    useEffect(() => {
        if (!booking.expectedEndTime) {
            return;
        }

        const updateTimer = () => {
            const end = new Date(booking.expectedEndTime).getTime();
            const now = new Date().getTime();
            const diff = end - now;
            if (diff <= -(8 * 60 * 60 * 1000)) {
                setTimeLeft("Expired");
                setTimerStatus("heavilyOverdue");
            }
            else if (diff <= 0) {
                setTimeLeft("Expired");
                setTimerStatus("expired");
            }

            else {
                const h = Math.floor(diff / (1000 * 60 * 60));
                const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const s = Math.floor((diff % (1000 * 60)) / 1000);

                setTimeLeft(
                    `${h.toString().padStart(2, '0')}h ` +
                    `${m.toString().padStart(2, '0')}m ` +
                    `${s.toString().padStart(2, '0')}s`
                );


                if (diff <= (2 * 60 * 60 * 1000)) {
                    setTimerStatus("canExtend");
                } else {
                    setTimerStatus("active");
                }
            }
        };

        updateTimer();
        const timer = setInterval(updateTimer, 1000);
        return () => clearInterval(timer);
    }, [booking.expectedEndTime]);

    const isActive = booking.bookingStatus === 'ACTIVE' || booking.bookingStatus === 'PAID';

    return (
        <Paper sx={{
            p: 4,
            borderRadius: 4,

            borderLeft: timerStatus === 'heavilyOverdue'
                ? '10px solid #dc2626'
                : timerStatus === 'expired'
                    ? '10px solid #f59e0b'
                    : '10px solid #2e7d32',
            mb: 2
        }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={3}>

                <Box>
                    <Typography variant="h3" fontWeight={900}>
                        Locker #{lockerId.slice(-4).toUpperCase()}
                    </Typography>

                    <Stack direction="row" spacing={1} alignItems="center" mt={1} mb={2}>
                        <LocationOnIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                        <Typography color="text.secondary" fontWeight={600}>
                            {locationString}
                        </Typography>
                    </Stack>

                    <Stack direction="row" spacing={1}>
                        <Chip
                            label={timerStatus === 'heavilyOverdue' ? "BLOCKED" : booking.bookingStatus || "UNKNOWN"}
                            color={timerStatus === 'heavilyOverdue' ? "error" : isActive ? "success" : "warning"}
                            sx={{ fontWeight: 700 }}
                        />
                        <Chip
                            label={`Size ${size}`}
                            variant="outlined"
                            sx={{ fontWeight: 700 }}
                        />
                    </Stack>
                </Box>

                <Stack alignItems={{ xs: 'flex-start', sm: 'flex-end' }} spacing={2} sx={{ maxWidth: { sm: '300px' } }}>

                    {timerStatus === 'heavilyOverdue' ? (
                        <Alert severity="error" sx={{ borderRadius: 2, '& .MuiAlert-message': { width: '100%' } }}>
                            <Typography variant="subtitle2" fontWeight={800}>
                                Booking heavily overdue.
                            </Typography>
                            <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                                Please collect your items immediately. Contact support to unlock your locker.
                            </Typography>
                        </Alert>
                    ) : (
                        <Box sx={{ p: 2, bgcolor: timerStatus === 'expired' ? '#fffbeb' : '#f0fdf4', borderRadius: 2, minWidth: '160px', textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={700}>
                                {timerStatus === 'expired' ? 'Expired in:' : 'Ends in:'}
                            </Typography>
                            <Typography variant="h5" fontWeight={800} color={timerStatus === 'expired' ? '#b45309' : '#166534'}>
                                {timeLeft}
                            </Typography>
                        </Box>
                    )}

                    {timerStatus === 'heavilyOverdue' ? (
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={() => alert("Redirecting to Support...")}
                            sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none', width: '100%' }}
                        >
                            Contact Support
                        </Button>
                    ) : timerStatus === 'expired' ? (
                        <Button
                            variant="contained"
                            color="warning"
                            onClick={() => bookingId && handlePayDebt(bookingId)}
                            sx={{ borderRadius: 2, fontWeight: 800, textTransform: 'none', bgcolor: '#f59e0b', width: '100%' }}
                        >
                            Pay Overdue Amount
                        </Button>
                    ) : (
                        <Stack direction="row" spacing={1} width="100%">
                            {timerStatus === 'canExtend' && (
                                <Button
                                    variant="contained"
                                    color="info"
                                    onClick={() => handleExtend(bookingId)}
                                    startIcon={<AccessTimeIcon />}
                                    sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none', flexGrow: 1 }}
                                >
                                    Extend
                                </Button>
                            )}
                            <Button
                                variant="outlined"
                                color="error"
                                onClick={() => bookingId && cancelBooking(bookingId)}
                                sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none', flexGrow: timerStatus === 'canExtend' ? 0 : 1 }}
                                disabled={!isActive}
                            >
                                Cancel
                            </Button>
                        </Stack>
                    )}

                </Stack>
            </Stack>
        </Paper>
    );
}