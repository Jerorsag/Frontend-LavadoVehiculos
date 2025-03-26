import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, MenuItem, Grid } from '@mui/material';
import { toast } from 'react-toastify';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { getVehiculos, createVehiculo, deleteVehiculo, getTiposVehiculos } from '../api/vehiculos';
import PageHeader from '../components/common/PageHeader';
import DataTable from "../components/common/DataTable";
import ConfirmDialog from "../components/common/ConfirmDialog";

const validationSchema = yup.object({
  placa: yup.string().required('La placa es requerida').max(10, 'Máximo 10 caracteres'),
  id_tipo: yup.number().required('El tipo de vehículo es requerido')
});

const Vehiculos = () => {
  const navigate = useNavigate();
  const [vehiculos, setVehiculos] = useState([]);
  const [tiposVehiculos, setTiposVehiculos] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null });
  const [searchTerm, setSearchTerm] = useState('');

  const formik = useFormik({
    initialValues: {
      placa: '',
      id_tipo: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        await createVehiculo(values);
        toast.success('Vehículo creado exitosamente');
        setOpenDialog(false);
        fetchVehiculos();
        formik.resetForm();
      } catch (error) {
        toast.error('Error al crear el vehículo');
        console.error('Error al crear vehículo:', error);
      }
    }
  });

  const fetchVehiculos = async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1,
        page_size: rowsPerPage,
        search: searchTerm
      };
      const data = await getVehiculos(params);
      setVehiculos(data.results);
      setTotalItems(data.count);
    } catch (error) {
      toast.error('Error al cargar los vehículos');
      console.error('Error fetching vehiculos:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTiposVehiculos = async () => {
    try {
      const data = await getTiposVehiculos();
      setTiposVehiculos(data.results);
    } catch (error) {
      toast.error('Error al cargar los tipos de vehículos');
      console.error('Error fetching tipos de vehiculos:', error);
    }
  };

  useEffect(() => {
    fetchVehiculos();
    fetchTiposVehiculos();
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

  const handleView = (placa) => {
    navigate(`/vehiculos/${placa}`);
  };

  const handleEdit = (placa) => {
    navigate(`/vehiculos/${placa}`);
  };

  const handleConfirmDelete = (placa) => {
    setConfirmDialog({ open: true, id: placa });
  };

  const handleDeleteVehiculo = async () => {
    try {
      await deleteVehiculo(confirmDialog.id);
      toast.success('Vehículo eliminado exitosamente');
      fetchVehiculos();
    } catch (error) {
      toast.error('Error al eliminar el vehículo');
      console.error('Error deleting vehiculo:', error);
    } finally {
      setConfirmDialog({ open: false, id: null });
    }
  };

  const columns = [
    { 
      id: 'placa', 
      label: 'Placa', 
      accessor: row => row.placa,
      minWidth: 120
    },
    { 
      id: 'tipo', 
      label: 'Tipo de Vehículo', 
      accessor: row => row.id_tipo?.descripcion || 'No especificado',
      minWidth: 170
    }
  ];

  return (
    <Box>
      <PageHeader
        title="Vehículos"
        subtitle="Gestiona la información de los vehículos"
        onAddClick={handleOpenDialog}
      />

      <DataTable
        columns={columns}
        data={vehiculos}
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

      {/* Diálogo para crear nuevo vehículo */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Nuevo Vehículo</DialogTitle>
        <form onSubmit={formik.handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="placa"
                  name="placa"
                  label="Placa"
                  value={formik.values.placa}
                  onChange={formik.handleChange}
                  error={formik.touched.placa && Boolean(formik.errors.placa)}
                  helperText={formik.touched.placa && formik.errors.placa}
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
        content="¿Estás seguro de que deseas eliminar este vehículo? Esta acción no se puede deshacer."
        onConfirm={handleDeleteVehiculo}
        onCancel={() => setConfirmDialog({ open: false, id: null })}
      />
    </Box>
  );
};

export default Vehiculos;