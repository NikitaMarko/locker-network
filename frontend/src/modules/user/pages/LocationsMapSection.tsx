import { useState, useMemo } from "react";
import { Box, Paper, Typography, Button, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Paths } from "../../../config/paths/paths.ts";

import type { LockerStation } from "../../../types/index";

export function LocationsMapSection({ stations }: { stations: LockerStation[] }) {
    const navigate = useNavigate();


    const activeStations = stations.filter(s => s.status === 'ACTIVE');


    const [activeId, setActiveId] = useState<string | null>(
        activeStations.length > 0 ? activeStations[0].stationId : null
    );


    const currentStation = useMemo(() =>
            activeStations.find(s => s.stationId === activeId) || activeStations[0],
        [activeId, activeStations]);

    return (
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>


            <Box sx={{ width: { xs: '100%', md: 320 }, maxHeight: 500, overflowY: 'auto', pr: 1 }}>
                {activeStations.length === 0 ? (
                    <Typography color="text.secondary" p={2} textAlign="center">
                        No active stations available.
                    </Typography>
                ) : (
                    activeStations.map(st => (
                        <Paper
                            key={st.stationId}
                            elevation={0}
                            sx={{
                                p: 2.5,
                                mb: 1.5,
                                border: activeId === st.stationId ? '2px solid #4CAF50' : '2px solid #e2e8f0',
                                bgcolor: activeId === st.stationId ? '#f0fdf4' : 'white',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                    borderColor: '#4CAF50',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                                }
                            }}
                            onClick={() => setActiveId(st.stationId)}
                        >

                            <Typography fontWeight={800} fontSize="1.1rem" color="#1a1a1a" mb={0.5}>
                                {typeof st.city === 'string' ? st.city : (st.city?.name || 'Unknown City')}
                            </Typography>

                            <Typography variant="body2" color="text.secondary" mb={1}>
                                {st.address}
                            </Typography>


                            <Typography variant="caption" fontWeight={700} color="#4CAF50" display="block">
                                Capacity: {st._count?.lockers || 0} boxes
                            </Typography>

                            <Button
                                fullWidth
                                variant="contained"
                                sx={{
                                    mt: 2,
                                    bgcolor: activeId === st.stationId ? '#6baf5c' : '#94a3b8',
                                    '&:hover': { bgcolor: '#5a994c' },
                                    textTransform: 'none',
                                    fontWeight: 'bold',
                                    boxShadow: 'none'
                                }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`${Paths.USER}/stations/${st.stationId}`);
                                }}
                            >
                                {activeId === st.stationId ? 'Selected' : 'Select Station'}
                            </Button>
                        </Paper>
                    ))
                )}
            </Box>


            <Box sx={{ flexGrow: 1, height: 500, borderRadius: 4, overflow: 'hidden', border: '1px solid #e2e8f0', bgcolor: '#f8fafc' }}>
                {currentStation ? (
                    <iframe
                        key={currentStation.stationId}
                        title="Google Maps"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        loading="lazy"

                        src={`https://maps.google.com/maps?q=${currentStation.latitude},${currentStation.longitude}&z=15&output=embed`}
                    />
                ) : (
                    <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                        <Typography color="text.secondary">Select a station to view on map</Typography>
                    </Box>
                )}
            </Box>

        </Stack>
    );
}