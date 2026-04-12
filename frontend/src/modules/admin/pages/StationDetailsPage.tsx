import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Paper, Grid, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Stack } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import { useQuery } from '@tanstack/react-query';
import { stationsApi } from '../../../api/stationsApi';
import { useStations } from '../../../hooks/useStations';
import { useAuth } from '../../../hooks/useAuth';
import { ROLES } from '../../../config/roles/roles.ts';

export default function StationDetailsPage() {
    const { stationId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { addLocker } = useStations();
    const [open, setOpen] = useState(false);
    const [lockerData, setLockerData] = useState({ code: '', size: 'M' as 'S' | 'M' | 'L' });

    const { data: station, isLoading } = useQuery({
        queryKey: ["station-details", stationId],
        queryFn: () => stationsApi.getStationById(stationId!),
        enabled: !!stationId
    });

    const handleAdd = async () => {
        if (!stationId) return;
        try {

            await addLocker({
                stationId: stationId,
                code: lockerData.code,
                size: lockerData.size
            });
            setOpen(false);
            setLockerData({ code: '', size: 'M' });
        } catch (e) {
            console.error("Ошибка добавления бокса:", e);
        }
    };

    if (isLoading) return <Typography>Loading...</Typography>;

    return (
        <Box>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 4, color: '#64748b', fontWeight: 700 }}>BACK</Button>

            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Box>
                    <Typography variant="h4" fontWeight={900}>{station?.address}</Typography>
                    <Typography color="text.secondary" fontWeight={600}>
                        {typeof station?.city === 'string' ? station.city : (station?.city?.name || 'Unknown')}
                    </Typography>
                </Box>
                {user?.role === ROLES.ADMIN && (
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)} sx={{ bgcolor: '#6baf5c', fontWeight: 700 }}>
                        ADD BOX
                    </Button>
                )}
            </Box>

            <Grid container spacing={2}>
                {station?.lockers?.map((locker: any) => (
                    <Grid size={{ xs: 12, sm: 6, md: 3 }} key={locker.lockerBoxId}>
                        <Paper sx={{ p: 3, borderRadius: 3, border: '1px solid #e2e8f0', textAlign: 'center' }}>
                            <Typography variant="h6" fontWeight={800}>Box #{locker.code}</Typography>
                            <Typography variant="body2" color="text.secondary" mb={1}>Size: {locker.size}</Typography>
                            <Chip label={locker.status} size="small" sx={{ bgcolor: locker.status === 'AVAILABLE' ? '#6baf5c' : '#ef4444', color: 'white', fontWeight: 700 }} />
                        </Paper>
                    </Grid>
                ))}
            </Grid>

            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs">
                <DialogTitle sx={{ fontWeight: 800 }}>Add Locker Box</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <TextField
                            label="Box Code (e.g. A007)"
                            fullWidth
                            value={lockerData.code}
                            onChange={e => setLockerData({...lockerData, code: e.target.value})}
                        />
                        <TextField
                            select
                            label="Size"
                            fullWidth
                            value={lockerData.size}
                            onChange={e => setLockerData({...lockerData, size: e.target.value as any})}
                        >
                            <MenuItem value="S">Small</MenuItem>
                            <MenuItem value="M">Medium</MenuItem>
                            <MenuItem value="L">Large</MenuItem>
                        </TextField>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setOpen(false)} sx={{ color: '#64748b', fontWeight: 700 }}>CANCEL</Button>
                    <Button onClick={handleAdd} variant="contained" sx={{ bgcolor: '#6baf5c', fontWeight: 700 }}>ADD</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}