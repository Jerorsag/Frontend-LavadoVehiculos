import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  CircularProgress,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  AlertTitle,
  Snackbar,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  alpha,
  Avatar,
  LinearProgress,
  Stack
} from '@mui/material';
import { toast } from 'react-toastify';
import { getServicio, updateServicio } from '../api/servicios';

// Iconos
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PrintIcon from '@mui/icons-material/Print';
import EditIcon from '@mui/icons-material/Edit';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ScheduleIcon from '@mui/icons-material/Schedule';
import TimerIcon from '@mui/icons-material/Timer';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import LocalCarWashIcon from '@mui/icons-material/LocalCarWash';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BadgeIcon from '@mui/icons-material/Badge';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import EventIcon from '@mui/icons-material/Event';
import CommentIcon from '@mui/icons-material/Comment';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShareIcon from '@mui/icons-material/Share';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import InfoIcon from '@mui/icons-material/Info';
import BuildIcon from '@mui/icons-material/Build';
import LocalAtmIcon from '@mui/icons-material/LocalAtm';
import MoreTimeIcon from '@mui/icons-material/MoreTime';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

import { format, differenceInMinutes, parseISO, parse } from 'date-fns';
import { es } from 'date-fns/locale';

// Componente para mostrar progreso del servicio
const ServicioTimeline = ({ servicio }) => {
  const theme = useTheme();
  
  const timelineSteps = [
    { 
      label: 'Recepción', 
      completed: !!servicio.hora_recibe,
      time: servicio.hora_recibe,
      icon: <LocalShippingIcon />,
      description: 'Vehículo recibido',
      color: theme.palette.info.main
    },
    { 
      label: 'En proceso', 
      completed: !!servicio.id_empleado_lava,
      time: servicio.hora_inicio_lavado,
      icon: <TimerIcon />,
      description: 'Lavado en curso',
      color: theme.palette.warning.main
    },
    { 
      label: 'Completado', 
      completed: !!servicio.hora_entrega,
      time: servicio.hora_entrega,
      icon: <CheckCircleIcon />,
      description: 'Servicio finalizado',
      color: theme.palette.success.main
    }
  ];

  return (
    <Box sx={{ my: 3, px: { xs: 0, sm: 2 } }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        flexWrap: 'wrap',
        position: 'relative'
      }}>
        {timelineSteps.map((step, index) => (
          <Box 
            key={step.label} 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              width: { xs: '100%', sm: 'auto' },
              mb: { xs: 2, sm: 0 },
              position: 'relative',
              zIndex: 2
            }}
          >
            <Avatar 
              sx={{ 
                width: 56, 
                height: 56, 
                bgcolor: step.completed ? step.color : alpha(theme.palette.grey[500], 0.2),
                color: step.completed ? 'white' : theme.palette.text.secondary,
                mb: 1,
                transition: 'all 0.3s',
                boxShadow: step.completed ? `0 4px 10px ${alpha(step.color, 0.25)}` : 'none',
              }}
            >
              {step.icon}
            </Avatar>
            
            <Typography 
              variant="subtitle1" 
              sx={{ 
                fontWeight: 600,
                color: step.completed ? step.color : theme.palette.text.secondary,
              }}
            >
              {step.label}
            </Typography>
            
            <Chip
              label={step.time || 'Pendiente'}
              size="small"
              color={step.completed ? "primary" : "default"}
              variant={step.completed ? "filled" : "outlined"}
              sx={{ mt: 0.5, fontWeight: 500 }}
            />
            
            <Typography 
              variant="caption" 
              color="text.secondary" 
              sx={{ 
                mt: 0.5,
                opacity: step.completed ? 1 : 0.5
              }}
            >
              {step.description}
            </Typography>
          </Box>
        ))}
        
        {/* Línea de conexión entre pasos */}
        <Box 
          sx={{ 
            position: 'absolute',
            left: '15%',
            right: '15%',
            top: 28,
            height: 2,
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            zIndex: 1,
            display: { xs: 'none', sm: 'block' }
          }} 
        />
        
        {/* Primera mitad de la línea de progreso */}
        <Box 
          sx={{ 
            position: 'absolute',
            left: '15%',
            width: timelineSteps[1].completed ? '35%' : '0%',
            top: 28,
            height: 2,
            bgcolor: theme.palette.warning.main,
            zIndex: 1,
            transition: 'width 0.5s ease-in-out',
            display: { xs: 'none', sm: 'block' }
          }} 
        />
        
        {/* Segunda mitad de la línea de progreso */}
        <Box 
          sx={{ 
            position: 'absolute',
            left: '50%',
            width: timelineSteps[2].completed ? '35%' : '0%',
            top: 28,
            height: 2,
            bgcolor: theme.palette.success.main,
            zIndex: 1,
            transition: 'width 0.5s ease-in-out',
            display: { xs: 'none', sm: 'block' }
          }} 
        />
      </Box>
    </Box>
  );
};

const ServicioDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const [servicio, setServicio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [insumos, setInsumos] = useState([]);
  const [openEdit, setOpenEdit] = useState(false);
  const [observaciones, setObservaciones] = useState('');
  const [savingObservaciones, setSavingObservaciones] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Para forzar refresh
  const [compartirOpen, setCompartirOpen] = useState(false);

  // Función para calcular la duración del servicio
  const calcularDuracion = useCallback((horaInicio, horaFin) => {
    if (!horaInicio || !horaFin) return 'N/A';
    
    try {
      // Usamos una fecha base para comparar solo las horas
      const baseDate = '2000-01-01';
      let inicio = parse(`${baseDate} ${horaInicio}`, 'yyyy-MM-dd HH:mm:ss', new Date());
      let fin = parse(`${baseDate} ${horaFin}`, 'yyyy-MM-dd HH:mm:ss', new Date());
      
      // Si fin es anterior a inicio, asumimos que pasó al día siguiente
      if (fin < inicio) {
        fin.setDate(fin.getDate() + 1);
      }
      
      const diffMinutos = differenceInMinutes(fin, inicio);
      const horas = Math.floor(diffMinutos / 60);
      const minutos = diffMinutos % 60;
      
      return `${horas}h ${minutos}m`;
    } catch (error) {
      console.error('Error calculando duración:', error);
      return 'N/A';
    }
  }, []);

  // Función para obtener el color según el estado del servicio
  const getStatusColor = () => {
    if (!servicio) return theme.palette.grey[500];
    
    if (servicio.hora_entrega) return theme.palette.success.main; // Completado
    if (servicio.id_empleado_lava) return theme.palette.warning.main; // En proceso
    return theme.palette.info.main; // Recibido
  };

  // Función para cargar los datos del servicio
  const fetchServicio = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);
      console.log("Fetching servicio with ID:", id);
      
      const data = await getServicio(id);
      
      if (!data) {
        setError(true);
        toast.error('No se encontró información del servicio');
        return;
      }
      
      setServicio(data);
      setObservaciones(data.observaciones || '');
      
      // Simulación de insumos - En producción, usa una API real
      setInsumos([
        { id: 1, nombre: 'Champú para Autos', cantidad: 2, unidad: 'oz' },
        { id: 2, nombre: 'Cera para Autos', cantidad: 1, unidad: 'oz' },
        { id: 3, nombre: 'Limpiavidrios', cantidad: 1, unidad: 'aplicación' }
      ]);
    } catch (error) {
      setError(true);
      toast.error('Error al cargar la información del servicio');
      console.error('Error fetching servicio:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Cargar datos iniciales
  useEffect(() => {
    if (id) {
      fetchServicio();
    } else {
      setError(true);
      setLoading(false);
      toast.error('ID de servicio no válido');
    }
  }, [id, fetchServicio, refreshKey]);

  // Manejar guardado de observaciones
  const handleSaveObservaciones = async () => {
    if (!servicio) return;
    
    try {
      setSavingObservaciones(true);
      
      await updateServicio(id, {
        ...servicio,
        observaciones
      });
      
      toast.success('Observaciones guardadas correctamente');
      setOpenEdit(false);
      // Refrescar para mostrar los cambios
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      console.error('Error guardando observaciones:', error);
      toast.error('Error al guardar las observaciones');
    } finally {
      setSavingObservaciones(false);
    }
  };

  // Generar PDF de factura
  const handleGenerateInvoice = () => {
    toast.info('Generando factura PDF...');
    // Implementación real usaría una librería como jsPDF o una API del backend
    setTimeout(() => {
      toast.success('Factura generada correctamente');
    }, 1500);
  };

  // Compartir detalles del servicio
  const handleShare = () => {
    setCompartirOpen(true);
    setTimeout(() => {
      toast.success('Enlace copiado al portapapeles');
      setCompartirOpen(false);
    }, 1500);
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
            <LocalCarWashIcon sx={{ fontSize: 30, color: theme.palette.primary.main }} />
          </Box>
        </Box>
        <Typography variant="h6" color="textSecondary" gutterBottom>
          Cargando información del servicio
        </Typography>
        <Box sx={{ width: '200px', mt: 2 }}>
          <LinearProgress color="primary" />
        </Box>
      </Box>
    );
  }

  if (error || !servicio) {
    return (
      <Box sx={{ p: 3, maxWidth: '800px', mx: 'auto' }}>
        <Card
          elevation={0}
          sx={{
            borderRadius: '16px',
            border: `1px solid ${theme.palette.divider}`,
            overflow: 'hidden',
            p: 3
          }}
        >
          <Alert 
            severity="error" 
            variant="outlined"
            sx={{ 
              mb: 2,
              borderRadius: '8px'
            }}
          >
            <AlertTitle>Error al cargar la información</AlertTitle>
            No se encontró información del servicio o ocurrió un error al cargarla
          </Alert>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/servicios')}
            sx={{ mt: 2, borderRadius: '8px' }}
          >
            Volver a la lista de servicios
          </Button>
        </Card>
      </Box>
    );
  }

  const statusColor = getStatusColor();
  const statusText = servicio.hora_entrega ? "Completado" : (servicio.id_empleado_lava ? "En proceso" : "Recibido");

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
          onClick={() => navigate('/servicios')}
          sx={{ borderRadius: '8px' }}
        >
          Volver a servicios
        </Button>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Compartir detalles">
            <IconButton 
              onClick={handleShare}
              sx={{ 
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.2)
                }
              }}
            >
              <ShareIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Imprimir detalles">
            <IconButton 
              onClick={() => window.print()}
              sx={{ 
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.2)
                }
              }}
            >
              <PrintIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Generar factura">
            <IconButton 
              onClick={handleGenerateInvoice} 
              color="primary"
              sx={{ 
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                '&:hover': {
                  bgcolor: alpha(theme.palette.primary.main, 0.2)
                }
              }}
            >
              <ReceiptIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Editar observaciones">
            <IconButton 
              onClick={() => setOpenEdit(true)} 
              sx={{ 
                bgcolor: alpha(theme.palette.secondary.main, 0.1),
                color: theme.palette.secondary.main,
                '&:hover': {
                  bgcolor: alpha(theme.palette.secondary.main, 0.2)
                }
              }}
            >
              <EditIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {/* Panel de estado del servicio */}
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
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            bgcolor: statusColor
          }}
        />
        
        <CardContent sx={{ py: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            flexWrap: 'wrap',
            mb: 2
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar
                sx={{
                  bgcolor: alpha(statusColor, 0.1),
                  color: statusColor,
                  mr: 2,
                  width: 48,
                  height: 48
                }}
              >
                <LocalCarWashIcon />
              </Avatar>
              <Box>
                <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                  Servicio #{servicio.id_servicio || ''}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {servicio.fecha ? format(new Date(servicio.fecha), 'EEEE, dd MMMM yyyy • HH:mm', { locale: es }) : 'Fecha no disponible'}
                </Typography>
              </Box>
            </Box>
            
            <Chip 
              label={statusText} 
              color={servicio.hora_entrega ? "success" : (servicio.id_empleado_lava ? "warning" : "info")}
              sx={{ fontWeight: 'bold', px: 1 }}
              icon={servicio.hora_entrega ? <CheckCircleIcon /> : (servicio.id_empleado_lava ? <TimerIcon /> : <HourglassEmptyIcon />)}
            />
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          <ServicioTimeline servicio={servicio} />
        </CardContent>
      </Card>

      {/* Información principal */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card 
            elevation={0} 
            sx={{ 
              mb: 3, 
              borderRadius: '16px',
              border: `1px solid ${theme.palette.divider}`,
              height: '100%'
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
                <InfoIcon sx={{ mr: 1 }} /> Detalles del servicio
              </Typography>
              
              <Grid container spacing={3}>
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
                      <DirectionsCarIcon sx={{ color: theme.palette.info.main }} />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Vehículo
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        {servicio.placa?.placa || 'No especificado'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {servicio.placa?.id_tipo?.descripcion || 'Tipo no disponible'}
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
                        Tipo de lavado
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        {servicio.id_tipo_lavado?.nombre || 'No especificado'}
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
                      <AttachMoneyIcon sx={{ color: theme.palette.success.main }} />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Precio
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                        ${parseFloat(servicio.precio || 0).toFixed(2)}
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
                    <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), mr: 2 }}>
                      <BadgeIcon sx={{ color: theme.palette.primary.main }} />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Recibido por
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        {servicio.id_empleado_recibe ? 
                          `${servicio.id_empleado_recibe.nombre || ''} ${servicio.id_empleado_recibe.apellido || ''}` : 
                          'No especificado'}
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
                    <Avatar sx={{ bgcolor: alpha(theme.palette.secondary.main, 0.1), mr: 2 }}>
                      <BuildIcon sx={{ color: theme.palette.secondary.main }} />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Lavado por
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        {servicio.id_empleado_lava ? 
                          `${servicio.id_empleado_lava.nombre || ''} ${servicio.id_empleado_lava.apellido || ''}` : 
                          'Pendiente'}
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
                    <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), mr: 2 }}>
                      <MoreTimeIcon sx={{ color: theme.palette.error.main }} />
                    </Avatar>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Duración
                      </Typography>
                      <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                        {servicio.hora_entrega && servicio.hora_recibe ? 
                          calcularDuracion(servicio.hora_recibe, servicio.hora_entrega) : 
                          'En proceso'}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
              
              {/* Observaciones */}
              {servicio.observaciones && (
                <Box sx={{ mt: 3 }}>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      color: theme.palette.primary.main,
                      fontWeight: 600,
                      mb: 2
                    }}
                  >
                    <CommentIcon sx={{ mr: 1 }} /> Observaciones
                  </Typography>
                  
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: '12px',
                      border: `1px solid ${theme.palette.divider}`,
                      bgcolor: alpha(theme.palette.background.default, 0.5),
                    }}
                  >
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                      {servicio.observaciones}
                    </Typography>
                  </Paper>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Panel de insumos */}
        <Grid item xs={12} md={4}>
          <Card 
            elevation={0} 
            sx={{ 
              mb: 3, 
              borderRadius: '16px',
              border: `1px solid ${theme.palette.divider}`,
              height: '100%'
            }}
          >
            <CardContent>
              <Typography 
                variant="h6" 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center',
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                  mb: 2
                }}
              >
                <InventoryIcon sx={{ mr: 1 }} /> Insumos utilizados
              </Typography>
              
              {insumos.length === 0 ? (
                <Box 
                  sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    py: 3
                  }}
                >
                  <InventoryIcon sx={{ fontSize: 40, color: alpha(theme.palette.text.secondary, 0.3), mb: 2 }} />
                  <Typography variant="body2" color="text.secondary">
                    No hay insumos registrados
                  </Typography>
                </Box>
              ) : (
                <TableContainer 
                  component={Paper} 
                  elevation={0}
                  sx={{ 
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: '12px',
                    mb: 3
                  }}
                >
                  <Table>
                    <TableHead>
                      <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                        <TableCell>Insumo</TableCell>
                        <TableCell align="right">Cantidad</TableCell>
                        <TableCell align="right">Unidad</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {insumos.map((insumo) => (
                        <TableRow key={insumo.id || `insumo-${Math.random()}`} sx={{ 
                          '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.02) },
                        }}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar 
                                sx={{ 
                                  width: 24, 
                                  height: 24, 
                                  mr: 1, 
                                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                                  fontSize: '0.75rem'
                                }}
                              >
                                {insumo.id}
                              </Avatar>
                              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                {insumo.nombre || 'N/A'}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {insumo.cantidad || 0}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Chip 
                              size="small" 
                              label={insumo.unidad || ''} 
                              sx={{ 
                                fontWeight: 500,
                                bgcolor: alpha(theme.palette.info.main, 0.1),
                                color: theme.palette.info.main
                              }} 
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
              
              {servicio.hora_entrega && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom sx={{ color: theme.palette.primary.main }}>
                    Resumen del servicio
                  </Typography>
                  
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">Tiempo total:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {calcularDuracion(servicio.hora_recibe, servicio.hora_entrega)}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">Costo total:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: theme.palette.success.main }}>
                        ${parseFloat(servicio.precio || 0).toFixed(2)}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mt: 2 }}>
                      <Button 
                        fullWidth 
                        variant="contained" 
                        color="primary" 
                        startIcon={<ReceiptIcon />}
                        onClick={handleGenerateInvoice}
                        sx={{ borderRadius: '8px' }}
                      >
                        Generar factura
                      </Button>
                    </Box>
                  </Stack>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog para editar observaciones */}
      <Dialog 
        open={openEdit} 
        onClose={() => !savingObservaciones && setOpenEdit(false)}
        fullWidth
        maxWidth="md"
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
            bgcolor: theme.palette.secondary.main,
          }} />
          
          <DialogTitle sx={{ 
            display: 'flex', 
            alignItems: 'center',
            pt: 3.5,
            pb: 2,
            px: 3,
            fontWeight: 600,
            fontSize: '1.2rem',
            color: theme.palette.secondary.main
          }}>
            <CommentIcon sx={{ mr: 1 }} />
            Editar Observaciones
          </DialogTitle>
          
          <IconButton
            onClick={() => !savingObservaciones && setOpenEdit(false)}
            sx={{ position: 'absolute', top: 12, right: 12 }}
            disabled={savingObservaciones}
          >
            <CloseIcon />
          </IconButton>
          
          <DialogContent sx={{ px: 3, py: 2 }}>
            <TextField
              autoFocus
              fullWidth
              label="Observaciones"
              multiline
              rows={4}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              disabled={savingObservaciones}
              variant="outlined"
              placeholder="Ingrese observaciones sobre el servicio..."
              InputProps={{
                sx: { borderRadius: '8px' }
              }}
            />
            
            <Box sx={{ 
              mt: 3, 
              p: 2, 
              bgcolor: alpha(theme.palette.info.main, 0.1),
              borderRadius: '8px',
              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
            }}>
              <Typography variant="body2" color="textSecondary">
                <b>Nota:</b> Las observaciones pueden incluir detalles específicos sobre
                el estado del vehículo, requerimientos especiales del cliente o cualquier
                incidencia durante el servicio.
              </Typography>
            </Box>
          </DialogContent>
          
          <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Button 
              onClick={() => setOpenEdit(false)} 
              disabled={savingObservaciones}
              variant="outlined"
              startIcon={<CloseIcon />}
              sx={{ borderRadius: '8px' }}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSaveObservaciones} 
              variant="contained" 
              color="secondary"
              disabled={savingObservaciones}
              startIcon={savingObservaciones ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
              sx={{ borderRadius: '8px' }}
            >
              {savingObservaciones ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
      
      {/* Dialog para compartir */}
      <Dialog 
        open={compartirOpen} 
        onClose={() => setCompartirOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px'
          }
        }}
      >
        <DialogTitle>Compartir detalles del servicio</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            value={`https://lavadero-app.com/servicios/${servicio.id_servicio}`}
            InputProps={{
              readOnly: true,
              endAdornment: (
                <IconButton size="small">
                  <ShareIcon fontSize="small" />
                </IconButton>
              ),
              sx: { borderRadius: '8px' }
            }}
          />
          
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress size={24} />
          </Box>
        </DialogContent>
      </Dialog>
      
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
          Servicio ID: {servicio.id_servicio}
        </Typography>
      </Box>
    </Box>
  );
};

export default ServicioDetail;