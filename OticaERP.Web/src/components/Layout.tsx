import { useState, useContext } from 'react';
import {
    AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem,
    ListItemButton, ListItemIcon, ListItemText, Box, CssBaseline, Divider
} from '@mui/material';
import {
    Menu as MenuIcon,
    People,
    Inventory,
    ShoppingCart,
    CalendarMonth,
    Assignment,
    ExitToApp
} from '@mui/icons-material';
import { useNavigate, Outlet } from 'react-router-dom'; // Outlet renderiza a página atual
import { AuthContext } from '../context/AuthContext';

const drawerWidth = 240;

export default function Layout() {
    const [mobileOpen, setMobileOpen] = useState(false);
    const { signOut, user } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const menuItems = [
        { text: 'Clientes', icon: <People />, path: '/clients' },
        { text: 'Produtos', icon: <Inventory />, path: '/products' },
        { text: 'Vendas', icon: <ShoppingCart />, path: '/sales' },
        { text: 'Agendamentos', icon: <CalendarMonth />, path: '/appointments' },
        { text: 'Ordens de Serviço', icon: <Assignment />, path: '/service-orders' },
    ];

    const drawer = (
        <div>
            <Toolbar sx={{ backgroundColor: '#1976d2', color: 'white' }}>
                <Typography variant="h6" noWrap component="div">
                    Ótica ERP
                </Typography>
            </Toolbar>
            <Divider />
            <List>
                {menuItems.map((item) => (
                    <ListItem key={item.text} disablePadding>
                        <ListItemButton onClick={() => navigate(item.path)}>
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} />
                        </ListItemButton>
                    </ListItem>
                ))}
                <Divider />
                <ListItem disablePadding>
                    <ListItemButton onClick={() => { signOut(); navigate('/login'); }}>
                        <ListItemIcon><ExitToApp color="error" /></ListItemIcon>
                        <ListItemText primary="Sair" sx={{ color: 'red' }} />
                    </ListItemButton>
                </ListItem>
            </List>
        </div>
    );

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div">
                        Olá, {user}
                    </Typography>
                </Toolbar>
            </AppBar>

            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
            >
                {/* Drawer Mobile */}
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    {drawer}
                </Drawer>
                {/* Drawer Desktop */}
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>

            <Box
                component="main"
                sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` }, marginTop: '64px' }}
            >
                {/* AQUI É ONDE AS PÁGINAS (CLIENTES, VENDAS...) VÃO APARECER */}
                <Outlet />
            </Box>
        </Box>
    );
}