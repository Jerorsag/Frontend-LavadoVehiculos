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
import { getEmpleado, updateEmpleado, getEmpleadoTurnos, getEmpleadoServicios } from '../api/empleados';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import BadgeIcon from '@mui/icons-material/Badge';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CakeIcon from '@mui/icons-material/Cake';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ScheduleIcon from '@mui/icons-material/Schedule';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import WorkHistoryIcon from '@mui/icons-material/WorkHistory';
import LocalCarWashIcon from '@mui/icons-material/LocalCarWash';
import ReceiptIcon from '@mui/icons-material/Receipt';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import TodayIcon from '@mui/icons-material/Today';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import RefreshIcon from '@mui/icons-material/Refresh';
import { format, differenceInYears } from 'date-fns';
import { es } from 'date-fns/locale';

const validationSchema = yup.object({
  nombre: yup.string().required('El nombre es requerido'),
  apellido: yup.string().required('El apellido es requerido'),
  fecha_nacimiento: yup.date().required('La fecha de nacimiento es requerida'),
  estado: yup.string().oneOf(['Activo', 'Inactivo']).required('El estado es requerido')
});

const EmpleadoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [empleado, setEmpleado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [turnos, setTurnos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [serviciosTipo, setServiciosTipo] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  const formik = useFormik({
    initialValues: {
      nombre: '',
      apellido: '',
      fecha_nacimiento: '',
      estado: 'Activo'
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setSaving(true);
        const updatedEmpleado = await updateEmpleado(id, values);
        setEmpleado(updatedEmpleado);
        setEditMode(false);
        toast.success('Empleado actualizado exitosamente');
      } catch (error) {
        toast.error('Error al actualizar el empleado');
        console.error('Error updating empleado:', error);
      } finally {
        setSaving(false);
      }
    }
  });

  useEffect(() => {
    const fetchEmpleado = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getEmpleado(id);
        setEmpleado(data);
        formik.setValues({
          nombre: data.nombre || '',
          apellido: data.apellido || '',
          fecha_nacimiento: data.fecha_nacimiento || '',
          estado: data.estado || 'Activo'
        });
      } catch (error) {
        setError('Error al cargar la información del empleado');
        toast.error('Error al cargar la información del empleado');
        console.error('Error fetching empleado:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmpleado();
  }, [id]);

  useEffect(() => {
    const fetchEmpleadoData = async () => {
      if (tabValue === 1) {
        try {
          setLoadingData(true);
          const data = await getEmpleadoTurnos(id);
          setTurnos(Array.isArray(data) ? data : []);
        } catch (error) {
          console.error('Error fetching turnos:', error);
          toast.error('Error al cargar los turnos del empleado');
          setTurnos([]);
        } finally {
          setLoadingData(false);
        }
      } else if (tabValue === 2) {
        try {
          setLoadingData(true);
          const data = await getEmpleadoServicios(id, serviciosTipo);
          setServicios(Array.isArray(data) ? data : []);
        } catch (error) {
          console.error('Error fetching servicios:', error);
          toast.error('Error al cargar los servicios del empleado');
          setServicios([]);
        } finally {
          setLoadingData(false);
        }
      }
    };

    if (id && !loading) {
      fetchEmpleadoData();
    }
  }, [id, tabValue, serviciosTipo, loading]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleEditClick = () => {
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    formik.resetForm();
    if (empleado) {
      formik.setValues({
        nombre: empleado.nombre || '',
        apellido: empleado.apellido || '',
        fecha_nacimiento: empleado.fecha_nacimiento || '',
        estado: empleado.estado || 'Activo'
      });
    }
  };

  const handleServiciosTipoChange = (event) => {
    setServiciosTipo(event.target.value);
  };

  // Función para recargar los datos
  const handleRefresh = async () => {
    if (tabValue === 1) {
      try {
        setLoadingData(true);
        const data = await getEmpleadoTurnos(id);
        setTurnos(Array.isArray(data) ? data : []);
        toast.success('Turnos actualizados');
      } catch (error) {
        console.error('Error refreshing turnos:', error);
        toast.error('Error al actualizar los turnos');
      } finally {
        setLoadingData(false);
      }
    } else if (tabValue === 2) {
      try {
        setLoadingData(true);
        const data = await getEmpleadoServicios(id, serviciosTipo);
        setServicios(Array.isArray(data) ? data : []);
        toast.success('Servicios actualizados');
      } catch (error) {
        console.error('Error refreshing servicios:', error);
        toast.error('Error al actualizar los servicios');
      } finally {
        setLoadingData(false);
      }
    }
  };

  // Función para calcular la edad
  const calculateAge = (birthdate) => {
    try {
      if (!birthdate) return "N/A";
      return differenceInYears(new Date(), new Date(birthdate));
    } catch (e) {
      console.error("Error calculating age:", e);
      return "N/A";
    }
  };

  // Función para obtener las iniciales del nombre
  const getInitials = (name, lastName) => {
    return `${name?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

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
            <BadgeIcon sx={{ fontSize: 30, color: theme.palette.primary.main }} />
          </Box>
        </Box>
        <Typography variant="h6" color="textSecondary" gutterBottom>
          Cargando información del empleado
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
          onClick={() => navigate('/empleados')}
        >
          Volver a la lista de empleados
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
          onClick={() => navigate('/empleados')}
          sx={{ borderRadius: '8px' }}
        >
          Volver a empleados
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

      {/* Cabecera con información del empleado */}
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
            <BadgeIcon sx={{ mr: 1 }} />
            {editMode ? 'Editar información del empleado' : 'Información del empleado'}
          </Typography>

          {editMode ? (
            <form onSubmit={formik.handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <BadgeIcon sx={{ mt: 2.5, mr: 1, color: theme.palette.primary.main }} />
                    <TextField
                      fullWidth
                      id="nombre"
                      name="nombre"
                      label="Nombre"
                      value={formik.values.nombre}
                      onChange={formik.handleChange}
                      error={formik.touched.nombre && Boolean(formik.errors.nombre)}
                      helperText={formik.touched.nombre && formik.errors.nombre}
                      margin="normal"
                      disabled={saving}
                      variant="outlined"
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <BadgeIcon sx={{ mt: 2.5, mr: 1, color: theme.palette.primary.main }} />
                    <TextField
                      fullWidth
                      id="apellido"
                      name="apellido"
                      label="Apellido"
                      value={formik.values.apellido}
                      onChange={formik.handleChange}
                      error={formik.touched.apellido && Boolean(formik.errors.apellido)}
                      helperText={formik.touched.apellido && formik.errors.apellido}
                      margin="normal"
                      disabled={saving}
                      variant="outlined"
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <CalendarMonthIcon sx={{ mt: 2.5, mr: 1, color: theme.palette.primary.main }} />
                    <TextField
                      fullWidth
                      id="fecha_nacimiento"
                      name="fecha_nacimiento"
                      label="Fecha de Nacimiento"
                      type="date"
                      value={formik.values.fecha_nacimiento}
                      onChange={formik.handleChange}
                      error={formik.touched.fecha_nacimiento && Boolean(formik.errors.fecha_nacimiento)}
                      helperText={formik.touched.fecha_nacimiento && formik.errors.fecha_nacimiento}
                      margin="normal"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      disabled={saving}
                      variant="outlined"
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <VerifiedUserIcon sx={{ mt: 2.5, mr: 1, color: theme.palette.primary.main }} />
                    <TextField
                      fullWidth
                      id="estado"
                      name="estado"
                      select
                      label="Estado"
                      value={formik.values.estado}
                      onChange={formik.handleChange}
                      error={formik.touched.estado && Boolean(formik.errors.estado)}
                      helperText={formik.touched.estado && formik.errors.estado}
                      margin="normal"
                      disabled={saving}
                      variant="outlined"
                    >
                      <MenuItem value="Activo">Activo</MenuItem>
                      <MenuItem value="Inactivo">Inactivo</MenuItem>
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
                    bgcolor: empleado.estado === 'Activo' ? theme.palette.primary.main : alpha(theme.palette.text.secondary, 0.4),
                    color: '#fff',
                    fontWeight: 'bold',
                    width: 70,
                    height: 70,
                    fontSize: '1.8rem',
                    mr: 3
                  }}
                >
                  {getInitials(empleado.nombre, empleado.apellido)}
                </Avatar>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600 }}>
                    {`${empleado.nombre} ${empleado.apellido}`}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                      ID: {empleado.id_empleado}
                    </Typography>
                    <Chip
                      label={empleado.estado}
                      color={empleado.estado === 'Activo' ? 'success' : 'error'}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                </Box>
              </Box>

              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={6} md={4}>
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
                      <CakeIcon sx={{ color: theme.palette.info.main }} />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Fecha de nacimiento
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        {format(new Date(empleado.fecha_nacimiento), 'dd MMMM yyyy', { locale: es })}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {calculateAge(empleado.fecha_nacimiento)} años
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
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
                      <WatchLaterIcon sx={{ color: theme.palette.success.main }} />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Turnos asignados
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        {turnos?.length || 0} turnos
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Esta semana
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={4}>
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
                      <LocalCarWashIcon sx={{ color: theme.palette.warning.main }} />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Servicios realizados
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        {servicios?.length || 0} servicios
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Total histórico
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
            label="Resumen"
            icon={<WorkHistoryIcon />}
            iconPosition="start"
            disabled={editMode}
          />
          <Tab
            label="Turnos"
            icon={<ScheduleIcon />}
            iconPosition="start"
            disabled={editMode}
          />
          <Tab
            label="Servicios"
            icon={<LocalCarWashIcon />}
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
            {(tabValue === 1 || tabValue === 2) && !editMode && (
              <Tooltip title="Actualizar datos">
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
                  <WorkHistoryIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                  Resumen de actividad
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
                        <LocalCarWashIcon sx={{ fontSize: 80 }} />
                      </Box>
                      <CardContent>
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                          Servicios realizados (lavado)
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 600 }}>
                          10
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <Chip
                            size="small"
                            color="success"
                            label="+12.5%"
                            icon={<ArrowBackIcon sx={{ transform: 'rotate(90deg) !important' }} />}
                            sx={{ mr: 1, height: 20 }}
                          />
                          <Typography variant="caption" color="textSecondary">
                            vs. mes anterior
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
                        <ReceiptIcon sx={{ fontSize: 80 }} />
                      </Box>
                      <CardContent>
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                          Servicios registrados (recepción)
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 600 }}>
                          15
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <Chip
                            size="small"
                            color="success"
                            label="+8.3%"
                            icon={<ArrowBackIcon sx={{ transform: 'rotate(90deg) !important' }} />}
                            sx={{ mr: 1, height: 20 }}
                          />
                          <Typography variant="caption" color="textSecondary">
                            vs. mes anterior
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
                        bgcolor: alpha(theme.palette.success.main, 0.05),
                        border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
                        '&:hover': {
                          boxShadow: theme.shadows[2],
                          bgcolor: alpha(theme.palette.success.main, 0.08),
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
                        <WatchLaterIcon sx={{ fontSize: 80 }} />
                      </Box>
                      <CardContent>
                        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                          Horas trabajadas (último mes)
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 600 }}>
                          160
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <Chip
                            size="small"
                            color="success"
                            label="100%"
                            variant="outlined"
                            sx={{ mr: 1, height: 20 }}
                          />
                          <Typography variant="caption" color="textSecondary">
                            Cumplimiento
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
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
                  <ScheduleIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                  Turnos asignados
                </Typography>

                {turnos.length === 0 ? (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      py: 4
                    }}
                  >
                    <ScheduleIcon sx={{ fontSize: 50, color: alpha(theme.palette.text.secondary, 0.3), mb: 2 }} />
                    <Typography variant="body1" color="text.secondary">
                      No hay turnos asignados para este empleado
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
                          <TableCell>Día</TableCell>
                          <TableCell>Hora de inicio</TableCell>
                          <TableCell>Hora de fin</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {turnos.map((turno) => (
                          <TableRow key={turno.id_turno} sx={{
                            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) },
                          }}>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {turno.id_turno}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
                              <TodayIcon sx={{ mr: 1, fontSize: 16, color: theme.palette.primary.main }} />
                              <Typography variant="body2">
                                {turno.dia}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                icon={<WatchLaterIcon fontSize="small" />}
                                label={turno.hora_inicio}
                                sx={{
                                  bgcolor: alpha(theme.palette.info.main, 0.1),
                                  color: theme.palette.info.main,
                                  border: 'none',
                                  fontWeight: 500
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                icon={<WatchLaterIcon fontSize="small" />}
                                label={turno.hora_final}
                                sx={{
                                  bgcolor: alpha(theme.palette.warning.main, 0.1),
                                  color: theme.palette.warning.main,
                                  border: 'none',
                                  fontWeight: 500
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            )}

            {tabValue === 2 && (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      fontWeight: 600
                    }}
                  >
                    <LocalCarWashIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
                    Historial de servicios
                  </Typography>

                  <TextField
                    select
                    label="Tipo de servicio"
                    value={serviciosTipo || ''}
                    onChange={handleServiciosTipoChange}
                    variant="outlined"
                    size="small"
                    sx={{
                      minWidth: 200,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px'
                      }
                    }}
                  >
                    <MenuItem value="">Todos</MenuItem>
                    <MenuItem value="recibidos">Recibidos</MenuItem>
                    <MenuItem value="lavados">Lavados</MenuItem>
                  </TextField>
                </Box>

                {servicios.length === 0 ? (
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
                      No hay servicios registrados para este empleado
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
                          <TableCell>Vehículo</TableCell>
                          <TableCell>Tipo de lavado</TableCell>
                          <TableCell align="right">Precio</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {servicios.map((servicio) => (
                          <TableRow key={servicio.id_servicio} sx={{
                            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) },
                          }}>
                            <TableCell>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {servicio.id_servicio}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <CalendarMonthIcon sx={{ mr: 1, fontSize: 16, color: theme.palette.primary.main }} />
                                <Typography variant="body2">
                                  {format(new Date(servicio.fecha), 'dd/MM/yyyy HH:mm', { locale: es })}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <DirectionsCarIcon sx={{ mr: 1, fontSize: 16, color: theme.palette.warning.main }} />
                                <Typography variant="body2">
                                  {servicio.placa || 'No especificado'}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={servicio.id_tipo_lavado || 'No especificado'}
                                sx={{
                                  bgcolor: alpha(theme.palette.info.main, 0.1),
                                  color: theme.palette.info.main,
                                  border: 'none',
                                  fontWeight: 500
                                }}
                              />
                            </TableCell>
                            <TableCell align="right">
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 600,
                                  color: theme.palette.success.main
                                }}
                              >
                                ${servicio.precio !== null && servicio.precio !== undefined && !isNaN(Number(servicio.precio))
                                  ? Number(servicio.precio).toFixed(2)
                                  : '0.00'}
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
          Empleado ID: {empleado.id_empleado}
        </Typography>
      </Box>
    </Box>
  );
};

export default EmpleadoDetail;