import { Box, Typography, Button, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { Paths } from '../../../config/paths/paths';

export function PaymentCancel() {
    const navigate = useNavigate();

    return (
        <Box sx={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3, bgcolor: '#f8fafc' }}>
            <Paper elevation={0} sx={{ p: { xs: 4, md: 6 }, borderRadius: 4, maxWidth: 450, width: '100%', textAlign: 'center', border: '1px solid #e2e8f0', boxShadow: '0 20px 40px rgba(0,0,0,0.04)' }}>
                <CancelOutlinedIcon sx={{ fontSize: 88, color: '#94a3b8', mb: 2 }} />

                <Typography variant="h4" fontWeight={900} mb={2} color="#1e293b">
                    Payment Cancelled
                </Typography>

                <Typography color="text.secondary" mb={5} fontWeight={500}>
                    Your transaction was cancelled and you haven't been charged. You can try booking again whenever you're ready.
                </Typography>

                <Button
                    variant="contained"
                    size="large"
                    fullWidth
                    disableElevation
                    onClick={() => navigate(Paths.USER)}
                    sx={{
                        bgcolor: '#6baf5c',
                        py: 1.5,
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        borderRadius: 3,
                        textTransform: 'none',
                        '&:hover': { bgcolor: '#5a994c' }
                    }}
                >
                    Find Another Locker
                </Button>
            </Paper>
        </Box>
    );
}