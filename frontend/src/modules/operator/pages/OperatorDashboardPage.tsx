import { Typography, Box } from "@mui/material";

export default function OperatorDashboardPage() {
    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" fontWeight={900}>
                Operator Dashboard
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 1 }}>
                Manage station readiness and maintenance workflow.
            </Typography>
        </Box>
    );
}
