// import React, { useState } from 'react';
// import { Paper, TextField, Button, Typography, Stack, Alert } from '@mui/material';
// import AddLocationIcon from '@mui/icons-material/AddLocation';
//
//
// interface AdminStationFormProps {
//     onSave: (data: {
//         city: string;
//         address: string;
//         latitude: number;
//         longitude: number;
//     }) => void;
// }
//
// const BRAND_GREEN = '#6baf5c';
//
// export function AdminStationForm({ onSave }: AdminStationFormProps) {
//     const [formData, setFormData] = useState({ city: '', address: '', latitude: '', longitude: '' });
//     const [error, setError] = useState('');
//
//     const handleSubmit = (e: React.FormEvent) => {
//         e.preventDefault();
//
//         const latNum = parseFloat(formData.latitude);
//         const lngNum = parseFloat(formData.longitude);
//
//
//         if (isNaN(latNum) || isNaN(lngNum)) {
//             setError("Coordinates must be valid numbers!");
//             return;
//         }
//
//
//         onSave({
//             city: formData.city,
//             address: formData.address,
//             latitude: latNum,
//             longitude: lngNum,
//         });
//
//
//         setFormData({ city: '', address: '', latitude: '', longitude: '' });
//         setError('');
//     };
//
//     return (
//         <Paper sx={{
//             p: 4,
//             borderRadius: 4,
//             maxWidth: 600,
//             mx: 'auto',
//             boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
//             border: '1px solid #f1f5f9'
//         }}>
//             <Stack direction="row" spacing={2} alignItems="center" mb={3}>
//                 <AddLocationIcon sx={{ color: BRAND_GREEN, fontSize: 32 }} />
//                 <Typography variant="h5" fontWeight={900}>Add New Station</Typography>
//             </Stack>
//
//             <form onSubmit={handleSubmit}>
//                 <Stack spacing={3}>
//                     <TextField
//                         label="City"
//                         fullWidth
//                         required
//                         value={formData.city}
//                         onChange={(e) => setFormData({ ...formData, city: e.target.value })}
//                     />
//                     <TextField
//                         label="Full Address"
//                         fullWidth
//                         required
//                         value={formData.address}
//                         onChange={(e) => setFormData({ ...formData, address: e.target.value })}
//                     />
//
//                     <Stack direction="row" spacing={2}>
//                         <TextField
//                             label="Latitude"
//                             fullWidth
//                             required
//                             value={formData.latitude}
//                             onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
//                             helperText="Example: 32.44"
//                         />
//                         <TextField
//                             label="Longitude"
//                             fullWidth
//                             required
//                             value={formData.longitude}
//                             onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
//                             helperText="Example: 34.89"
//                         />
//                     </Stack>
//
//                     {error && (
//                         <Alert severity="error" sx={{ borderRadius: 2 }}>
//                             {error}
//                         </Alert>
//                     )}
//
//                     <Button
//                         type="submit"
//                         variant="contained"
//                         size="large"
//                         sx={{
//                             borderRadius: 1.5,
//                             py: 1.5,
//                             fontWeight: 800,
//                             bgcolor: BRAND_GREEN,
//                             boxShadow: 'none',
//                             textTransform: 'none',
//                             '&:hover': { bgcolor: '#5a994c', boxShadow: 'none' }
//                         }}
//                     >
//                         Save Station
//                     </Button>
//
//                     <Typography
//                         variant="caption"
//                         color="text.secondary"
//                         textAlign="center"
//                         sx={{ bgcolor: '#f8fafc', p: 2, borderRadius: 2 }}
//                     >
//                         💡 <b>Tip:</b> Right-click on Google Maps to get Lat/Lng coordinates.
//                     </Typography>
//                 </Stack>
//             </form>
//         </Paper>
//     );
// }