import { Box, Typography, Alert, Stack, Paper, Chip, CircularProgress, Button } from "@mui/material";
import Grid from '@mui/material/Grid';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { LocationsMapSection } from "./LocationsMapSection";
import { stationsApi } from "../../../api/stationsApi";
import type { Station } from "../../../types/lockers/lockers.ts";
import {Paths} from "../../../config/paths/paths.ts";

export default function UserDashboard() {
    const navigate = useNavigate();

    const { data: stations = [], isLoading, error } = useQuery<Station[]>({
        queryKey: ['user-stations'],
        queryFn: stationsApi.getUserStations
    });

    return (
        <Box sx={{ pt: '100px', pb: 8, px: { xs: 2, md: 4 }, maxWidth: '1300px', margin: '0 auto' }}>
            <Stack spacing={4}>
                <Alert severity="info" sx={{ borderRadius: 6, p: 3, bgcolor: '#f0f7ff', border: '1px solid #d0e3ff' }}>
                    <Typography variant="h6" fontWeight={800} color="#003e92">
                        Find a Spare Locker
                    </Typography>
                    <Typography variant="body1" color="#003e92">
                        Select a station from the map or list below to see available slots and start a new booking.
                    </Typography>
                </Alert>

                <LocationsMapSection stations={stations} />

                <Typography variant="h4" fontWeight={900} sx={{ mt: 4, mb: 2 }}>
                    Available Stations
                </Typography>

                {isLoading ? (
                    <Box display="flex" justifyContent="center" p={5}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Alert severity="error">Failed to load stations. Please try again later.</Alert>
                ) : stations.length === 0 ? (
                    <Paper sx={{ p: 5, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: 4 }}>
                        <Typography color="text.secondary">No active stations available right now.</Typography>
                    </Paper>
                ) : (
                    <Grid container spacing={3}>
                        {stations.map((station) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={station.stationId}>
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 3,
                                        borderRadius: 4,
                                        border: '1px solid #e2e8f0',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        height: '100%',
                                        '&:hover': {
                                            boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
                                            borderColor: '#cbd5e1',
                                            transform: 'translateY(-4px)'
                                        }
                                    }}
                                >
                                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                        <Chip
                                            icon={<LocationOnIcon />}
                                            label={station.city?.name || "Unknown City"}
                                            size="small"
                                            sx={{ bgcolor: '#f1f5f9', fontWeight: 600 }}
                                        />
                                        <Chip
                                            label={`${station._count?.lockers || 0} boxes`}
                                            size="small"
                                            color="success"
                                            variant="outlined"
                                        />
                                    </Box>

                                    <Typography variant="h6" fontWeight={800} mb={1}>
                                        {station.address}
                                    </Typography>

                                    <Box sx={{ flexGrow: 1 }} />

                                    <Button
                                        variant="contained"
                                        fullWidth
                                        endIcon={<ArrowForwardIcon />}
                                        onClick={() => navigate(`${Paths.USER}/stations/${station.stationId}`)}
                                        sx={{
                                            mt: 3,
                                            borderRadius: 2,
                                            bgcolor: '#6baf5c',
                                            textTransform: 'none',
                                            fontWeight: 700,
                                            '&:hover': { bgcolor: '#5a994c' }
                                        }}
                                    >
                                        View Lockers
                                    </Button>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Stack>
        </Box>
    );
}