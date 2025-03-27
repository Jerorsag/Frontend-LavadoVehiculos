import React from 'react';
import { 
  Drawer, 
  List, 
  ListItem, 
  ListItemIcon, 
  ListItemText,
  Toolbar,
  Divider,
  Box,
  useTheme,
  useMediaQuery,
  Typography,
  Avatar,
  alpha
} from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import InventoryIcon from '@mui/icons-material/Inventory';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import ScheduleIcon from '@mui/icons-material/Schedule';
import SettingsIcon from '@mui/icons-material/Settings';
import LocalCarWashIcon from '@mui/icons-material/LocalCarWash';

// Ancho ligeramente mayor para la sidebar
const drawerWidth = 260;

const Sidebar = ({ mobileOpen, handleDrawerToggle }) => {
  const theme = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Empleados', icon: <PeopleIcon />, path: '/empleados' },
    { text: 'Vehículos', icon: <DirectionsCarIcon />, path: '/vehiculos' },
    { text: 'Servicios', icon: <CleaningServicesIcon />, path: '/servicios' },
    { text: 'Inventario', icon: <InventoryIcon />, path: '/inventario' },
    { text: 'Turnos', icon: <ScheduleIcon />, path: '/turnos' },
    { text: 'Configuración', icon: <SettingsIcon />, path: '/configuracion' },
  ];
  
  const drawer = (
    <div>
      {/* Header con logo */}
      <Box 
        sx={{ 
          py: 2, 
          px: 2,
          display: 'flex', 
          alignItems: 'center', 
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText
        }}
      >
        <Avatar 
          sx={{ 
            bgcolor: theme.palette.background.paper,
            color: theme.palette.primary.main,
            width: 40,
            height: 40,
            mr: 2
          }}
        >
          <LocalCarWashIcon />
        </Avatar>
        <Box>
          <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.1rem' }}>
            Auto Lavado
          </Typography>
          <Typography variant="subtitle2" sx={{ opacity: 0.8, fontSize: '0.75rem' }}>
            Sistema de Gestión
          </Typography>
        </Box>
      </Box>
      
      <Divider />
      
      {/* Menú de navegación */}
      <Box sx={{ mt: 2 }}>
        <List sx={{ px: 1 }}>
          {menuItems.map((item) => {
            const isSelected = location.pathname === item.path;
            
            return (
              <ListItem 
                button 
                component={Link} 
                to={item.path} 
                key={item.text}
                selected={isSelected}
                sx={{
                  mb: 0.5,
                  borderRadius: '8px',
                  position: 'relative',
                  transition: 'all 0.2s ease-in-out',
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? alpha(theme.palette.primary.main, 0.2)
                      : alpha(theme.palette.primary.main, 0.1),
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: 0,
                      top: '12%',
                      height: '76%',
                      width: 4,
                      backgroundColor: theme.palette.primary.main,
                      borderRadius: '0 4px 4px 0'
                    }
                  },
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? alpha(theme.palette.primary.main, 0.1)
                      : alpha(theme.palette.primary.main, 0.05),
                  },
                  '&.Mui-selected:hover': {
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? alpha(theme.palette.primary.main, 0.3)
                      : alpha(theme.palette.primary.main, 0.15),
                  },
                }}
              >
                <ListItemIcon sx={{ 
                  color: isSelected ? theme.palette.primary.main : theme.palette.text.secondary,
                  minWidth: 40
                }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  sx={{ 
                    '& .MuiTypography-root': {
                      fontWeight: isSelected ? 600 : 400,
                      color: isSelected ? theme.palette.primary.main : theme.palette.text.primary,
                    }
                  }}
                />
                {isSelected && (
                  <Box 
                    sx={{ 
                      width: 6, 
                      height: 6, 
                      borderRadius: '50%', 
                      backgroundColor: theme.palette.primary.main,
                      ml: 1
                    }} 
                  />
                )}
              </ListItem>
            );
          })}
        </List>
      </Box>
      
      {/* Footer de la sidebar */}
      <Box sx={{ position: 'absolute', bottom: 0, width: '100%', p: 2 }}>
        <Divider sx={{ mb: 1 }} />
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          Auto Lavado © {new Date().getFullYear()}
        </Typography>
      </Box>
    </div>
  );
  
  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    >
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            borderRight: '1px solid',
            borderRightColor: theme.palette.divider
          },
        }}
      >
        {drawer}
      </Drawer>
      
      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: drawerWidth,
            borderRight: '1px solid',
            borderRightColor: theme.palette.divider,
            boxShadow: '0 0 15px rgba(0, 0, 0, 0.05)'
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Sidebar;