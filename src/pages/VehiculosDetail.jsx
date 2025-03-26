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
import { getVehiculo, updateVehiculo, getHistorialVehiculo, getTiposVehiculos } from '../api/vehiculos';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const validationSchema = yup.object({
  id_tipo: yup.number().required('El tipo de vehículo es requerido')
});

const VehiculoDetail = () => {
  const { placa } = useParams();
  const navigate = useNavigate();
  const [vehiculo, setVehiculo] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [tiposVehiculos, setTiposVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  const formik = useFormik({
    initialValues: {
      id_tipo: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const updatedVehiculo = await updateVehiculo(placa, values);
        setVehiculo(updatedVehiculo);
        setEditMode(false);
        toast.success('Vehículo actualizado exitosamente');
      } catch (error) {
        toast.error('Error al actualizar el vehículo');
        console.error('Error updating vehiculo:', error);
      }
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [vehiculoData, historialData, tiposData] = await Promise.all([
          getVehiculo(placa),
          getHistorialVehiculo(placa),
          getTiposVehiculos()
        ]);
        
        setVehiculo(vehiculoData);
        setHistorial(historialData);
        setTiposVehiculos(tiposData.results);
        
        formik.setValues({
          id_tipo: vehiculoData.id_tipo.id_tipo
        });
      } catch (error) {
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
    formik.setValues({
      id_tipo: vehiculo.id_tipo.id_tipo
    });
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
          onClick={() => navigate('/vehiculos')}
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
            Información del Vehículo
          </Typography>
          {editMode ? (
            <form onSubmit={formik.handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    disabled
                    label="Placa"
                    value={placa}
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
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
                  >
                    {tiposVehiculos.map((tipo) => (
                      <MenuItem key={tipo.id_tipo} value={tipo.id_tipo}>
                        {tipo.descripcion}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>
            </form>
          ) : (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="textSecondary">Placa:</Typography>
                <Typography variant="body1">{vehiculo.placa}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="textSecondary">Tipo de vehículo:</Typography>
                <Typography variant="body1">{vehiculo.id_tipo.descripcion}</Typography>
              </Grid>
            </Grid>
          )}
        </CardContent>
      </Card>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="vehiculo tabs">
          <Tab label="Historial de Servicios" />
          <Tab label="Estadísticas" />
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <Box>
          <Typography variant="h6" gutterBottom>
            Historial de Servicios
          </Typography>
          {historial.length === 0 ? (
            <Typography>No hay servicios registrados para este vehículo.</Typography>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
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
                    <TableRow key={servicio.id_servicio}>
                      <TableCell>{servicio.id_servicio}</TableCell>
                      <TableCell>{format(new Date(servicio.fecha), 'dd/MM/yyyy HH:mm', { locale: es })}</TableCell>
                      <TableCell>{servicio.id_tipo_lavado?.nombre || 'No especificado'}</TableCell>
                      <TableCell>
                        {servicio.id_empleado_recibe ? 
                          `${servicio.id_empleado_recibe.nombre} ${servicio.id_empleado_recibe.apellido}` : 
                          'No especificado'}
                      </TableCell>
                      <TableCell>
                        {servicio.id_empleado_lava ? 
                          `${servicio.id_empleado_lava.nombre} ${servicio.id_empleado_lava.apellido}` : 
                          'No especificado'}
                      </TableCell>
                      <TableCell align="right">${servicio.precio.toFixed(2)}</TableCell>
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
          <Typography variant="h6" gutterBottom>
            Estadísticas del Vehículo
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total de visitas
                  </Typography>
                  <Typography variant="h4">
                    {historial.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Costo total
                  </Typography>
                  <Typography variant="h4">
                    ${historial.reduce((sum, servicio) => sum + parseFloat(servicio.precio), 0).toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Última visita
                  </Typography>
                  <Typography variant="h6">
                    {historial.length > 0 
                      ? format(new Date(historial[0].fecha), 'dd/MM/yyyy', { locale: es })
                      : 'N/A'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default VehiculoDetail;