import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  Alert,
  IconButton,
  Chip,
  Avatar,
  Tooltip,
  InputAdornment,
  Divider,
  LinearProgress,
  useTheme,
  alpha
} from '@mui/material';
import { toast } from 'react-toastify';
import { getTurnos, createTurno, deleteTurno } from '../api/turnos';
import { getEmpleados, getAllEmpleados } from '../api/empleados';
import { useFormik } from 'formik';
import * as yup from 'yup';
import ConfirmDialog from "../components/common/ConfirmDialog";

// Iconos
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import ScheduleIcon from '@mui/icons-material/Schedule';
import BadgeIcon from '@mui/icons-material/Badge';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EventIcon from '@mui/icons-material/Event';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import FilterListIcon from '@mui/icons-material/FilterList';
import WatchLaterIcon from '@mui/icons-material/WatchLater';
import WorkIcon from '@mui/icons-material/Work';
import TodayIcon from '@mui/icons-material/Today';
import PersonIcon from '@mui/icons-material/Person';
import WeekendIcon from '@mui/icons-material/Weekend';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';

const diasSemana = [
  'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'
];

// Objeto para asociar los días con iconos y colores
const diasConfig = {
  'Lunes': { icon: <TodayIcon />, color: '#8e24aa' },
  'Martes': { icon: <TodayIcon />, color: '#e91e63' },
  'Miércoles': { icon: <TodayIcon />, color: '#3f51b5' },
  'Jueves': { icon: <TodayIcon />, color: '#00acc1' },
  'Viernes': { icon: <TodayIcon />, color: '#43a047' },
  'Sábado': { icon: <WeekendIcon />, color: '#fb8c00' },
  'Domingo': { icon: <WeekendIcon />, color: '#e53935' }
};

const validationSchema = yup.object({
  id_empleado: yup.number().required('El empleado es requerido'),
  dia: yup.string().required('El día es requerido'),
  hora_inicio: yup.string().required('La hora de inicio es requerida'),
  hora_final: yup.string().required('La hora final es requerida')
});

const Turnos = () => {
  const theme = useTheme();
  const [turnos, setTurnos] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingEmpleados, setLoadingEmpleados] = useState(false);
  const [openNuevoTurno, setOpenNuevoTurno] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null, empleado: '', dia: '' });
  const [filteredEmpleado, setFilteredEmpleado] = useState('');
  const [filteredDia, setFilteredDia] = useState('');
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [turnosStats, setTurnosStats] = useState({
    total: 0,
    porDia: {}
  });

  const formik = useFormik({
    initialValues: {
      id_empleado: '',
      dia: '',
      hora_inicio: '',
      hora_final: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setError(null);
        const result = await createTurno(values);
        
        if (result) {
          toast.success('Turno creado exitosamente');
          setOpenNuevoTurno(false);
          fetchTurnos();
          formik.resetForm();
        } else {
          throw new Error('No se recibió respuesta al crear el turno');
        }
      } catch (error) {
        toast.error('Error al crear el turno');
        setError('Error al crear el turno: ' + (error.message || 'Error desconocido'));
        console.error('Error al crear turno:', error);
      }
    }
  });

  const fetchEmpleadosCompleto = async () => {
    try {
      setLoadingEmpleados(true);
      setError(null);
      
      // Usar nuestra función mejorada que maneja paginación automáticamente
      const empleadosData = await getAllEmpleados({ estado: 'Activo' });
      
      if (empleadosData && empleadosData.results) {
        console.log('Empleados obtenidos:', empleadosData.results.length);
        setEmpleados(empleadosData.results);
      } else {
        console.warn("Formato de respuesta inesperado al cargar empleados:", empleadosData);
        setEmpleados([]);
        toast.error('Error al procesar datos de empleados');
      }
    } catch (error) {
      setError('Error al cargar los empleados: ' + (error.message || 'Error desconocido'));
      toast.error('Error al cargar los empleados');
      console.error('Error fetching empleados:', error);
      setEmpleados([]);
    } finally {
      setLoadingEmpleados(false);
    }
  };

  const fetchTurnos = async () => {
    try {
      setLoading(true);
      setRefreshing(true);
      setError(null);
      
      const params = {};
      if (filteredEmpleado) params.id_empleado = filteredEmpleado;
      if (filteredDia) params.dia = filteredDia;
      
      console.log('Obteniendo turnos con parámetros:', params);
      const turnosData = await getTurnos(params);
      
      // Maneja tanto el formato con "results" como sin él
      const turnosList = turnosData.results || turnosData;
      
      if (Array.isArray(turnosList)) {
        console.log('Turnos obtenidos:', turnosList.length);
        setTurnos(turnosList);
        
        // Calcular estadísticas
        const stats = {
          total: turnosList.length,
          porDia: {}
        };
        
        // Inicializar contador por día
        diasSemana.forEach(dia => {
          stats.porDia[dia] = 0;
        });
        
        // Contar turnos por día
        turnosList.forEach(turno => {
          if (turno.dia && stats.porDia.hasOwnProperty(turno.dia)) {
            stats.porDia[turno.dia]++;
          }
        });
        
        setTurnosStats(stats);
      } else {
        console.warn("Formato de respuesta inesperado al cargar turnos:", turnosData);
        setTurnos([]);
      }
    } catch (error) {
      setError('Error al cargar los turnos: ' + (error.message || 'Error desconocido'));
      toast.error('Error al cargar los turnos');
      console.error('Error fetching turnos:', error);
      setTurnos([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Efecto para cargar turnos cuando cambian los filtros
  useEffect(() => {
    fetchTurnos();
  }, [filteredEmpleado, filteredDia]);

  // Cargar empleados inicialmente
  useEffect(() => {
    fetchEmpleadosCompleto();
  }, []);

  const handleOpenNuevoTurno = () => {
    // Refrescar lista de empleados al abrir el modal
    fetchEmpleadosCompleto();
    setOpenNuevoTurno(true);
  };

  const handleCloseNuevoTurno = () => {
    if (!formik.isSubmitting) {
      setOpenNuevoTurno(false);
      formik.resetForm();
    }
  };

  const handleRefresh = () => {
    fetchTurnos();
    fetchEmpleadosCompleto();
  };

  const handleConfirmDelete = (id, empleadoNombre, dia) => {
    setConfirmDialog({ 
      open: true, 
      id,
      empleado: empleadoNombre,
      dia: dia
    });
  };

  const handleDeleteTurno = async () => {
    try {
      await deleteTurno(confirmDialog.id);
      toast.success('Turno eliminado exitosamente');
      fetchTurnos();
    } catch (error) {
      toast.error('Error al eliminar el turno');
      console.error('Error deleting turno:', error);
    } finally {
      setConfirmDialog({ open: false, id: null, empleado: '', dia: '' });
    }
  };

  const handleEmpleadoFilterChange = (event) => {
    setFilteredEmpleado(event.target.value);
  };

  const handleDiaFilterChange = (event) => {
    setFilteredDia(event.target.value);
  };

  const handleClearFilters = () => {
    setFilteredEmpleado('');
    setFilteredDia('');
  };

  // Función auxiliar para obtener el nombre del empleado
  const getEmpleadoNombre = (idEmpleado) => {
    if (!idEmpleado) return 'No asignado';
    
    // Si es un objeto con propiedades nombre y apellido
    if (typeof idEmpleado === 'object' && idEmpleado !== null) {
      if (idEmpleado.nombre && idEmpleado.apellido) {
        return `${idEmpleado.nombre} ${idEmpleado.apellido}`;
      }
      // Si solo tiene id_empleado, buscar en la lista
      if (idEmpleado.id_empleado) {
        const empleado = empleados.find(e => e.id_empleado === idEmpleado.id_empleado);
        if (empleado) {
          return `${empleado.nombre} ${empleado.apellido}`;
        }
      }
    }
    
    // Si es un ID numérico, buscar en la lista
    const empleado = empleados.find(e => e.id_empleado === idEmpleado);
    if (empleado) {
      return `${empleado.nombre} ${empleado.apellido}`;
    }
    
    return `Empleado ID: ${idEmpleado}`;
  };

  // Función para obtener las iniciales de un nombre completo
  const getInitials = (nombreCompleto) => {
    if (!nombreCompleto || nombreCompleto.startsWith('Empleado ID:')) return 'E';
    
    return nombreCompleto
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Renderizar mensaje cuando no hay turnos
  const renderEmptyState = () => (
    <Card
      elevation={0}
      sx={{
        textAlign: 'center',
        py: 4,
        borderRadius: '16px',
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <ScheduleIcon sx={{ fontSize: 80, color: alpha(theme.palette.primary.main, 0.2), mb: 2 }} />
      <Typography variant="h6" color="text.secondary" gutterBottom>
        No hay turnos programados
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: '80%', mx: 'auto' }}>
        Agrega un nuevo turno para comenzar a gestionar los horarios de los empleados
      </Typography>
      <Button 
        variant="contained" 
        color="primary" 
        startIcon={<AddIcon />}
        onClick={handleOpenNuevoTurno}
        sx={{ 
          borderRadius: '8px',
          boxShadow: theme.shadows[2]
        }}
      >
        Crear nuevo turno
      </Button>
    </Card>
  );

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
          <ScheduleIcon sx={{ fontSize: 180 }} />
        </Box>
        
        <CardContent sx={{ py: 4, position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: theme.palette.primary.main, display: 'flex', alignItems: 'center' }}>
                <ScheduleIcon sx={{ mr: 1, fontSize: 32 }} />
                Gestión de Turnos
              </Typography>
              <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
                Administra los horarios y días de trabajo de los empleados
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleOpenNuevoTurno}
                sx={{ 
                  borderRadius: '8px',
                  px: 3,
                  boxShadow: theme.shadows[2],
                  '&:hover': {
                    boxShadow: theme.shadows[4],
                    transform: 'translateY(-2px)',
                    transition: 'all 0.3s'
                  }
                }}
              >
                Nuevo Turno
              </Button>
              
              <Tooltip title="Actualizar datos">
                <IconButton 
                  onClick={handleRefresh} 
                  disabled={refreshing || loading || loadingEmpleados}
                  sx={{ 
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.2)
                    }
                  }}
                >
                  {refreshing ? <CircularProgress size={24} /> : <RefreshIcon />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
          {/* Tarjetas de estadísticas */}
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                }}
              >
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {turnosStats.total}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Turnos totales
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: '50%',
                    bgcolor: alpha(theme.palette.primary.main, 0.15),
                  }}
                >
                  <ScheduleIcon sx={{ color: theme.palette.primary.main }} />
                </Box>
              </Paper>
            </Grid>
            
            {/* Mostrar los tres días con más turnos */}
            {Object.entries(turnosStats.porDia)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 3)
              .map(([dia, cantidad], index) => (
                <Grid item xs={12} sm={6} md={3} key={dia}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      bgcolor: alpha(diasConfig[dia]?.color || theme.palette.primary.main, 0.1),
                      border: `1px solid ${alpha(diasConfig[dia]?.color || theme.palette.primary.main, 0.2)}`,
                    }}
                  >
                    <Box>
                      <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        {cantidad}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Turnos {dia}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: '50%',
                        bgcolor: alpha(diasConfig[dia]?.color || theme.palette.primary.main, 0.15),
                      }}
                    >
                      {diasConfig[dia]?.icon || <TodayIcon />}
                    </Box>
                  </Paper>
                </Grid>
              ))}
          </Grid>
        </CardContent>
        
        {(loading || refreshing) && (
          <LinearProgress sx={{ height: 3 }} />
        )}
      </Card>

      {error && (
        <Alert 
          severity="error" 
          variant="outlined"
          sx={{ 
            mb: 3, 
            borderRadius: '12px',
            border: `1px solid ${theme.palette.error.main}`
          }}
        >
          {error}
        </Alert>
      )}

      {/* Panel de filtros mejorado */}
      <Card 
        elevation={0} 
        sx={{ 
          mb: 3, 
          borderRadius: '16px',
          border: `1px solid ${theme.palette.divider}`,
          overflow: 'hidden'
        }}
      >
        <CardContent sx={{ pb: 3 }}>
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              fontWeight: 600
            }}
          >
            <FilterListIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
            Filtros de búsqueda
          </Typography>
          
          <Grid container spacing={3} alignItems="flex-end">
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="empleado-filter-label">Filtrar por Empleado</InputLabel>
                <Select
                  labelId="empleado-filter-label"
                  id="empleado-filter"
                  value={filteredEmpleado}
                  label="Filtrar por Empleado"
                  onChange={handleEmpleadoFilterChange}
                  startAdornment={
                    <InputAdornment position="start">
                      <BadgeIcon sx={{ color: theme.palette.primary.main }} />
                    </InputAdornment>
                  }
                  sx={{ 
                    borderRadius: '8px',
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: alpha(theme.palette.primary.main, 0.2),
                      },
                      '&:hover fieldset': {
                        borderColor: theme.palette.primary.main,
                      }
                    }
                  }}
                >
                  <MenuItem value="">Todos los empleados</MenuItem>
                  {empleados.map((empleado) => (
                    <MenuItem key={empleado.id_empleado} value={empleado.id_empleado}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          sx={{ 
                            width: 24, 
                            height: 24, 
                            fontSize: '0.75rem', 
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                            mr: 1
                          }}
                        >
                          {getInitials(`${empleado.nombre} ${empleado.apellido}`)}
                        </Avatar>
                        {`${empleado.nombre} ${empleado.apellido}`}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="dia-filter-label">Filtrar por Día</InputLabel>
                <Select
                  labelId="dia-filter-label"
                  id="dia-filter"
                  value={filteredDia}
                  label="Filtrar por Día"
                  onChange={handleDiaFilterChange}
                  startAdornment={
                    <InputAdornment position="start">
                      <CalendarTodayIcon sx={{ color: theme.palette.primary.main }} />
                    </InputAdornment>
                  }
                  sx={{ 
                    borderRadius: '8px',
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: alpha(theme.palette.primary.main, 0.2),
                      },
                      '&:hover fieldset': {
                        borderColor: theme.palette.primary.main,
                      }
                    }
                  }}
                >
                  <MenuItem value="">Todos los días</MenuItem>
                  {diasSemana.map((dia) => (
                    <MenuItem key={dia} value={dia}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          sx={{ 
                            width: 24, 
                            height: 24, 
                            bgcolor: alpha(diasConfig[dia]?.color || theme.palette.primary.main, 0.1),
                            color: diasConfig[dia]?.color || theme.palette.primary.main,
                            mr: 1
                          }}
                        >
                          {diasConfig[dia]?.icon || <CalendarTodayIcon sx={{ fontSize: 16 }} />}
                        </Avatar>
                        {dia}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button 
                  variant="outlined"
                  startIcon={<ClearIcon />}
                  onClick={handleClearFilters}
                  disabled={!filteredEmpleado && !filteredDia}
                  sx={{ borderRadius: '8px' }}
                >
                  Limpiar filtros
                </Button>
                
                <Button 
                  variant="contained" 
                  color="primary"
                  startIcon={<SearchIcon />}
                  onClick={handleRefresh}
                  disabled={refreshing || loading}
                  sx={{ borderRadius: '8px' }}
                >
                  Aplicar
                </Button>
              </Box>
            </Grid>
          </Grid>
          
          {(filteredEmpleado || filteredDia) && (
            <Alert 
              severity="info" 
              icon={<FilterListIcon />}
              sx={{ 
                mt: 2, 
                borderRadius: '8px', 
                display: 'flex', 
                alignItems: 'center'
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {filteredEmpleado && filteredDia ? (
                  <>Mostrando turnos del empleado <strong>{getEmpleadoNombre(filteredEmpleado)}</strong> para el día <strong>{filteredDia}</strong></>
                ) : filteredEmpleado ? (
                  <>Mostrando turnos del empleado <strong>{getEmpleadoNombre(filteredEmpleado)}</strong></>
                ) : (
                  <>Mostrando turnos para el día <strong>{filteredDia}</strong></>
                )}
                {' - '}
                <strong>{turnos.length} turnos</strong> encontrados
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>

      {loading && !refreshing ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
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
              <ScheduleIcon sx={{ fontSize: 30, color: theme.palette.primary.main }} />
            </Box>
          </Box>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            Cargando turnos
          </Typography>
          <Box sx={{ width: '200px', mt: 2 }}>
            <LinearProgress color="primary" />
          </Box>
        </Box>
      ) : turnos.length === 0 ? (
        renderEmptyState()
      ) : (
        <TableContainer 
          component={Paper} 
          elevation={0}
          sx={{ 
            borderRadius: '16px',
            border: `1px solid ${theme.palette.divider}`,
            overflow: 'hidden'
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                <TableCell>ID</TableCell>
                <TableCell>Empleado</TableCell>
                <TableCell>Día</TableCell>
                <TableCell>Horario</TableCell>
                <TableCell align="center">Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {turnos.map((turno) => {
                const empleadoNombre = getEmpleadoNombre(turno.id_empleado);
                const iniciales = getInitials(empleadoNombre);
                const diaColor = diasConfig[turno.dia]?.color || theme.palette.primary.main;
                
                return (
                  <TableRow 
                    key={turno.id_turno}
                    sx={{ 
                      '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) },
                    }}
                  >
                    <TableCell>
                      <Chip
                        size="small"
                        label={turno.id_turno}
                        sx={{ 
                          fontWeight: 'bold',
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar 
                          sx={{ 
                            width: 32, 
                            height: 32, 
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                            mr: 1.5,
                            fontSize: '0.875rem',
                            fontWeight: 'bold'
                          }}
                        >
                          {iniciales}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {empleadoNombre}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={diasConfig[turno.dia]?.icon || <CalendarTodayIcon />}
                        label={turno.dia}
                        size="small"
                        sx={{ 
                          bgcolor: alpha(diaColor, 0.1),
                          color: diaColor,
                          fontWeight: 500,
                          '& .MuiChip-icon': {
                            color: diaColor
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AccessTimeIcon sx={{ mr: 1, fontSize: 16, color: theme.palette.info.main }} />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {turno.hora_inicio} - {turno.hora_final}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Eliminar turno">
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleConfirmDelete(turno.id_turno, empleadoNombre, turno.dia)}
                          sx={{ 
                            '&:hover': { 
                              bgcolor: alpha(theme.palette.error.main, 0.1) 
                            }
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Footer informativo */}
      {!loading && turnos.length > 0 && (
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
            Los turnos se asignan por día completo con horarios fijos para cada empleado
          </Typography>
        </Box>
      )}

      {/* Dialog para Nuevo Turno */}
      <Dialog 
        open={openNuevoTurno} 
        onClose={handleCloseNuevoTurno} 
        maxWidth="sm" 
        fullWidth
        disableEscapeKeyDown={formik.isSubmitting}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            boxShadow: theme.shadows[10]
          }
        }}
      >
        <Box sx={{ position: 'relative' }}>
          <Box sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            height: 6, 
            bgcolor: theme.palette.primary.main,
          }} />
          
          <DialogTitle sx={{ 
            display: 'flex', 
            alignItems: 'center',
            pt: 3.5,
            pb: 2,
            px: 3,
            fontWeight: 600,
            fontSize: '1.2rem',
            color: theme.palette.primary.main
          }}>
            <ContentPasteIcon sx={{ mr: 1 }} />
            Programar Nuevo Turno
          </DialogTitle>
          
          <IconButton
            onClick={handleCloseNuevoTurno}
            sx={{ position: 'absolute', top: 12, right: 12 }}
            disabled={formik.isSubmitting}
          >
            <CloseIcon />
          </IconButton>
          
          <form onSubmit={formik.handleSubmit}>
            <DialogContent sx={{ px: 3, py: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <BadgeIcon sx={{ mt: 2.5, mr: 1, color: theme.palette.primary.main }} />
                    <FormControl fullWidth margin="normal">
                      <InputLabel id="empleado-label">Empleado</InputLabel>
                      <Select
                        labelId="empleado-label"
                        id="id_empleado"
                        name="id_empleado"
                        value={formik.values.id_empleado}
                        onChange={formik.handleChange}
                        error={formik.touched.id_empleado && Boolean(formik.errors.id_empleado)}
                        label="Empleado"
                        disabled={loadingEmpleados || formik.isSubmitting}
                        sx={{ borderRadius: '8px' }}
                      >
                        {loadingEmpleados ? (
                          <MenuItem value="" disabled>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <CircularProgress size={20} sx={{ mr: 1 }} />
                              Cargando empleados...
                            </Box>
                          </MenuItem>
                        ) : empleados.length === 0 ? (
                          <MenuItem value="" disabled>No hay empleados disponibles</MenuItem>
                        ) : (
                          empleados.map((empleado) => (
                            <MenuItem key={empleado.id_empleado} value={empleado.id_empleado}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar 
                                  sx={{ 
                                    width: 24, 
                                    height: 24, 
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    color: theme.palette.primary.main,
                                    mr: 1,
                                    fontSize: '0.75rem'
                                  }}
                                >
                                  {getInitials(`${empleado.nombre} ${empleado.apellido}`)}
                                </Avatar>
                                {`${empleado.nombre} ${empleado.apellido}`}
                              </Box>
                            </MenuItem>
                          ))
                        )}
                      </Select>
                      {formik.touched.id_empleado && formik.errors.id_empleado && (
                        <Typography color="error" variant="caption" sx={{ mt: 0.5, ml: 1 }}>
                          {formik.errors.id_empleado}
                        </Typography>
                      )}
                    </FormControl>
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <EventIcon sx={{ mt: 2.5, mr: 1, color: theme.palette.primary.main }} />
                    <FormControl fullWidth margin="normal">
                      <InputLabel id="dia-label">Día de la semana</InputLabel>
                      <Select
                        labelId="dia-label"
                        id="dia"
                        name="dia"
                        value={formik.values.dia}
                        onChange={formik.handleChange}
                        error={formik.touched.dia && Boolean(formik.errors.dia)}
                        label="Día de la semana"
                        disabled={formik.isSubmitting}
                        sx={{ borderRadius: '8px' }}
                      >
                        {diasSemana.map((dia) => (
                          <MenuItem key={dia} value={dia}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar 
                                sx={{ 
                                  width: 24, 
                                  height: 24, 
                                  bgcolor: alpha(diasConfig[dia]?.color || theme.palette.primary.main, 0.1),
                                  color: diasConfig[dia]?.color || theme.palette.primary.main,
                                  mr: 1
                                }}
                              >
                                {diasConfig[dia]?.icon || <CalendarTodayIcon sx={{ fontSize: 16 }} />}
                              </Avatar>
                              {dia}
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                      {formik.touched.dia && formik.errors.dia && (
                        <Typography color="error" variant="caption" sx={{ mt: 0.5, ml: 1 }}>
                          {formik.errors.dia}
                        </Typography>
                      )}
                    </FormControl>
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <WatchLaterIcon sx={{ mt: 2.5, mr: 1, color: theme.palette.primary.main }} />
                    <TextField
                      fullWidth
                      id="hora_inicio"
                      name="hora_inicio"
                      label="Hora de inicio"
                      type="time"
                      value={formik.values.hora_inicio}
                      onChange={formik.handleChange}
                      error={formik.touched.hora_inicio && Boolean(formik.errors.hora_inicio)}
                      helperText={formik.touched.hora_inicio && formik.errors.hora_inicio}
                      margin="normal"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      inputProps={{
                        step: 300, // 5 min
                      }}
                      disabled={formik.isSubmitting}
                      sx={{ 
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "8px"
                        }
                      }}
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <WatchLaterIcon sx={{ mt: 2.5, mr: 1, color: theme.palette.primary.main }} />
                    <TextField
                      fullWidth
                      id="hora_final"
                      name="hora_final"
                      label="Hora de finalización"
                      type="time"
                      value={formik.values.hora_final}
                      onChange={formik.handleChange}
                      error={formik.touched.hora_final && Boolean(formik.errors.hora_final)}
                      helperText={formik.touched.hora_final && formik.errors.hora_final}
                      margin="normal"
                      InputLabelProps={{
                        shrink: true,
                      }}
                      inputProps={{
                        step: 300, // 5 min
                      }}
                      disabled={formik.isSubmitting}
                      sx={{ 
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "8px"
                        }
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>
              
              <Box sx={{ 
                mt: 3, 
                p: 2, 
                bgcolor: alpha(theme.palette.info.main, 0.1),
                borderRadius: '8px',
                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
              }}>
                <Typography variant="body2" color="textSecondary">
                  <b>Nota:</b> Los turnos se asignan por día completo. Asegúrate de que el empleado no tenga ya un turno asignado para el mismo día.
                </Typography>
              </Box>
            </DialogContent>
            
            <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
              <Button 
                onClick={handleCloseNuevoTurno} 
                disabled={formik.isSubmitting}
                variant="outlined"
                startIcon={<CloseIcon />}
                sx={{ borderRadius: '8px' }}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                disabled={formik.isSubmitting || loadingEmpleados}
                startIcon={formik.isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                sx={{ borderRadius: '8px' }}
              >
                {formik.isSubmitting ? 'Guardando...' : 'Guardar turno'}
              </Button>
            </DialogActions>
          </form>
        </Box>
      </Dialog>

      {/* Diálogo de confirmación para eliminar */}
      <ConfirmDialog
        open={confirmDialog.open}
        title="Confirmar eliminación de turno"
        content={
          <Box>
            <Typography variant="body1" paragraph>
              ¿Estás seguro de que deseas eliminar este turno? Esta acción no se puede deshacer.
            </Typography>
            <Box sx={{ 
              p: 2, 
              bgcolor: alpha(theme.palette.error.main, 0.05),
              borderRadius: '8px',
              border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`
            }}>
              <Typography variant="subtitle2" gutterBottom>
                Detalles del turno:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PersonIcon sx={{ fontSize: 16, mr: 1, color: theme.palette.primary.main }} />
                <Typography variant="body2">
                  <strong>Empleado:</strong> {confirmDialog.empleado}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarTodayIcon sx={{ fontSize: 16, mr: 1, color: theme.palette.primary.main }} />
                <Typography variant="body2">
                  <strong>Día:</strong> {confirmDialog.dia}
                </Typography>
              </Box>
            </Box>
          </Box>
        }
        onConfirm={handleDeleteTurno}
        onCancel={() => setConfirmDialog({ open: false, id: null, empleado: '', dia: '' })}
      />
    </Box>
  );
};

export default Turnos;