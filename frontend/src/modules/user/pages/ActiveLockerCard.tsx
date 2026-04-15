import { useState, useEffect } from "react";
import { Paper, Box, Typography, Stack, Chip, Button } from "@mui/material";
import LocationOnIcon from '@mui/icons-material/LocationOn';
import {useLockers} from "../../../hooks/useLockers.ts";


export function ActiveLockerCard({ locker }: { locker: any }) {
    const { cancelBooking } = useLockers();
    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
        const timer = setInterval(() => {
            const diff = (locker.reservedUntil || 0) - Date.now();
            if (diff <= 0) setTimeLeft("Expired");
            else setTimeLeft(`${Math.floor(diff/3600000)}h ${Math.floor((diff/60000)%60)}m`);
        }, 1000);
        return () => clearInterval(timer);
    }, [locker.reservedUntil]);

    return (
        <Paper sx={{ p: 4, borderRadius: 4, borderLeft: '10px solid #2e7d32' }}>
            <Stack direction="row" justifyContent="space-between">
                <Box>
                    <Typography variant="h2" fontWeight={900}>#{locker.code}</Typography>
                    <Stack direction="row" spacing={1}><LocationOnIcon /> <Typography>{locker.status}</Typography></Stack>
                    <Chip label={locker.size} />
                </Box>
                <Box sx={{ p: 2, bgcolor: '#f0fdf4', borderRadius: 2 }}>
                    <Typography variant="caption">Ends in:</Typography>
                    <Typography variant="h5" fontWeight={800}>{timeLeft}</Typography>
                </Box>
            </Stack>
            <Button color="error" onClick={() => cancelBooking(locker.lockerBoxId)}>Cancel</Button>
        </Paper>
    );
}