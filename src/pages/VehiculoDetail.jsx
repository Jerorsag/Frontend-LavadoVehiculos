import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  MenuItem,
  CircularProgress,
  Avatar,
  Chip,
  IconButton,
  Divider,
  Tooltip,
  Alert,
  LinearProgress,
  useTheme,
  alpha
} from '@mui/material';
import { toast } from 'react-toastify';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { getVehiculo, updateVehiculo, getHistorialVehiculo, getTiposVehiculos } from '../api/vehiculos';

// Iconos
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LocalCarWashIcon from '@mui/icons-material/LocalCarWash';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import HistoryIcon from '@mui/icons-material/History';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AirportShuttleIcon from '@mui/icons-material/AirportShuttle';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import TimeToLeaveIcon from '@mui/icons-material/TimeToLeave';
import RefreshIcon from '@mui/icons-material/Refresh';
import SellIcon from '@mui/icons-material/Sell';
import BadgeIcon from '@mui/icons-material/Badge';
import SpeedIcon from '@mui/icons-material/Speed';
import EventRepeatIcon from '@mui/icons-material/EventRepeat';
import PaymentsIcon from '@mui/icons-material/Payments';
import ReceiptIcon from '@mui/icons-material/Receipt';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const validationSchema = yup.object({
  id_tipo: yup.number().required('El tipo de vehículo es requerido')
});

const VehiculoDetail = () => {
  const { placa } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [vehiculo, setVehiculo] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [tiposVehiculos, setTiposVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const formik = useFormik({
    initialValues: {
      id_tipo: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setSaving(true);
        const updatedVehiculo = await updateVehiculo(placa, values);
        setVehiculo(updatedVehiculo);
        setEditMode(false);
        toast.success('Vehículo actualizado exitosamente');
      } catch (error) {
        toast.error('Error al actualizar el vehículo');
        console.error('Error updating vehiculo:', error);
      } finally {
        setSaving(false);
      }
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [vehiculoData, historialData, tiposData] = await Promise.all([
          getVehiculo(placa),
          getHistorialVehiculo(placa),
          getTiposVehiculos()
        ]);
        
        setVehiculo(vehiculoData);
        setHistorial(Array.isArray(historialData) ? historialData : []);
        setTiposVehiculos(tiposData.results);
        
        formik.setValues({
          id_tipo: vehiculoData.id_tipo?.id_tipo || ''
        });
      } catch (error) {
        setError('Error al cargar la información del vehículo');
        toast.error('Error al cargar la información del vehículo');
        console.error('Error fetching vehiculo data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [placa]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleEditClick = () => {
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    formik.resetForm();
    if (vehiculo?.id_tipo?.id_tipo) {
      formik.setValues({
        id_tipo: vehiculo.id_tipo.id_tipo
      });
    }
  };

  const handleRefresh = async () => {
    try {
      setLoadingData(true);
      const historialData = await getHistorialVehiculo(placa);
      setHistorial(Array.isArray(historialData) ? historialData : []);
      toast.success('Historial actualizado');
    } catch (error) {
      toast.error('Error al actualizar el historial');
      console.error('Error refreshing historial:', error);
    } finally {
      setLoadingData(false);
    }
  };

  // Función para obtener el icono según el tipo de vehículo
  const getVehicleIcon = (type) => {
    const typeStr = type?.toLowerCase() || '';
    
    if (typeStr.includes('camioneta') || typeStr.includes('suv')) return <AirportShuttleIcon />;
    if (typeStr.includes('moto')) return <TwoWheelerIcon />;
    if (typeStr.includes('camion')) return <LocalShippingIcon />;
    if (typeStr.includes('sedan')) return <TimeToLeaveIcon />;
    
    // Por defecto
    return <DirectionsCarIcon />;
  };

  // Obtener color según el tipo de vehículo
  const getVehicleColor = (type) => {
    const typeStr = type?.toLowerCase() || '';
    
    if (typeStr.includes('camioneta') || typeStr.includes('suv')) return theme.palette.info.main;
    if (typeStr.includes('moto')) return theme.palette.error.main;
    if (typeStr.includes('camion')) return theme.palette.warning.main;
    if (typeStr.includes('sedan')) return theme.palette.success.main;
    
    // Por defecto
    return theme.palette.primary.main;
  };
  
  // Calcular estadísticas
  const calculateStats = () => {
    const totalVisitas = historial.length;
    const costoTotal = historial.reduce((sum, servicio) => {
      const precio = typeof servicio.precio === 'number' 
        ? servicio.precio 
        : parseFloat(servicio.precio || 0);
      return sum + (isNaN(precio) ? 0 : precio);
    }, 0);
    
    const ultimaVisita = historial.length > 0 
      ? format(new Date(historial[0].fecha), 'dd MMMM yyyy', { locale: es })
      : 'No hay visitas registradas';
      
    const tiposLavadoCount = {};
    historial.forEach(servicio => {
      const tipoLavado = servicio.id_tipo_lavado?.nombre || 'No especificado';
      tiposLavadoCount[tipoLavado] = (tiposLavadoCount[tipoLavado] || 0) + 1;
    });
    
    const tipoLavadoFavorito = Object.entries(tiposLavadoCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'No hay datos';
    
    return { totalVisitas, costoTotal, ultimaVisita, tipoLavadoFavorito };
  };
  
  const stats = calculateStats();

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <Box sx={{ width: '60px', height: '60px', position: 'relative', mb: 3 }}>
          <CircularProgress size={60} thickness={4} />
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <DirectionsCarIcon sx={{ fontSize: 30, color: theme.palette.primary.main }} />
          </Box>
        </Box>
        <Typography variant="h6" color="textSecondary" gutterBottom>
          Cargando información del vehículo
        </Typography>
        <Box sx={{ width: '200px', mt: 2 }}>
          <LinearProgress color="primary" />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/vehiculos')}
        >
          Volver a la lista de vehículos
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Barra superior con acciones */}
      <Box sx={{ 
        mb: 3, 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/vehiculos')}
          sx={{ borderRadius: '8px' }}
        >
          Volver a vehículos
        </Button>
        
        {!editMode ? (
          <Button
            variant="contained"
            color="primary"
            startIcon={<EditIcon />}
            onClick={handleEditClick}
            sx={{ borderRadius: '8px' }}
          >
            Editar información
          </Button>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<CancelIcon />}
              onClick={handleCancelEdit}
              sx={{ borderRadius: '8px' }}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              onClick={formik.handleSubmit}
              sx={{ borderRadius: '8px' }}
              disabled={saving}
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </Box>
        )}
      </Box>

      {/* Cabecera con información del vehículo */}
      <Card 
        elevation={0} 
        sx={{ 
          mb: 3, 
          borderRadius: '16px',
          border: `1px solid ${theme.palette.divider}`,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {editMode && (
          <Box 
            sx={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              height: '4px', 
              bgcolor: theme.palette.primary.main 
            }} 
          />
        )}
        
        <CardContent sx={{ py: 3 }}>
          <Typography 
            variant="h5" 
            component="h2" 
            gutterBottom
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              color: theme.palette.primary.main,
              fontWeight: 600
            }}
          >
            <DirectionsCarIcon sx={{ mr: 1 }} />
            {editMode ? 'Editar información del vehículo' : 'Información del vehículo'}
          </Typography>
          
          {editMode ? (
            <form onSubmit={formik.handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <SellIcon sx={{ mt: 2.5, mr: 1, color: theme.palette.primary.main }} />
                    <TextField
                      fullWidth
                      disabled
                      label="Placa"
                      value={placa}
                      margin="normal"
                      variant="outlined"
                      InputProps={{
                        sx: { borderRadius: '8px' }
                      }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <DirectionsCarIcon sx={{ mt: 2.5, mr: 1, color: theme.palette.primary.main }} />
                    <TextField
                      fullWidth
                      id="id_tipo"
                      name="id_tipo"
                      select
                      label="Tipo de Vehículo"
                      value={formik.values.id_tipo}
                      onChange={formik.handleChange}
                      error={formik.touched.id_tipo && Boolean(formik.errors.id_tipo)}
                      helperText={formik.touched.id_tipo && formik.errors.id_tipo}
                      margin="normal"
                      disabled={saving}
                      variant="outlined"
                      InputProps={{
                        sx: { borderRadius: '8px' }
                      }}
                    >
                      {tiposVehiculos.map((tipo) => (
                        <MenuItem key={tipo.id_tipo} value={tipo.id_tipo}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {getVehicleIcon(tipo.descripcion)}
                            <span style={{ marginLeft: 8 }}>{tipo.descripcion}</span>
                          </Box>
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>
                </Grid>
              </Grid>
            </form>
          ) : (
            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, flexWrap: 'wrap' }}>
                <Avatar 
                  sx={{ 
                    bgcolor: alpha(getVehicleColor(vehiculo.id_tipo?.descripcion), 0.2),
                    color: getVehicleColor(vehiculo.id_tipo?.descripcion),
                    width: 70,
                    height: 70,
                    mr: 3
                  }}
                >
                  {getVehicleIcon(vehiculo.id_tipo?.descripcion)}
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {vehiculo.placa}
                  </Typography>
                  <Chip
                    icon={<DirectionsCarIcon />}
                    label={vehiculo.id_tipo?.descripcion || 'No especificado'}
                    color="primary"
                    size="small"
                    variant="outlined"
                    sx={{ mt: 0.5 }}
                  />
                </Box>
              </Box>
              
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      display: 'flex', 
                      alignItems: 'center', 
                      borderRadius: '12px',
                      border: `1px solid ${theme.palette.divider}`,
                      height: '100%'
                    }}
                  >
                    <Avatar sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), mr: 2 }}>
                      <EventRepeatIcon sx={{ color: theme.palette.success.main }} />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Total de visitas
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        {stats.totalVisitas} lavados
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      display: 'flex', 
                      alignItems: 'center', 
                      borderRadius: '12px',
                      border: `1px solid ${theme.palette.divider}`,
                      height: '100%'
                    }}
                  >
                    <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), mr: 2 }}>
                      <PaymentsIcon sx={{ color: theme.palette.warning.main }} />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Gasto total
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        ${stats.costoTotal.toFixed(2)}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      display: 'flex', 
                      alignItems: 'center', 
                      borderRadius: '12px',
                      border: `1px solid ${theme.palette.divider}`,
                      height: '100%'
                    }}
                  >
                    <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), mr: 2 }}>
                      <CalendarTodayIcon sx={{ color: theme.palette.info.main }} />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Última visita
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        {stats.ultimaVisita}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Paper 
                    elevation={0} 
                    sx={{ 
                      p: 2, 
                      display: 'flex', 
                      alignItems: 'center', 
                      borderRadius: '12px',
                      border: `1px solid ${theme.palette.divider}`,
                      height: '100%'
                    }}
                  >
                    <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), mr: 2 }}>
                      <LocalCarWashIcon sx={{ color: theme.palette.primary.main }} />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Tipo de lavado favorito
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        {stats.tipoLavadoFavorito}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Pestañas de información */}
      <Box 
        sx={{ 
          bgcolor: alpha(theme.palette.primary.main, 0.04), 
          borderRadius: '12px', 
          mb: 3,
          overflow: 'hidden',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
        }}
      >
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          variant="fullWidth"
          textColor="primary"
          indicatorColor="primary"
          sx={{
            '& .MuiTab-root': {
              py: 2,
              fontWeight: 500,
              transition: 'all 0.2s',
              '&:hover': {
                bgcolor: alpha(theme.palette.primary.main, 0.05),
              },
            },
          }}
        >
          <Tab 
            label="Historial de Servicios" 
            icon={<HistoryIcon />} 
            iconPosition="start"
            disabled={editMode}
          />
          <Tab 
            label="Estadísticas" 
            icon={<AssessmentIcon />} 
            iconPosition="start"
            disabled={editMode}
          />
        </Tabs>
      </Box>

      {/* Contenido de pestaña seleccionada */}
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          borderRadius: '16px',
          border: `1px solid ${theme.palette.divider}`,
          minHeight: '300px',
          position: 'relative'
        }}
      >
        {loadingData ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Botón de actualizar */}
            {tabValue === 0 && !editMode && (
              <Tooltip title="Actualizar historial">
                <IconButton 
                  sx={{ 
                    position: 'absolute', 
                    top: 12, 
                    right: 12,
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.2),
                    }
                  }}
                  onClick={handleRefresh}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            )}
          
            {tabValue === 0 && (
              <Box>
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    fontWeight: 600,
                    mb: 3
                  }}
                >
                  <HistoryIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                  Historial de Servicios
                </Typography>
                
                {historial.length === 0 ? (
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      py: 4
                    }}
                  >
                    <LocalCarWashIcon sx={{ fontSize: 50, color: alpha(theme.palette.text.secondary, 0.3), mb: 2 }} />
                    <Typography variant="body1" color="text.secondary">
                      No hay servicios registrados para este vehículo
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer 
                    component={Paper} 
                    elevation={0}
                    sx={{ 
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: '8px',
                      overflow: 'hidden'
                    }}
                  >
                    <Table>
                      <TableHead>
                        <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                          <TableCell>ID</TableCell>
                          <TableCell>Fecha</TableCell>
                          <TableCell>Tipo de Lavado</TableCell>
                          <TableCell>Empleado que Recibió</TableCell>
                          <TableCell>Empleado que Lavó</TableCell>
                          <TableCell align="right">Precio</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {historial.map((servicio) => (
                          <TableRow key={servicio.id_servicio} sx={{ 
                            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) },
                          }}>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {servicio.id_servicio}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
                              <CalendarTodayIcon sx={{ mr: 1, fontSize: 16, color: theme.palette.primary.main }} />
                              <Typography variant="body2">
                                {format(new Date(servicio.fecha), 'dd/MM/yyyy HH:mm', { locale: es })}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                icon={<LocalCarWashIcon fontSize="small" />}
                                label={servicio.id_tipo_lavado?.nombre || 'No especificado'}
                                sx={{ 
                                  bgcolor: alpha(theme.palette.info.main, 0.1),
                                  color: theme.palette.info.main,
                                  border: 'none',
                                  fontWeight: 500
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <BadgeIcon sx={{ mr: 1, fontSize: 16, color: theme.palette.success.main }} />
                                <Typography variant="body2">
                                  {servicio.id_empleado_recibe ? 
                                    `${servicio.id_empleado_recibe.nombre} ${servicio.id_empleado_recibe.apellido}` : 
                                    'No especificado'}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <BadgeIcon sx={{ mr: 1, fontSize: 16, color: theme.palette.warning.main }} />
                                <Typography variant="body2">
                                  {servicio.id_empleado_lava ? 
                                    `${servicio.id_empleado_lava.nombre} ${servicio.id_empleado_lava.apellido}` : 
                                    'No especificado'}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="right">
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontWeight: 600, 
                                  color: theme.palette.success.main 
                                }}
                              >
                                ${typeof servicio.precio === 'number' ? servicio.precio.toFixed(2) : '0.00'}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            )}
            
            {tabValue === 1 && (
              <Box>
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    fontWeight: 600,
                    mb: 3
                  }}
                >
                  <AssessmentIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                  Estadísticas del Vehículo
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Card 
                      elevation={0} 
                      sx={{ 
                        borderRadius: '12px',
                        position: 'relative',
                        overflow: 'hidden',
                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                        '&:hover': {
                          boxShadow: theme.shadows[2],
                          bgcolor: alpha(theme.palette.primary.main, 0.08),
                          transform: 'translateY(-2px)',
                          transition: 'all 0.3s'
                        }
                      }}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          top: -15,
                          right: -10,
                          opacity: 0.1,
                          transform: 'rotate(15deg)'
                        }}
                      >
                        <EventRepeatIcon sx={{ fontSize: 80 }} />
                      </Box>
                      <CardContent>
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                          Total de visitas
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 600 }}>
                          {stats.totalVisitas}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <Typography variant="caption" color="textSecondary">
                            Servicios de lavado
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4}>
                    <Card 
                      elevation={0} 
                      sx={{ 
                        borderRadius: '12px',
                        position: 'relative',
                        overflow: 'hidden',
                        bgcolor: alpha(theme.palette.warning.main, 0.05),
                        border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
                        '&:hover': {
                          boxShadow: theme.shadows[2],
                          bgcolor: alpha(theme.palette.warning.main, 0.08),
                          transform: 'translateY(-2px)',
                          transition: 'all 0.3s'
                        }
                      }}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          top: -15,
                          right: -10,
                          opacity: 0.1,
                          transform: 'rotate(15deg)'
                        }}
                      >
                        <PaymentsIcon sx={{ fontSize: 80 }} />
                      </Box>
                      <CardContent>
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                          Gasto total
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 600 }}>
                          ${stats.costoTotal.toFixed(2)}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <Typography variant="caption" color="textSecondary">
                            En servicios de lavado
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4}>
                    <Card 
                      elevation={0} 
                      sx={{ 
                        borderRadius: '12px',
                        position: 'relative',
                        overflow: 'hidden',
                        bgcolor: alpha(theme.palette.info.main, 0.05),
                        border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
                        '&:hover': {
                          boxShadow: theme.shadows[2],
                          bgcolor: alpha(theme.palette.info.main, 0.08),
                          transform: 'translateY(-2px)',
                          transition: 'all 0.3s'
                        }
                      }}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          top: -15,
                          right: -10,
                          opacity: 0.1,
                          transform: 'rotate(15deg)'
                        }}
                      >
                        <LocalCarWashIcon sx={{ fontSize: 80 }} />
                      </Box>
                      <CardContent>
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                          Tipo de lavado favorito
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 600 }}>
                          {stats.tipoLavadoFavorito}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <Typography variant="caption" color="textSecondary">
                            Servicio más solicitado
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid item xs={12}>
                    <Card 
                      elevation={0} 
                      sx={{ 
                        borderRadius: '12px',
                        position: 'relative',
                        overflow: 'hidden',
                        bgcolor: alpha(theme.palette.success.main, 0.05),
                        border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
                        mt: 2
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <SpeedIcon sx={{ color: theme.palette.success.main, mr: 1 }} />
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            Resumen del vehículo
                          </Typography>
                        </Box>
                        <Typography variant="body2" paragraph>
                          Este vehículo ha visitado el lavadero <strong>{stats.totalVisitas}</strong> veces, 
                          generando un ingreso total de <strong>${stats.costoTotal.toFixed(2)}</strong>. 
                          {stats.totalVisitas > 0 ? (
                            <>Su última visita fue el <strong>{stats.ultimaVisita}</strong> y 
                            el tipo de lavado más solicitado ha sido <strong>{stats.tipoLavadoFavorito}</strong>.</>
                          ) : 'No se ha registrado ninguna visita hasta el momento.'}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <Button 
                            variant="outlined" 
                            color="success"
                            onClick={() => navigate('/servicios/nuevo', { state: { placa: vehiculo.placa } })}
                            sx={{ borderRadius: '8px', mt: 1 }}
                          >
                            <ReceiptIcon sx={{ mr: 1 }} />
                            Registrar nuevo servicio
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            )}
          </>
        )}
      </Paper>
      
      {/* Footer con información adicional */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          mt: 2, 
          pt: 2,
          color: theme.palette.text.secondary,
          borderTop: `1px solid ${theme.palette.divider}`,
          fontSize: '0.75rem'
        }}
      >
        <Typography variant="caption">
          Última actualización: {format(new Date(), 'dd/MM/yyyy HH:mm:ss', { locale: es })}
        </Typography>
        <Typography variant="caption">
          Placa: {vehiculo.placa}
        </Typography>
      </Box>
    </Box>
  );
};

export default VehiculoDetail;