import React from 'react';
import Grid from '@mui/material/GridLegacy';
import { Paper, Typography, Box, Chip, Button } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { lockersApi } from '../../../api/lockersApi';
import { useLockers } from '../../../hooks/useLockers';
import { useAuth } from '../../../hooks/useAuth';
import type { LockerBox } from '../../../types/index';

interface LockersGridProps {
    stationId: string;
}

const getChipColor = (status: string): "success" | "warning" | "default" | "error" => {
    switch (status) {
        case "ACTIVE":      return "success";
        case "READY":       return "warning";
        case "MAINTENANCE": return "error";
        case "FAULTY":      return "error";
        case "INACTIVE":    return "default";
        default:            return "default";
    }
};

const LockersGrid: React.FC<LockersGridProps> = ({ stationId }) => {
    const { data: lockers = [] } = useQuery<LockerBox[]>({
        queryKey: ['lockers', stationId],
        queryFn: async () => {
            const all = await lockersApi.getAdminLockers();
            return all.filter(l => l.stationId === stationId);
        }
    });

    const { user } = useAuth();
    const { setReady, activate, setMaintenance } = useLockers();

    return (
        <Grid container spacing={2}>
            {lockers.map((locker) => (
                <Grid item xs={6} sm={4} md={3} key={locker.lockerBoxId}>
                    <Paper sx={{ p: 2, borderRadius: 2 }}>
                        <Typography variant="h6">
                            Box #{locker.code}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Size: {locker.size}
                        </Typography>

                        <Chip
                            label={locker.status}
                            color={getChipColor(locker.status)}
                            size="small"
                            sx={{ mt: 1 }}
                        />

                        <Box mt={2} display="flex" flexDirection="column" gap={1}>
                            {/* OPERATOR: INACTIVE → READY */}
                            {user?.role === "OPERATOR" && locker.techStatus === "INACTIVE" && (
                                <Button
                                    variant="contained"
                                    size="small"
                                    onClick={() => setReady(locker.lockerBoxId)}
                                >
                                    Set READY
                                </Button>
                            )}

                            {/* OPERATOR: MAINTENANCE → READY */}
                            {user?.role === "OPERATOR" && locker.techStatus === "MAINTENANCE" && (
                                <Button
                                    variant="contained"
                                    size="small"
                                    onClick={() => setReady(locker.lockerBoxId)}
                                >
                                    Repair → READY
                                </Button>
                            )}

                            {/* ADMIN: READY → ACTIVE */}
                            {user?.role === "ADMIN" && locker.techStatus === "READY" && (
                                <Button
                                    variant="contained"
                                    color="success"
                                    size="small"
                                    onClick={() => activate(locker.lockerBoxId)}
                                >
                                    Activate
                                </Button>
                            )}

                            {/* ADMIN: ACTIVE → MAINTENANCE */}
                            {user?.role === "ADMIN" && locker.techStatus === "ACTIVE" && (
                                <Button
                                    variant="contained"
                                    color="error"
                                    size="small"
                                    onClick={() => setMaintenance(locker.lockerBoxId)}
                                >
                                    → Maintenance
                                </Button>
                            )}

                            {/* ADMIN: INACTIVE — ждём оператора */}
                            {user?.role === "ADMIN" && locker.techStatus === "INACTIVE" && (
                                <Typography variant="caption" color="text.secondary">
                                    Awaiting operator activation
                                </Typography>
                            )}

                            {/* ADMIN: MAINTENANCE — ждём оператора */}
                            {user?.role === "ADMIN" && locker.techStatus === "MAINTENANCE" && (
                                <Typography variant="caption" color="text.secondary">
                                    Awaiting operator repair
                                </Typography>
                            )}
                        </Box>
                    </Paper>
                </Grid>
            ))}
        </Grid>
    );
};

export default LockersGrid;