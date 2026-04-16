import React from 'react';
import Grid from '@mui/material/GridLegacy';
import { Paper, Typography, Box, Chip, Skeleton } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { lockersApi } from '../../../api/lockersApi';
import type { LockerBox, LockerStatus } from '../../../types/index';

interface LockersGridProps {
    stationId: string;
}

const getBorderColor = (status: LockerStatus): string => {
    switch (status) {
        case 'AVAILABLE':
            return '#4caf50';
        case 'RESERVED':
        case 'OCCUPIED':
            return '#ffa726';
        case 'FAULTY':
        case 'INACTIVE':
            return '#ef4444';
        default:
            return '#e0e0e0';
    }
};

const getChipColor = (status: LockerStatus): 'success' | 'warning' | 'default' => {
    switch (status) {
        case 'AVAILABLE':
            return 'success';
        case 'RESERVED':
        case 'OCCUPIED':
            return 'warning';
        default:
            return 'default';
    }
};

const LockersGrid: React.FC<LockersGridProps> = ({ stationId }) => {
    const { data: lockers = [], isLoading } = useQuery<LockerBox[]>({
        queryKey: ['lockers', stationId],
        queryFn: async () => {
            const all = await lockersApi.getAdminLockers();
            return all.filter(l => l.stationId === stationId);
        }
    });

    if (isLoading) {
        return (
            <Grid container spacing={2}>
                {[1, 2, 3, 4].map((i) => (
                    <Grid item xs={6} sm={4} md={3} key={i}>
                        <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 2 }} />
                    </Grid>
                ))}
            </Grid>
        );
    }

    return (
        <Grid container spacing={2}>
            {lockers.map((locker) => (
                <Grid item xs={6} sm={4} md={3} key={locker.lockerBoxId}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2,
                            textAlign: 'center',
                            border: '1px solid #e0e0e0',
                            borderRadius: 2,
                            borderTop: `4px solid ${getBorderColor(locker.status)}`
                        }}
                    >
                        <Typography variant="h6" fontWeight={700}>#{locker.code}</Typography>
                        <Typography variant="body2" color="text.secondary">Size: {locker.size}</Typography>

                        <Box mt={1}>
                            <Chip
                                label={locker.status}
                                size="small"
                                variant="outlined"
                                color={getChipColor(locker.status)}
                            />
                        </Box>
                    </Paper>
                </Grid>
            ))}

            {lockers.length === 0 && (
                <Box
                    sx={{
                        p: 4,
                        width: '100%',
                        textAlign: 'center',
                        bgcolor: '#f9f9f9',
                        borderRadius: 2
                    }}
                >
                    <Typography color="text.secondary">
                        No boxes configured for this station yet.
                    </Typography>
                </Box>
            )}
        </Grid>
    );
};

export default LockersGrid;