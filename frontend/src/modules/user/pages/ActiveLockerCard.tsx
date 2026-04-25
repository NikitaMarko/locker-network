import { useState, useEffect } from "react";
import { Paper, Box, Typography, Stack, Chip, Button } from "@mui/material";
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useLockers } from "../../../hooks/useLockers.ts";

export function ActiveLockerCard({ locker: booking }: { locker: any }) {
    const { cancelBooking } = useLockers();
    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
        if (!booking.expectedEndTime) return;

        const timer = setInterval(() => {
            const end = new Date(booking.expectedEndTime).getTime();
            const diff = end - Date.now();

            if (diff <= 0) {
                setTimeLeft("Expired");
            } else {
                const h = Math.floor(diff / 3600000);
                const m = Math.floor((diff / 60000) % 60);
                const s = Math.floor((diff / 1000) % 60);
                setTimeLeft(`${h}h ${m}m ${s}s`);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [booking.expectedEndTime]);


    const isActive = booking.bookingStatus === 'ACTIVE';

    return (
        <Paper sx={{
            p: 4,
            borderRadius: 4,
            borderLeft: isActive ? '10px solid #2e7d32' : '10px solid #f59e0b'
        }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={3}>
                <Box>
                    <Typography variant="h3" fontWeight={900}>
                        Locker #{booking.lockerBoxId ? booking.lockerBoxId.slice(-4).toUpperCase() : '???'}
                    </Typography>

                    <Stack direction="row" spacing={1} alignItems="center" mt={1} mb={2}>
                        <LocationOnIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                        <Typography color="text.secondary" fontWeight={600}>
                            Station ID: {booking.stationId ? booking.stationId.slice(-6).toUpperCase() : 'N/A'}
                        </Typography>
                    </Stack>

                    <Stack direction="row" spacing={1}>

                        <Chip
                            label={booking.bookingStatus || "UNKNOWN"}
                            color={isActive ? "success" : "warning"}
                            sx={{ fontWeight: 700 }}
                        />
                        <Chip
                            label={`Size ${booking.size}`}
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
                            {timeLeft || "Calculating..."}
                        </Typography>
                    </Box>

                    <Button
                        variant="outlined"
                        color="error"
                        onClick={() => cancelBooking(booking.bookingId)}
                        sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
                    >
                        Cancel Booking
                    </Button>
                </Stack>
            </Stack>
        </Paper>
    );
}