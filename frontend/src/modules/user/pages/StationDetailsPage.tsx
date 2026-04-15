import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { stationsApi } from "../../../api/stationsApi";
import { lockersApi } from "../../../api/lockersApi";
import type {
    Station,
    LockerBox,
    LockerStatus
} from "../../../types/lockers/lockers";
import {
    Box,
    Typography,
    Paper,
    Chip
} from "@mui/material";
import Grid from "@mui/material/GridLegacy";

const getChipColor = (status: LockerStatus): "success" | "warning" | "default" => {
    switch (status) {
        case "AVAILABLE":
            return "success";
        case "RESERVED":
        case "OCCUPIED":
            return "warning";
        default:
            return "default";
    }
};

export function StationDetailsPage() {
    const { id } = useParams();

    const { data: station } = useQuery<Station>({
        queryKey: ["user-station", id],
        queryFn: () => stationsApi.getStationById(id!),
        enabled: !!id
    });

    const { data: lockers = [] } = useQuery<LockerBox[]>({
        queryKey: ["user-lockers", id],
        queryFn: lockersApi.getAllLockers
    });

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" fontWeight={900}>
                Station Details
            </Typography>

            <Typography color="text.secondary" sx={{ mb: 3 }}>
                {station?.address}
            </Typography>

            <Grid container spacing={2}>
                {lockers
                    .filter((l) => l.stationId === id)
                    .map((locker) => (
                        <Grid item xs={12} sm={6} md={3} key={locker.lockerBoxId}>
                            <Paper sx={{ p: 2, borderRadius: 2 }}>
                                <Typography fontWeight={700}>
                                    Box #{locker.code}
                                </Typography>

                                <Chip
                                    label={locker.status}
                                    size="small"
                                    sx={{ mt: 1 }}
                                    color={getChipColor(locker.status)}
                                />
                            </Paper>
                        </Grid>
                    ))}
            </Grid>
        </Box>
    );
}
