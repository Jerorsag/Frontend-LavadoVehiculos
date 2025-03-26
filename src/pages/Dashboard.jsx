import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Button
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import RefreshIcon from '@mui/icons-material/Refresh'; // Añadido para botón de reintento
import {
  getEstadisticasGenerales,
  getServiciosPorTiempo,
  getRankingEmpleados
} from '../api/dashboard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'react-toastify'; // Asegúrate de importar toast

const Dashboard = () => {
  const [estadisticas, setEstadisticas] = useState({
    total_servicios: 0,
    servicios_ultimo_mes: 0,
    ingresos_totales: 0,
    ingresos_ultimo_mes: 0,
    empleados_activos: 0,
    insumos_mas_usados: []
  });

  const [serviciosPorTiempo, setServiciosPorTiempo] = useState([]);
  const [rankingEmpleados, setRankingEmpleados] = useState({
    ranking_lavados: [],
    ranking_recibidos: []
  });
  const [loading, setLoading] = useState(true);
  const [chartPeriodo, setChartPeriodo] = useState('mes');
  const [tabValue, setTabValue] = useState(0);
  const [error, setError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // Función para reintentar
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setError(false);
  };

  // Dentro del useEffect del Dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(false);

        // Obtener datos con manejo de errores
        const [estadisticasData, serviciosData, rankingData] = await Promise.allSettled([
          getEstadisticasGenerales(),
          getServiciosPorTiempo(chartPeriodo),
          getRankingEmpleados()
        ]);

        // Procesar resultados de estadísticas
        if (estadisticasData.status === 'fulfilled') {
          setEstadisticas(estadisticasData.value);
        } else {
          console.error('Error al obtener estadísticas:', estadisticasData.reason);
          setEstadisticas({
            total_servicios: 0,
            servicios_ultimo_mes: 0,
            ingresos_totales: 0,
            ingresos_ultimo_mes: 0,
            empleados_activos: 0,
            insumos_mas_usados: []
          });
        }

        // Procesar resultados de servicios por tiempo
        let formattedServicios = [];
        if (serviciosData.status === 'fulfilled' && Array.isArray(serviciosData.value)) {
          formattedServicios = serviciosData.value.map((item, index) => ({
            ...item,
            id: index, // Añadir id único para resolver el problema de keys
            fecha: format(parseISO(item.periodo || new Date().toISOString()), 'MMM yyyy', { locale: es }),
            servicios: item.total || 0,
            ingresos: item.ingresos || 0
          }));
        } else {
          console.error('Error al obtener servicios por tiempo:', serviciosData.reason);
          // Datos de muestra en caso de error
          const demoData = Array.from({ length: 6 }, (_, i) => {
            const date = new Date();
            date.setMonth(date.getMonth() - (5 - i));
            return {
              id: i,
              periodo: date.toISOString(),
              fecha: format(date, 'MMM yyyy', { locale: es }),
              servicios: Math.floor(Math.random() * 20),
              ingresos: Math.floor(Math.random() * 300)
            };
          });
          formattedServicios = demoData;
        }
        setServiciosPorTiempo(formattedServicios);

        // Procesar resultados de ranking de empleados
        if (rankingData.status === 'fulfilled') {
          setRankingEmpleados(rankingData.value);
        } else {
          console.error('Error al obtener ranking de empleados:', rankingData.reason);
          setRankingEmpleados({
            ranking_lavados: [],
            ranking_recibidos: []
          });
        }
      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
        toast.error('Error al cargar datos del dashboard');
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [chartPeriodo, retryCount]);

  const handlePeriodoChange = (event, newValue) => {
    setChartPeriodo(newValue === 0 ? 'mes' : 'dia');
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
        <Typography variant="h6" color="error" gutterBottom>
          Error al cargar los datos del dashboard
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<RefreshIcon />}
          onClick={handleRetry}
          sx={{ mt: 2 }}
        >
          Reintentar
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Tarjetas de estadísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent className="dashboard-card">
              <Typography className="dashboard-card-title" color="textSecondary" gutterBottom>
                Servicios Totales
              </Typography>
              <Typography className="dashboard-card-value" variant="h3">
                {estadisticas?.total_servicios || 0}
              </Typography>
              <Box className="dashboard-card-change positive-change">
                <ArrowUpwardIcon fontSize="small" />
                <Typography variant="body2" sx={{ ml: 0.5 }}>
                  {estadisticas?.servicios_ultimo_mes || 0} en el último mes
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent className="dashboard-card">
              <Typography className="dashboard-card-title" color="textSecondary" gutterBottom>
                Ingresos Totales
              </Typography>
              <Typography className="dashboard-card-value" variant="h3">
                ${(estadisticas?.ingresos_totales || 0).toFixed(2)}
              </Typography>
              <Box className="dashboard-card-change positive-change">
                <ArrowUpwardIcon fontSize="small" />
                <Typography variant="body2" sx={{ ml: 0.5 }}>
                  ${(estadisticas?.ingresos_ultimo_mes || 0).toFixed(2)} en el último mes
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent className="dashboard-card">
              <Typography className="dashboard-card-title" color="textSecondary" gutterBottom>
                Empleados Activos
              </Typography>
              <Typography className="dashboard-card-value" variant="h3">
                {estadisticas?.empleados_activos || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent className="dashboard-card">
              <Typography className="dashboard-card-title" color="textSecondary" gutterBottom>
                Insumo Más Utilizado
              </Typography>
              <Typography className="dashboard-card-value" variant="h5">
                {estadisticas?.insumos_mas_usados?.length > 0
                  ? estadisticas.insumos_mas_usados[0].id_insumo__nombre
                  : 'N/A'}
              </Typography>
              {estadisticas?.insumos_mas_usados?.length > 0 && (
                <Typography variant="body2" color="textSecondary">
                  {estadisticas.insumos_mas_usados[0].total} unidades usadas
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Gráficos */}
      <Paper sx={{ p: 2, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Tendencia de Servicios</Typography>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Servicios" />
            <Tab label="Ingresos" />
          </Tabs>
        </Box>

        <Box sx={{ height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            {tabValue === 0 ? (
              <BarChart
                data={serviciosPorTiempo}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} servicios`, 'Cantidad']} />
                <Legend />
                <Bar dataKey="servicios" name="Servicios" fill="#1976d2" />
              </BarChart>
            ) : (
              <LineChart
                data={serviciosPorTiempo}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="fecha" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${(value || 0).toFixed(2)}`, 'Ingresos']} />
                <Legend />
                <Line type="monotone" dataKey="ingresos" name="Ingresos" stroke="#26c6da" strokeWidth={2} />
              </LineChart>
            )}
          </ResponsiveContainer>
        </Box>
      </Paper>

      {/* Rankings */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Top Empleados - Lavados
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Empleado</TableCell>
                    <TableCell align="right">Lavados Realizados</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rankingEmpleados?.ranking_lavados?.length > 0 ? (
                    rankingEmpleados.ranking_lavados.map((empleado) => (
                      <TableRow key={empleado.id_empleado}>
                        <TableCell>{`${empleado.nombre || ''} ${empleado.apellido || ''}`}</TableCell>
                        <TableCell align="right">{empleado.total_lavados || 0}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} align="center">No hay datos disponibles</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Top Empleados - Recepción
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Empleado</TableCell>
                    <TableCell align="right">Vehículos Recibidos</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rankingEmpleados?.ranking_recibidos?.length > 0 ? (
                    rankingEmpleados.ranking_recibidos.map((empleado) => (
                      <TableRow key={empleado.id_empleado}>
                        <TableCell>{`${empleado.nombre || ''} ${empleado.apellido || ''}`}</TableCell>
                        <TableCell align="right">{empleado.total_recibidos || 0}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={2} align="center">No hay datos disponibles</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;