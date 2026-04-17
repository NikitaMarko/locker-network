import { useEffect } from "react";
import { Box, Typography, Button, Chip } from "@mui/material";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { Paths } from "../../../config/paths/paths.ts";
import type { LockerStation } from "../../../types/index";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
});

function MapController({ stations, selectedId }: { stations: LockerStation[], selectedId: string | null }) {
    const map = useMap();

    useEffect(() => {
        if (selectedId) {

            const st = stations.find(s => s.stationId === selectedId);
            if (st) map.flyTo([st.latitude, st.longitude], 16, { duration: 1.5 });
        } else if (stations.length > 0) {

            const bounds = L.latLngBounds(stations.map(s => [s.latitude, s.longitude]));
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14, duration: 1 });
        }
    }, [selectedId, stations, map]);

    return null;
}

interface LocationsMapSectionProps {
    stations: LockerStation[];
    selectedId: string | null;
    onMarkerAction?: (id: string) => void;
    actionText?: string;
}

export function LocationsMapSection({ stations, selectedId, onMarkerAction, actionText }: LocationsMapSectionProps) {
    const navigate = useNavigate();
    const defaultCenter: [number, number] = [32.08, 34.78]; //init Tel-Aviv

    if (stations.length === 0) {
        return (
            <Box display="flex" alignItems="center" justifyContent="center" height="100%" bgcolor="#f8fafc">
                <Typography color="text.secondary">No active stations in this area.</Typography>
            </Box>
        );
    }

    return (
        <MapContainer
            center={defaultCenter}
            zoom={13}
            style={{ height: '100%', width: '100%', zIndex: 1 }}
        >
            <TileLayer
                attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />

            <MapController stations={stations} selectedId={selectedId} />

            {stations.map(st => (
                <Marker key={st.stationId} position={[st.latitude, st.longitude]}>
                    <Popup maxWidth={300} minWidth={250}>
                        <Box sx={{ p: 0.5, textAlign: 'center' }}>
                            <Chip
                                size="small"
                                color="success"
                                variant="outlined"
                                label={`${st._count?.lockers || 0} Total Boxes`}
                                sx={{ mb: 1.5, fontWeight: 'bold' }}
                            />

                            <Typography variant="subtitle1" fontWeight={800} lineHeight={1.2} mb={0.5} color="#1e293b">
                                {st.address}
                            </Typography>

                            <Typography variant="body2" color="text.secondary" mb={2}>
                                {typeof st.city === 'string' ? st.city : (st.city?.name || "Unknown City")}
                            </Typography>

                            <Button
                                variant="contained"
                                fullWidth
                                size="small"
                                startIcon={<Inventory2OutlinedIcon />}
                                onClick={() => {

                                    if (onMarkerAction) {
                                        onMarkerAction(st.stationId);
                                    } else {
                                        navigate(`${Paths.USER}/stations/${st.stationId}`);
                                    }
                                }}
                                sx={{
                                    bgcolor: '#6baf5c',
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    borderRadius: 2,
                                    boxShadow: 'none',
                                    '&:hover': { bgcolor: '#5a994c', boxShadow: 'none' }
                                }}
                            >
                                {actionText || "View Sizes & Prices"}
                            </Button>
                        </Box>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}