import React from 'react';
import { Box, Paper, Typography, Divider, List, ListItem, ListItemText, Switch, FormControlLabel, Button, Card, CardContent } from '@mui/material';
import PageHeader from '../components/common/PageHeader';

const Configuracion = () => {
  const [notifications, setNotifications] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);
  const [autoRefresh, setAutoRefresh] = React.useState(false);

  const handleToggleNotifications = () => {
    setNotifications(!notifications);
  };

  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleToggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };

  return (
    <Box>
      <PageHeader
        title="Configuración"
        subtitle="Personaliza la aplicación según tus preferencias"
      />

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Preferencias de la Aplicación
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <List>
            <ListItem>
              <ListItemText 
                primary="Notificaciones" 
                secondary="Recibir alertas y notificaciones del sistema" 
              />
              <Switch 
                edge="end"
                checked={notifications}
                onChange={handleToggleNotifications}
                inputProps={{
                  'aria-labelledby': 'switch-notifications',
                }}
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Modo Oscuro" 
                secondary="Cambiar a tema oscuro para reducir la fatiga visual" 
              />
              <Switch 
                edge="end"
                checked={darkMode}
                onChange={handleToggleDarkMode}
                inputProps={{
                  'aria-labelledby': 'switch-dark-mode',
                }}
              />
            </ListItem>
            <ListItem>
              <ListItemText 
                primary="Actualización Automática" 
                secondary="Actualizar datos automáticamente cada 5 minutos" 
              />
              <Switch 
                edge="end"
                checked={autoRefresh}
                onChange={handleToggleAutoRefresh}
                inputProps={{
                  'aria-labelledby': 'switch-auto-refresh',
                }}
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Cuenta y Seguridad
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button variant="outlined" color="primary">
              Cambiar Contraseña
            </Button>
            <Button variant="outlined" color="primary">
              Actualizar Información Personal
            </Button>
            <Button variant="outlined" color="error">
              Cerrar Sesión
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Configuracion;