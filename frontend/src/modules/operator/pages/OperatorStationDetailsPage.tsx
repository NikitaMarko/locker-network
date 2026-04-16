import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { stationsApi } from "../../../api/stationsApi";
import { lockersApi } from "../../../api/lockersApi";

import type { LockerBox, LockerStatus, LockerStation } from "../../../types/index";
import {
    Box,
    Typography,
    Paper,
    Chip,
    Button
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

export default function OperatorStationDetailsPage() {
    const { stationId } = useParams();

    const { data: station } = useQuery<LockerStation>({
        queryKey: ["operator-station", stationId],
        queryFn: () => stationsApi.getStationById(stationId!),
        enabled: !!stationId
    });

    const { data: lockers = [] } = useQuery<LockerBox[]>({
        queryKey: ["operator-lockers", stationId],
        queryFn: () => lockersApi.getAdminLockers()
    });

    const handleLockerStatus = async (lockerId: string, status: LockerStatus) => {
        await lockersApi.updateLockerStatus(lockerId, status);
    };

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
                    .filter((l) => l.stationId === stationId)
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

                                <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                                    {locker.status === "INACTIVE" && (
                                        <Button
                                            size="small"
                                            variant="contained"
                                            onClick={() =>
                                                handleLockerStatus(
                                                    locker.lockerBoxId,
                                                    "READY"
                                                )
                                            }
                                        >
                                            Prepare
                                        </Button>
                                    )}

                                    {locker.status === "MAINTENANCE" && (
                                        <Button
                                            size="small"
                                            variant="contained"
                                            color="success"
                                            onClick={() =>
                                                handleLockerStatus(
                                                    locker.lockerBoxId,
                                                    "READY"
                                                )
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
