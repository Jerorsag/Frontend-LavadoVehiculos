import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  IconButton,
  Tooltip,
  Chip,
  Paper,
  Divider,
  Avatar,
  InputAdornment,
  CircularProgress,
  LinearProgress,
  Alert,
  useTheme,
  alpha
} from '@mui/material';
import { toast } from 'react-toastify';
import { getServicios, getServiciosPorFecha, getServiciosPorPeriodo } from '../api/servicios';
import DataTable from "../components/common/DataTable";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Iconos
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LocalCarWashIcon from '@mui/icons-material/LocalCarWash';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DateRangeIcon from '@mui/icons-material/DateRange';
import BadgeIcon from '@mui/icons-material/Badge';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import ReceiptIcon from '@mui/icons-material/Receipt';
import TimelineIcon from '@mui/icons-material/Timeline';
import TodayIcon from '@mui/icons-material/Today';
import EventIcon from '@mui/icons-material/Event';
import DoneIcon from '@mui/icons-material/Done';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import AutorenewIcon from '@mui/icons-material/Autorenew';

const Servicios = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [servicios, setServicios] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, id: null });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [fecha, setFecha] = useState('');
  const [periodo, setPeriodo] = useState({
    inicio: '',
    fin: ''
  });
  const [shouldRefresh, setShouldRefresh] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [filterActive, setFilterActive] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    hoy: 0,
    semana: 0
  });

  const fetchServicios = async () => {
    try {
      setLoading(true);
      let data;
      
      if (filterType === 'fecha' && fecha) {
        data = await getServiciosPorFecha(fecha);
        setFilterActive(true);
      } else if (filterType === 'periodo' && periodo.inicio && periodo.fin) {
        data = await getServiciosPorPeriodo(periodo.inicio, periodo.fin);
        setFilterActive(true);
      } else {
        const params = {
          page: page + 1,
          page_size: rowsPerPage,
          search: searchTerm
        };
        data = await getServicios(params);
        setFilterActive(false);
      }
      
      // Manejar tanto resultados paginados como listas planas
      if (data.results) {
        setServicios(data.results);
        setTotalItems(data.count);
        setStats(prev => ({...prev, total: data.count}));
      } else {
        setServicios(Array.isArray(data) ? data : []);
        setTotalItems(Array.isArray(data) ? data.length : 0);
      }
    } catch (error) {
      toast.error('Error al cargar los servicios');
      console.error('Error fetching servicios:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchEstadisticas = async () => {
    try {
      // Simular obtención de estadísticas (en un proyecto real, tendrías un endpoint para esto)
      // Para este ejemplo, simplemente establecemos valores de muestra
      setStats({
        total: totalItems,
        hoy: Math.floor(Math.random() * 10) + 1,
        semana: Math.floor(Math.random() * 50) + 10
      });
    } catch (error) {
      console.error('Error fetching estadísticas:', error);
    }
  };

  useEffect(() => {
    fetchServicios();
    fetchEstadisticas();
  }, [page, rowsPerPage, searchTerm, shouldRefresh]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setPage(0); // Volver a la primera página al buscar
  };

  const handleView = (id) => {
    // Asegurarse de que id sea un valor primitivo, no un objeto
    if (typeof id === 'object' && id !== null) {
      // Si es un objeto, intentamos extraer el id_servicio
      if (id.id_servicio) {
        navigate(`/servicios/${id.id_servicio}`);
      } else {
        console.error('ID de servicio no encontrado:', id);
        toast.error('Error al acceder al servicio: ID no válido');
      }
    } else {
      // Si ya es un valor primitivo, lo usamos directamente
      navigate(`/servicios/${id}`);
    }
  };

  const handleEdit = (id) => {
    // Mismo manejo que en handleView
    if (typeof id === 'object' && id !== null) {
      // Si es un objeto, intentamos extraer el id_servicio
      if (id.id_servicio) {
        navigate(`/servicios/${id.id_servicio}`);
      } else {
        console.error('ID de servicio no encontrado:', id);
        toast.error('Error al acceder al servicio: ID no válido');
      }
    } else {
      // Si ya es un valor primitivo, lo usamos directamente
      navigate(`/servicios/${id}`);
    }
  };

  const handleFilterTypeChange = (event) => {
    setFilterType(event.target.value);
  };

  const handleDateChange = (event) => {
    setFecha(event.target.value);
  };

  const handlePeriodChange = (event) => {
    setPeriodo({
      ...periodo,
      [event.target.name]: event.target.value
    });
  };

  const handleFilter = () => {
    // Al aplicar filtros, volvemos a la primera página
    setPage(0);
    // Usamos el estado shouldRefresh para forzar la actualización
    setShouldRefresh(prev => !prev);
  };

  const handleClearFilters = () => {
    setFilterType('all');
    setFecha('');
    setPeriodo({ inicio: '', fin: '' });
    setPage(0);
    setShouldRefresh(prev => !prev);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setShouldRefresh(prev => !prev);
  };

  const handleNuevoServicio = () => {
    navigate('/servicios/nuevo');
  };

  const getStatusColor = (fecha) => {
    if (!fecha) return theme.palette.grey[500];
    
    const today = new Date();
    const serviceDate = new Date(fecha);
    const diffDays = Math.floor((today - serviceDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) return theme.palette.success.main; // Hoy
    if (diffDays < 7) return theme.palette.info.main; // Última semana
    if (diffDays < 30) return theme.palette.warning.main; // Último mes
    return theme.palette.error.main; // Más antiguo
  };

  const columns = [
    { 
      id: 'id_servicio', 
      label: 'ID', 
      accessor: row => (
        <Chip
          size="small"
          label={row.id_servicio}
          sx={{ 
            fontWeight: 'bold',
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: theme.palette.primary.main,
          }}
        />
      ),
      minWidth: 70
    },
    { 
      id: 'fecha', 
      label: 'Fecha', 
      accessor: row => {
        if (!row.fecha) return 'No especificado';
        try {
          const formattedDate = format(new Date(row.fecha), 'dd/MM/yyyy HH:mm', { locale: es });
          const statusColor = getStatusColor(row.fecha);
          
          return (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CalendarTodayIcon sx={{ mr: 1, fontSize: 16, color: statusColor }} />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {formattedDate}
              </Typography>
            </Box>
          );
        } catch (error) {
          console.error('Error formatting date:', error);
          return row.fecha;
        }
      },
      minWidth: 150
    },
    { 
      id: 'placa', 
      label: 'Vehículo', 
      accessor: row => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <DirectionsCarIcon sx={{ mr: 1, fontSize: 16, color: theme.palette.info.main }} />
          <Typography variant="body2">
            {row.placa?.placa || 'No especificado'}
          </Typography>
        </Box>
      ),
      minWidth: 100
    },
    { 
      id: 'tipo_lavado', 
      label: 'Tipo de Lavado', 
      accessor: row => (
        <Chip
          size="small"
          icon={<LocalCarWashIcon fontSize="small" />}
          label={row.id_tipo_lavado?.nombre || 'No especificado'}
          sx={{ 
            bgcolor: alpha(theme.palette.info.main, 0.1),
            color: theme.palette.info.main,
            border: 'none',
            fontWeight: 500
          }}
        />
      ),
      minWidth: 150
    },
    { 
      id: 'empleado_recibe', 
      label: 'Recibido por', 
      accessor: row => (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <BadgeIcon sx={{ mr: 1, fontSize: 16, color: theme.palette.success.main }} />
          <Typography variant="body2">
            {row.id_empleado_recibe ? 
              `${row.id_empleado_recibe.nombre} ${row.id_empleado_recibe.apellido}` : 
              'No especificado'}
          </Typography>
        </Box>
      ),
      minWidth: 150
    },
    { 
      id: 'precio', 
      label: 'Precio', 
      accessor: row => (
        <Typography 
          variant="body2" 
          sx={{ 
            fontWeight: 600, 
            color: theme.palette.success.main,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end'
          }}
        >
          <AttachMoneyIcon sx={{ fontSize: 16, mr: 0.5 }} />
          {row.precio ? parseFloat(row.precio).toFixed(2) : '0.00'}
        </Typography>
      ),
      align: 'right',
      minWidth: 100
    }
  ];

  // Determinar mensaje según filtro aplicado
  const getFilterMessage = () => {
    if (filterType === 'fecha' && fecha) {
      return `Mostrando servicios del día ${format(new Date(fecha), 'dd MMMM yyyy', { locale: es })}`;
    } else if (filterType === 'periodo' && periodo.inicio && periodo.fin) {
      return `Mostrando servicios del ${format(new Date(periodo.inicio), 'dd/MM/yyyy', { locale: es })} al ${format(new Date(periodo.fin), 'dd/MM/yyyy', { locale: es })}`;
    }
    return null;
  };

  const filterMessage = getFilterMessage();

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
          <LocalCarWashIcon sx={{ fontSize: 180 }} />
        </Box>
        
        <CardContent sx={{ py: 4, position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: theme.palette.primary.main, display: 'flex', alignItems: 'center' }}>
                <ReceiptIcon sx={{ mr: 1, fontSize: 32 }} />
                Gestión de Servicios
              </Typography>
              <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
                Administra los servicios de lavado registrados en el sistema
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleNuevoServicio}
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
                Nuevo Servicio
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
                  {refreshing ? <AutorenewIcon sx={{ animation: 'spin 1s linear infinite' }} /> : <RefreshIcon />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
          {/* Tarjetas de estadísticas */}
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={6} md={4}>
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
                    {stats.total}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Servicios totales
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: '50%',
                    bgcolor: alpha(theme.palette.primary.main, 0.15),
                  }}
                >
                  <AssessmentIcon sx={{ color: theme.palette.primary.main }} />
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  bgcolor: alpha(theme.palette.success.main, 0.1),
                  border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                }}
              >
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {stats.hoy}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Servicios de hoy
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: '50%',
                    bgcolor: alpha(theme.palette.success.main, 0.15),
                  }}
                >
                  <TodayIcon sx={{ color: theme.palette.success.main }} />
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={6} md={4}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  bgcolor: alpha(theme.palette.info.main, 0.1),
                  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                }}
              >
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {stats.semana}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Servicios esta semana
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: '50%',
                    bgcolor: alpha(theme.palette.info.main, 0.15),
                  }}
                >
                  <DateRangeIcon sx={{ color: theme.palette.info.main }} />
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
        
        {(loading || refreshing) && (
          <LinearProgress sx={{ height: 3 }} />
        )}
      </Card>

      {/* Panel de filtros mejorado */}
      <Card 
        elevation={0} 
        sx={{ 
          mb: 3, 
          borderRadius: '16px',
          border: `1px solid ${theme.palette.divider}`,
          overflow: 'hidden'
        }}
      >
        <CardContent sx={{ pb: 3 }}>
          <Typography 
            variant="h6" 
            gutterBottom
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              fontWeight: 600
            }}
          >
            <FilterListIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
            Filtros de búsqueda
          </Typography>
          
          <Grid container spacing={3} alignItems="flex-end">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="filter-type-label">Tipo de filtro</InputLabel>
                <Select
                  labelId="filter-type-label"
                  id="filter-type"
                  value={filterType}
                  label="Tipo de filtro"
                  onChange={handleFilterTypeChange}
                  startAdornment={
                    <InputAdornment position="start">
                      <PlaylistAddCheckIcon sx={{ color: theme.palette.primary.main }} />
                    </InputAdornment>
                  }
                  sx={{ 
                    borderRadius: '8px',
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: alpha(theme.palette.primary.main, 0.2),
                      },
                      '&:hover fieldset': {
                        borderColor: theme.palette.primary.main,
                      }
                    }
                  }}
                >
                  <MenuItem value="all">Todos los servicios</MenuItem>
                  <MenuItem value="fecha">Por fecha específica</MenuItem>
                  <MenuItem value="periodo">Por rango de fechas</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {filterType === 'fecha' && (
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Fecha"
                  type="date"
                  value={fecha}
                  onChange={handleDateChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EventIcon sx={{ color: theme.palette.primary.main }} />
                      </InputAdornment>
                    ),
                    sx: { borderRadius: '8px' }
                  }}
                />
              </Grid>
            )}
            
            {filterType === 'periodo' && (
              <>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Fecha inicio"
                    type="date"
                    name="inicio"
                    value={periodo.inicio}
                    onChange={handlePeriodChange}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EventIcon sx={{ color: theme.palette.primary.main }} />
                        </InputAdornment>
                      ),
                      sx: { borderRadius: '8px' }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    label="Fecha fin"
                    type="date"
                    name="fin"
                    value={periodo.fin}
                    onChange={handlePeriodChange}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EventIcon sx={{ color: theme.palette.primary.main }} />
                        </InputAdornment>
                      ),
                      sx: { borderRadius: '8px' }
                    }}
                  />
                </Grid>
              </>
            )}
            
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button 
                  variant="contained" 
                  color="primary"
                  startIcon={<SearchIcon />}
                  onClick={handleFilter}
                  disabled={
                    (filterType === 'fecha' && !fecha) || 
                    (filterType === 'periodo' && (!periodo.inicio || !periodo.fin))
                  }
                  sx={{ borderRadius: '8px' }}
                >
                  Aplicar filtro
                </Button>
                <Button 
                  variant="outlined"
                  startIcon={<CloseIcon />}
                  onClick={handleClearFilters}
                  sx={{ borderRadius: '8px' }}
                >
                  Limpiar
                </Button>
              </Box>
            </Grid>
          </Grid>
          
          {filterActive && filterMessage && (
            <Alert 
              severity="info" 
              icon={<FilterListIcon />}
              sx={{ 
                mt: 2, 
                borderRadius: '8px', 
                display: 'flex', 
                alignItems: 'center'
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {filterMessage} - Total: <strong>{totalItems} servicios</strong>
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Tabla de servicios mejorada */}
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
            data={servicios}
            page={page}
            totalItems={totalItems}
            perPage={rowsPerPage}
            loading={loading}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={null}  // No permitimos eliminar servicios
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            searchPlaceholder="Buscar por ID, vehículo, empleado..."
            emptyStateMessage="No hay servicios que coincidan con los criterios de búsqueda"
            emptyStateIcon={<LocalCarWashIcon sx={{ fontSize: 60, opacity: 0.3 }} />}
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
      
      {/* Footer informativo */}
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mt: 2, 
          pt: 2,
          color: theme.palette.text.secondary,
          borderTop: `1px solid ${theme.palette.divider}`,
          fontSize: '0.75rem'
        }}
      >
        <Typography variant="caption">
          Los servicios mostrados se ordenan por fecha, del más reciente al más antiguo
        </Typography>
      </Box>
    </Box>
  );
};

export default Servicios;