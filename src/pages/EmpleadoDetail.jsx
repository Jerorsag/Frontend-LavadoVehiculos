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
  CircularProgress
} from '@mui/material';
import { toast } from 'react-toastify';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { getEmpleado, updateEmpleado, getEmpleadoTurnos, getEmpleadoServicios } from '../api/empleados';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { format } from 'date-fns';
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
  const [empleado, setEmpleado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [turnos, setTurnos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [serviciosTipo, setServiciosTipo] = useState(null);

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
        const updatedEmpleado = await updateEmpleado(id, values);
        setEmpleado(updatedEmpleado);
        setEditMode(false);
        toast.success('Empleado actualizado exitosamente');
      } catch (error) {
        toast.error('Error al actualizar el empleado');
        console.error('Error updating empleado:', error);
      }
    }
  });

  useEffect(() => {
    const fetchEmpleado = async () => {
      try {
        setLoading(true);
        const data = await getEmpleado(id);
        setEmpleado(data);
        formik.setValues({
          nombre: data.nombre,
          apellido: data.apellido,
          fecha_nacimiento: data.fecha_nacimiento,
          estado: data.estado
        });
      } catch (error) {
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
          const data = await getEmpleadoTurnos(id);
          setTurnos(data);
        } catch (error) {
          console.error('Error fetching turnos:', error);
          toast.error('Error al cargar los turnos del empleado');
        }
      } else if (tabValue === 2) {
        try {
          const data = await getEmpleadoServicios(id, serviciosTipo);
          setServicios(data);
        } catch (error) {
          console.error('Error fetching servicios:', error);
          toast.error('Error al cargar los servicios del empleado');
        }
      }
    };

    if (id) {
      fetchEmpleadoData();
    }
  }, [id, tabValue, serviciosTipo]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleEditClick = () => {
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    formik.resetForm();
    formik.setValues({
      nombre: empleado.nombre,
      apellido: empleado.apellido,
      fecha_nacimiento: empleado.fecha_nacimiento,
      estado: empleado.estado
    });
  };

  const handleServiciosTipoChange = (event) => {
    setServiciosTipo(event.target.value);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/empleados')}
        >
          Volver a la lista
        </Button>
        {!editMode ? (
          <Button
            variant="contained"
            color="primary"
            startIcon={<EditIcon />}
            onClick={handleEditClick}
          >
            Editar
          </Button>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              color="error"
              startIcon={<CancelIcon />}
              onClick={handleCancelEdit}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={formik.handleSubmit}
            >
              Guardar
            </Button>
          </Box>
        )}
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            Información del Empleado
          </Typography>
          {editMode ? (
            <form onSubmit={formik.handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
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
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
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
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
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
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
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
                  >
                    <MenuItem value="Activo">Activo</MenuItem>
                    <MenuItem value="Inactivo">Inactivo</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </form>
          ) : (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="textSecondary">ID:</Typography>
                <Typography variant="body1">{empleado.id_empleado}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="textSecondary">Nombre completo:</Typography>
                <Typography variant="body1">{`${empleado.nombre} ${empleado.apellido}`}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="textSecondary">Fecha de nacimiento:</Typography>
                <Typography variant="body1">
                  {format(new Date(empleado.fecha_nacimiento), 'dd/MM/yyyy', { locale: es })}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="textSecondary">Edad:</Typography>
                <Typography variant="body1">{empleado.edad} años</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="textSecondary">Estado:</Typography>
                <Box
                  component="span"
                  sx={{
                    py: 0.5,
                    px: 1.5,
                    borderRadius: 8,
                    backgroundColor: empleado.estado === 'Activo' ? '#e6f4ea' : '#f8d7da',
                    color: empleado.estado === 'Activo' ? '#43a047' : '#d32f2f',
                    fontWeight: 'medium',
                    display: 'inline-block'
                  }}
                >
                  {empleado.estado}
                </Box>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="empleado tabs">
          <Tab label="Resumen" />
          <Tab label="Turnos" />
          <Tab label="Servicios" />
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Resumen de actividad
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Servicios realizados (lavado)
                  </Typography>
                  <Typography variant="h4">
                    {/* Aquí podrías mostrar datos de resumen */}
                    10
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Servicios registrados (recepción)
                  </Typography>
                  <Typography variant="h4">
                    {/* Aquí podrías mostrar datos de resumen */}
                    15
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Horas trabajadas (último mes)
                  </Typography>
                  <Typography variant="h4">
                    {/* Aquí podrías mostrar datos de resumen */}
                    160
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}

      {tabValue === 1 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Turnos asignados
          </Typography>
          {turnos.length === 0 ? (
            <Typography>No hay turnos asignados para este empleado.</Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Día</TableCell>
                    <TableCell>Hora de inicio</TableCell>
                    <TableCell>Hora de fin</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {turnos.map((turno) => (
                    <TableRow key={turno.id_turno}>
                      <TableCell>{turno.id_turno}</TableCell>
                      <TableCell>{turno.dia}</TableCell>
                      <TableCell>{turno.hora_inicio}</TableCell>
                      <TableCell>{turno.hora_final}</TableCell>
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Historial de servicios
            </Typography>
            <TextField
              select
              label="Tipo de servicio"
              value={serviciosTipo || ''}
              onChange={handleServiciosTipoChange}
              variant="outlined"
              size="small"
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="">Todos</MenuItem>
              <MenuItem value="recibidos">Recibidos</MenuItem>
              <MenuItem value="lavados">Lavados</MenuItem>
            </TextField>
          </Box>
          
          {servicios.length === 0 ? (
            <Typography>No hay servicios para este empleado.</Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Placa</TableCell>
                    <TableCell>Tipo de lavado</TableCell>
                    <TableCell align="right">Precio</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {servicios.map((servicio) => (
                    <TableRow key={servicio.id_servicio}>
                      <TableCell>{servicio.id_servicio}</TableCell>
                      <TableCell>{format(new Date(servicio.fecha), 'dd/MM/yyyy HH:mm', { locale: es })}</TableCell>
                      <TableCell>{servicio.placa}</TableCell>
                      <TableCell>{servicio.id_tipo_lavado}</TableCell>
                      <TableCell align="right">${servicio.precio.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}
    </Box>
  );
};

export default EmpleadoDetail;