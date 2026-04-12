import  { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Box, Button, Typography, Stack, CircularProgress, Paper, Breadcrumbs, Link } from "@mui/material";
import { stationsApi } from "../../../api/stationsApi";
import { lockersApi } from "../../../api/lockersApi";
import type { Station, LockerSize } from "../../../types/lockers/lockers.ts";
import {Paths} from "../../../config/paths/paths.ts";

export function StationDetailsPage() {

    const { id: stationId } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [selectedSize, setSelectedSize] = useState<LockerSize | null>(null);


    const { data: station, isLoading } = useQuery<Station>({
        queryKey: ['station', stationId],
        queryFn: () => stationsApi.getStationById(stationId!),
        enabled: !!stationId
    });


    const bookLockerMutation = useMutation({
        mutationFn: (lockerBoxId: string) => lockersApi.updateLockerStatus(lockerBoxId, "RESERVED"),
        onSuccess: () => {

                navigate(`${Paths.USER}/my-bookings`);
        },
        onError: (error) => {
            console.error("Booking failed", error);
            alert("Failed to book the locker. It might be already taken.");
        }
    });

    if (isLoading) return <Box p={5} textAlign="center"><CircularProgress /></Box>;
    if (!station) return <Typography p={5} textAlign="center">Station not found</Typography>;


    const availableLockers = (station.lockers || []).filter(l => l.status === "AVAILABLE");

    const availableSizesAndPrices = availableLockers.reduce((acc, locker) => {
        if (!acc[locker.size]) {
            acc[locker.size] = locker.pricePerHour;
        }
        return acc;
    }, {} as Record<string, string>);


    const lockersToDisplay = availableLockers.filter(
        (l) => selectedSize ? l.size === selectedSize : true
    );

    return (
        <Box sx={{ p: 3, maxWidth: '1000px', margin: '0 auto', pt: '100px' }}>
            <Breadcrumbs sx={{ mb: 4 }}>
                <Link sx={{ cursor: 'pointer' }} underline="hover" color="inherit" onClick={() => navigate('/user')}>
                    Map
                </Link>
                <Typography color="text.primary">Choose Box</Typography>
            </Breadcrumbs>

            <Typography variant="h4" fontWeight={900}>{station.city?.name || "Station"}</Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>{station.address}</Typography>

            {availableLockers.length === 0 ? (
                <Paper sx={{ p: 4, mt: 4, textAlign: 'center', bgcolor: '#fff3e0' }}>
                    <Typography variant="h6" color="warning.main">Sorry, no available lockers at this station.</Typography>
                </Paper>
            ) : (
                <>

                    <Stack direction="row" spacing={2} sx={{ my: 4, overflowX: 'auto', pb: 1 }}>
                        {(Object.keys(availableSizesAndPrices) as LockerSize[]).map((size) => (
                            <Button
                                key={size}
                                variant={selectedSize === size ? "contained" : "outlined"}
                                onClick={() => setSelectedSize(size)}
                                size="large"
                                sx={{
                                    borderRadius: 3,
                                    minWidth: 120,
                                    fontWeight: 'bold',
                                    bgcolor: selectedSize === size ? '#6baf5c' : 'transparent',
                                    color: selectedSize === size ? '#fff' : '#6baf5c',
                                    borderColor: '#6baf5c',
                                    '&:hover': { bgcolor: selectedSize === size ? '#5a994c' : '#eaf4e8' }
                                }}
                            >
                                Size {size} <br/>
                                <Typography variant="caption" sx={{ display: 'block' }}>
                                    ₪{availableSizesAndPrices[size]} / hr
                                </Typography>
                            </Button>
                        ))}
                    </Stack>


                    <Box sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                        gap: 2
                    }}>
                        {lockersToDisplay.map((l) => (
                            <Paper
                                key={l.lockerBoxId}
                                onClick={() => !bookLockerMutation.isPending && bookLockerMutation.mutate(l.lockerBoxId)}
                                sx={{
                                    p: 3,
                                    textAlign: "center",
                                    cursor: bookLockerMutation.isPending ? "wait" : "pointer",
                                    bgcolor: "#edf7ed",
                                    border: '2px solid #c3e6cb',
                                    borderRadius: 3,
                                    opacity: bookLockerMutation.variables === l.lockerBoxId ? 0.5 : 1,
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                        bgcolor: '#e1f0e1',
                                        transform: 'translateY(-2px)',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                                    }
                                }}
                            >
                                <Typography fontWeight={800} variant="h6">#{l.code}</Typography>
                                <Typography variant="body2" color="text.secondary">Size: {l.size}</Typography>

                                {bookLockerMutation.variables === l.lockerBoxId && (
                                    <CircularProgress size={20} sx={{ display: 'block', mx: 'auto', mt: 1, color: '#6baf5c' }} />
                                )}
                            </Paper>
                        ))}
                    </Box>
                </>
            )}
        </Box>
    );
}