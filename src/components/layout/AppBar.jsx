import React, { useState } from 'react';
import { 
  AppBar as MuiAppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Box,
  Badge,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  Tooltip,
  InputBase,
  alpha,
  useTheme,
  Paper
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SearchIcon from '@mui/icons-material/Search';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const AppBar = ({ title, handleDrawerToggle }) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);
  
  const isMenuOpen = Boolean(anchorEl);
  const isNotificationsOpen = Boolean(notificationsAnchorEl);
  
  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleNotificationsOpen = (event) => {
    setNotificationsAnchorEl(event.currentTarget);
  };
  
  const handleNotificationsClose = () => {
    setNotificationsAnchorEl(null);
  };
  
  // Array de notificaciones simuladas
  const notifications = [
    { id: 1, title: 'Nuevo servicio programado', content: 'Se ha registrado un nuevo servicio para hoy', read: false, time: '10 min' },
    { id: 2, title: 'Stock bajo', content: 'El inventario de Champú está por debajo de lo recomendado', read: false, time: '1 hora' },
    { id: 3, title: 'Pago recibido', content: 'Se ha registrado un nuevo pago', read: true, time: '3 horas' },
  ];
  
  const unreadCount = notifications.filter(notification => !notification.read).length;
  
  return (
    <MuiAppBar 
      position="fixed" 
      elevation={0}
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        borderBottom: `1px solid ${theme.palette.divider}`
      }}
    >
      <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              fontWeight: 600,
              display: { xs: 'none', sm: 'block' }
            }}
          >
            {title}
          </Typography>
          
          {/* Barra de búsqueda */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: alpha(theme.palette.primary.main, 0.05),
              borderRadius: '8px',
              ml: { xs: 0, sm: 4 },
              p: '2px 4px',
              width: { xs: '100%', sm: 300 },
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
            }}
          >
            <IconButton sx={{ p: '4px' }} aria-label="search">
              <SearchIcon color="action" />
            </IconButton>
            <InputBase
              sx={{ ml: 1, flex: 1, fontSize: '0.9rem' }}
              placeholder="Buscar..."
              inputProps={{ 'aria-label': 'buscar' }}
            />
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          {/* Botón de notificaciones */}
          <Tooltip title="Notificaciones">
            <IconButton 
              color="inherit" 
              sx={{ 
                borderRadius: '8px',
                mx: 1,
                color: unreadCount > 0 ? theme.palette.warning.main : undefined,
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                }
              }}
              onClick={handleNotificationsOpen}
            >
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          
          {/* Menú de notificaciones */}
          <Menu
            anchorEl={notificationsAnchorEl}
            id="notifications-menu"
            open={isNotificationsOpen}
            onClose={handleNotificationsClose}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
                mt: 1.5,
                width: 320,
                '& .MuiAvatar-root': {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Notificaciones</Typography>
              {unreadCount > 0 && (
                <Typography variant="caption" sx={{ cursor: 'pointer', color: theme.palette.primary.main }}>
                  Marcar todas como leídas
                </Typography>
              )}
            </Box>
            <Divider />
            
            {notifications.length === 0 ? (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No hay notificaciones
                </Typography>
              </Box>
            ) : (
              notifications.map((notification) => (
                <MenuItem 
                  key={notification.id} 
                  onClick={handleNotificationsClose}
                  sx={{ 
                    py: 1.5, 
                    px: 2,
                    borderLeft: notification.read ? 'none' : `4px solid ${theme.palette.primary.main}`,
                    backgroundColor: notification.read ? 'inherit' : alpha(theme.palette.primary.main, 0.05)
                  }}
                >
                  <Box sx={{ width: '100%' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: notification.read ? 400 : 600 }}>
                        {notification.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {notification.time}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {notification.content}
                    </Typography>
                  </Box>
                </MenuItem>
              ))
            )}
            
            <Divider />
            <Box sx={{ p: 1, display: 'flex', justifyContent: 'center' }}>
              <Typography 
                variant="body2" 
                color="primary" 
                sx={{ cursor: 'pointer', py: 0.5 }}
              >
                Ver todas las notificaciones
              </Typography>
            </Box>
          </Menu>
          
          {/* Perfil del usuario */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              ml: 1,
              cursor: 'pointer',
              borderRadius: '18px',
              backgroundColor: alpha(theme.palette.primary.main, 0.04),
              padding: '4px 6px 4px 8px',
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
              }
            }}
            onClick={handleProfileMenuOpen}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                fontSize: '1rem',
                fontWeight: 'bold',
              }}
            >
              JD
            </Avatar>
            <Box sx={{ ml: 1.5, mr: 1, display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="subtitle2" sx={{ lineHeight: 1.2, fontWeight: 600 }}>
                Juan Díaz
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2 }}>
                Administrador
              </Typography>
            </Box>
            <KeyboardArrowDownIcon fontSize="small" color="action" sx={{ display: { xs: 'none', sm: 'block' } }} />
          </Box>
          
          {/* Menú de perfil */}
          <Menu
            anchorEl={anchorEl}
            id="account-menu"
            open={isMenuOpen}
            onClose={handleMenuClose}
            PaperProps={{
              elevation: 0,
              sx: {
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
                mt: 1.5,
                '& .MuiAvatar-root': {
                  width: 32,
                  height: 32,
                  ml: -0.5,
                  mr: 1,
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Juan Díaz
              </Typography>
              <Typography variant="body2" color="text.secondary">
                juan.diaz@ejemplo.com
              </Typography>
            </Box>
            
            <Divider />
            
            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon>
                <PersonOutlineIcon fontSize="small" />
              </ListItemIcon>
              Mi perfil
            </MenuItem>
            
            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon>
                <SettingsOutlinedIcon fontSize="small" />
              </ListItemIcon>
              Configuración
            </MenuItem>
            
            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon>
                {theme.palette.mode === 'dark' ? (
                  <LightModeIcon fontSize="small" />
                ) : (
                  <DarkModeIcon fontSize="small" />
                )}
              </ListItemIcon>
              {theme.palette.mode === 'dark' ? 'Modo claro' : 'Modo oscuro'}
            </MenuItem>
            
            <Divider />
            
            <MenuItem onClick={handleMenuClose}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              Cerrar sesión
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </MuiAppBar>
  );
};

export default AppBar;