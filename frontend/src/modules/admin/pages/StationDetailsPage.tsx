import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box, Typography, Button, Paper, Chip,
    Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, MenuItem, Stack
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { stationsApi } from '../../../api/stationsApi';
import { useAuth } from '../../../hooks/useAuth';
import { ROLES } from '../../../config/roles/roles';
import { useLockers } from '../../../hooks/useLockers';
import type { LockerStation } from '../../../types/index';

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

export default function StationDetailsPage() {
    const { stationId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { changeLockerStatus } = useLockers();
    const queryClient = useQueryClient();

    const [open, setOpen] = useState(false);
    const [lockerData, setLockerData] = useState({
        code: '',
        size: 'M' as 'S' | 'M' | 'L'
    });

    const { data: station, isLoading } = useQuery<LockerStation>({
        queryKey: ["station-details", stationId],
        queryFn: () => stationsApi.getAdminStationById(stationId!),
        enabled: !!stationId
    });

    console.log("STATION DATA:", station);
    console.log("LOCKERS:", station?.lockers);

    const handleAdd = async () => {
        if (!stationId || !lockerData.code) return;
        await stationsApi.addLocker({
            stationId,
            code: lockerData.code,
            size: lockerData.size
        });
        queryClient.invalidateQueries({ queryKey: ["station-details", stationId] });
        setOpen(false);
        setLockerData({ code: '', size: 'M' });
    };

    if (isLoading) return <Typography>Loading...</Typography>;

    return (
        <Box>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)}>
                BACK
            </Button>

            <Box display="flex" alignItems="center" justifyContent="space-between" mt={2}>
                <Typography variant="h4" fontWeight={900}>
                    {station?.address}
                </Typography>

                {user?.role === ROLES.ADMIN && (
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setOpen(true)}
                    >
                        Add Locker
                    </Button>
                )}
            </Box>

            <Grid container spacing={2} mt={2}>
                {station?.lockers?.map((locker) => (
                    <Grid item xs={12} sm={6} md={3} key={locker.lockerBoxId}>
                        <Paper sx={{ p: 2 }}>
                            <Typography fontWeight={700}>
                                Box #{locker.code}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Size: {locker.size}
                            </Typography>

                            <Chip
                                label={locker.status}
                                color={getChipColor(locker.status)}
                                sx={{ mt: 1 }}
                                size="small"
                            />

                            {user?.role === ROLES.ADMIN && (
                                <Box mt={2} display="flex" flexDirection="column" gap={1}>
                                    {/* READY → ACTIVE */}
                                    {locker.status === "READY" && (
                                        <Button
                                            variant="contained"
                                            color="success"
                                            size="small"
                                            onClick={() => changeLockerStatus({
                                                lockerBoxId: locker.lockerBoxId,
                                                status: "ACTIVE"
                                            })}
                                        >
                                            Activate
                                        </Button>
                                    )}

                                    {/* ACTIVE → MAINTENANCE */}
                                    {locker.status === "ACTIVE" && (
                                        <Button
                                            variant="contained"
                                            color="error"
                                            size="small"
                                            onClick={() => changeLockerStatus({
                                                lockerBoxId: locker.lockerBoxId,
                                                status: "MAINTENANCE"
                                            })}
                                        >
                                            → Maintenance
                                        </Button>
                                    )}

                                    {/* INACTIVE — ждём оператора */}
                                    {locker.status === "INACTIVE" && (
                                        <Typography variant="caption" color="text.secondary">
                                            Awaiting operator activation
                                        </Typography>
                                    )}

                                    {/* MAINTENANCE — ждём оператора */}
                                    {locker.status === "MAINTENANCE" && (
                                        <Typography variant="caption" color="text.secondary">
                                            Awaiting operator repair
                                        </Typography>
                                    )}
                                </Box>
                            )}
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Add Locker</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField
                            label="Code (e.g. A-101)"
                            value={lockerData.code}
                            onChange={(e) => setLockerData({ ...lockerData, code: e.target.value })}
                            fullWidth
                            required
                        />
                        <TextField
                            select
                            label="Size"
                            value={lockerData.size}
                            onChange={(e) => setLockerData({ ...lockerData, size: e.target.value as 'S' | 'M' | 'L' })}
                            fullWidth
                        >
                            <MenuItem value="S">Small (S)</MenuItem>
                            <MenuItem value="M">Medium (M)</MenuItem>
                            <MenuItem value="L">Large (L)</MenuItem>
                        </TextField>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button
                        onClick={handleAdd}
                        variant="contained"
                        disabled={!lockerData.code}
                    >
                        Add
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}