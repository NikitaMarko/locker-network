import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    Divider,
    Button
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.ts';
import { ROLES } from '../config/roles/roles.ts';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AssignmentIcon from '@mui/icons-material/Assignment';
import KitchenIcon from '@mui/icons-material/Kitchen';
import RouterIcon from '@mui/icons-material/Router';
import LogoutIcon from '@mui/icons-material/Logout';
import MapIcon from '@mui/icons-material/Map';
import {Paths} from "../config/paths/paths.ts";

const DRAWER_WIDTH = 280;
const BRAND_GREEN = '#6baf5c';

export default function SideMenu() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    if (!user) return null;

    const getMenuItems = () => {
        switch (user.role) {
            case ROLES.ADMIN: return [
                { label: 'Dashboard', path: Paths.ADMIN, icon: <DashboardIcon /> },
                { label: 'Stations', path: `${Paths.ADMIN}/stations`, icon: <RouterIcon /> },
            ];
            case ROLES.OPERATOR: return [
                { label: 'Tasks', path: Paths.OPERATOR, icon: <AssignmentIcon /> },
                { label: 'Lockers', path: `${Paths.OPERATOR}/lockers`, icon: <KitchenIcon /> },
            ];
            case ROLES.USER: return [
                { label: 'Map & Booking', path: Paths.USER, icon: <MapIcon /> },
                { label: 'My Bookings', path: `${Paths.USER}/my-bookings`, icon: <AssignmentIcon /> },
            ];
            default: return [];
        }
    };

    return (
        <Drawer variant="permanent" sx={{ width: DRAWER_WIDTH, [`& .MuiDrawer-paper`]: { width: DRAWER_WIDTH, boxSizing: 'border-box' } }}>
            <Box sx={{ p: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, color: BRAND_GREEN }}>SmartBox</Typography>
                <Typography variant="body2" color="text.secondary">{user.role}</Typography>
            </Box>
            <Divider />
            <List sx={{ px: 2, mt: 2 }}>
                {getMenuItems().map((item) => (
                    <ListItem key={item.path} disablePadding>
                        <ListItemButton
                            selected={location.pathname === item.path}
                            onClick={() => navigate(item.path)}
                            sx={{ borderRadius: '12px', '&.Mui-selected': { color: BRAND_GREEN } }}
                        >
                            <ListItemIcon sx={{ color: location.pathname === item.path ? BRAND_GREEN : 'inherit' }}>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.label} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            <Box sx={{ mt: 'auto', p: 2 }}>
                <Button fullWidth onClick={logout} startIcon={<LogoutIcon />} color="error">Sign Out</Button>
            </Box>
        </Drawer>
    );
}