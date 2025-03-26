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
  AccordionDetails
} from '@mui/material';
import { toast } from 'react-toastify';
import { getServicio, updateServicio } from '../api/servicios';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PrintIcon from '@mui/icons-material/Print';
import EditIcon from '@mui/icons-material/Edit';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ScheduleIcon from '@mui/icons-material/Schedule';
import TimerIcon from '@mui/icons-material/Timer';
import { format, differenceInMinutes, parseISO, parse } from 'date-fns';
import { es } from 'date-fns/locale';

// Componente para mostrar progreso del servicio
const ServicioTimeline = ({ servicio }) => {
  const timelineSteps = [
    { 
      label: 'Recepción', 
      completed: !!servicio.hora_recibe,
      time: servicio.hora_recibe,
      icon: <LocalShippingIcon />
    },
    { 
      label: 'En proceso', 
      completed: !!servicio.id_empleado_lava,
      time: servicio.hora_inicio_lavado,
      icon: <TimerIcon />
    },
    { 
      label: 'Completado', 
      completed: !!servicio.hora_entrega,
      time: servicio.hora_entrega,
      icon: <CheckCircleIcon />
    }
  ];

  return (
    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
      {timelineSteps.map((step, index) => (
        <React.Fragment key={step.label}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            opacity: step.completed ? 1 : 0.5
          }}>
            <Chip
              icon={step.icon}
              label={step.label}
              color={step.completed ? "primary" : "default"}
              variant={step.completed ? "filled" : "outlined"}
            />
            <Typography variant="caption" sx={{ mt: 1 }}>
              {step.time || 'Pendiente'}
            </Typography>
          </Box>
          
          {index < timelineSteps.length - 1 && (
            <Box sx={{ 
              flex: 1, 
              height: '2px', 
              bgcolor: 'divider',
              mx: 1,
              opacity: timelineSteps[index + 1].completed ? 1 : 0.3
            }} />
          )}
        </React.Fragment>
      ))}
    </Box>
  );
};

const ServicioDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [servicio, setServicio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [insumos, setInsumos] = useState([]);
  const [openEdit, setOpenEdit] = useState(false);
  const [observaciones, setObservaciones] = useState('');
  const [savingObservaciones, setSavingObservaciones] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Para forzar refresh

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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !servicio) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Alert severity="error" sx={{ mb: 2, width: '100%', maxWidth: '500px' }}>
          <AlertTitle>Error</AlertTitle>
          No se encontró información del servicio o ocurrió un error al cargarla
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/servicios')}
          sx={{ mt: 2 }}
        >
          Volver a la lista
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/servicios')}
        >
          Volver a la lista
        </Button>
        
        <Box>
          <Tooltip title="Imprimir detalles">
            <IconButton onClick={() => window.print()}>
              <PrintIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Generar factura">
            <IconButton onClick={handleGenerateInvoice} color="primary">
              <ReceiptIcon />
            </IconButton>
          </Tooltip>
          
          <Tooltip title="Editar observaciones">
            <IconButton onClick={() => setOpenEdit(true)} color="secondary">
              <EditIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {/* Panel de estado del servicio */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" component="h2">
              Servicio #{servicio.id_servicio || ''}
            </Typography>
            
            <Chip 
              label={servicio.hora_entrega ? "Completado" : "En proceso"} 
              color={servicio.hora_entrega ? "success" : "warning"}
              sx={{ fontWeight: 'bold' }}
            />
          </Box>
          
          <ServicioTimeline servicio={servicio} />
        </CardContent>
      </Card>

      {/* Información principal */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <LocalShippingIcon sx={{ mr: 1 }} /> Información del servicio
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" color="textSecondary">Fecha:</Typography>
              <Typography variant="body1" fontWeight="medium">
                {servicio.fecha ? format(new Date(servicio.fecha), 'dd/MM/yyyy', { locale: es }) : 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" color="textSecondary">Hora:</Typography>
              <Typography variant="body1" fontWeight="medium">
                {servicio.fecha ? format(new Date(servicio.fecha), 'HH:mm', { locale: es }) : 'N/A'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" color="textSecondary">Vehículo:</Typography>
              <Typography variant="body1" fontWeight="medium">{servicio.placa?.placa || 'No especificado'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" color="textSecondary">Tipo de vehículo:</Typography>
              <Typography variant="body1" fontWeight="medium">{servicio.placa?.id_tipo?.descripcion || 'No especificado'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" color="textSecondary">Tipo de lavado:</Typography>
              <Typography variant="body1" fontWeight="medium">{servicio.id_tipo_lavado?.nombre || 'No especificado'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" color="textSecondary">Precio:</Typography>
              <Typography variant="body1" fontWeight="bold" color="primary.main">
                ${parseFloat(servicio.precio || 0).toFixed(2)}
              </Typography>
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <ScheduleIcon sx={{ mr: 1 }} /> Tiempos y personal
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" color="textSecondary">Empleado que recibió:</Typography>
              <Typography variant="body1" fontWeight="medium">
                {servicio.id_empleado_recibe ? 
                  `${servicio.id_empleado_recibe.nombre || ''} ${servicio.id_empleado_recibe.apellido || ''}` : 
                  'No especificado'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" color="textSecondary">Empleado que lavó:</Typography>
              <Typography variant="body1" fontWeight="medium">
                {servicio.id_empleado_lava ? 
                  `${servicio.id_empleado_lava.nombre || ''} ${servicio.id_empleado_lava.apellido || ''}` : 
                  'No especificado'}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" color="textSecondary">Hora de recepción:</Typography>
              <Typography variant="body1" fontWeight="medium">{servicio.hora_recibe || 'N/A'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography variant="subtitle2" color="textSecondary">Hora de entrega:</Typography>
              <Typography variant="body1" fontWeight="medium">{servicio.hora_entrega || 'Pendiente'}</Typography>
            </Grid>
            {servicio.hora_entrega && servicio.hora_recibe && (
              <Grid item xs={12} sm={6} md={3}>
                <Typography variant="subtitle2" color="textSecondary">Duración total:</Typography>
                <Typography variant="body1" fontWeight="medium">
                  {calcularDuracion(servicio.hora_recibe, servicio.hora_entrega)}
                </Typography>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Observaciones */}
      {servicio.observaciones && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Observaciones
            </Typography>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
              {servicio.observaciones}
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Insumos */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Insumos Utilizados</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Insumo</TableCell>
                  <TableCell align="right">Cantidad</TableCell>
                  <TableCell align="right">Unidad</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {insumos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">No hay insumos registrados</TableCell>
                  </TableRow>
                ) : (
                  insumos.map((insumo) => (
                    <TableRow key={insumo.id || `insumo-${Math.random()}`}>
                      <TableCell>{insumo.id || 'N/A'}</TableCell>
                      <TableCell>{insumo.nombre || 'N/A'}</TableCell>
                      <TableCell align="right">{insumo.cantidad || 0}</TableCell>
                      <TableCell align="right">{insumo.unidad || ''}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>

      {/* Dialog para editar observaciones */}
      <Dialog 
        open={openEdit} 
        onClose={() => !savingObservaciones && setOpenEdit(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Editar Observaciones</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Observaciones"
            fullWidth
            multiline
            rows={4}
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            disabled={savingObservaciones}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenEdit(false)} 
            disabled={savingObservaciones}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSaveObservaciones} 
            variant="contained" 
            color="primary"
            disabled={savingObservaciones}
          >
            {savingObservaciones ? <CircularProgress size={24} /> : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ServicioDetail;