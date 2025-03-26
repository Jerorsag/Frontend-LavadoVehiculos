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
  MenuItem
} from '@mui/material';
import { toast } from 'react-toastify';
import { getServicios, getServiciosPorFecha, getServiciosPorPeriodo } from '../api/servicios';
import PageHeader from '../components/common/PageHeader';
import DataTable from "../components/common/DataTable";
import ConfirmDialog from "../components/common/ConfirmDialog";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';

const Servicios = () => {
  const navigate = useNavigate();
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

  const fetchServicios = async () => {
    try {
      setLoading(true);
      let data;
      
      if (filterType === 'fecha' && fecha) {
        data = await getServiciosPorFecha(fecha);
      } else if (filterType === 'periodo' && periodo.inicio && periodo.fin) {
        data = await getServiciosPorPeriodo(periodo.inicio, periodo.fin);
      } else {
        const params = {
          page: page + 1,
          page_size: rowsPerPage,
          search: searchTerm
        };
        data = await getServicios(params);
      }
      
      // Manejar tanto resultados paginados como listas planas
      if (data.results) {
        setServicios(data.results);
        setTotalItems(data.count);
      } else {
        setServicios(data);
        setTotalItems(data.length);
      }
    } catch (error) {
      toast.error('Error al cargar los servicios');
      console.error('Error fetching servicios:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServicios();
    // Cada vez que cambie el shouldRefresh, también actualizamos
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

  const handleNuevoServicio = () => {
    navigate('/servicios/nuevo');
  };

  const columns = [
    { 
      id: 'id_servicio', 
      label: 'ID', 
      accessor: row => row.id_servicio,
      minWidth: 70
    },
    { 
      id: 'fecha', 
      label: 'Fecha', 
      accessor: row => row.fecha,
      format: value => {
        if (!value) return 'No especificado';
        try {
          return format(new Date(value), 'dd/MM/yyyy HH:mm', { locale: es });
        } catch (error) {
          console.error('Error formatting date:', error);
          return value;
        }
      },
      minWidth: 150
    },
    { 
      id: 'placa', 
      label: 'Vehículo', 
      accessor: row => row.placa?.placa || 'No especificado',
      minWidth: 100
    },
    { 
      id: 'tipo_lavado', 
      label: 'Tipo de Lavado', 
      accessor: row => row.id_tipo_lavado?.nombre || 'No especificado',
      minWidth: 150
    },
    { 
      id: 'empleado_recibe', 
      label: 'Recibido por', 
      accessor: row => row.id_empleado_recibe ? 
        `${row.id_empleado_recibe.nombre} ${row.id_empleado_recibe.apellido}` : 
        'No especificado',
      minWidth: 150
    },
    { 
      id: 'precio', 
      label: 'Precio', 
      accessor: row => row.precio,
      format: value => value ? `$${parseFloat(value).toFixed(2)}` : '$0.00',
      align: 'right',
      minWidth: 100
    }
  ];

  return (
    <Box>
      <PageHeader
        title="Servicios"
        subtitle="Gestiona los servicios de lavado"
        onAddClick={handleNuevoServicio}
        buttonText="Nuevo Servicio"
      />

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <FilterListIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
            Filtros
          </Typography>
          <Grid container spacing={2} alignItems="flex-end">
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth>
                <InputLabel id="filter-type-label">Tipo de filtro</InputLabel>
                <Select
                  labelId="filter-type-label"
                  id="filter-type"
                  value={filterType}
                  label="Tipo de filtro"
                  onChange={handleFilterTypeChange}
                >
                  <MenuItem value="all">Todos los servicios</MenuItem>
                  <MenuItem value="fecha">Por fecha</MenuItem>
                  <MenuItem value="periodo">Por periodo</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {filterType === 'fecha' && (
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth
                  label="Fecha"
                  type="date"
                  value={fecha}
                  onChange={handleDateChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
            )}
            
            {filterType === 'periodo' && (
              <>
                <Grid item xs={12} sm={3}>
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
                  />
                </Grid>
                <Grid item xs={12} sm={3}>
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
                  />
                </Grid>
              </>
            )}
            
            <Grid item xs={12} sm={3}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleFilter}
                  disabled={
                    (filterType === 'fecha' && !fecha) || 
                    (filterType === 'periodo' && (!periodo.inicio || !periodo.fin))
                  }
                >
                  Filtrar
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={handleClearFilters}
                >
                  Limpiar
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

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
      />
    </Box>
  );
};

export default Servicios;