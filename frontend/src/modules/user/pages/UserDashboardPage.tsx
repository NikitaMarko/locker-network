import { useState, useMemo } from "react";
import { Box, Typography, Alert, Stack, MenuItem, TextField, CircularProgress } from "@mui/material";
import { LocationsMapSection } from "./LocationsMapSection";
import { useStations } from "../../../hooks/useStations.ts";

export default function UserDashboard() {
    const { stations, isLoading, error } = useStations({ publicOnly: true });

    const safeStations = Array.isArray(stations) ? stations : [];
    const activeStations = safeStations.filter(s => s.status === 'ACTIVE');

    const cities = useMemo(() => {
        const citySet = new Set(activeStations.map(s => typeof s.city === 'string' ? s.city : (s.city?.name || '')));
        return Array.from(citySet).filter(c => c !== '');
    }, [activeStations]);


    const [selectedCity, setSelectedCity] = useState<string>('');
    const [selectedStationId, setSelectedStationId] = useState<string | null>(null);
    const displayedStations = useMemo(() => {
        if (!selectedCity) return activeStations;

        return activeStations.filter(s => {
            const cityName = typeof s.city === 'string' ? s.city : (s.city?.name || '');
            return cityName === selectedCity;
        });
    }, [activeStations, selectedCity]);

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ pt: '100px', pb: 8, px: { xs: 2, md: 4 }, maxWidth: '1400px', margin: '0 auto' }}>
            <Stack spacing={3} height="100%">

                <Alert severity="info" sx={{ borderRadius: 4, p: 2, bgcolor: '#f0f7ff', border: '1px solid #d0e3ff' }}>
                    <Typography variant="h6" fontWeight={800} color="#003e92">
                        Find a Station Near You
                    </Typography>
                    <Typography variant="body2" color="#003e92">
                        Select a city and address, or click directly on a map marker to view available locker sizes and prices.
                    </Typography>
                </Alert>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <TextField
                        select
                        label="1. Select City"
                        value={selectedCity}
                        onChange={(e) => {
                            setSelectedCity(e.target.value);
                            setSelectedStationId(null);
                        }}
                        sx={{ minWidth: 250, bgcolor: 'white', borderRadius: 2 }}
                    >
                        <MenuItem value="">
                            <em> All Cities</em>
                        </MenuItem>
                        {cities.length === 0 && <MenuItem disabled value="none">No active cities</MenuItem>}
                        {cities.map(city => (
                            <MenuItem key={city} value={city}>{city}</MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        select
                        label="2. Select Address (Optional)"
                        value={selectedStationId || ''}
                        onChange={(e) => setSelectedStationId(e.target.value)}
                        disabled={!selectedCity || displayedStations.length === 0}
                        sx={{ minWidth: 300, bgcolor: 'white', borderRadius: 2, flexGrow: 1 }}
                    >
                        <MenuItem value="">
                            <em>{selectedCity ? ` Show all in ${selectedCity}` : 'Select a city first'}</em>
                        </MenuItem>
                        {selectedCity && displayedStations.map(st => (
                            <MenuItem key={st.stationId} value={st.stationId}>
                                {st.address} ({st._count?.lockers || 0} boxes)
                            </MenuItem>
                        ))}
                    </TextField>
                </Stack>

                <Box sx={{
                    height: '65vh',
                    width: '100%',
                    borderRadius: 4,
                    overflow: 'hidden',
                    border: '1px solid #6baf5c',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.05)'
                }}>
                    {error ? (
                        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                            <Typography color="error">Failed to load map data.</Typography>
                        </Box>
                    ) : (
                        <LocationsMapSection
                            stations={displayedStations}
                            selectedId={selectedStationId}
                        />
                    )}
                </Box>

            </Stack>
        </Box>
    );
}