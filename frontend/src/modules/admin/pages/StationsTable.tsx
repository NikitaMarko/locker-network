import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    DataGrid,
    type GridColDef,
} from '@mui/x-data-grid';
import {
    Button,
    Chip,
    IconButton,
    Box,
    Typography,
    Alert,
    Snackbar
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';

import { stationsApi } from '../../../api/stationsApi';
import {Paths} from "../../../config/paths/paths.ts";
import type {LockerStation, StationStatus} from "../../../types/index";

const BRAND_GREEN = '#6baf5c';

const StationsTable: React.FC = () => {
    const navigate = useNavigate();
    const [stations, setStations] = useState<LockerStation[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const loadStations = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await stationsApi.getAllStations();
            setStations(data);
        } catch (err) {
            setError('Failed to fetch stations. Please check your connection.');
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadStations();
    }, []);

    const handleStatusToggle = async (id: string, currentStatus: StationStatus) => {
        const newStatus: StationStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        try {
            await stationsApi.updateStationStatusAdmin(id, newStatus);
            setStations((prev) =>
                prev.map((s) => s.stationId === id ? { ...s, status: newStatus } : s)
            );
        } catch (err) {
            console.error('Status update failed:', err);
            alert('Could not update status.');
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this station?')) {
            try {
                await stationsApi.deleteStation(id);
                setStations((prev) => prev.filter((s) => s.stationId !== id));
            } catch (err) {
                console.error('Delete failed:', err);
                alert('Could not delete station.');
            }
        }
    };

    const columns: GridColDef<LockerStation>[] = [
        {
            field: 'stationId',
            headerName: 'ID',
            width: 150,
            renderCell: (params) => (
                <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.7rem' }}>
                    {params.value}
                </Typography>
            )
        },
        {
            field: 'city',
            headerName: 'City',
            width: 120,

            valueGetter: (_value, row) => typeof row.city === 'string' ? row.city : (row.city?.name || 'Unknown')
        },
        {
            field: 'address',
            headerName: 'Address',
            width: 220,
        },
        {
            field: 'status',
            headerName: 'Status',
            width: 110,
            renderCell: (params) => (
                <Chip
                    label={params.value}
                    color={params.value === 'ACTIVE' ? 'success' : 'default'}
                    size="small"
                />
            )
        },
        {
            field: 'manage',
            headerName: 'Boxes',
            width: 150,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <Button
                    variant="contained"
                    size="small"
                    sx={{
                        bgcolor: BRAND_GREEN,
                        fontWeight: 'bold',
                        textTransform: 'none',
                        '&:hover': { bgcolor: '#5a994c' }
                    }}
                    onClick={() => navigate(`${Paths.ADMIN}/stations/${params.row.stationId}`)}
                >
                    Manage Boxes
                </Button>
            )
        },
        {
            field: 'actions',
            headerName: 'Actions',
            width: 200,
            sortable: false,
            renderCell: (params) => (
                <Box display="flex" gap={1}>
                    <Button
                        variant="outlined"
                        size="small"
                        color="primary"
                        onClick={() => handleStatusToggle(params.row.stationId, params.row.status)}
                    >
                        {params.row.status === 'ACTIVE' ? 'Off' : 'On'}
                    </Button>
                    <IconButton
                        color="error"
                        size="small"
                        onClick={() => handleDelete(params.row.stationId)}
                    >
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Box>
            )
        }
    ];

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h5" fontWeight="bold">
                    Active Stations
                </Typography>
                <Box display="flex" gap={2}>
                    <Button
                        startIcon={<RefreshIcon />}
                        onClick={loadStations}
                        variant="outlined"
                        size="small"
                    >
                        Refresh
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        size="small"
                        color="success"
                        sx={{ bgcolor: BRAND_GREEN }}
                        onClick={() => console.log('Open Create Modal')} //this place for Create Station Modal
                    >
                        New Station
                    </Button>
                </Box>
            </Box>

            <DataGrid
                rows={stations}
                columns={columns}
                getRowId={(row) => row.stationId}
                loading={loading}
                autoHeight
                pageSizeOptions={[10, 25]}
                initialState={{
                    pagination: { paginationModel: { pageSize: 10 } },
                }}
                sx={{
                    border: 0,
                    '& .MuiDataGrid-columnHeaders': {
                        backgroundColor: '#fafafa',
                        fontWeight: 'bold'
                    },
                }}
            />

            <Snackbar
                open={!!error}
                autoHideDuration={6000}
                onClose={() => setError(null)}
            >
                <Alert severity="error" onClose={() => setError(null)}>
                    {error}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default StationsTable;