// import {
//     Container, Stack, Typography, Paper,
//     Table, TableHead, TableRow, TableCell, TableBody, Chip, Button
// } from "@mui/material";
// import { useStations } from "../../../hooks/useStations";
// import { AdminStationForm } from "./AdminStationForm";
// import type {StationStatus} from "../../../types/index";
//
// const BRAND_GREEN = '#6baf5c';
//
// export default function AdminStationsPage() {
//     const { stations, createStation, updateStatus } = useStations();
//
//     const handleSave = async (data: any) => {
//         await createStation(data);
//     };
//
//     return (
//         <Container maxWidth="lg" sx={{ py: 4 }}>
//             <Stack spacing={4}>
//                 <Typography variant="h4" fontWeight={800}>Station Management</Typography>
//
//                 <AdminStationForm onSave={handleSave} />
//
//                 <Paper sx={{ border: '1px solid #e0e0e0', boxShadow: 'none', overflow: 'hidden' }}>
//                     <Table>
//                         <TableHead sx={{ bgcolor: '#f5f5f5' }}>
//                             <TableRow>
//                                 <TableCell sx={{ fontWeight: 700 }}>City</TableCell>
//                                 <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
//                                 <TableCell sx={{ fontWeight: 700 }}>Coordinates</TableCell>
//                                 <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
//                             </TableRow>
//                         </TableHead>
//                         <TableBody>
//                             {stations.map((st) => (
//                                 <TableRow key={st.stationId}>
//                                     {/* ИСПРАВЛЕНО: fontWeight внутри sx */}
//                                     <TableCell sx={{ fontWeight: 600 }}>{st.city}</TableCell>
//                                     <TableCell>
//                                         <Chip
//                                             label={st.status}
//                                             color={st.status === 'ACTIVE' ? 'success' : 'default'}
//                                             size="small"
//                                         />
//                                     </TableCell>
//                                     <TableCell sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
//                                         {st.latitude.toFixed(4)}, {st.longitude.toFixed(4)}
//                                     </TableCell>
//                                     <TableCell align="right">
//                                         {st.status === 'INACTIVE' && (
//                                             <Button
//                                                 variant="contained"
//                                                 size="small"
//                                                 sx={{ bgcolor: BRAND_GREEN, fontWeight: 700, boxShadow: 'none' }}
//                                                 onClick={() => updateStatus({ id: st.stationId, status: 'ACTIVE' as StationStatus })}
//                                             >
//                                                 Activate
//                                             </Button>
//                                         )}
//                                     </TableCell>
//                                 </TableRow>
//                             ))}
//                         </TableBody>
//                     </Table>
//                 </Paper>
//             </Stack>
//         </Container>
//     );
// }