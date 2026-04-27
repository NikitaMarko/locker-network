import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { stationsApi } from "../../../api/stationsApi";
import { useLockers } from "../../../hooks/useLockers";

import type { LockerStation } from "../../../types/index";
import { Box, Typography, Paper, Chip, Button } from "@mui/material";
import Grid from "@mui/material/GridLegacy";

const getChipColor = (
    status: string
): "success" | "warning" | "default" | "error" => {
    switch (status) {
        case "ACTIVE": return "success";
        case "READY": return "warning";
        case "INACTIVE": return "default";
        case "MAINTENANCE":
        case "FAULTY": return "error";
        default: return "default";
    }
};

export default function OperatorStationDetailsPage() {
    const { stationId } = useParams();
    const { setReady } = useLockers();

    const { data: station } = useQuery<LockerStation>({
        queryKey: ["operator-station", stationId],
        queryFn: () => stationsApi.getStationById(stationId!),
        enabled: !!stationId
    });

    const lockers = station?.lockers ?? [];

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4">Station Details</Typography>
            <Typography sx={{ mb: 3 }}>{station?.address}</Typography>

            <Grid container spacing={2}>
                {lockers.map((locker) => (
                    <Grid item xs={12} sm={6} md={3} key={locker.lockerBoxId}>
                        <Paper sx={{ p: 2 }}>
                            <Typography>Box #{locker.code}</Typography>

                            <Chip
                                label={locker.technicalStatus}
                                color={getChipColor(locker.technicalStatus)}
                                size="small"
                                sx={{ mt: 1 }}
                            />

                            <Box mt={2}>
                                {locker.technicalStatus === "INACTIVE" && (
                                    <Button
                                        variant="contained"
                                        size="small"
                                        onClick={() => setReady(locker.lockerBoxId)}
                                    >
                                        Prepare
                                    </Button>
                                )}

                                {locker.technicalStatus === "MAINTENANCE" && (
                                    <Button
                                        variant="contained"
                                        size="small"
                                        color="success"
                                        onClick={() => setReady(locker.lockerBoxId)}
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