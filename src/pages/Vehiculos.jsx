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
  Typography,
  Card,
  CardContent,
  Chip,
  IconButton,
  Paper,
  Tooltip,
  InputAdornment,
  useTheme,
  alpha,
  LinearProgress
} from '@mui/material';
import { toast } from 'react-toastify';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { getVehiculos, createVehiculo, deleteVehiculo, getTiposVehiculos } from '../api/vehiculos';
import PageHeader from '../components/common/PageHeader';
import DataTable from "../components/common/DataTable";
import ConfirmDialog from "../components/common/ConfirmDialog";

// Iconos
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import TimeToLeaveIcon from '@mui/icons-material/TimeToLeave';
import AirportShuttleIcon from '@mui/icons-material/AirportShuttle';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AirlineSeatReclineNormalIcon from '@mui/icons-material/AirlineSeatReclineNormal';
import SportsMotorsportsIcon from '@mui/icons-material/SportsMotorsports';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';

const validationSchema = yup.object({
  placa: yup.string().required('La placa es requerida').max(10, 'Máximo 10 caracteres'),
  id_tipo: yup.number().required('El tipo de vehículo es requerido')
});

const Vehiculos = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [vehiculos, setVehiculos] = useState([]);
  const [tiposVehiculos, setTiposVehiculos] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [refreshing, setRefreshing] = useState(false);

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

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchVehiculos();
    setRefreshing(false);
    toast.success('Lista de vehículos actualizada');
  };

  // Función para obtener el icono según el tipo de vehículo
  const getVehicleIcon = (type) => {
    const typeStr = type?.toLowerCase() || '';
    
    if (typeStr.includes('camioneta') || typeStr.includes('suv')) return <AirportShuttleIcon />;
    if (typeStr.includes('moto')) return <TwoWheelerIcon />;
    if (typeStr.includes('camion')) return <LocalShippingIcon />;
    if (typeStr.includes('sedan')) return <TimeToLeaveIcon />;
    if (typeStr.includes('deportivo')) return <SportsMotorsportsIcon />;
    
    // Por defecto
    return <DirectionsCarIcon />;
  };

  // Obtener color según el tipo de vehículo
  const getVehicleColor = (type) => {
    const typeStr = type?.toLowerCase() || '';
    
    if (typeStr.includes('camioneta') || typeStr.includes('suv')) return theme.palette.info.main;
    if (typeStr.includes('moto')) return theme.palette.error.main;
    if (typeStr.includes('camion')) return theme.palette.warning.main;
    if (typeStr.includes('sedan')) return theme.palette.success.main;
    if (typeStr.includes('deportivo')) return theme.palette.secondary.main;
    
    // Por defecto
    return theme.palette.primary.main;
  };

  const columns = [
    { 
      id: 'placa', 
      label: 'Placa', 
      accessor: row => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Chip
            icon={getVehicleIcon(row.id_tipo?.descripcion)}
            label={row.placa}
            sx={{ 
              fontWeight: 'bold', 
              bgcolor: alpha(getVehicleColor(row.id_tipo?.descripcion), 0.1),
              color: getVehicleColor(row.id_tipo?.descripcion),
              border: `1px solid ${alpha(getVehicleColor(row.id_tipo?.descripcion), 0.3)}`,
              '& .MuiChip-icon': {
                color: getVehicleColor(row.id_tipo?.descripcion)
              }
            }}
          />
        </Box>
      ),
      minWidth: 150
    },
    { 
      id: 'tipo', 
      label: 'Tipo de Vehículo', 
      accessor: row => (
        <Typography variant="body2" sx={{ 
          display: 'flex', 
          alignItems: 'center',
          fontWeight: 500 
        }}>
          {getVehicleIcon(row.id_tipo?.descripcion)}
          <span style={{ marginLeft: '8px' }}>{row.id_tipo?.descripcion || 'No especificado'}</span>
        </Typography>
      ),
      minWidth: 170
    }
  ];

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
          <DirectionsCarIcon sx={{ fontSize: 180 }} />
        </Box>
        
        <CardContent sx={{ py: 4, position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: theme.palette.primary.main, display: 'flex', alignItems: 'center' }}>
                <DirectionsCarIcon sx={{ mr: 1, fontSize: 32 }} />
                Gestión de Vehículos
              </Typography>
              <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
                Administra la información de los vehículos registrados en el sistema
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleOpenDialog}
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
                Nuevo Vehículo
              </Button>
              
              <Tooltip title="Actualizar lista">
                <IconButton 
                  onClick={handleRefresh} 
                  disabled={refreshing || loading}
                  sx={{ 
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    '&:hover': {
                      bgcolor: alpha(theme.palette.primary.main, 0.2)
                    }
                  }}
                >
                  <RefreshIcon />
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
                    {totalItems}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Vehículos totales
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: '50%',
                    bgcolor: alpha(theme.palette.primary.main, 0.15),
                  }}
                >
                  <DirectionsCarIcon sx={{ color: theme.palette.primary.main }} />
                </Box>
              </Paper>
            </Grid>
            
            {/* Aquí puedes agregar más tarjetas de estadísticas si es necesario */}
          </Grid>
          
          {/* Barra de búsqueda estilizada */}
          <Box sx={{ mt: 3 }}>
            <TextField
              fullWidth
              placeholder="Buscar vehículo por placa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchTerm('')}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: '12px',
                  bgcolor: '#fff',
                  '& fieldset': {
                    borderColor: alpha(theme.palette.primary.main, 0.2),
                  },
                  '&:hover fieldset': {
                    borderColor: alpha(theme.palette.primary.main, 0.5),
                  }
                }
              }}
              sx={{ maxWidth: '100%' }}
            />
          </Box>
        </CardContent>
        
        {(loading || refreshing) && (
          <LinearProgress sx={{ height: 3 }} />
        )}
      </Card>

      {/* Tabla de vehículos mejorada */}
      <Card 
        elevation={0} 
        sx={{ 
          borderRadius: '16px',
          border: `1px solid ${theme.palette.divider}`,
          overflow: 'hidden'
        }}
      >
        <CardContent sx={{ p: 0 }}>
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
            searchTerm=""
            onSearchChange={() => {}}
            hideSearch={true}
            emptyStateMessage="No hay vehículos registrados"
            emptyStateIcon={<DirectionsCarIcon sx={{ fontSize: 60, opacity: 0.3 }} />}
            sx={{
              '& .MuiTableCell-root': {
                fontSize: '0.9rem',
              },
              '& .MuiTableRow-root:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.04),
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Diálogo para crear nuevo vehículo */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog} 
        maxWidth="md" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '16px',
            boxShadow: theme.shadows[10],
            overflow: 'hidden'
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
            <AddIcon sx={{ mr: 1 }} />
            Registrar Nuevo Vehículo
          </DialogTitle>
          
          <IconButton
            onClick={handleCloseDialog}
            sx={{ position: 'absolute', top: 12, right: 12 }}
          >
            <CloseIcon />
          </IconButton>
          
          <form onSubmit={formik.handleSubmit}>
            <DialogContent sx={{ px: 3, py: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <AirlineSeatReclineNormalIcon sx={{ mt: 2.5, mr: 1, color: theme.palette.primary.main }} />
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
                      InputProps={{
                        sx: { borderRadius: '8px' }
                      }}
                    />
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <DirectionsCarIcon sx={{ mt: 2.5, mr: 1, color: theme.palette.primary.main }} />
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
                      InputProps={{
                        sx: { borderRadius: '8px' }
                      }}
                    >
                      {tiposVehiculos.map((tipo) => (
                        <MenuItem key={tipo.id_tipo} value={tipo.id_tipo}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {getVehicleIcon(tipo.descripcion)}
                            <span style={{ marginLeft: 8 }}>{tipo.descripcion}</span>
                          </Box>
                        </MenuItem>
                      ))}
                    </TextField>
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
                  <b>Nota:</b> La placa del vehículo debe seguir el formato establecido en tu región. 
                  Una vez registrado, el vehículo podrá ser asociado a los servicios de lavado.
                </Typography>
              </Box>
            </DialogContent>
            
            <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
              <Button 
                onClick={handleCloseDialog}
                variant="outlined"
                sx={{ borderRadius: '8px' }}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                sx={{ 
                  borderRadius: '8px',
                  boxShadow: theme.shadows[2],
                  px: 3
                }}
              >
                Guardar Vehículo
              </Button>
            </DialogActions>
          </form>
        </Box>
      </Dialog>

      {/* Diálogo de confirmación para eliminar */}
      <ConfirmDialog
        open={confirmDialog.open}
        title="Confirmar eliminación"
        content={`¿Estás seguro de que deseas eliminar el vehículo con placa ${confirmDialog.id}? Esta acción no se puede deshacer.`}
        onConfirm={handleDeleteVehiculo}
        onCancel={() => setConfirmDialog({ open: false, id: null })}
      />
    </Box>
  );
};

export default Vehiculos;