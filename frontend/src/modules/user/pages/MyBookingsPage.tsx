import { Box, Typography, Button, Stack, Paper, CircularProgress } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import { lockersApi } from "../../../api/lockersApi";
import { ActiveLockerCard } from "./ActiveLockerCard.tsx";
import type { LockerBox } from "../../../types/index"; // Обновили путь к типу
import {Paths} from "../../../config/paths/paths.ts";

export default function MyBookingsPage() {
    const navigate = useNavigate();

    const { data: lockers = [], isLoading } = useQuery<LockerBox[]>({
        queryKey: ['my-bookings'],
        // Обернули в стрелочную функцию, чтобы починить ошибку No overload matches this call
        queryFn: () => lockersApi.getLockers()
    });

    // Защита для TypeScript, чтобы метод .filter гарантированно работал
    const safeLockers = Array.isArray(lockers) ? lockers : [];

    // Статусы пока не трогаем, логика сохранена полностью
    const reservedLockers = safeLockers.filter(
        (l) => l.status === "OCCUPIED" || (l as any).status === "RESERVED"
    );

    if (isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', pt: 20 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ pt: '100px', px: 4, maxWidth: '900px', margin: '0 auto', pb: 10 }}>
            <Typography variant="h3" fontWeight={900} mb={5}>My Bookings</Typography>

            {reservedLockers.length > 0 ? (
                <Stack spacing={2}>
                    {reservedLockers.map((locker) => (
                        <ActiveLockerCard key={locker.lockerBoxId} locker={locker} />
                    ))}
                </Stack>
            ) : (
                <Paper sx={{
                    p: 8, textAlign: 'center', borderRadius: 8, bgcolor: 'white',
                    border: '2px dashed #e2e8f0', boxShadow: 'none'
                }}>
                    <Stack alignItems="center" spacing={3}>
                        <SentimentDissatisfiedIcon sx={{ fontSize: 60, color: '#94a3b8' }} />
                        <Typography variant="h5" fontWeight={800} color="text.primary">
                            No active bookings found
                        </Typography>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={() => navigate(Paths.USER)}
                            sx={{ borderRadius: 4, px: 5, py: 1.5, fontWeight: 800, textTransform: 'none' }}
                        >
                            Find a Station
                        </Button>
                    </Stack>
                </Paper>
            )}
        </Box>
    );
}