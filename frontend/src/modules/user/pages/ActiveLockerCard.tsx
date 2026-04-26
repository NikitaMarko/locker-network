import { useState, useEffect } from "react";
import { Paper, Box, Typography, Stack, Chip, Button } from "@mui/material";
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useLockers } from "../../../hooks/useLockers.ts";

export function ActiveLockerCard({ locker: booking }: { locker: any }) {
    const { cancelBooking } = useLockers();
    const [timeLeft, setTimeLeft] = useState(() =>
        booking.expectedEndTime ? "Calculating..." : "No end time"
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
        console.log(">>> Инициирована оплата задолженности для брони:", bId);
        alert("Redirecting to Stripe to pay the debt... (API needs to be connected)");
    };


    useEffect(() => {
        if (!booking.expectedEndTime) {
            return;
        }

        const updateTimer = () => {
            const end = new Date(booking.expectedEndTime).getTime();
            const now = new Date().getTime();
            const diff = end - now;

            if (diff <= 0) {
                setTimeLeft("Expired");
            } else {
                const h = Math.floor(diff / (1000 * 60 * 60));
                const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const s = Math.floor((diff % (1000 * 60)) / 1000);

                setTimeLeft(
                    `${h.toString().padStart(2, '0')}h ` +
                    `${m.toString().padStart(2, '0')}m ` +
                    `${s.toString().padStart(2, '0')}s`
                );
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
            borderLeft: isActive ? '10px solid #2e7d32' : '10px solid #f59e0b',
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
                            label={booking.bookingStatus || "UNKNOWN"}
                            color={isActive ? "success" : "warning"}
                            sx={{ fontWeight: 700 }}
                        />
                        <Chip
                            label={`Size ${size}`}
                            variant="outlined"
                            sx={{ fontWeight: 700 }}
                        />
                    </Stack>
                </Box>


                <Stack alignItems={{ xs: 'flex-start', sm: 'flex-end' }} spacing={2}>


                    <Box sx={{ p: 2, bgcolor: isActive ? '#f0fdf4' : '#fffbeb', borderRadius: 2, minWidth: '160px', textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={700}>
                            {isActive ? 'Ends in:' : 'Expires in:'}
                        </Typography>
                        <Typography variant="h5" fontWeight={800} color={isActive ? '#166534' : '#b45309'}>
                            {timeLeft}
                        </Typography>
                    </Box>


                    {timeLeft === "Expired" ? (
                        <Button
                            variant="contained"
                            color="warning"
                            onClick={() => bookingId && handlePayDebt(bookingId)}
                            sx={{ borderRadius: 2, fontWeight: 800, textTransform: 'none', bgcolor: '#f59e0b' }}
                        >
                            Pay Overdue Amount
                        </Button>
                    ) : (
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={() => {
                                if (bookingId) cancelBooking(bookingId);
                                else console.error("No bookingId found to cancel!");
                            }}
                            sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
                            disabled={!isActive}
                        >
                            Cancel Booking
                        </Button>
                    )}

                </Stack>
            </Stack>
        </Paper>
    );
}