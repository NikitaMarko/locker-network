import { useQuery } from "@tanstack/react-query";
import { stationsApi } from "../../../api/stationsApi";
import type { Station, StationStatus } from "../../../types/lockers/lockers";
import { Box, Typography, Paper, Chip, Button } from "@mui/material";
import Grid from "@mui/material/GridLegacy";

import { useStations } from "../../../hooks/useStations";

export default function OperatorStationsPage() {
    const { changeStationStatus } = useStations();

    const { data: stations = [], isLoading } = useQuery<Station[]>({
        queryKey: ["operator-stations"],
        queryFn: stationsApi.getAllStations
    });

    if (isLoading) return <Typography>Loading...</Typography>;

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" fontWeight={900} mb={3}>
                Stations (Operator)
            </Typography>

            <Grid container spacing={2}>
                {stations.map((st) => (
                    <Grid item xs={12} md={6} key={st.stationId}>
                        <Paper sx={{ p: 3, borderRadius: 3 }}>
                            <Typography variant="h6" fontWeight={800}>
                                {st.address}
                            </Typography>

                            <Chip
                                label={st.status}
                                size="small"
                                sx={{ mt: 1 }}
                                color={
                                    st.status === "READY"
                                        ? "success"
                                        : st.status === "MAINTENANCE"
                                            ? "warning"
                                            : "default"
                                }
                            />

                            <Box sx={{ mt: 2, display: "flex", gap: 2 }}>
                                {st.status === "INACTIVE" && (
                                    <Button
                                        variant="contained"
                                        onClick={() =>
                                            changeStationStatus({
                                                id: st.stationId,
                                                status: "READY" as StationStatus
                                            })
                                        }
                                    >
                                        Prepare (READY)
                                    </Button>
                                )}

                                {st.status === "MAINTENANCE" && (
                                    <Button
                                        variant="contained"
                                        color="success"
                                        onClick={() =>
                                            changeStationStatus({
                                                id: st.stationId,
                                                status: "READY" as StationStatus
                                            })
                                        }
                                    >
                                        Fix & Ready
                                    </Button>
                                )}
                            </Box>
                        </Paper>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}
