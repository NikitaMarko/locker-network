import { Box, Typography, Paper, Stack, Grid } from '@mui/material';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';


const lockers = [
    {
        size: "S",
        price: "5.00",
        description: "For small personal items",
        features: [
            "Phones, wallets, keys",
            "Quick access",
            "Lowest cost option",
        ],
    },
    {
        size: "M",
        price: "10.00",
        description: "For everyday storage",
        features: [
            "Backpacks, small bags",
            "Best price / capacity balance",
            "Most popular choice",
        ],
    },
    {
        size: "L",
        price: "15.00",
        description: "For larger items",
        features: [
            "Suitcases, equipment",
            "Maximum storage space",
            "Extended usage",
        ],
    },
];

export function Price() {
    return (
        <Box sx={{ minHeight: '92vh', bgcolor: '#f8fafc', py: 10, px: { xs: 2, md: 4 }, display: 'flex', alignItems: 'center' }}>
            <Box sx={{ maxWidth: '1000px', mx: 'auto', width: '100%' }}>

                <Typography variant="h3" fontWeight={900} textAlign="center" mb={2} color="#1e293b">
                    Locker Pricing
                </Typography>
                <Typography variant="h6" textAlign="center" color="text.secondary" mb={8}>
                    Choose the right locker size based on your needs. Simple and transparent pricing.
                </Typography>

                <Grid container spacing={4} sx={{ flexWrap: 'nowrap' }}>
                    {lockers.map((locker) => (
                        <Grid size={{ xs: 12, md: 4 }} key={locker.size}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 4,
                                    borderRadius: 4,
                                    border: '1px solid #e2e8f0',
                                    transition: 'all 0.3s ease',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    cursor: 'default',
                                    bgcolor: 'white',
                                    '&:hover': {
                                        transform: 'translateY(-8px)',
                                        boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                                        borderColor: '#6baf5c',
                                    }
                                }}
                            >
                                <Inventory2OutlinedIcon sx={{ fontSize: 48, color: '#6baf5c', mb: 2 }} />

                                <Typography variant="h4" fontWeight={900} mb={2}>
                                    Size {locker.size}
                                </Typography>

                                <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 2 }}>
                                    <Typography variant="h3" fontWeight={800} color="#6baf5c">
                                        ₪{locker.price}
                                    </Typography>
                                    <Typography variant="subtitle1" color="text.secondary" ml={1} fontWeight={600}>
                                        / hour
                                    </Typography>
                                </Box>

                                <Typography color="text.secondary" textAlign="center" mb={4} sx={{ minHeight: '48px', fontWeight: 500 }}>
                                    {locker.description}
                                </Typography>

                                <Stack component="ul" spacing={2} sx={{ pl: 0, m: 0, listStyle: 'none', width: '100%' }}>
                                    {locker.features.map((f) => (
                                        <Box component="li" key={f} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#6baf5c', flexShrink: 0 }} />
                                            <Typography variant="body2" fontWeight={700} color="#334155">
                                                {f}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Stack>
                            </Paper>
                        </Grid>
                    ))}
                </Grid>

            </Box>
        </Box>
    );
}