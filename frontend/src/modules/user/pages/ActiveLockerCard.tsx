import { useState, useEffect } from "react";
import { Paper, Box, Typography, Stack, Chip, Button, Alert, CircularProgress } from "@mui/material";
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockIcon from '@mui/icons-material/Lock';
import { useLockers } from "../../../hooks/useLockers.ts";
import { apiClient } from "../../../api/apiClient.ts";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { stationsApi } from "../../../api/stationsApi.ts";
import { lockersApi } from "../../../api/lockersApi.ts";

export function ActiveLockerCard({ locker: booking }: { locker: any }) {
    const { cancelBooking } = useLockers();
    const queryClient = useQueryClient();

    const [timeLeft, setTimeLeft] = useState(() => booking.expectedEndTime ? "Calculating..." : "No end time");
    const [timerStatus, setTimerStatus] = useState<"active" | "expired" | "heavilyOverdue" | "noTime">(() =>
        booking.expectedEndTime ? "active" : "noTime"
    );
    const [isLockerOpen, setIsLockerOpen] = useState(false);
    const [deviceLoading, setDeviceLoading] = useState(false);
    const bookingId = booking.bookingId || booking.id;
    const stationId = booking.stationId || booking.station?.id;
    const lockerBoxId = booking.lockerBoxId || booking.lockerBox?.id;

    const { data: stationData } = useQuery({
        queryKey: ['station-details', stationId],
        queryFn: () => stationsApi.getStationById(stationId!),
        enabled: !!stationId && !booking.station?.address
    });

    const { data: lockerData } = useQuery({
        queryKey: ['locker-details', lockerBoxId],
        queryFn: () => lockersApi.getLockerById(lockerBoxId!),
        enabled: !!lockerBoxId && !booking.size
    });

    const address = booking.station?.address || stationData?.address || `Station ID: ${stationId?.slice(-6).toUpperCase() || 'N/A'}`;
    const lockerCode = booking.code || booking.lockerBox?.code || lockerData?.code || lockerBoxId?.slice(-4).toUpperCase() || '???';
    const size = booking.size || booking.lockerBox?.size || lockerData?.size || 'N/A';
    const handlePayDebt = (bId: string) => {
        console.log("Pay debt for", bId);
        alert("Redirecting to Stripe to pay the debt...");
    };

    const handleExtend = (bId: string) => {
        console.log("Extend for", bId);
        alert("Opening extension modal...");
    };

    const toggleLockerDevice = async () => {
        setDeviceLoading(true);
        try {
            if (isLockerOpen) {

                await apiClient.post('/devices/close-locker', { bookingId });
                setIsLockerOpen(false);
            } else {
                await apiClient.post('/devices/open-locker', { bookingId });
                setIsLockerOpen(true);
            }
        } catch (error) {
            console.error("Device operation failed", error);
            alert("Failed to communicate with the locker device.");
        } finally {
            setDeviceLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!bookingId) return;
        try {
            await cancelBooking(bookingId);
            queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
        } catch (error) {
            console.error("Failed to cancel", error);
            alert("Could not cancel booking.");
        }
    };

    useEffect(() => {
        if (!booking.expectedEndTime) return;

        const updateTimer = () => {
            const end = new Date(booking.expectedEndTime).getTime();
            const now = new Date().getTime();
            const diff = end - now;

            if (diff <= -(8 * 60 * 60 * 1000)) {
                setTimeLeft("Expired");
                setTimerStatus("heavilyOverdue");
            } else if (diff <= 0) {
                setTimeLeft("Expired");
                setTimerStatus("expired");
            } else {
                const h = Math.floor(diff / (1000 * 60 * 60));
                const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const s = Math.floor((diff % (1000 * 60)) / 1000);

                setTimeLeft(
                    `${h.toString().padStart(2, '0')}h ` +
                    `${m.toString().padStart(2, '0')}m ` +
                    `${s.toString().padStart(2, '0')}s`
                );
                setTimerStatus("active");
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
            borderLeft: timerStatus === 'heavilyOverdue' ? '10px solid #dc2626' : timerStatus === 'expired' ? '10px solid #f59e0b' : '10px solid #2e7d32',
            mb: 2
        }}>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={3}>

                <Box>
                    <Typography variant="h3" fontWeight={900}>
                        Locker #{lockerCode}
                    </Typography>

                    <Stack direction="row" spacing={1} alignItems="center" mt={1} mb={2}>
                        <LocationOnIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                        <Typography color="text.secondary" fontWeight={600}>
                            {address}
                        </Typography>
                    </Stack>

                    <Stack direction="row" spacing={1}>
                        <Chip label={timerStatus === 'heavilyOverdue' ? "BLOCKED" : booking.bookingStatus || "UNKNOWN"} color={timerStatus === 'heavilyOverdue' ? "error" : isActive ? "success" : "warning"} sx={{ fontWeight: 700 }} />
                        <Chip label={`Size ${size}`} variant="outlined" sx={{ fontWeight: 700 }} />
                    </Stack>
                </Box>

                <Stack alignItems={{ xs: 'stretch', md: 'flex-end' }} spacing={2} sx={{ minWidth: { md: '320px' } }}>

                    {timerStatus === 'heavilyOverdue' ? (
                        <Alert severity="error" sx={{ borderRadius: 2 }}>
                            <Typography variant="subtitle2" fontWeight={800}>Booking heavily overdue.</Typography>
                            <Typography variant="caption">Please collect your items immediately. Contact support.</Typography>
                        </Alert>
                    ) : (
                        <Box sx={{ p: 2, bgcolor: timerStatus === 'expired' ? '#fffbeb' : '#f0fdf4', borderRadius: 2, textAlign: 'center' }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={700}>
                                {timerStatus === 'expired' ? 'Expired in:' : 'Ends in:'}
                            </Typography>
                            <Typography variant="h5" fontWeight={800} color={timerStatus === 'expired' ? '#b45309' : '#166534'}>
                                {timeLeft}
                            </Typography>
                        </Box>
                    )}

                    {timerStatus !== 'heavilyOverdue' && isActive && (
                        <Button
                            variant="contained"
                            color={isLockerOpen ? "warning" : "success"}
                            onClick={toggleLockerDevice}
                            disabled={deviceLoading}
                            startIcon={deviceLoading ? <CircularProgress size={20} color="inherit" /> : (isLockerOpen ? <LockIcon /> : <LockOpenIcon />)}
                            sx={{ borderRadius: 2, fontWeight: 800, textTransform: 'none', py: 1.5, fontSize: '1.1rem' }}
                        >
                            {isLockerOpen ? "Close Locker" : "Open Locker"}
                        </Button>
                    )}

                    {timerStatus === 'heavilyOverdue' ? (
                        <Button variant="outlined" color="error" onClick={() => alert("Contacting Support...")} sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}>
                            Contact Support
                        </Button>
                    ) : timerStatus === 'expired' ? (
                        <Button variant="contained" color="warning" onClick={() => handlePayDebt(bookingId)} sx={{ borderRadius: 2, fontWeight: 800, textTransform: 'none' }}>
                            Pay Overdue Amount
                        </Button>
                    ) : (
                        <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
                            <Button
                                variant="contained"
                                color="info"
                                onClick={() => handleExtend(bookingId)}
                                startIcon={<AccessTimeIcon />}
                                sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none', flex: 1 }}
                            >
                                Extend
                            </Button>

                            <Button
                                variant="outlined"
                                color="error"
                                onClick={handleCancel}
                                disabled={!isActive}
                                sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none', flex: 1 }}
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