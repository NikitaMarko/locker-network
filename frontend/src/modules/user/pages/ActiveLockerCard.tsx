import { useState, useEffect } from "react";
import { Paper, Box, Typography, Stack, Chip, Button, Alert, CircularProgress } from "@mui/material";
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import LockIcon from '@mui/icons-material/Lock';
import { useLockers } from "../../../hooks/useLockers.ts";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { stationsApi } from "../../../api/stationsApi.ts";
import { lockersApi } from "../../../api/lockersApi.ts";
import { useDeviceOperation } from "../../../hooks/useDeviceOperation.ts";

export function ActiveLockerCard({ locker: booking }: { locker: any }) {
    const { cancelBooking } = useLockers();
    const queryClient = useQueryClient();
    const { openLocker, closeLocker, isWorking, operationData, resetOperation } = useDeviceOperation();
    const [timeLeft, setTimeLeft] = useState(() => booking.expectedEndTime ? "Calculating..." : "No end time");
    const [timerStatus, setTimerStatus] = useState<"active" | "expired" | "heavilyOverdue" | "noTime">(() =>
        booking.expectedEndTime ? "active" : "noTime"
    );
    const [isLockerOpen, setIsLockerOpen] = useState(false);
    const [lastProcessedOp, setLastProcessedOp] = useState<string | null>(null);
    const [isCancelling, setIsCancelling] = useState(false);
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
    const lockerCode = booking.code || booking.lockerBox?.code || lockerData?.code || '???';
    const size = booking.size || booking.lockerBox?.size || lockerData?.size || 'N/A';

    // --- LOGIC IOT DEVICES ---
    if (operationData?.status === 'SUCCESS' && operationData.operationId !== lastProcessedOp) {
        setLastProcessedOp(operationData.operationId);
        if (operationData.type === 'LOCKER_OPEN') setIsLockerOpen(true);
        if (operationData.type === 'LOCKER_CLOSE') setIsLockerOpen(false);
    }

    useEffect(() => {
        if (operationData?.status === 'SUCCESS') {
            const timer = setTimeout(() => resetOperation(), 5000);
            return () => clearTimeout(timer);
        }
    }, [operationData?.status, resetOperation]);


    const handleCancel = async () => {
        if (!bookingId) return;
        if (!window.confirm("Are you sure you want to cancel this booking?")) return;

        setIsCancelling(true);
        try {
            await cancelBooking(bookingId);
            await queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
        } catch (error) {
            console.error("Cancel failed", error);
            alert("Could not cancel booking. Please try again.");
        } finally {
            setIsCancelling(false);
        }
    };

    const toggleLockerDevice = async () => {
        try {
            if (isLockerOpen) {
                await closeLocker(bookingId);
            } else {
                await openLocker(bookingId);
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        if (!booking.expectedEndTime) return;
        const updateTimer = () => {
            const end = new Date(booking.expectedEndTime).getTime();
            const now = new Date().getTime();
            const diff = end - now;
            if (diff <= -(8 * 60 * 60 * 1000)) { setTimerStatus("heavilyOverdue"); setTimeLeft("Expired"); }
            else if (diff <= 0) { setTimerStatus("expired"); setTimeLeft("Expired"); }
            else {
                const h = Math.floor(diff / 3600000);
                const m = Math.floor((diff % 3600000) / 60000);
                const s = Math.floor((diff % 60000) / 1000);
                setTimeLeft(`${h.toString().padStart(2, '0')}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`);
                setTimerStatus("active");
            }
        };
        updateTimer();
        const timer = setInterval(updateTimer, 1000);
        return () => clearInterval(timer);
    }, [booking.expectedEndTime]);

    const isActive = ['ACTIVE', 'PAID', 'PENDING'].includes(booking.bookingStatus);

    return (
        <Paper sx={{ p: 4, borderRadius: 4, borderLeft: timerStatus === 'heavilyOverdue' ? '10px solid #dc2626' : timerStatus === 'expired' ? '10px solid #f59e0b' : '10px solid #2e7d32', mb: 2 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={3}>
                <Box>
                    <Typography variant="h3" fontWeight={900}>Locker #{lockerCode}</Typography>
                    <Stack direction="row" spacing={1} alignItems="center" mt={1} mb={2}>
                        <LocationOnIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                        <Typography color="text.secondary" fontWeight={600}>{address}</Typography>
                    </Stack>
                    <Stack direction="row" spacing={1}>
                        <Chip label={timerStatus === 'heavilyOverdue' ? "BLOCKED" : booking.bookingStatus || "UNKNOWN"} color={timerStatus === 'heavilyOverdue' ? "error" : isActive ? "success" : "warning"} sx={{ fontWeight: 700 }} />
                        <Chip label={`Size ${size}`} variant="outlined" sx={{ fontWeight: 700 }} />
                    </Stack>
                </Box>

                <Stack alignItems={{ xs: 'stretch', md: 'flex-end' }} spacing={2} sx={{ minWidth: { md: '350px' } }}>
                    {timerStatus === 'heavilyOverdue' ? (
                        <Alert severity="error" sx={{ borderRadius: 2 }}><Typography variant="subtitle2" fontWeight={800}>Booking overdue.</Typography></Alert>
                    ) : (
                        <Box sx={{ p: 2, bgcolor: timerStatus === 'expired' ? '#fffbeb' : '#f0fdf4', borderRadius: 2, textAlign: 'center', width: '100%' }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={700}>{timerStatus === 'expired' ? 'Expired in:' : 'Ends in:'}</Typography>
                            <Typography variant="h5" fontWeight={800} color={timerStatus === 'expired' ? '#b45309' : '#166534'}>{timeLeft}</Typography>
                        </Box>
                    )}

                    {isActive && (
                        <Button
                            variant="contained" color={isLockerOpen ? "warning" : "success"} onClick={toggleLockerDevice} disabled={isWorking}
                            startIcon={isWorking ? <CircularProgress size={20} color="inherit" /> : (isLockerOpen ? <LockIcon /> : <LockOpenIcon />)}
                            sx={{ borderRadius: 2, fontWeight: 800, textTransform: 'none', py: 1.5, fontSize: '1.1rem', width: '100%' }}
                        >
                            {isWorking ? "Connecting..." : (isLockerOpen ? "Close Locker" : "Open Locker")}
                        </Button>
                    )}

                    <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
                        {timerStatus === 'expired' ? (
                            <Button variant="contained" color="warning" fullWidth sx={{ borderRadius: 2, fontWeight: 800 }}>Pay Overdue</Button>
                        ) : (
                            <>
                                <Button
                                    variant="contained" onClick={() => alert("Extend Modal")} startIcon={<AccessTimeIcon />}
                                    sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none', flex: 1, bgcolor: '#3b82f6', '&:hover': { bgcolor: '#2563eb' } }}
                                >
                                    Extend
                                </Button>
                                <Button
                                    variant="outlined" color="error" onClick={handleCancel} disabled={isCancelling}
                                    startIcon={isCancelling ? <CircularProgress size={16} color="inherit" /> : null}
                                    sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none', flex: 1 }}
                                >
                                    {isCancelling ? "Wait..." : "Cancel"}
                                </Button>
                            </>
                        )}
                    </Stack>
                </Stack>
            </Stack>
        </Paper>
    );
}