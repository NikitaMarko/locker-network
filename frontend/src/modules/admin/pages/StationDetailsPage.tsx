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
import { getTechnicalStatus } from "../../../types/index";

const getChipColor = (status: string): "success" | "warning" | "default" | "error" => {
    switch (status) {
        case "ACTIVE": return "success";
        case "READY": return "warning";
        case "MAINTENANCE":
        case "FAULTY": return "error";
        case "INACTIVE": return "default";
        default: return "default";
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

            <Box display="flex" justifyContent="space-between" mt={2}>
                <Typography variant="h4" fontWeight={900}>
                    {station?.address}
                </Typography>

                {user?.role === ROLES.ADMIN && (
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
                        Add Locker
                    </Button>
                )}
            </Box>

            <Grid container spacing={2} mt={2}>
                {station?.lockers?.map((locker) => {
                    const tech = getTechnicalStatus(locker.status);

                    return (
                        <Grid item xs={12} sm={6} md={3} key={locker.lockerBoxId}>
                            <Paper sx={{ p: 2 }}>
                                <Typography fontWeight={700}>
                                    Box #{locker.code}
                                </Typography>

                                <Chip
                                    label={tech}
                                    color={getChipColor(tech)}
                                    sx={{ mt: 1 }}
                                    size="small"
                                />

                                {user?.role === ROLES.ADMIN && (
                                    <Box mt={2} display="flex" flexDirection="column" gap={1}>

                                        {tech === "READY" && (
                                            <Button
                                                variant="contained"
                                                color="success"
                                                size="small"
                                                onClick={() =>
                                                    changeLockerStatus({
                                                        lockerBoxId: locker.lockerBoxId,
                                                        status: "ACTIVE"
                                                    })
                                                }
                                            >
                                                Activate
                                            </Button>
                                        )}

                                        {tech === "ACTIVE" && (
                                            <Button
                                                variant="contained"
                                                color="error"
                                                size="small"
                                                onClick={() =>
                                                    changeLockerStatus({
                                                        lockerBoxId: locker.lockerBoxId,
                                                        status: "MAINTENANCE"
                                                    })
                                                }
                                            >
                                                → Maintenance
                                            </Button>
                                        )}

                                        {tech === "INACTIVE" && (
                                            <Typography variant="caption">
                                                Awaiting operator activation
                                            </Typography>
                                        )}

                                        {tech === "MAINTENANCE" && (
                                            <Typography variant="caption">
                                                Awaiting operator repair
                                            </Typography>
                                        )}
                                    </Box>
                                )}
                            </Paper>
                        </Grid>
                    );
                })}
            </Grid>

            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Add Locker</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField
                            label="Code"
                            value={lockerData.code}
                            onChange={(e) =>
                                setLockerData({ ...lockerData, code: e.target.value })
                            }
                            fullWidth
                        />
                        <TextField
                            select
                            label="Size"
                            value={lockerData.size}
                            onChange={(e) =>
                                setLockerData({
                                    ...lockerData,
                                    size: e.target.value as 'S' | 'M' | 'L'
                                })
                            }
                        >
                            <MenuItem value="S">S</MenuItem>
                            <MenuItem value="M">M</MenuItem>
                            <MenuItem value="L">L</MenuItem>
                        </TextField>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleAdd} variant="contained">
                        Add
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}