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
  Select
} from '@mui/material';
import { toast } from 'react-toastify';
import PageHeader from '../components/common/PageHeader';
import { getTurnos, createTurno, deleteTurno } from '../api/turnos';
import { getEmpleados } from '../api/empleados';
import { useFormik } from 'formik';
import * as yup from 'yup';
import AddIcon from '@mui/icons-material/Add';
import ConfirmDialog from "../components/common/ConfirmDialog";

const diasSemana = [
  'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'
];

const validationSchema = yup.object({
  id_empleado: yup.number().required('El empleado es requerido'),
  dia: yup.string().required('El día es requerido'),
  hora_inicio: yup.string().required('La hora de inicio es requerida'),
  hora_final: yup.string().required('La hora final es requerida')
});

const Turnos = () => {
  const [turnos, setTurnos] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openNuevoTurno, setOpenNuevoTurno] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null });
  const [filteredEmpleado, setFilteredEmpleado] = useState('');
  const [filteredDia, setFilteredDia] = useState('');

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
        await createTurno(values);
        toast.success('Turno creado exitosamente');
        setOpenNuevoTurno(false);
        fetchTurnos();
        formik.resetForm();
      } catch (error) {
        toast.error('Error al crear el turno');
        console.error('Error al crear turno:', error);
      }
    }
  });

  const fetchTurnos = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filteredEmpleado) params.id_empleado = filteredEmpleado;
      if (filteredDia) params.dia = filteredDia;
      
      const [turnosData, empleadosData] = await Promise.all([
        getTurnos(params),
        getEmpleados({ estado: 'Activo' })
      ]);
      setTurnos(turnosData.results);
      setEmpleados(empleadosData.results);
    } catch (error) {
      toast.error('Error al cargar los turnos');
      console.error('Error fetching turnos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTurnos();
  }, [filteredEmpleado, filteredDia]);

  const handleOpenNuevoTurno = () => {
    setOpenNuevoTurno(true);
  };

  const handleCloseNuevoTurno = () => {
    setOpenNuevoTurno(false);
    formik.resetForm();
  };

  const handleConfirmDelete = (id) => {
    setConfirmDialog({ open: true, id });
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
      setConfirmDialog({ open: false, id: null });
    }
  };

  const handleEmpleadoFilterChange = (event) => {
    setFilteredEmpleado(event.target.value);
  };

  const handleDiaFilterChange = (event) => {
    setFilteredDia(event.target.value);
  };

  const getEmpleadoNombre = (id) => {
    const empleado = empleados.find(e => e.id_empleado === id);
    return empleado ? `${empleado.nombre} ${empleado.apellido}` : 'Desconocido';
  };

  return (
    <Box>
      <PageHeader
        title="Turnos"
        subtitle="Gestiona los turnos de los empleados"
        onAddClick={handleOpenNuevoTurno}
        buttonText="Nuevo Turno"
      />

      <Box sx={{ mb: 3 }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Filtros
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="empleado-filter-label">Filtrar por Empleado</InputLabel>
                <Select
                  labelId="empleado-filter-label"
                  id="empleado-filter"
                  value={filteredEmpleado}
                  label="Filtrar por Empleado"
                  onChange={handleEmpleadoFilterChange}
                >
                  <MenuItem value="">Todos</MenuItem>
                  {empleados.map((empleado) => (
                    <MenuItem key={empleado.id_empleado} value={empleado.id_empleado}>
                      {`${empleado.nombre} ${empleado.apellido}`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="dia-filter-label">Filtrar por Día</InputLabel>
                <Select
                  labelId="dia-filter-label"
                  id="dia-filter"
                  value={filteredDia}
                  label="Filtrar por Día"
                  onChange={handleDiaFilterChange}
                >
                  <MenuItem value="">Todos</MenuItem>
                  {diasSemana.map((dia) => (
                    <MenuItem key={dia} value={dia}>
                      {dia}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Empleado</TableCell>
              <TableCell>Día</TableCell>
              <TableCell>Hora Inicio</TableCell>
              <TableCell>Hora Final</TableCell>
              <TableCell align="center">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {turnos.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No hay turnos disponibles
                </TableCell>
              </TableRow>
            ) : (
              turnos.map((turno) => (
                <TableRow key={turno.id_turno}>
                  <TableCell>{turno.id_turno}</TableCell>
                  <TableCell>
                    {turno.id_empleado ? 
                      `${turno.id_empleado.nombre} ${turno.id_empleado.apellido}` : 
                      'No asignado'}
                  </TableCell>
                  <TableCell>{turno.dia}</TableCell>
                  <TableCell>{turno.hora_inicio}</TableCell>
                  <TableCell>{turno.hora_final}</TableCell>
                  <TableCell align="center">
                    <Button
                      color="error"
                      size="small"
                      onClick={() => handleConfirmDelete(turno.id_turno)}
                    >
                      Eliminar
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog para Nuevo Turno */}
      <Dialog open={openNuevoTurno} onClose={handleCloseNuevoTurno} maxWidth="sm" fullWidth>
        <DialogTitle>Nuevo Turno</DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
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
              >
                {empleados.map((empleado) => (
                  <MenuItem key={empleado.id_empleado} value={empleado.id_empleado}>
                    {`${empleado.nombre} ${empleado.apellido}`}
                  </MenuItem>
                ))}
              </Select>
              {formik.touched.id_empleado && formik.errors.id_empleado && (
                <Typography color="error" variant="caption">
                  {formik.errors.id_empleado}
                </Typography>
              )}
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="dia-label">Día</InputLabel>
              <Select
                labelId="dia-label"
                id="dia"
                name="dia"
                value={formik.values.dia}
                onChange={formik.handleChange}
                error={formik.touched.dia && Boolean(formik.errors.dia)}
                label="Día"
              >
                {diasSemana.map((dia) => (
                  <MenuItem key={dia} value={dia}>
                    {dia}
                  </MenuItem>
                ))}
              </Select>
              {formik.touched.dia && formik.errors.dia && (
                <Typography color="error" variant="caption">
                  {formik.errors.dia}
                </Typography>
              )}
            </FormControl>
            
            <TextField
              fullWidth
              id="hora_inicio"
              name="hora_inicio"
              label="Hora de Inicio"
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
            />
            
            <TextField
              fullWidth
              id="hora_final"
              name="hora_final"
              label="Hora Final"
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
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseNuevoTurno}>Cancelar</Button>
            <Button type="submit" variant="contained" color="primary">
              Guardar
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Diálogo de confirmación para eliminar */}
      <ConfirmDialog
        open={confirmDialog.open}
        title="Confirmar eliminación"
        content="¿Estás seguro de que deseas eliminar este turno? Esta acción no se puede deshacer."
        onConfirm={handleDeleteTurno}
        onCancel={() => setConfirmDialog({ open: false, id: null })}
      />
    </Box>
  );
};

export default Turnos;