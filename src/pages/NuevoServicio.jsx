import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  Button,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Divider,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  FormHelperText
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { getEmpleados } from '../api/empleados';
import { getVehiculos, createVehiculo, getTiposVehiculos } from '../api/vehiculos';
import { getInsumos } from '../api/inventario';
import { getTiposLavado } from '../api/servicios';
import { createServicio } from '../api/servicios';

const steps = ['Información del Vehículo', 'Información del Servicio', 'Insumos Utilizados', 'Confirmar'];

const validationSchemaStep1 = yup.object({
  placa: yup.string().required('La placa es requerida')
});

const validationSchemaStep2 = yup.object({
  id_empleado_recibe: yup.number().required('El empleado que recibe es requerido'),
  id_empleado_lava: yup.number().required('El empleado que lava es requerido'),
  id_tipo_lavado: yup.number().required('El tipo de lavado es requerido'),
  precio: yup.number().positive('El precio debe ser positivo').required('El precio es requerido')
});

const NuevoServicio = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [empleados, setEmpleados] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [tiposVehiculos, setTiposVehiculos] = useState([]);
  const [tiposLavado, setTiposLavado] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [insumosSeleccionados, setInsumosSeleccionados] = useState([]);
  const [nuevoVehiculo, setNuevoVehiculo] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true); // Añadido para manejar estado de carga

  const formik = useFormik({
    initialValues: {
      // Vehículo
      placa: '',
      id_tipo: '',
      // Servicio
      id_empleado_recibe: '',
      id_empleado_lava: '',
      id_tipo_lavado: '',
      precio: '',
      // Temporal
      insumo_seleccionado: '',
      cantidad_insumo: 1
    },
    validationSchema: activeStep === 0 ? validationSchemaStep1 : 
                       activeStep === 1 ? validationSchemaStep2 : 
                       null,
    onSubmit: async (values) => {
      if (activeStep === steps.length - 1) {
        handleSubmitServicio(values);
      } else {
        handleNext();
      }
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true); // Indicar inicio de carga
        // Usar Promise.allSettled en lugar de Promise.all para manejar mejor errores
        const results = await Promise.allSettled([
          getEmpleados({ estado: 'Activo' }),
          getVehiculos(),
          getTiposVehiculos(),
          getTiposLavado(),
          getInsumos()
        ]);
        
        // Procesar resultados incluso si alguno falla
        if (results[0].status === 'fulfilled') setEmpleados(results[0].value.results || []);
        if (results[1].status === 'fulfilled') setVehiculos(results[1].value.results || []);
        if (results[2].status === 'fulfilled') setTiposVehiculos(results[2].value.results || []);
        if (results[3].status === 'fulfilled') setTiposLavado(results[3].value.results || []);
        if (results[4].status === 'fulfilled') setInsumos(results[4].value.results || []);
        
        // Verificar si alguna petición falló
        const failedRequests = results.filter(r => r.status === 'rejected');
        if (failedRequests.length > 0) {
          console.error('Algunas peticiones fallaron:', failedRequests);
          toast.warning('Algunos datos podrían no estar disponibles');
        }
      } catch (error) {
        console.error('Error al cargar datos iniciales:', error);
        toast.error('Error al cargar datos. Por favor, intenta nuevamente.');
      } finally {
        setLoading(false); // Indicar fin de carga
      }
    };
    
    fetchData();
  }, []);

  const handlePlacaChange = (event) => {
    const placaValue = event.target.value;
    formik.setFieldValue('placa', placaValue);
    
    // Verificar si el vehículo existe
    const vehiculoExistente = vehiculos?.find(v => v.placa === placaValue);
    if (vehiculoExistente) {
      setNuevoVehiculo(false);
      formik.setFieldValue('id_tipo', vehiculoExistente.id_tipo.id_tipo);
    } else {
      setNuevoVehiculo(true);
      formik.setFieldValue('id_tipo', '');
    }
  };

  const handleTipoLavadoChange = (event) => {
    const tipoLavadoId = parseInt(event.target.value);
    formik.setFieldValue('id_tipo_lavado', tipoLavadoId);
    
    // Establecer precio automáticamente
    const tipoLavado = tiposLavado?.find(tipo => tipo.id_tipo_lavado === tipoLavadoId);
    if (tipoLavado) {
      formik.setFieldValue('precio', tipoLavado.costo);
    }
  };

  const handleAgregarInsumo = () => {
    const insumoId = parseInt(formik.values.insumo_seleccionado);
    const cantidad = parseInt(formik.values.cantidad_insumo);
    
    if (!insumoId || cantidad <= 0) {
      setError('Selecciona un insumo y una cantidad válida');
      return;
    }
    
    const insumoSeleccionado = insumos?.find(i => i.id_insumo === insumoId);
    if (!insumoSeleccionado) {
      setError('Insumo no encontrado');
      return;
    }
    
    // Verificar si ya existe el insumo
    const insumoExistente = insumosSeleccionados.find(i => i.id_insumo === insumoId);
    if (insumoExistente) {
      // Actualizar cantidad
      setInsumosSeleccionados(insumosSeleccionados.map(i => 
        i.id_insumo === insumoId 
          ? { ...i, cantidad_usada: i.cantidad_usada + cantidad } 
          : i
      ));
    } else {
      // Agregar nuevo insumo
      setInsumosSeleccionados([
        ...insumosSeleccionados,
        {
          id_insumo: insumoId,
          nombre: insumoSeleccionado.nombre,
          cantidad_usada: cantidad
        }
      ]);
    }
    
    // Limpiar campos
    formik.setFieldValue('insumo_seleccionado', '');
    formik.setFieldValue('cantidad_insumo', 1);
    setError('');
  };

  const handleQuitarInsumo = (id) => {
    setInsumosSeleccionados(insumosSeleccionados.filter(i => i.id_insumo !== id));
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (formik.errors.placa) {
        toast.error('Completa la información del vehículo');
        return;
      }
      
      // Si es un vehículo nuevo, verificar que tenga tipo
      if (nuevoVehiculo && !formik.values.id_tipo) {
        toast.error('Selecciona el tipo de vehículo');
        return;
      }
    } else if (activeStep === 1) {
      if (formik.errors.id_empleado_recibe || formik.errors.id_empleado_lava || 
          formik.errors.id_tipo_lavado || formik.errors.precio) {
        toast.error('Completa toda la información del servicio');
        return;
      }
    }
    
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmitServicio = async (values) => {
    try {
      // Si es un vehículo nuevo, crearlo primero
      if (nuevoVehiculo) {
        await createVehiculo({
          placa: values.placa,
          id_tipo: parseInt(values.id_tipo)
        });
      }
      
      // Crear el servicio
      const servicioData = {
        fecha: new Date().toISOString(),
        id_empleado_recibe: parseInt(values.id_empleado_recibe),
        id_empleado_lava: parseInt(values.id_empleado_lava),
        placa: values.placa,
        id_tipo_lavado: parseInt(values.id_tipo_lavado),
        hora_recibe: new Date().toTimeString().split(' ')[0],
        precio: parseFloat(values.precio),
        insumos: insumosSeleccionados.map(i => ({
          id_insumo: i.id_insumo,
          cantidad_usada: i.cantidad_usada
        }))
      };
      
      const resultado = await createServicio(servicioData);
      toast.success('Servicio creado exitosamente');
      navigate('/servicios');
    } catch (error) {
      console.error('Error al crear el servicio:', error);
      toast.error('Error al crear el servicio: ' + (error.response?.data?.message || error.message || 'Error desconocido'));
    }
  };

  // Renderizado condicional para estado de carga
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Typography>Cargando datos...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/servicios')}
        >
          Volver a servicios
        </Button>
      </Box>
      
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            Nuevo Servicio
          </Typography>
          
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
          
          <form onSubmit={formik.handleSubmit}>
            {activeStep === 0 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Información del Vehículo
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="placa"
                      name="placa"
                      label="Placa del Vehículo"
                      value={formik.values.placa}
                      onChange={handlePlacaChange}
                      error={formik.touched.placa && Boolean(formik.errors.placa)}
                      helperText={formik.touched.placa && formik.errors.placa}
                      margin="normal"
                    />
                    {nuevoVehiculo && (
                      <FormHelperText>
                        Vehículo nuevo. Por favor selecciona el tipo.
                      </FormHelperText>
                    )}
                  </Grid>
                  {nuevoVehiculo && (
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        id="id_tipo"
                        name="id_tipo"
                        select
                        label="Tipo de Vehículo"
                        value={formik.values.id_tipo}
                        onChange={formik.handleChange}
                        margin="normal"
                      >
                        {tiposVehiculos && tiposVehiculos.map((tipo) => (
                          <MenuItem key={tipo.id_tipo} value={tipo.id_tipo}>
                            {tipo.descripcion}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                  )}
                </Grid>
              </Box>
            )}
            
            {activeStep === 1 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Información del Servicio
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="id_empleado_recibe"
                      name="id_empleado_recibe"
                      select
                      label="Empleado que Recibe"
                      value={formik.values.id_empleado_recibe}
                      onChange={formik.handleChange}
                      error={formik.touched.id_empleado_recibe && Boolean(formik.errors.id_empleado_recibe)}
                      helperText={formik.touched.id_empleado_recibe && formik.errors.id_empleado_recibe}
                      margin="normal"
                    >
                      {empleados && empleados.map((empleado) => (
                        <MenuItem key={empleado.id_empleado} value={empleado.id_empleado}>
                          {`${empleado.nombre} ${empleado.apellido}`}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="id_empleado_lava"
                      name="id_empleado_lava"
                      select
                      label="Empleado que Lava"
                      value={formik.values.id_empleado_lava}
                      onChange={formik.handleChange}
                      error={formik.touched.id_empleado_lava && Boolean(formik.errors.id_empleado_lava)}
                      helperText={formik.touched.id_empleado_lava && formik.errors.id_empleado_lava}
                      margin="normal"
                    >
                      {empleados && empleados.map((empleado) => (
                        <MenuItem key={empleado.id_empleado} value={empleado.id_empleado}>
                          {`${empleado.nombre} ${empleado.apellido}`}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="id_tipo_lavado"
                      name="id_tipo_lavado"
                      select
                      label="Tipo de Lavado"
                      value={formik.values.id_tipo_lavado}
                      onChange={handleTipoLavadoChange}
                      error={formik.touched.id_tipo_lavado && Boolean(formik.errors.id_tipo_lavado)}
                      helperText={formik.touched.id_tipo_lavado && formik.errors.id_tipo_lavado}
                      margin="normal"
                    >
                      {tiposLavado && tiposLavado.map((tipo) => (
                        <MenuItem key={tipo.id_tipo_lavado} value={tipo.id_tipo_lavado}>
                          {`${tipo.nombre} - $${tipo.costo}`}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="precio"
                      name="precio"
                      label="Precio"
                      type="number"
                      value={formik.values.precio}
                      onChange={formik.handleChange}
                      error={formik.touched.precio && Boolean(formik.errors.precio)}
                      helperText={formik.touched.precio && formik.errors.precio}
                      margin="normal"
                      InputProps={{
                        startAdornment: <Box component="span" sx={{ mr: 1 }}>$</Box>,
                      }}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}
            
            {activeStep === 2 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Insumos Utilizados
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="insumo_seleccionado"
                      name="insumo_seleccionado"
                      select
                      label="Seleccionar Insumo"
                      value={formik.values.insumo_seleccionado}
                      onChange={formik.handleChange}
                      margin="normal"
                    >
                      {insumos && insumos.map((insumo) => (
                        <MenuItem key={insumo.id_insumo} value={insumo.id_insumo}>
                          {insumo.nombre}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      fullWidth
                      id="cantidad_insumo"
                      name="cantidad_insumo"
                      label="Cantidad"
                      type="number"
                      value={formik.values.cantidad_insumo}
                      onChange={formik.handleChange}
                      margin="normal"
                      InputProps={{ 
                        inputProps: { min: 1 } 
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3} sx={{ display: 'flex', alignItems: 'center' }}>
                    <Button 
                      variant="contained" 
                      color="primary"
                      onClick={handleAgregarInsumo}
                      sx={{ mt: 2 }}
                    >
                      Agregar
                    </Button>
                  </Grid>
                </Grid>
                
                {error && (
                  <Typography color="error" sx={{ mt: 1 }}>
                    {error}
                  </Typography>
                )}
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle1" gutterBottom>
                  Insumos seleccionados
                </Typography>
                
                {insumosSeleccionados.length === 0 ? (
                  <Typography color="textSecondary">
                    No hay insumos seleccionados
                  </Typography>
                ) : (
                  <Paper sx={{ mt: 2 }}>
                    <List>
                      {insumosSeleccionados.map((insumo) => (
                        <ListItem key={insumo.id_insumo} sx={{ py: 1 }}> {/* Eliminado el 'button' atributo */}
                          <ListItemText 
                            primary={insumo.nombre} 
                            secondary={`Cantidad: ${insumo.cantidad_usada}`} 
                          />
                          <ListItemSecondaryAction>
                            <IconButton 
                              edge="end" 
                              aria-label="delete"
                              onClick={() => handleQuitarInsumo(insumo.id_insumo)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </ListItemSecondaryAction>
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                )}
              </Box>
            )}
            
            {activeStep === 3 && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Resumen del Servicio
                </Typography>
                
                <Paper sx={{ p: 2, mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Información del Vehículo
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Placa:</Typography>
                      <Typography variant="body1">{formik.values.placa}</Typography>
                    </Grid>
                    {nuevoVehiculo && (
                      <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary">Tipo:</Typography>
                        <Typography variant="body1">
                          {tiposVehiculos?.find(t => t.id_tipo === parseInt(formik.values.id_tipo))?.descripcion || ''}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </Paper>
                
                <Paper sx={{ p: 2, mb: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Información del Servicio
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Empleado que recibe:</Typography>
                      <Typography variant="body1">
                        {empleados?.find(e => e.id_empleado === parseInt(formik.values.id_empleado_recibe))
                          ? `${empleados.find(e => e.id_empleado === parseInt(formik.values.id_empleado_recibe)).nombre} ${empleados.find(e => e.id_empleado === parseInt(formik.values.id_empleado_recibe)).apellido}`
                          : ''}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Empleado que lava:</Typography>
                      <Typography variant="body1">
                        {empleados?.find(e => e.id_empleado === parseInt(formik.values.id_empleado_lava))
                          ? `${empleados.find(e => e.id_empleado === parseInt(formik.values.id_empleado_lava)).nombre} ${empleados.find(e => e.id_empleado === parseInt(formik.values.id_empleado_lava)).apellido}`
                          : ''}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Tipo de lavado:</Typography>
                      <Typography variant="body1">
                        {tiposLavado?.find(t => t.id_tipo_lavado === parseInt(formik.values.id_tipo_lavado))?.nombre || ''}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="textSecondary">Precio:</Typography>
                      <Typography variant="body1">${parseFloat(formik.values.precio).toFixed(2)}</Typography>
                    </Grid>
                  </Grid>
                </Paper>
                
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Insumos Utilizados
                  </Typography>
                  {insumosSeleccionados.length === 0 ? (
                    <Typography color="textSecondary">No hay insumos seleccionados</Typography>
                  ) : (
                    <List>
                      {insumosSeleccionados.map((insumo) => (
                        <ListItem key={insumo.id_insumo} sx={{ py: 0.5 }}> {/* Corregido: eliminado disablePadding */}
                          <ListItemText 
                            primary={insumo.nombre} 
                            secondary={`Cantidad: ${insumo.cantidad_usada}`} 
                          />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Paper>
              </Box>
            )}
            
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              {activeStep > 0 && (
                <Button onClick={handleBack} sx={{ mr: 1 }}>
                  Atrás
                </Button>
              )}
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                >
                  Crear Servicio
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                >
                  Siguiente
                </Button>
              )}
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default NuevoServicio;