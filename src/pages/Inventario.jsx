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
  MenuItem 
} from '@mui/material';
import { toast } from 'react-toastify';
import PageHeader from '../components/common/PageHeader';
import { getInventario, getInsumos, createInsumo, updateInventario } from '../api/inventario';
import { useFormik } from 'formik';
import * as yup from 'yup';
import AddIcon from '@mui/icons-material/Add';
import InventoryIcon from '@mui/icons-material/Inventory';

const validationSchemaInsumo = yup.object({
  nombre: yup.string().required('El nombre es requerido'),
  descripcion: yup.string(),
  precio_unitario: yup.number().required('El precio es requerido').positive('El precio debe ser positivo')
});

const validationSchemaInventario = yup.object({
  stock: yup.number().required('El stock es requerido').integer('Debe ser un número entero').min(0, 'No puede ser negativo')
});

const Inventario = () => {
  const [inventario, setInventario] = useState([]);
  const [insumos, setInsumos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openNuevoInsumo, setOpenNuevoInsumo] = useState(false);
  const [openEditarStock, setOpenEditarStock] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const insumoFormik = useFormik({
    initialValues: {
      nombre: '',
      descripcion: '',
      precio_unitario: ''
    },
    validationSchema: validationSchemaInsumo,
    onSubmit: async (values) => {
      try {
        await createInsumo(values);
        toast.success('Insumo creado exitosamente');
        setOpenNuevoInsumo(false);
        fetchData();
        insumoFormik.resetForm();
      } catch (error) {
        toast.error('Error al crear el insumo');
        console.error('Error al crear insumo:', error);
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
        await updateInventario(selectedItem.id_inventario, {
          id_insumo: selectedItem.id_insumo.id_insumo,
          stock: values.stock
        });
        toast.success('Stock actualizado exitosamente');
        setOpenEditarStock(false);
        fetchData();
        stockFormik.resetForm();
      } catch (error) {
        toast.error('Error al actualizar el stock');
        console.error('Error al actualizar stock:', error);
      }
    }
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [inventarioData, insumosData] = await Promise.all([
        getInventario(),
        getInsumos()
      ]);
      setInventario(inventarioData.results);
      setInsumos(insumosData.results);
    } catch (error) {
      toast.error('Error al cargar los datos');
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenNuevoInsumo = () => {
    setOpenNuevoInsumo(true);
  };

  const handleCloseNuevoInsumo = () => {
    setOpenNuevoInsumo(false);
    insumoFormik.resetForm();
  };

  const handleOpenEditarStock = (item) => {
    setSelectedItem(item);
    stockFormik.setValues({
      stock: item.stock
    });
    setOpenEditarStock(true);
  };

  const handleCloseEditarStock = () => {
    setOpenEditarStock(false);
    setSelectedItem(null);
    stockFormik.resetForm();
  };

  const getStockLevel = (stock) => {
    if (stock <= 5) return 'Crítico';
    if (stock <= 15) return 'Bajo';
    if (stock <= 30) return 'Medio';
    return 'Alto';
  };

  const getStockColor = (stock) => {
    if (stock <= 5) return '#f44336';  // Rojo
    if (stock <= 15) return '#ff9800';  // Naranja
    if (stock <= 30) return '#ffc107';  // Amarillo
    return '#4caf50';  // Verde
  };

  return (
    <Box>
      <PageHeader
        title="Inventario"
        subtitle="Gestiona el inventario de insumos"
        onAddClick={handleOpenNuevoInsumo}
        buttonText="Nuevo Insumo"
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <InventoryIcon sx={{ fontSize: 100, color: 'text.secondary', opacity: 0.3 }} />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {inventario.map((item) => (
            <Grid item xs={12} sm={6} md={4} key={item.id_inventario}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {item.id_insumo.nombre}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {item.id_insumo.descripcion || 'Sin descripción'}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="body1">
                      Precio: ${parseFloat(item.id_insumo.precio_unitario).toFixed(2)}
                    </Typography>
                    <Box 
                      sx={{ 
                        backgroundColor: getStockColor(item.stock),
                        color: 'white',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: '0.875rem'
                      }}
                    >
                      {getStockLevel(item.stock)}
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h5" component="div">
                      {item.stock} unidades
                    </Typography>
                    <Button 
                      variant="outlined" 
                      color="primary"
                      onClick={() => handleOpenEditarStock(item)}
                    >
                      Editar Stock
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Dialog para Nuevo Insumo */}
      <Dialog open={openNuevoInsumo} onClose={handleCloseNuevoInsumo} maxWidth="sm" fullWidth>
        <DialogTitle>Nuevo Insumo</DialogTitle>
        <form onSubmit={insumoFormik.handleSubmit}>
          <DialogContent>
            <TextField
              fullWidth
              id="nombre"
              name="nombre"
              label="Nombre"
              value={insumoFormik.values.nombre}
              onChange={insumoFormik.handleChange}
              error={insumoFormik.touched.nombre && Boolean(insumoFormik.errors.nombre)}
              helperText={insumoFormik.touched.nombre && insumoFormik.errors.nombre}
              margin="normal"
            />
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
            />
            <TextField
              fullWidth
              id="precio_unitario"
              name="precio_unitario"
              label="Precio Unitario"
              type="number"
              value={insumoFormik.values.precio_unitario}
              onChange={insumoFormik.handleChange}
              error={insumoFormik.touched.precio_unitario && Boolean(insumoFormik.errors.precio_unitario)}
              helperText={insumoFormik.touched.precio_unitario && insumoFormik.errors.precio_unitario}
              margin="normal"
              InputProps={{
                startAdornment: <Box component="span" sx={{ mr: 1 }}>$</Box>,
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseNuevoInsumo}>Cancelar</Button>
            <Button type="submit" variant="contained" color="primary">
              Guardar
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Dialog para Editar Stock */}
      <Dialog open={openEditarStock} onClose={handleCloseEditarStock} maxWidth="sm" fullWidth>
        <DialogTitle>Editar Stock</DialogTitle>
        <form onSubmit={stockFormik.handleSubmit}>
          <DialogContent>
            {selectedItem && (
              <Typography variant="h6" gutterBottom>
                {selectedItem.id_insumo.nombre}
              </Typography>
            )}
            <TextField
              fullWidth
              id="stock"
              name="stock"
              label="Stock Actual"
              type="number"
              value={stockFormik.values.stock}
              onChange={stockFormik.handleChange}
              error={stockFormik.touched.stock && Boolean(stockFormik.errors.stock)}
              helperText={stockFormik.touched.stock && stockFormik.errors.stock}
              margin="normal"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEditarStock}>Cancelar</Button>
            <Button type="submit" variant="contained" color="primary">
              Actualizar
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default Inventario;