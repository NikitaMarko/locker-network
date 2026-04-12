import { Card, CardContent, Typography, Chip } from "@mui/material";

export function StatCard({
                             title,
                             value,
                             change,
                             color,
                         }: {
    title: string;
    value: string;
    change?: string;
    color?: string;
}) {
    return (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', py: 3 }}>
                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', mb: 1 }}>
                    {title}
                </Typography>

                <Typography variant="h4" fontWeight={900} color={color}>
                    {value}
                </Typography>

                {change && (
                    <Chip
                        label={change}
                        color={change.includes("-") ? "error" : "success"}
                        size="small"
                        sx={{ mt: 1 }}
                    />
                )}
            </CardContent>
        </Card>
    );
}