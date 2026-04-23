import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Button, IconButton
} from "@mui/material";
import RefreshIcon from '@mui/icons-material/Refresh';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import { useStations } from '../../../hooks/useStations';

export default function OperatorDashboardPage() {
    const navigate = useNavigate();
    const { stations, refresh, deleteStation } = useStations();

    return (
        <Box sx={{ maxWidth: '1100px', mx: 'auto', mt: 4 }}>
            <Typography variant="h4" fontWeight={900} textAlign="center" mb={1}>
                Operator Dashboard
            </Typography>
            <Typography color="text.secondary" textAlign="center" mb={4}>
                Manage station readiness, maintenance, and decommissioning.
            </Typography>

            <Paper sx={{ p: 3, borderRadius: 4, border: '1px solid #e2e8f0' }}>
                <Box display="flex" justifyContent="space-between" mb={3}>
                    <Typography variant="h6" fontWeight={800}>Assigned Stations</Typography>

                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={() => refresh()}
                        sx={{ color: '#6baf5c', borderColor: '#6baf5c', borderRadius: 2, fontWeight: 700 }}
                    >
                        REFRESH
                    </Button>
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
                            {stations.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                                        No stations assigned or found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                stations.map((s) => (
                                    <TableRow key={s.stationId}>
                                        <TableCell sx={{ fontWeight: 600 }}>
                                            {typeof s.city === 'string' ? s.city : (s.city?.name || 'N/A')}
                                        </TableCell>
                                        <TableCell>{s.address}</TableCell>
                                        <TableCell align="right">
                                            <Button
                                                size="small"
                                                variant="contained"
                                                onClick={() => navigate(`stations/${s.stationId}`)}
                                                sx={{ bgcolor: '#6baf5c', mr: 1, borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
                                            >
                                                Manage Lockers
                                            </Button>
                                            <IconButton
                                                onClick={() => {
                                                    if(window.confirm('Are you sure you want to delete this station?')) {
                                                        deleteStation(s.stationId);
                                                    }
                                                }}
                                                color="error"
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
}