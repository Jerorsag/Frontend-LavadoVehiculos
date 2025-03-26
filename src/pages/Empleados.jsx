import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, MenuItem, Grid } from '@mui/material';
import { toast } from 'react-toastify';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { getEmpleados, createEmpleado, deleteEmpleado } from '../api/empleados';
import PageHeader from '../components/common/PageHeader';
import DataTable from "../components/common/DataTable";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const validationSchema = yup.object({
  nombre: yup.string().required('El nombre es requerido'),
  apellido: yup.string().required('El apellido es requerido'),
  fecha_nacimiento: yup.date().required('La fecha de nacimiento es requerida'),
  estado: yup.string().oneOf(['Activo', 'Inactivo']).required('El estado es requerido')
});

const Empleados = () => {
  const navigate = useNavigate();
  const [empleados, setEmpleados] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null });
  const [searchTerm, setSearchTerm] = useState('');

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
        await createEmpleado(values);
        toast.success('Empleado creado exitosamente');
        setOpenDialog(false);
        fetchEmpleados();
        formik.resetForm();
      } catch (error) {
        toast.error('Error al crear el empleado');
        console.error('Error al crear empleado:', error);
      }
    }
  });

  const fetchEmpleados = async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        page_size: rowsPerPage,
        search: searchTerm
      };
      const data = await getEmpleados(params);
      setEmpleados(data.results);
      setTotalItems(data.count);
    } catch (error) {
      toast.error('Error al cargar los empleados');
      console.error('Error fetching empleados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmpleados();
  }, [page, rowsPerPage, searchTerm]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    formik.resetForm();
  };

  const handleView = (id) => {
    navigate(`/empleados/${id}`);
  };

  const handleEdit = (id) => {
    navigate(`/empleados/${id}`);
  };

  const handleConfirmDelete = (id) => {
    setConfirmDialog({ open: true, id });
  };

  const handleDeleteEmpleado = async () => {
    try {
      await deleteEmpleado(confirmDialog.id);
      toast.success('Empleado eliminado exitosamente');
      fetchEmpleados();
    } catch (error) {
      toast.error('Error al eliminar el empleado');
      console.error('Error deleting empleado:', error);
    } finally {
      setConfirmDialog({ open: false, id: null });
    }
  };

  const columns = [
    { 
      id: 'id_empleado', 
      label: 'ID', 
      accessor: row => row.id_empleado,
      minWidth: 70
    },
    { 
      id: 'nombre', 
      label: 'Nombre', 
      accessor: row => `${row.nombre} ${row.apellido}`,
      minWidth: 170
    },
    { 
      id: 'fecha_nacimiento', 
      label: 'Fecha de Nacimiento', 
      accessor: row => row.fecha_nacimiento,
      format: value => format(new Date(value), 'dd/MM/yyyy', { locale: es }),
      minWidth: 170
    },
    { 
      id: 'estado', 
      label: 'Estado', 
      accessor: row => row.estado,
      format: (value) => (
        <Box
          component="span"
          sx={{
            py: 0.5,
            px: 1.5,
            borderRadius: 8,
            backgroundColor: value === 'Activo' ? '#e6f4ea' : '#f8d7da',
            color: value === 'Activo' ? '#43a047' : '#d32f2f',
            fontWeight: 'medium'
          }}
        >
          {value}
        </Box>
      ),
      minWidth: 100
    }
  ];

  return (
    <Box>
      <PageHeader
        title="Empleados"
        subtitle="Gestiona la información de los empleados"
        onAddClick={handleOpenDialog}
      />

      <DataTable
        columns={columns}
        data={empleados}
        page={page}
        totalItems={totalItems}
        perPage={rowsPerPage}
        loading={loading}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleConfirmDelete}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      {/* Diálogo para crear nuevo empleado */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Nuevo Empleado</DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
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
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
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
        content="¿Estás seguro de que deseas eliminar este empleado? Esta acción no se puede deshacer."
        onConfirm={handleDeleteEmpleado}
        onCancel={() => setConfirmDialog({ open: false, id: null })}
      />
    </Box>
  );
};

export default Empleados;