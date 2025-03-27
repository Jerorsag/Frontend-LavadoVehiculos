import React, { useState } from 'react';
import {
  Box,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  Switch,
  Button,
  Card,
  CardContent,
  Grid,
  Avatar,
  IconButton,
  Tooltip,
  Paper,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Badge,
  Chip,
  useTheme,
  alpha,
  Collapse,
  InputAdornment
} from '@mui/material';
import { toast } from 'react-toastify';

// Iconos
import NotificationsIcon from '@mui/icons-material/Notifications';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import SecurityIcon from '@mui/icons-material/Security';
import PersonIcon from '@mui/icons-material/Person';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import LockIcon from '@mui/icons-material/Lock';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import EditIcon from '@mui/icons-material/Edit';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import InfoIcon from '@mui/icons-material/Info';
import LanguageIcon from '@mui/icons-material/Language';
import TranslateIcon from '@mui/icons-material/Translate';
import StorageIcon from '@mui/icons-material/Storage';
import BackupIcon from '@mui/icons-material/Backup';
import DeleteIcon from '@mui/icons-material/Delete';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';

const Configuracion = () => {
  const theme = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [mobileNotifications, setMobileNotifications] = useState(true);
  const [dataExport, setDataExport] = useState(false);
  const [language, setLanguage] = useState('es');
  const [autoBackup, setAutoBackup] = useState(true);

  // Estados para diálogos
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [profileDialog, setProfileDialog] = useState(false);
  const [logoutDialog, setLogoutDialog] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);

  // Estados para formularios
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Información del perfil del usuario
  const [userProfile, setUserProfile] = useState({
    name: 'Juan Pérez',
    email: 'juan.perez@ejemplo.com',
    phone: '+57 123 456 7890',
    role: 'Administrador',
    lastLogin: '27/03/2025 10:30'
  });

  const handleToggleNotifications = () => {
    setNotifications(!notifications);
    toast.success(`Notificaciones ${!notifications ? 'activadas' : 'desactivadas'}`);
  };

  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
    toast.success(`Modo oscuro ${!darkMode ? 'activado' : 'desactivado'}`);
  };

  const handleToggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
    toast.success(`Actualización automática ${!autoRefresh ? 'activada' : 'desactivada'}`);
  };

  const handleToggleEmailNotifications = () => {
    setEmailNotifications(!emailNotifications);
    toast.success(`Notificaciones por correo ${!emailNotifications ? 'activadas' : 'desactivadas'}`);
  };

  const handleToggleMobileNotifications = () => {
    setMobileNotifications(!mobileNotifications);
    toast.success(`Notificaciones móviles ${!mobileNotifications ? 'activadas' : 'desactivadas'}`);
  };

  const handleToggleDataExport = () => {
    setDataExport(!dataExport);
    toast.success(`Exportación automática de datos ${!dataExport ? 'activada' : 'desactivada'}`);
  };

  const handleToggleAutoBackup = () => {
    setAutoBackup(!autoBackup);
    toast.success(`Copia de seguridad automática ${!autoBackup ? 'activada' : 'desactivada'}`);
  };

  const handleSavePassword = () => {
    if (newPassword !== confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    // Aquí iría la lógica para guardar la contraseña
    toast.success('Contraseña actualizada correctamente');
    setPasswordDialog(false);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleUpdateProfile = () => {
    // Aquí iría la lógica para actualizar el perfil
    toast.success('Información personal actualizada correctamente');
    setProfileDialog(false);
  };

  const handleLogout = () => {
    // Aquí iría la lógica para cerrar sesión
    toast.info('Sesión cerrada correctamente');
    setLogoutDialog(false);
  };

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    toast.success(`Idioma cambiado a ${lang === 'es' ? 'Español' : 'English'}`);
  };

  const handleToggleExpand = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const exportData = () => {
    toast.success('Exportando datos...');
    setTimeout(() => {
      toast.info('Datos exportados correctamente');
    }, 1500);
  };

  return (
    <Box>
      {/* Header estilizado */}
      <Card
        elevation={0}
        sx={{
          mb: 4,
          borderRadius: '16px',
          border: `1px solid ${theme.palette.divider}`,
          position: 'relative',
          overflow: 'hidden',
          background: `linear-gradient(to right, ${alpha(theme.palette.primary.main, 0.05)}, ${alpha(theme.palette.primary.main, 0.02)})`
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            right: -20,
            top: -20,
            transform: 'rotate(15deg)',
            opacity: 0.05,
            zIndex: 0
          }}
        >
          <SettingsIcon sx={{ fontSize: 180 }} />
        </Box>

        <CardContent sx={{ py: 4, position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: theme.palette.primary.main, display: 'flex', alignItems: 'center' }}>
                <SettingsIcon sx={{ mr: 1, fontSize: 32 }} />
                Configuración del Sistema
              </Typography>
              <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
                Personaliza la aplicación según tus preferencias y necesidades
              </Typography>
            </Box>

            <Avatar
              sx={{
                width: 64,
                height: 64,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                fontWeight: 'bold',
                fontSize: '1.5rem'
              }}
            >
              {userProfile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </Avatar>
          </Box>

          {/* Información del usuario */}
          <Paper
            elevation={0}
            sx={{
              mt: 3,
              p: 2,
              borderRadius: '12px',
              backgroundColor: alpha(theme.palette.background.paper, 0.7),
              border: `1px solid ${theme.palette.divider}`
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PersonIcon sx={{ color: theme.palette.primary.main, mr: 1 }} />
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Usuario
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {userProfile.name}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <EmailIcon sx={{ color: theme.palette.info.main, mr: 1 }} />
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Correo
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {userProfile.email}
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <SecurityIcon sx={{ color: theme.palette.warning.main, mr: 1 }} />
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Rol
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      <Chip
                        size="small"
                        label={userProfile.role}
                        sx={{
                          bgcolor: alpha(theme.palette.warning.main, 0.1),
                          color: theme.palette.warning.main,
                          fontWeight: 500
                        }}
                      />
                    </Typography>
                  </Box>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccessTimeIcon sx={{ color: theme.palette.success.main, mr: 1 }} />
                  <Box>
                    <Typography variant="caption" color="textSecondary">
                      Último acceso
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {userProfile.lastLogin}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Panel de Preferencias de Aplicación */}
        <Grid item xs={12} md={6}>
          <Card
            elevation={0}
            sx={{
              height: '100%',
              borderRadius: '16px',
              border: `1px solid ${theme.palette.divider}`
            }}
          >
            <CardContent sx={{ pb: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 2
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    color: theme.palette.primary.main,
                    fontWeight: 600
                  }}
                >
                  <SettingsIcon sx={{ mr: 1 }} />
                  Preferencias de la Aplicación
                </Typography>
                <IconButton
                  onClick={() => handleToggleExpand('preferences')}
                  aria-expanded={expandedSection === 'preferences'}
                  aria-label="mostrar más"
                >
                  <ExpandMoreIcon
                    sx={{
                      transform: expandedSection === 'preferences' ? 'rotate(180deg)' : 'rotate(0)',
                      transition: '0.3s'
                    }}
                  />
                </IconButton>
              </Box>

              <Divider sx={{ mb: 1 }} />

              <List disablePadding>
                <ListItem sx={{ py: 1.5 }}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <DarkModeIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                          Modo Oscuro
                        </Typography>
                      </Box>
                    }
                    secondary="Cambiar a tema oscuro para reducir la fatiga visual"
                    secondaryTypographyProps={{ sx: { mt: 0.5 } }}
                  />
                  <Switch
                    edge="end"
                    checked={darkMode}
                    onChange={handleToggleDarkMode}
                    inputProps={{
                      'aria-labelledby': 'switch-dark-mode',
                    }}
                    color="primary"
                  />
                </ListItem>

                <Divider component="li" variant="middle" />

                <ListItem sx={{ py: 1.5 }}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AutorenewIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                          Actualización Automática
                        </Typography>
                      </Box>
                    }
                    secondary="Actualizar datos automáticamente cada 5 minutos"
                    secondaryTypographyProps={{ sx: { mt: 0.5 } }}
                  />
                  <Switch
                    edge="end"
                    checked={autoRefresh}
                    onChange={handleToggleAutoRefresh}
                    inputProps={{
                      'aria-labelledby': 'switch-auto-refresh',
                    }}
                    color="primary"
                  />
                </ListItem>

                <Divider component="li" variant="middle" />

                <ListItem sx={{ py: 1.5 }}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <LanguageIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                          Idioma
                        </Typography>
                      </Box>
                    }
                    secondary="Cambiar el idioma de la interfaz"
                    secondaryTypographyProps={{ sx: { mt: 0.5 } }}
                  />
                  <Box>
                    <Chip
                      icon={<TranslateIcon />}
                      label="Español"
                      color={language === 'es' ? 'primary' : 'default'}
                      onClick={() => handleLanguageChange('es')}
                      sx={{ mr: 1, fontWeight: 500 }}
                    />
                    <Chip
                      icon={<TranslateIcon />}
                      label="English"
                      color={language === 'en' ? 'primary' : 'default'}
                      onClick={() => handleLanguageChange('en')}
                      sx={{ fontWeight: 500 }}
                    />
                  </Box>
                </ListItem>
              </List>

              <Collapse in={expandedSection === 'preferences'} timeout="auto" unmountOnExit>
                <List disablePadding>
                  <Divider component="li" variant="middle" />

                  <ListItem sx={{ py: 1.5 }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <BackupIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                            Copia de seguridad automática
                          </Typography>
                        </Box>
                      }
                      secondary="Realizar copias de seguridad automáticas diarias"
                      secondaryTypographyProps={{ sx: { mt: 0.5 } }}
                    />
                    <Switch
                      edge="end"
                      checked={autoBackup}
                      onChange={handleToggleAutoBackup}
                      inputProps={{
                        'aria-labelledby': 'switch-auto-backup',
                      }}
                      color="primary"
                    />
                  </ListItem>

                  <Divider component="li" variant="middle" />

                  <ListItem sx={{ py: 1.5 }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <StorageIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                            Exportación automática de datos
                          </Typography>
                        </Box>
                      }
                      secondary="Exportar datos a CSV semanalmente"
                      secondaryTypographyProps={{ sx: { mt: 0.5 } }}
                    />
                    <Switch
                      edge="end"
                      checked={dataExport}
                      onChange={handleToggleDataExport}
                      inputProps={{
                        'aria-labelledby': 'switch-data-export',
                      }}
                      color="primary"
                    />
                  </ListItem>

                  <Divider component="li" variant="middle" />

                  <ListItem sx={{ py: 1.5 }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <ColorLensIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                            Tema de color
                          </Typography>
                        </Box>
                      }
                      secondary="Selecciona el color principal de la aplicación"
                      secondaryTypographyProps={{ sx: { mt: 0.5 } }}
                    />
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {['#3f51b5', '#f50057', '#009688', '#ff9800', '#4caf50'].map((color) => (
                        <Tooltip key={color} title={color} arrow>
                          <Avatar
                            sx={{
                              width: 24,
                              height: 24,
                              bgcolor: color,
                              cursor: 'pointer',
                              border: color === '#3f51b5' ? `2px solid ${theme.palette.primary.main}` : 'none'
                            }}
                          >
                            {color === '#3f51b5' && (
                              <CheckCircleIcon sx={{ fontSize: 14, color: 'white' }} />
                            )}
                          </Avatar>
                        </Tooltip>
                      ))}
                    </Box>
                  </ListItem>
                </List>
              </Collapse>
            </CardContent>
          </Card>
        </Grid>

        {/* Panel de Notificaciones */}
        <Grid item xs={12} md={6}>
          <Card
            elevation={0}
            sx={{
              height: '100%',
              borderRadius: '16px',
              border: `1px solid ${theme.palette.divider}`
            }}
          >
            <CardContent sx={{ pb: 2 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 2
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    color: theme.palette.primary.main,
                    fontWeight: 600
                  }}
                >
                  <NotificationsIcon sx={{ mr: 1 }} />
                  Configuración de Notificaciones
                </Typography>
                <IconButton
                  onClick={() => handleToggleExpand('notifications')}
                  aria-expanded={expandedSection === 'notifications'}
                  aria-label="mostrar más"
                >
                  <ExpandMoreIcon
                    sx={{
                      transform: expandedSection === 'notifications' ? 'rotate(180deg)' : 'rotate(0)',
                      transition: '0.3s'
                    }}
                  />
                </IconButton>
              </Box>

              <Divider sx={{ mb: 1 }} />

              <List disablePadding>
                <ListItem sx={{ py: 1.5 }}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <NotificationsIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                          Notificaciones del Sistema
                        </Typography>
                      </Box>
                    }
                    secondary="Recibir alertas y notificaciones del sistema"
                    secondaryTypographyProps={{ sx: { mt: 0.5 } }}
                  />
                  <Switch
                    edge="end"
                    checked={notifications}
                    onChange={handleToggleNotifications}
                    inputProps={{
                      'aria-labelledby': 'switch-notifications',
                    }}
                    color="primary"
                  />
                </ListItem>

                <Divider component="li" variant="middle" />

                <ListItem sx={{ py: 1.5 }}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <EmailIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                          Notificaciones por Correo
                        </Typography>
                      </Box>
                    }
                    secondary="Recibir notificaciones por correo electrónico"
                    secondaryTypographyProps={{ sx: { mt: 0.5 } }}
                  />
                  <Switch
                    edge="end"
                    checked={emailNotifications}
                    onChange={handleToggleEmailNotifications}
                    inputProps={{
                      'aria-labelledby': 'switch-email-notifications',
                    }}
                    color="primary"
                    disabled={!notifications}
                  />
                </ListItem>

                <Divider component="li" variant="middle" />

                <ListItem sx={{ py: 1.5 }}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <PhoneIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                          Notificaciones Móviles
                        </Typography>
                      </Box>
                    }
                    secondary="Recibir notificaciones en tu dispositivo móvil"
                    secondaryTypographyProps={{ sx: { mt: 0.5 } }}
                  />
                  <Switch
                    edge="end"
                    checked={mobileNotifications}
                    onChange={handleToggleMobileNotifications}
                    inputProps={{
                      'aria-labelledby': 'switch-mobile-notifications',
                    }}
                    color="primary"
                    disabled={!notifications}
                  />
                </ListItem>
              </List>

              <Collapse in={expandedSection === 'notifications'} timeout="auto" unmountOnExit>
                <List disablePadding>
                  <Divider component="li" variant="middle" />

                  <ListItem sx={{ py: 1.5 }}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <InfoIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                          <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                            Tipos de Notificaciones
                          </Typography>
                        </Box>
                      }
                      secondary="Selecciona los tipos de notificaciones que deseas recibir"
                      secondaryTypographyProps={{ sx: { mt: 0.5 } }}
                    />
                  </ListItem>

                  <Box sx={{ px: 2, py: 1 }}>
                    <FormControlLabel
                      control={<Switch checked={true} color="primary" disabled={!notifications} />}
                      label="Alertas del sistema"
                    />
                    <FormControlLabel
                      control={<Switch checked={true} color="primary" disabled={!notifications} />}
                      label="Nuevos servicios"
                    />
                    <FormControlLabel
                      control={<Switch checked={true} color="primary" disabled={!notifications} />}
                      label="Cambios en turnos"
                    />
                    <FormControlLabel
                      control={<Switch checked={false} color="primary" disabled={!notifications} />}
                      label="Reportes semanales"
                    />
                  </Box>
                </List>
              </Collapse>
            </CardContent>
          </Card>
        </Grid>

        {/* Panel de Cuenta y Seguridad */}
        <Grid item xs={12}>
          <Card
            elevation={0}
            sx={{
              borderRadius: '16px',
              border: `1px solid ${theme.palette.divider}`
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                gutterBottom
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                  mb: 2
                }}
              >
                <SecurityIcon sx={{ mr: 1 }} />
                Cuenta y Seguridad
              </Typography>

              <Divider sx={{ mb: 3 }} />

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6} md={4}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: '12px',
                      border: `1px solid ${theme.palette.divider}`,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.3s',
                      '&:hover': {
                        boxShadow: theme.shadows[3],
                        transform: 'translateY(-3px)'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: alpha(theme.palette.warning.main, 0.1),
                          color: theme.palette.warning.main,
                          mr: 1.5
                        }}
                      >
                        <LockIcon />
                      </Avatar>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Seguridad
                      </Typography>
                    </Box>

                    <Typography variant="body2" color="textSecondary" paragraph sx={{ flex: 1 }}>
                      Actualiza tu contraseña y configura las opciones de seguridad de tu cuenta
                    </Typography>

                    <Button
                      fullWidth
                      variant="outlined"
                      color="warning"
                      startIcon={<LockIcon />}
                      onClick={() => setPasswordDialog(true)}
                      sx={{ borderRadius: '8px', mt: 'auto' }}
                    >
                      Cambiar Contraseña
                    </Button>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: '12px',
                      border: `1px solid ${theme.palette.divider}`,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.3s',
                      '&:hover': {
                        boxShadow: theme.shadows[3],
                        transform: 'translateY(-3px)'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex' }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: alpha(theme.palette.info.main, 0.1),
                          color: theme.palette.info.main,
                          mr: 1.5
                        }}
                      >
                        <PersonIcon />
                      </Avatar>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Perfil
                      </Typography>
                    </Box>

                    <Typography variant="body2" color="textSecondary" paragraph sx={{ flex: 1 }}>
                      Actualiza tu información personal, correo electrónico y preferencias de contacto
                    </Typography>

                    <Button
                      fullWidth
                      variant="outlined"
                      color="info"
                      startIcon={<EditIcon />}
                      onClick={() => setProfileDialog(true)}
                      sx={{ borderRadius: '8px', mt: 'auto' }}
                    >
                      Editar Perfil
                    </Button>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: '12px',
                      border: `1px solid ${theme.palette.divider}`,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.3s',
                      '&:hover': {
                        boxShadow: theme.shadows[3],
                        transform: 'translateY(-3px)'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: alpha(theme.palette.error.main, 0.1),
                          color: theme.palette.error.main,
                          mr: 1.5
                        }}
                      >
                        <ExitToAppIcon />
                      </Avatar>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Sesión
                      </Typography>
                    </Box>

                    <Typography variant="body2" color="textSecondary" paragraph sx={{ flex: 1 }}>
                      Finaliza tu sesión actual o gestiona las sesiones activas en otros dispositivos
                    </Typography>

                    <Button
                      fullWidth
                      variant="outlined"
                      color="error"
                      startIcon={<ExitToAppIcon />}
                      onClick={() => setLogoutDialog(true)}
                      sx={{ borderRadius: '8px', mt: 'auto' }}
                    >
                      Cerrar Sesión
                    </Button>
                  </Paper>
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<CloudDownloadIcon />}
                  onClick={exportData}
                  sx={{ borderRadius: '8px' }}
                >
                  Exportar mis datos
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Footer informativo */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          mt: 3,
          pt: 2,
          color: theme.palette.text.secondary,
          borderTop: `1px solid ${theme.palette.divider}`,
          fontSize: '0.75rem'
        }}
      >
        <Typography variant="caption">
          La configuración se guarda automáticamente y se sincroniza con todos tus dispositivos
        </Typography>
      </Box>

      {/* Diálogos */}
      {/* ... (Los diálogos ya están incluidos en tu código) ... */}
    </Box>
  );
};

export default Configuracion;