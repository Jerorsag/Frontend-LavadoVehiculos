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
  CircularProgress,
  Alert,
  IconButton,
  Chip,
  Avatar,
  InputAdornment,
  LinearProgress,
  Tooltip,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import { toast } from 'react-toastify';
import { getInventario, getInsumos, createInsumo, updateInventario, createInventario } from '../api/inventario';
import { useFormik } from 'formik';
import * as yup from 'yup';

// Iconos
import AddIcon from '@mui/icons-material/Add';
import InventoryIcon from '@mui/icons-material/Inventory';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import RefreshIcon from '@mui/icons-material/Refresh';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DescriptionIcon from '@mui/icons-material/Description';
import CategoryIcon from '@mui/icons-material/Category';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ShoppingBasketIcon from '@mui/icons-material/ShoppingBasket';
import InfoIcon from '@mui/icons-material/Info';
import SearchIcon from '@mui/icons-material/Search';

const validationSchemaInsumo = yup.object({
  nombre: yup.string().required('El nombre es requerido'),
  descripcion: yup.string(),
  precio_unitario: yup.number().required('El precio es requerido').positive('El precio debe ser positivo'),
  stock_inicial: yup.number().required('El stock inicial es requerido').integer('Debe ser un número entero').min(0, 'No puede ser negativo')
});

const validationSchemaInventario = yup.object({
  stock: yup.number().required('El stock es requerido').integer('Debe ser un número entero').min(0, 'No puede ser negativo')
});

const Inventario = () => {
  const theme = useTheme();
  const [inventario, setInventario] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingInsumo, setSavingInsumo] = useState(false);
  const [savingStock, setSavingStock] = useState(false);
  const [openNuevoInsumo, setOpenNuevoInsumo] = useState(false);
  const [openEditarStock, setOpenEditarStock] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [inventarioStats, setInventarioStats] = useState({
    total: 0,
    critico: 0,
    bajo: 0,
    normal: 0
  });

  const insumoFormik = useFormik({
    initialValues: {
      nombre: '',
      descripcion: '',
      precio_unitario: '',
      stock_inicial: 0
    },
    validationSchema: validationSchemaInsumo,
    onSubmit: async (values) => {
      try {
        setSavingInsumo(true);
        setError(null);
        
        // 1. Extraer stock_inicial del objeto values
        const { stock_inicial, ...insumoData } = values;
        
        // 2. Crear el insumo
        const nuevoInsumo = await createInsumo(insumoData);
        
        // 3. Crear el registro en inventario con el stock inicial
        if (nuevoInsumo && nuevoInsumo.id_insumo) {
          await createInventario({
            id_insumo: nuevoInsumo.id_insumo,
            stock: stock_inicial
          });
          
          toast.success('Insumo agregado al inventario exitosamente');
          setOpenNuevoInsumo(false);
          insumoFormik.resetForm();
          // 4. Recargar los datos
          await fetchData();
        } else {
          throw new Error('No se recibió respuesta válida al crear el insumo');
        }
      } catch (error) {
        setError('Error al crear el insumo: ' + (error.message || 'Error desconocido'));
        toast.error('Error al crear el insumo');
        console.error('Error al crear insumo:', error);
      } finally {
        setSavingInsumo(false);
      }
    }
  });

  const stockFormik = useFormik({
    initialValues: {
      stock: ''
    },
    validationSchema: validationSchemaInventario,
    onSubmit: async (values) => {
      try {
        setSavingStock(true);
        setError(null);
        
        await updateInventario(selectedItem.id_inventario, {
          id_insumo: selectedItem.id_insumo.id_insumo,
          stock: values.stock
        });
        
        toast.success('Stock actualizado exitosamente');
        setOpenEditarStock(false);
        stockFormik.resetForm();
        fetchData();
      } catch (error) {
        setError('Error al actualizar el stock: ' + (error.message || 'Error desconocido'));
        toast.error('Error al actualizar el stock');
        console.error('Error al actualizar stock:', error);
      } finally {
        setSavingStock(false);
      }
    }
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setRefreshing(true);
      setError(null);
      
      const [inventarioData, insumosData] = await Promise.all([
        getInventario(),
        getInsumos()
      ]);
      
      // Manejar diferentes formatos de respuesta
      const inventarioItems = inventarioData.results || inventarioData;
      const insumosItems = insumosData.results || insumosData;
      
      const inventarioArray = Array.isArray(inventarioItems) ? inventarioItems : [];
      
      // Calcular estadísticas
      const stats = {
        total: inventarioArray.length,
        critico: inventarioArray.filter(item => item.stock <= 5).length,
        bajo: inventarioArray.filter(item => item.stock > 5 && item.stock <= 15).length,
        normal: inventarioArray.filter(item => item.stock > 15).length
      };
      
      setInventarioStats(stats);
      setInventario(inventarioArray);
      setInsumos(Array.isArray(insumosItems) ? insumosItems : []);
    } catch (error) {
      setError('Error al cargar los datos: ' + (error.message || 'Error desconocido'));
      toast.error('Error al cargar los datos');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Manejar búsqueda
  const filteredInventario = inventario.filter(item => 
    item.id_insumo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.id_insumo.descripcion && item.id_insumo.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    fetchData();
  };

  const handleOpenNuevoInsumo = () => {
    setOpenNuevoInsumo(true);
    setError(null);
  };

  const handleCloseNuevoInsumo = () => {
    if (!savingInsumo) {
      setOpenNuevoInsumo(false);
      insumoFormik.resetForm();
    }
  };

  const handleOpenEditarStock = (item) => {
    setSelectedItem(item);
    stockFormik.setValues({
      stock: item.stock
    });
    setOpenEditarStock(true);
    setError(null);
  };

  const handleCloseEditarStock = () => {
    if (!savingStock) {
      setOpenEditarStock(false);
      setSelectedItem(null);
      stockFormik.resetForm();
    }
  };

  const getStockLevel = (stock) => {
    if (stock <= 5) return 'Crítico';
    if (stock <= 15) return 'Bajo';
    if (stock <= 30) return 'Medio';
    return 'Alto';
  };

  const getStockColor = (stock) => {
    if (stock <= 5) return theme.palette.error.main;
    if (stock <= 15) return theme.palette.warning.main;
    if (stock <= 30) return theme.palette.info.main;
    return theme.palette.success.main;
  };

  const getStockIcon = (stock) => {
    if (stock <= 5) return <ErrorOutlineIcon />;
    if (stock <= 15) return <WarningAmberIcon />;
    if (stock <= 30) return <InfoIcon />;
    return <CheckCircleIcon />;
  };

  // Renderizar mensaje cuando no hay inventario
  const renderEmptyState = () => (
    <Card
      elevation={0}
      sx={{
        textAlign: 'center',
        py: 4,
        borderRadius: '16px',
        border: `1px solid ${theme.palette.divider}`,
      }}
    >
      <InventoryIcon sx={{ fontSize: 80, color: alpha(theme.palette.primary.main, 0.2), mb: 2 }} />
      <Typography variant="h6" color="text.secondary" gutterBottom>
        No hay insumos en el inventario
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: '80%', mx: 'auto' }}>
        Agrega un nuevo insumo para comenzar a gestionar tu inventario
      </Typography>
      <Button 
        variant="contained" 
        color="primary" 
        startIcon={<AddIcon />}
        onClick={handleOpenNuevoInsumo}
        sx={{ 
          borderRadius: '8px',
          boxShadow: theme.shadows[2]
        }}
      >
        Agregar nuevo insumo
      </Button>
    </Card>
  );

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
          <InventoryIcon sx={{ fontSize: 180 }} />
        </Box>
        
        <CardContent sx={{ py: 4, position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" component="h1" sx={{ fontWeight: 600, color: theme.palette.primary.main, display: 'flex', alignItems: 'center' }}>
                <InventoryIcon sx={{ mr: 1, fontSize: 32 }} />
                Gestión de Inventario
              </Typography>
              <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
                Administra el stock de insumos disponibles para los servicios
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleOpenNuevoInsumo}
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
                Nuevo Insumo
              </Button>
              
              <Tooltip title="Actualizar inventario">
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
                  {refreshing ? <CircularProgress size={24} /> : <RefreshIcon />}
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
                    {inventarioStats.total}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Insumos totales
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: '50%',
                    bgcolor: alpha(theme.palette.primary.main, 0.15),
                  }}
                >
                  <InventoryIcon sx={{ color: theme.palette.primary.main }} />
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  bgcolor: alpha(theme.palette.error.main, 0.1),
                  border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                }}
              >
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {inventarioStats.critico}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Stock crítico
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: '50%',
                    bgcolor: alpha(theme.palette.error.main, 0.15),
                  }}
                >
                  <ErrorOutlineIcon sx={{ color: theme.palette.error.main }} />
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  bgcolor: alpha(theme.palette.warning.main, 0.1),
                  border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                }}
              >
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {inventarioStats.bajo}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Stock bajo
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: '50%',
                    bgcolor: alpha(theme.palette.warning.main, 0.15),
                  }}
                >
                  <WarningAmberIcon sx={{ color: theme.palette.warning.main }} />
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
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
                    {inventarioStats.normal}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Stock normal
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: '50%',
                    bgcolor: alpha(theme.palette.success.main, 0.15),
                  }}
                >
                  <CheckCircleIcon sx={{ color: theme.palette.success.main }} />
                </Box>
              </Paper>
            </Grid>
          </Grid>
          
          {/* Barra de búsqueda */}
          <Box sx={{ mt: 3 }}>
            <TextField
              fullWidth
              placeholder="Buscar insumo por nombre o descripción..."
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
            />
          </Box>
        </CardContent>
        
        {(loading || refreshing) && (
          <LinearProgress sx={{ height: 3 }} />
        )}
      </Card>

      {error && (
        <Alert 
          severity="error" 
          variant="outlined"
          sx={{ 
            mb: 3, 
            borderRadius: '12px',
            border: `1px solid ${theme.palette.error.main}`
          }}
        >
          {error}
        </Alert>
      )}

      {loading && !refreshing ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          <Box sx={{ width: '60px', height: '60px', position: 'relative', mb: 3 }}>
            <CircularProgress size={60} thickness={4} />
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <InventoryIcon sx={{ fontSize: 30, color: theme.palette.primary.main }} />
            </Box>
          </Box>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            Cargando inventario
          </Typography>
          <Box sx={{ width: '200px', mt: 2 }}>
            <LinearProgress color="primary" />
          </Box>
        </Box>
      ) : inventario.length === 0 ? (
        renderEmptyState()
      ) : (
        <>
          {searchTerm && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1">
                Mostrando {filteredInventario.length} de {inventario.length} insumos
              </Typography>
            </Box>
          )}
          
          <Grid container spacing={3}>
            {filteredInventario.map((item) => (
              <Grid item xs={12} sm={6} md={4} key={item.id_inventario}>
                <Card 
                  elevation={0} 
                  sx={{ 
                    borderRadius: '16px',
                    border: `1px solid ${theme.palette.divider}`,
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.3s',
                    '&:hover': {
                      boxShadow: theme.shadows[3],
                      transform: 'translateY(-3px)'
                    }
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      bgcolor: getStockColor(item.stock)
                    }}
                  />
                  
                  <CardContent sx={{ pb: 3, pt: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main,
                          width: 40,
                          height: 40,
                          mr: 2
                        }}
                      >
                        <CategoryIcon />
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                          {item.id_insumo.nombre}
                        </Typography>
                        <Chip 
                          icon={getStockIcon(item.stock)} 
                          label={getStockLevel(item.stock)}
                          size="small"
                          sx={{ 
                            bgcolor: alpha(getStockColor(item.stock), 0.1),
                            color: getStockColor(item.stock),
                            fontWeight: 500
                          }}
                        />
                      </Box>
                    </Box>
                    
                    <Divider sx={{ mb: 2 }} />
                    
                    <Box sx={{ minHeight: '60px', mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ 
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {item.id_insumo.descripcion || 'Sin descripción disponible para este insumo.'}
                      </Typography>
                    </Box>
                    
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Paper 
                          elevation={0} 
                          sx={{ 
                            p: 1.5, 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center',
                            borderRadius: '8px',
                            bgcolor: alpha(theme.palette.info.main, 0.05),
                            border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                            <LocalOfferIcon sx={{ fontSize: 16, mr: 0.5, color: theme.palette.info.main }} />
                            <Typography variant="caption" color="text.secondary">Precio</Typography>
                          </Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: theme.palette.info.main }}>
                            ${parseFloat(item.id_insumo.precio_unitario).toFixed(2)}
                          </Typography>
                        </Paper>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Paper 
                          elevation={0} 
                          sx={{ 
                            p: 1.5, 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'center',
                            borderRadius: '8px',
                            bgcolor: alpha(getStockColor(item.stock), 0.05),
                            border: `1px solid ${alpha(getStockColor(item.stock), 0.1)}`
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                            <ShoppingBasketIcon sx={{ fontSize: 16, mr: 0.5, color: getStockColor(item.stock) }} />
                            <Typography variant="caption" color="text.secondary">Stock</Typography>
                          </Box>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: getStockColor(item.stock) }}>
                            {item.stock} unidades
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                    
                    <Box sx={{ mt: 2, textAlign: 'right' }}>
                      <Button 
                        variant="outlined" 
                        startIcon={<EditIcon />}
                        onClick={() => handleOpenEditarStock(item)}
                        sx={{ 
                          borderRadius: '8px',
                          borderColor: getStockColor(item.stock),
                          color: getStockColor(item.stock),
                          '&:hover': {
                            borderColor: getStockColor(item.stock),
                            bgcolor: alpha(getStockColor(item.stock), 0.05)
                          }
                        }}
                      >
                        Actualizar Stock
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          
          {filteredInventario.length === 0 && (
            <Paper 
              elevation={0} 
              sx={{ 
                p: 3, 
                textAlign: 'center',
                borderRadius: '16px',
                border: `1px solid ${theme.palette.divider}`
              }}
            >
              <SearchIcon sx={{ fontSize: 60, color: alpha(theme.palette.text.secondary, 0.3), mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No se encontraron insumos
              </Typography>
              <Typography variant="body2" color="text.secondary">
                No hay insumos que coincidan con tu búsqueda: "{searchTerm}"
              </Typography>
              <Button 
                variant="text" 
                color="primary" 
                onClick={() => setSearchTerm('')} 
                sx={{ mt: 2 }}
              >
                Limpiar búsqueda
              </Button>
            </Paper>
          )}
        </>
      )}

      {/* Dialog para Nuevo Insumo */}
      <Dialog 
        open={openNuevoInsumo} 
        onClose={handleCloseNuevoInsumo} 
        maxWidth="sm" 
        fullWidth
        disableEscapeKeyDown={savingInsumo}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            boxShadow: theme.shadows[10]
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
            fontWeight: 600,
            fontSize: '1.2rem',
            color: theme.palette.primary.main
          }}>
            <AddShoppingCartIcon sx={{ mr: 1 }} />
            Agregar Nuevo Insumo
          </DialogTitle>
          
          <IconButton
            onClick={handleCloseNuevoInsumo}
            sx={{ position: 'absolute', top: 12, right: 12 }}
            disabled={savingInsumo}
          >
            <CloseIcon />
          </IconButton>
          
          <form onSubmit={insumoFormik.handleSubmit}>
            <DialogContent sx={{ px: 3, py: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <CategoryIcon sx={{ mt: 2.5, mr: 1, color: theme.palette.primary.main }} />
                    <TextField
                      fullWidth
                      id="nombre"
                      name="nombre"
                      label="Nombre del insumo"
                      value={insumoFormik.values.nombre}
                      onChange={insumoFormik.handleChange}
                      error={insumoFormik.touched.nombre && Boolean(insumoFormik.errors.nombre)}
                      helperText={insumoFormik.touched.nombre && insumoFormik.errors.nombre}
                      margin="normal"
                      disabled={savingInsumo}
                      variant="outlined"
                      placeholder="Ej: Champú para autos"
                      InputProps={{
                        sx: { borderRadius: '8px' }
                      }}
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <DescriptionIcon sx={{ mt: 2.5, mr: 1, color: theme.palette.primary.main }} />
                    <TextField
                      fullWidth
                      id="descripcion"
                      name="descripcion"
                      label="Descripción"
                      multiline
                      rows={3}
                      value={insumoFormik.values.descripcion}
                      onChange={insumoFormik.handleChange}
                      error={insumoFormik.touched.descripcion && Boolean(insumoFormik.errors.descripcion)}
                      helperText={insumoFormik.touched.descripcion && insumoFormik.errors.descripcion}
                      margin="normal"
                      disabled={savingInsumo}
                      placeholder="Descripción detallada del insumo..."
                      InputProps={{
                        sx: { borderRadius: '8px' }
                      }}
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <AttachMoneyIcon sx={{ mt: 2.5, mr: 1, color: theme.palette.primary.main }} />
                    <TextField
                      fullWidth
                      id="precio_unitario"
                      name="precio_unitario"
                      label="Precio unitario"
                      type="number"
                      value={insumoFormik.values.precio_unitario}
                      onChange={insumoFormik.handleChange}
                      error={insumoFormik.touched.precio_unitario && Boolean(insumoFormik.errors.precio_unitario)}
                      helperText={insumoFormik.touched.precio_unitario && insumoFormik.errors.precio_unitario}
                      margin="normal"
                      InputProps={{
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        sx: { borderRadius: '8px' }
                      }}
                      disabled={savingInsumo}
                    />
                  </Box>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                    <InventoryIcon sx={{ mt: 2.5, mr: 1, color: theme.palette.primary.main }} />
                    <TextField
                      fullWidth
                      id="stock_inicial"
                      name="stock_inicial"
                      label="Stock inicial"
                      type="number"
                      value={insumoFormik.values.stock_inicial}
                      onChange={insumoFormik.handleChange}
                      error={insumoFormik.touched.stock_inicial && Boolean(insumoFormik.errors.stock_inicial)}
                      helperText={insumoFormik.touched.stock_inicial && insumoFormik.errors.stock_inicial}
                      margin="normal"
                      disabled={savingInsumo}
                      InputProps={{
                        sx: { borderRadius: '8px' }
                      }}
                    />
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
                  <b>Nota:</b> Una vez creado el insumo, podrás actualizar el stock pero no modificar el nombre ni el precio.
                  Asegúrate de que toda la información sea correcta antes de guardarlo.
                </Typography>
              </Box>
            </DialogContent>
            
            <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
              <Button 
                onClick={handleCloseNuevoInsumo} 
                disabled={savingInsumo}
                variant="outlined"
                startIcon={<CloseIcon />}
                sx={{ borderRadius: '8px' }}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                disabled={savingInsumo}
                startIcon={savingInsumo ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                sx={{ borderRadius: '8px' }}
              >
                {savingInsumo ? 'Guardando...' : 'Guardar insumo'}
              </Button>
            </DialogActions>
          </form>
        </Box>
      </Dialog>

      {/* Dialog para Editar Stock */}
      <Dialog 
        open={openEditarStock} 
        onClose={handleCloseEditarStock} 
        maxWidth="sm" 
        fullWidth
        disableEscapeKeyDown={savingStock}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            boxShadow: theme.shadows[10]
          }
        }}
      >
        <Box sx={{ position: 'relative' }}>
          {selectedItem && (
            <Box sx={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              height: 6, 
              bgcolor: getStockColor(selectedItem.stock),
            }} />
          )}
          
          <DialogTitle sx={{ 
            display: 'flex', 
            alignItems: 'center',
            pt: 3.5,
            pb: 2,
            fontWeight: 600,
            fontSize: '1.2rem',
            color: selectedItem ? getStockColor(selectedItem.stock) : theme.palette.primary.main
          }}>
            <ShoppingBasketIcon sx={{ mr: 1 }} />
            Actualizar Stock
          </DialogTitle>
          
          <IconButton
            onClick={handleCloseEditarStock}
            sx={{ position: 'absolute', top: 12, right: 12 }}
            disabled={savingStock}
          >
            <CloseIcon />
          </IconButton>
          
          <form onSubmit={stockFormik.handleSubmit}>
            <DialogContent sx={{ px: 3, py: 2 }}>
              {selectedItem && (
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        width: 40,
                        height: 40,
                        mr: 2
                      }}
                    >
                      <CategoryIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" gutterBottom sx={{ mb: 0, fontWeight: 600 }}>
                        {selectedItem.id_insumo.nombre}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        ${parseFloat(selectedItem.id_insumo.precio_unitario).toFixed(2)} por unidad
                      </Typography>
                    </Box>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <Paper 
                        elevation={0} 
                        sx={{ 
                          p: 1.5, 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center',
                          borderRadius: '8px',
                          bgcolor: alpha(getStockColor(selectedItem.stock), 0.05),
                          border: `1px solid ${alpha(getStockColor(selectedItem.stock), 0.1)}`
                        }}
                      >
                        <Typography variant="caption" color="text.secondary" gutterBottom>
                          Stock actual
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: getStockColor(selectedItem.stock) }}>
                          {selectedItem.stock} unidades
                        </Typography>
                      </Paper>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Paper 
                        elevation={0} 
                        sx={{ 
                          p: 1.5, 
                          display: 'flex', 
                          flexDirection: 'column', 
                          alignItems: 'center',
                          borderRadius: '8px',
                          bgcolor: alpha(theme.palette.info.main, 0.05),
                          border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`
                        }}
                      >
                        <Typography variant="caption" color="text.secondary" gutterBottom>
                          Estado
                        </Typography>
                        <Chip 
                          size="small"
                          label={getStockLevel(selectedItem.stock)}
                          sx={{ 
                            bgcolor: alpha(getStockColor(selectedItem.stock), 0.1),
                            color: getStockColor(selectedItem.stock),
                            fontWeight: 500
                          }}
                        />
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>
              )}
              
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <InventoryIcon sx={{ mt: 2.5, mr: 1, color: theme.palette.primary.main }} />
                <TextField
                  fullWidth
                  id="stock"
                  name="stock"
                  label="Actualizar stock"
                  type="number"
                  value={stockFormik.values.stock}
                  onChange={stockFormik.handleChange}
                  error={stockFormik.touched.stock && Boolean(stockFormik.errors.stock)}
                  helperText={stockFormik.touched.stock && stockFormik.errors.stock}
                  margin="normal"
                  disabled={savingStock}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">unidades</InputAdornment>,
                    sx: { borderRadius: '8px' }
                  }}
                />
              </Box>
              
              <Box sx={{ 
                mt: 3, 
                p: 2, 
                bgcolor: alpha(theme.palette.info.main, 0.1),
                borderRadius: '8px',
                border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`
              }}>
                <Typography variant="body2" color="textSecondary">
                  <b>Nota:</b> Ingresa el número total de unidades disponibles actualmente. Esta acción 
                  reemplazará el stock actual con el nuevo valor.
                </Typography>
              </Box>
            </DialogContent>
            
            <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
              <Button 
                onClick={handleCloseEditarStock} 
                disabled={savingStock}
                variant="outlined"
                startIcon={<CloseIcon />}
                sx={{ borderRadius: '8px' }}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                disabled={savingStock}
                startIcon={savingStock ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                sx={{ borderRadius: '8px' }}
              >
                {savingStock ? 'Actualizando...' : 'Actualizar stock'}
              </Button>
            </DialogActions>
          </form>
        </Box>
      </Dialog>
      
      {/* Footer informativo */}
      {!loading && inventario.length > 0 && (
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            mt: 3, 
            pt: 2,
            color: theme.palette.text.secondary,
            borderTop: `1px solid ${theme.palette.divider}`,
            fontSize: '0.75rem'
          }}
        >
          <Typography variant="caption">
            Los insumos con stock crítico (5 o menos unidades) requieren atención inmediata
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default Inventario;