import { useState, useCallback } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { Box, Paper, Typography, Button, Stack, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";

import type { Station } from "../../../types/lockers/lockers.ts";

export function LocationsMapSection({ stations }: { stations: Station[] }) {
    const { isLoaded } = useJsApiLoader({ id: 'google-map-script', googleMapsApiKey: "" });
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [activeId, setActiveId] = useState<string | null>(null);
    const navigate = useNavigate();

    const activeStations = stations.filter(s => s.status === 'ACTIVE');

    const handleFlyTo = useCallback((st: Station) => {
        setActiveId(st.stationId);
        if (map) map.panTo({ lat: st.latitude, lng: st.longitude });
    }, [map]);

    if (!isLoaded) return <CircularProgress />;

    return (
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>

            <Box sx={{ width: 300, maxHeight: 500, overflowY: 'auto' }}>
                {activeStations.map(st => (
                    <Paper
                        key={st.stationId}
                        sx={{
                            p: 2,
                            mb: 1,
                            border: activeId === st.stationId ? '2px solid #6baf5c' : '2px solid transparent',
                            cursor: 'pointer'
                        }}
                        onClick={() => handleFlyTo(st)}
                    >

                        <Typography fontWeight={700}>{st.city?.name || 'Unknown'}</Typography>
                        <Typography variant="caption">{st.address}</Typography>
                        <Button
                            fullWidth
                            variant="contained"
                            sx={{ mt: 1, bgcolor: '#6baf5c', '&:hover': { bgcolor: '#5a994c' } }}
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/user/stations/${st.stationId}`);
                            }}
                        >
                            Select
                        </Button>
                    </Paper>
                ))}
            </Box>
            <Box sx={{ flexGrow: 1, height: 500, borderRadius: 3, overflow: 'hidden' }}>
                <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    onLoad={setMap}
                    center={{ lat: 32.08, lng: 34.78 }}
                    zoom={10}
                >
                    {activeStations.map(st => (
                        <Marker
                            key={st.stationId}
                            position={{ lat: st.latitude, lng: st.longitude }}
                            onClick={() => handleFlyTo(st)}
                        />
                    ))}
                </GoogleMap>
            </Box>
        </Stack>
    );
}