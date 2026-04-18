import { Box, Typography, Paper, Stack } from "@mui/material";
import Grid from '@mui/material/Grid';
import HubOutlinedIcon from '@mui/icons-material/HubOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import TouchAppOutlinedIcon from '@mui/icons-material/TouchAppOutlined';

export function Info() {
    return (
        <Box sx={{ minHeight: '92vh', bgcolor: '#f8fafc', py: 10, px: { xs: 2, md: 4 }, display: 'flex', alignItems: 'center' }}>
            <Box sx={{ maxWidth: '1000px', mx: 'auto', width: '100%' }}>

                <Typography variant="h3" fontWeight={900} textAlign="center" mb={2} color="#1e293b">
                    Smart Locker Network System
                </Typography>

                <Typography variant="h6" textAlign="center" color="text.secondary" mb={8}>
                    A digital platform for booking and managing smart lockers across locations.
                </Typography>

                <Grid container spacing={4}>

                    {/* Карточка 1: About */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 4,
                                height: '100%',
                                borderRadius: 4,
                                border: '1px solid #e2e8f0',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                bgcolor: 'white',
                                '&:hover': {
                                    transform: 'translateY(-8px)',
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                                    borderColor: '#6baf5c',
                                }
                            }}
                        >
                            <HubOutlinedIcon sx={{ fontSize: 40, color: '#6baf5c', mb: 2 }} />
                            <Typography variant="h5" fontWeight={800} mb={2} color="#1e293b">
                                About
                            </Typography>
                            <Typography color="text.secondary" sx={{ lineHeight: 1.6, fontWeight: 500 }}>
                                Centralized system connecting multiple locker locations into a single, unified network.
                            </Typography>
                        </Paper>
                    </Grid>

                    {/* Карточка 2: Why it exists */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 4,
                                height: '100%',
                                borderRadius: 4,
                                border: '1px solid #e2e8f0',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                bgcolor: 'white',
                                '&:hover': {
                                    transform: 'translateY(-8px)',
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                                    borderColor: '#6baf5c',
                                }
                            }}
                        >
                            <SecurityOutlinedIcon sx={{ fontSize: 40, color: '#6baf5c', mb: 2 }} />
                            <Typography variant="h5" fontWeight={800} mb={2} color="#1e293b">
                                Why it exists
                            </Typography>
                            <Typography color="text.secondary" sx={{ lineHeight: 1.6, fontWeight: 500 }}>
                                Provides real-time availability, secure remote booking, and strictly controlled access for users.
                            </Typography>
                        </Paper>
                    </Grid>

                    {/* Карточка 3: How it works */}
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 4,
                                height: '100%',
                                borderRadius: 4,
                                border: '1px solid #e2e8f0',
                                transition: 'all 0.3s ease',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                bgcolor: 'white',
                                '&:hover': {
                                    transform: 'translateY(-8px)',
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
                                    borderColor: '#6baf5c',
                                }
                            }}
                        >
                            <TouchAppOutlinedIcon sx={{ fontSize: 40, color: '#6baf5c', mb: 2 }} />
                            <Typography variant="h5" fontWeight={800} mb={2} color="#1e293b">
                                How it works
                            </Typography>

                            <Stack component="ul" spacing={2} sx={{ pl: 0, m: 0, listStyle: 'none', width: '100%' }}>
                                {['Create account', 'Select locker location', 'Book instantly'].map((step, index) => (
                                    <Box component="li" key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                        <Box
                                            sx={{
                                                width: 24,
                                                height: 24,
                                                borderRadius: '50%',
                                                bgcolor: '#eaf4e8',
                                                color: '#6baf5c',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0,
                                                fontWeight: 800,
                                                fontSize: '12px'
                                            }}
                                        >
                                            {index + 1}
                                        </Box>
                                        <Typography variant="body2" fontWeight={700} color="#334155">
                                            {step}
                                        </Typography>
                                    </Box>
                                ))}
                            </Stack>
                        </Paper>
                    </Grid>

                </Grid>
            </Box>
        </Box>
    );
}