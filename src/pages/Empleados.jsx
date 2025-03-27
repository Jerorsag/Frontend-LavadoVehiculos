import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Dialog, 
  DialogActions, 
  DialogContent, 
  DialogTitle, 
  TextField, 
  MenuItem, 
  Grid, 
  Paper, 
  Typography, 
  Chip, 
  Avatar, 
  IconButton, 
  Tooltip, 
  Divider,
  useTheme,
  alpha,
  LinearProgress,
  CircularProgress,
  Card,
  CardContent,
  Alert
} from '@mui/material';
import { toast } from 'react-toastify';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { getEmpleados, createEmpleado, deleteEmpleado } from '../api/empleados';
import PageHeader from '../components/common/PageHeader';
import DataTable from "../components/common/DataTable";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { format, differenceInYears } from 'date-fns';
import { es } from 'date-fns/locale';

// Iconos
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CakeIcon from '@mui/icons-material/Cake';
import BadgeIcon from '@mui/icons-material/Badge';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';
import GroupIcon from '@mui/icons-material/Group';

const validationSchema = yup.object({
  nombre: yup.string().required('El nombre es requerido'),
  apellido: yup.string().required('El apellido es requerido'),
  fecha_nacimiento: yup.date().required('La fecha de nacimiento es requerida'),
  estado: yup.string().oneOf(['Activo', 'Inactivo']).required('El estado es requerido')
});

const Empleados = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [empleados, setEmpleados] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [activosCount, setActivosCount] = useState(0);
  const [inactivosCount, setInactivosCount] = useState(0);
  const [error, setError] = useState(null);

  const formik = useFormik({
    initialValues: {
      nombre: '',
      apellido: '',
      fecha_nacimiento: format(new Date(), 'yyyy-MM-dd'),
      estado: 'Activo'
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setSubmitting(true);
        await createEmpleado(values);
        toast.success('Empleado creado exitosamente');
        setOpenDialog(false);
        fetchEmpleados();
        formik.resetForm();
      } catch (error) {
        toast.error('Error al crear el empleado');
        console.error('Error al crear empleado:', error);
      } finally {
        setSubmitting(false);
      }
    }
  });

  const fetchEmpleados = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page: page + 1,
        page_size: rowsPerPage,
        search: searchTerm,
        estado: filterEstado
      };
      
      const data = await getEmpleados(params);
      setEmpleados(data.results || []);
      setTotalItems(data.count || 0);
      
      // Contar empleados activos e inactivos
      const activos = data.results.filter(emp => emp.estado === 'Activo').length;
      const inactivos = data.results.filter(emp => emp.estado === 'Inactivo').length;
      
      setActivosCount(activos);
      setInactivosCount(inactivos);
    } catch (error) {
      setError('Error al cargar los empleados');
      toast.error('Error al cargar los empleados');
      console.error('Error fetching empleados:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmpleados();
  }, [page, rowsPerPage, searchTerm, filterEstado]);

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
    if (!submitting) {
      setOpenDialog(false);
      formik.resetForm();
    }
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

  const handleFilterEstado = (estado) => {
    setFilterEstado(estado === filterEstado ? '' : estado);
    setPage(0);
  };

  const getInitials = (name, lastName) => {
    return `${name?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const renderEmployeeAvatar = (row) => {
    const initials = getInitials(row.nombre, row.apellido);
    const isActive = row.estado === 'Activo';
    
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Avatar 
          sx={{ 
            bgcolor: isActive ? theme.palette.primary.main : alpha(theme.palette.text.secondary, 0.4),
            color: '#fff',
            fontWeight: 'bold',
            mr: 2
          }}
        >
          {initials}
        </Avatar>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {`${row.nombre} ${row.apellido}`}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            ID: {row.id_empleado}
          </Typography>
        </Box>
      </Box>
    );
  };
  
  const calculateAge = (birthdate) => {
    try {
      const today = new Date();
      const birthdateObj = new Date(birthdate);
      return differenceInYears(today, birthdateObj);
    } catch (e) {
      return "N/A";
    }
  };

  const columns = [
    { 
      id: 'nombre', 
      label: 'Empleado', 
      accessor: row => row,
      format: renderEmployeeAvatar,
      minWidth: 200
    },
    { 
      id: 'fecha_nacimiento', 
      label: 'Fecha de Nacimiento', 
      accessor: row => row.fecha_nacimiento,
      format: value => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <CakeIcon sx={{ color: theme.palette.warning.main, mr: 1, fontSize: 18 }} />
          <Box>
            <Typography variant="body2">
              {format(new Date(value), 'dd MMM yyyy', { locale: es })}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {calculateAge(value)} años
            </Typography>
          </Box>
        </Box>
      ),
      minWidth: 170
    },
    { 
      id: 'estado', 
      label: 'Estado', 
      accessor: row => row.estado,
      format: (value) => (
        <Chip
          label={value}
          color={value === 'Activo' ? 'success' : 'error'}
          variant="outlined"
          size="small"
          sx={{ 
            fontWeight: 500,
            minWidth: 80,
            '& .MuiChip-label': { px: 1 }
          }}
        />
      ),
      minWidth: 100,
      align: 'center'
    }
  ];

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          variant="contained" 
          onClick={fetchEmpleados}
          startIcon={<RefreshIcon />}
        >
          Reintentar
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Cabecera con estadísticas */}
      <Box sx={{ mb: 3 }}>
        <PageHeader
          title="Empleados"
          subtitle="Gestiona la información de los empleados"
          onAddClick={handleOpenDialog}
          buttonText="Nuevo Empleado"
          buttonIcon={<PersonAddIcon />}
        />
        
        <Grid container spacing={2} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Card elevation={0} sx={{ 
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.primary.main, 0.05),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
            }}>
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: theme.palette.primary.main, mr: 1.5 }}>
                    <GroupIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" component="div" sx={{ fontWeight: 600 }}>
                      {totalItems}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Empleados totales
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={6} sm={3} md={4}>
            <Card 
              elevation={0} 
              sx={{ 
                borderRadius: 2,
                height: '100%',
                backgroundColor: alpha(theme.palette.success.main, 0.05),
                border: `1px solid ${alpha(theme.palette.success.main, 0.1)}`,
                cursor: 'pointer'
              }}
              onClick={() => handleFilterEstado('Activo')}
            >
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
                      {activosCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Activos
                    </Typography>
                  </Box>
                  <Chip 
                    label="Activo" 
                    color="success" 
                    variant={filterEstado === 'Activo' ? 'filled' : 'outlined'} 
                    size="small" 
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={6} sm={3} md={4}>
            <Card 
              elevation={0} 
              sx={{ 
                borderRadius: 2,
                height: '100%',
                backgroundColor: alpha(theme.palette.error.main, 0.05),
                border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`,
                cursor: 'pointer'
              }}
              onClick={() => handleFilterEstado('Inactivo')}
            >
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="h5" component="div" sx={{ fontWeight: 600 }}>
                      {inactivosCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Inactivos
                    </Typography>
                  </Box>
                  <Chip 
                    label="Inactivo" 
                    color="error" 
                    variant={filterEstado === 'Inactivo' ? 'filled' : 'outlined'} 
                    size="small" 
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Filtros activos */}
      {filterEstado && (
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          <FilterListIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
          <Typography variant="body2" sx={{ mr: 1 }}>Filtros activos:</Typography>
          <Chip
            label={`Estado: ${filterEstado}`}
            size="small"
            onDelete={() => setFilterEstado('')}
            color={filterEstado === 'Activo' ? 'success' : 'error'}
            sx={{ mr: 1 }}
          />
        </Box>
      )}

      {/* Tabla de datos */}
      <Paper 
        elevation={0} 
        sx={{ 
          borderRadius: 2,
          overflow: 'hidden',
          border: `1px solid ${theme.palette.divider}`
        }}
      >
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
          searchPlaceholder="Buscar por nombre o apellido..."
        />
      </Paper>

      {/* Diálogo para crear nuevo empleado */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{ 
          sx: { 
            borderRadius: 2,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: alpha(theme.palette.primary.main, 0.1),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PersonAddIcon sx={{ mr: 1.5, color: theme.palette.primary.main }} />
            <Typography variant="h6">Nuevo Empleado</Typography>
          </Box>
          <IconButton onClick={handleCloseDialog} disabled={submitting}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <form onSubmit={formik.handleSubmit}>
          <DialogContent sx={{ pt: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                  <BadgeIcon sx={{ mt: 2, mr: 1, color: theme.palette.primary.main }} />
                  <TextField
                    fullWidth
                    id="nombre"
                    name="nombre"
                    label="Nombre"
                    variant="outlined"
                    value={formik.values.nombre}
                    onChange={formik.handleChange}
                    error={formik.touched.nombre && Boolean(formik.errors.nombre)}
                    helperText={formik.touched.nombre && formik.errors.nombre}
                    margin="normal"
                    disabled={submitting}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                  <BadgeIcon sx={{ mt: 2, mr: 1, color: theme.palette.primary.main }} />
                  <TextField
                    fullWidth
                    id="apellido"
                    name="apellido"
                    label="Apellido"
                    variant="outlined"
                    value={formik.values.apellido}
                    onChange={formik.handleChange}
                    error={formik.touched.apellido && Boolean(formik.errors.apellido)}
                    helperText={formik.touched.apellido && formik.errors.apellido}
                    margin="normal"
                    disabled={submitting}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                  <CalendarMonthIcon sx={{ mt: 2, mr: 1, color: theme.palette.primary.main }} />
                  <TextField
                    fullWidth
                    id="fecha_nacimiento"
                    name="fecha_nacimiento"
                    label="Fecha de Nacimiento"
                    type="date"
                    variant="outlined"
                    value={formik.values.fecha_nacimiento}
                    onChange={formik.handleChange}
                    error={formik.touched.fecha_nacimiento && Boolean(formik.errors.fecha_nacimiento)}
                    helperText={formik.touched.fecha_nacimiento && formik.errors.fecha_nacimiento}
                    margin="normal"
                    InputLabelProps={{
                      shrink: true,
                    }}
                    disabled={submitting}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                  <VerifiedUserIcon sx={{ mt: 2, mr: 1, color: theme.palette.primary.main }} />
                  <TextField
                    fullWidth
                    id="estado"
                    name="estado"
                    select
                    label="Estado"
                    variant="outlined"
                    value={formik.values.estado}
                    onChange={formik.handleChange}
                    error={formik.touched.estado && Boolean(formik.errors.estado)}
                    helperText={formik.touched.estado && formik.errors.estado}
                    margin="normal"
                    disabled={submitting}
                  >
                    <MenuItem value="Activo">Activo</MenuItem>
                    <MenuItem value="Inactivo">Inactivo</MenuItem>
                  </TextField>
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          
          <Divider />
          
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button 
              onClick={handleCloseDialog} 
              disabled={submitting}
              sx={{ mr: 1 }}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={submitting}
              startIcon={submitting ? <CircularProgress size={20} /> : <PersonAddIcon />}
            >
              {submitting ? 'Guardando...' : 'Guardar Empleado'}
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