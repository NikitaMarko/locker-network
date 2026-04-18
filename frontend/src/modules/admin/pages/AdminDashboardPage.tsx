import { useState } from 'react';
import {
    Box, Typography, Button, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, Stack, Alert, MenuItem
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { useStations } from '../../../hooks/useStations';
import { useAuth } from '../../../hooks/useAuth';
import { ROLES } from '../../../config/roles/roles.ts';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../../api/apiClient';

const SUPPORTED_CITIES = [
    { code: 'PTK', name: 'Petah Tikva' },
    { code: 'TLV', name: 'Tel Aviv' },
    { code: 'JLM', name: 'Jerusalem' },
    { code: 'BNB', name: 'Bnei Brak' },
    { code: 'HLN', name: 'Holon' },
    { code: 'ASH', name: 'Ashdod' },
    { code: 'NTY', name: 'Netanya' },
    { code: 'RSL', name: 'Rishon LeZion' },
    { code: 'HFA', name: 'Haifa' },
    { code: 'B7',  name: 'Beer Sheva' },
    { code: 'TBR', name: 'Tiberias' },
    { code: 'NHR', name: 'Nahariya' }
];

export function AdminDashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { stations, createStation, deleteStation, refresh } = useStations();

    const [open, setOpen] = useState(false);
    const [formData, setFormData] = useState({ cityCode: '', address: '', latitude: '', longitude: '' });
    const [error, setError] = useState<string | null>(null);

    const [isReconciling, setIsReconciling] = useState(false);
    const [reconcileResult, setReconcileResult] = useState<any>(null);


    const handleCreate = async () => {
        setError(null);

        if (!formData.cityCode || !formData.address || !formData.latitude || !formData.longitude) {
            setError("All fields are required.");
            return;
        }

        try {
            await createStation({
                city: formData.cityCode,
                address: formData.address.trim(),
                latitude: Number(formData.latitude),
                longitude: Number(formData.longitude)
            });

            setOpen(false);
            setFormData({ cityCode: '', address: '', latitude: '', longitude: '' });

        } catch (e: any) {
            console.error("Errors create:", e);
            let backendMessage = "Unknown error occurred";
            if (e.response?.data?.message) {
                try {
                    const parsedError = JSON.parse(e.response.data.message);
                    if (Array.isArray(parsedError) && parsedError[0]?.message) {
                        backendMessage = parsedError[0].message;
                    } else {
                        backendMessage = e.response.data.message;
                    }
                } catch {
                    backendMessage = e.response.data.message;
                }
            } else if (e.message) {
                backendMessage = e.message;
            }

            setError(`Failed to create: ${backendMessage}`);
        }
    };

    const handleClose = () => {
        setOpen(false);
        setFormData({ cityCode: '', address: '', latitude: '', longitude: '' });
        setError(null);
    };


    const handleEmergencyUpdate = async () => {
        setIsReconciling(true);
        try {
            const response = await apiClient.post('/lockers/admin/cache/reconcile');
            setReconcileResult(response.data);
        } catch (e: any) {
            console.error("Reconciliation error:", e);
                setReconcileResult({
                success: false,
                error: e.response?.data || e.message
            });
        } finally {
            setIsReconciling(false);
            refresh();
        }
    };

    return (
        <Box sx={{ maxWidth: '1100px', mx: 'auto', mt: 4 }}>
            <Typography variant="h4" fontWeight={900} textAlign="center" mb={4}>System Overview</Typography>

            <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid #e2e8f0' }}>
                <Box display="flex" justifyContent="space-between" mb={3}>
                    <Typography variant="h6" fontWeight={800}>Active Stations</Typography>

                    <Stack direction="row" spacing={2}>
                        <Button
                            variant="outlined"
                            startIcon={<RefreshIcon />}
                            onClick={() => refresh()}
                            sx={{ color: '#6baf5c', borderColor: '#6baf5c', borderRadius: 2, fontWeight: 700 }}
                        >
                            REFRESH
                        </Button>

                       {user?.role === ROLES.ADMIN && (
                            <>
                                <Button
                                    variant="contained"
                                    startIcon={isReconciling ? <RefreshIcon sx={{ animation: 'spin 1s linear infinite' }} /> : <WarningAmberIcon />}
                                    onClick={handleEmergencyUpdate}
                                    disabled={isReconciling}
                                    sx={{
                                        bgcolor: '#e53935',
                                        borderRadius: 2,
                                        fontWeight: 700,
                                        '&:hover': { bgcolor: '#c62828' }
                                    }}
                                >
                                    {isReconciling ? 'SYNCING...' : 'EMERGENCY DB UPDATE'}
                                </Button>

                                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)} sx={{ bgcolor: '#6baf5c', borderRadius: 2, fontWeight: 700 }}>
                                    ADD NEW STATION
                                </Button>
                            </>
                        )}
                    </Stack>
                </Box>

                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700 }}>City</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Address</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {stations.map((s) => (
                                <TableRow key={s.stationId}>
                                    <TableCell sx={{ fontWeight: 600 }}>
                                        {typeof s.city === 'string' ? s.city : (s.city?.name || 'N/A')}
                                    </TableCell>
                                    <TableCell>{s.address}</TableCell>
                                    <TableCell align="right">
                                        <Button size="small" variant="contained" onClick={() => navigate(`stations/${s.stationId}`)} sx={{ bgcolor: '#6baf5c', mr: 1, borderRadius: 2 }}>
                                            Manage
                                        </Button>

                                        {user?.role === ROLES.OPERATOR && (
                                            <IconButton onClick={() => deleteStation(s.stationId)} color="error">
                                                <DeleteIcon />
                                            </IconButton>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>


            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
                <DialogTitle sx={{ fontWeight: 800 }}>Create New Station</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        {error && (
                            <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
                        )}

                        <TextField
                            select
                            label="City"
                            fullWidth
                            value={formData.cityCode}
                            onChange={e => {
                                setFormData({...formData, cityCode: e.target.value});
                                if (error) setError(null);
                            }}
                        >
                            {SUPPORTED_CITIES.map((city) => (
                                <MenuItem key={city.code} value={city.code}>
                                    {city.name}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            label="Address"
                            fullWidth
                            value={formData.address}
                            onChange={e => setFormData({...formData, address: e.target.value})}
                        />
                        <Stack direction="row" spacing={2}>
                            <TextField
                                label="Lat"
                                type="number"
                                inputProps={{ step: "any" }}
                                value={formData.latitude}
                                onChange={e => setFormData({...formData, latitude: e.target.value})}
                            />
                            <TextField
                                label="Lng"
                                type="number"
                                inputProps={{ step: "any" }}
                                value={formData.longitude}
                                onChange={e => setFormData({...formData, longitude: e.target.value})}
                            />
                        </Stack>
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={handleClose} sx={{ color: '#64748b', fontWeight: 700 }}>CANCEL</Button>
                    <Button onClick={handleCreate} variant="contained" sx={{ bgcolor: '#6baf5c', fontWeight: 700 }}>CREATE</Button>
                </DialogActions>
            </Dialog>


            <Dialog open={!!reconcileResult} onClose={() => setReconcileResult(null)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 800, color: reconcileResult?.success === false ? '#e53935' : '#1e293b' }}>
                    Reconciliation Result
                </DialogTitle>
                <DialogContent>
                    <Paper
                        elevation={0}
                        sx={{
                            bgcolor: '#1e293b',
                            color: reconcileResult?.success === false ? '#ef4444' : '#10b981',
                            p: 2,
                            borderRadius: 2,
                            overflowX: 'auto'
                        }}
                    >
                        <pre style={{ margin: 0, fontFamily: 'monospace', fontSize: '14px' }}>
                            {JSON.stringify(reconcileResult, null, 2)}
                        </pre>
                    </Paper>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setReconcileResult(null)} variant="contained" sx={{ bgcolor: '#6baf5c', fontWeight: 700 }}>
                        CLOSE
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}