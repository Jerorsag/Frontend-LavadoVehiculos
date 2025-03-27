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
  Button,
  Avatar,
  IconButton,
  Chip,
  Divider,
  useTheme,
  alpha,
  LinearProgress,
  Tooltip
} from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import RefreshIcon from '@mui/icons-material/Refresh';
import LocalCarWashIcon from '@mui/icons-material/LocalCarWash';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import DateRangeIcon from '@mui/icons-material/DateRange';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
  getEstadisticasGenerales,
  getServiciosPorTiempo,
  getRankingEmpleados
} from '../api/dashboard';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { format, parseISO, subMonths } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'react-toastify';

// Colores para gráficas
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const Dashboard = () => {
  const theme = useTheme();
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
  const [refreshing, setRefreshing] = useState(false);

  // Función para reintentar
  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setError(false);
    setRefreshing(true);
    toast.info("Actualizando datos del dashboard...");
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
            id: index,
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
        setRefreshing(false);
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

  // Calcular porcentaje de cambio para mostrar en tarjetas
  const calcularPorcentajeCambio = (actual, anterior) => {
    if (!anterior) return 0;
    return ((actual - anterior) / anterior) * 100;
  };

  // Crear datos para gráfica de insumos
  const prepararDatosInsumos = () => {
    return estadisticas.insumos_mas_usados?.map((insumo, index) => ({
      name: insumo.id_insumo__nombre || `Insumo ${index + 1}`,
      value: insumo.total || 0
    })) || [];
  };

  // Componente para tarjeta de estadística
  const EstadisticaCard = ({ title, value, subtitle, icon, color, cambio, cambioLabel }) => {
    const isPositive = cambio >= 0;
    
    return (
      <Card elevation={0} sx={{ 
        borderRadius: 2, 
        backgroundImage: `linear-gradient(135deg, ${alpha(color, 0.2)} 0%, ${alpha(color, 0.05)} 100%)`, 
        border: `1px solid ${alpha(color, 0.1)}`,
        height: '100%',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Box 
          sx={{ 
            position: 'absolute', 
            top: '-20px', 
            right: '-20px', 
            opacity: 0.1,
            transform: 'rotate(15deg)'
          }}
        >
          {React.cloneElement(icon, { style: { fontSize: 120, color } })}
        </Box>
        <CardContent sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Avatar sx={{ bgcolor: color, mr: 1.5 }}>
              {icon}
            </Avatar>
            <Typography variant="subtitle1" color="text.secondary">
              {title}
            </Typography>
          </Box>
          
          <Typography variant="h3" component="div" sx={{ fontWeight: 600, mb: 1 }}>
            {value}
          </Typography>
          
          <Typography color="text.secondary" variant="body2" gutterBottom sx={{ mb: 1 }}>
            {subtitle}
          </Typography>
          
          {cambio !== undefined && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Chip
                size="small"
                icon={isPositive ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />}
                label={`${isPositive ? '+' : ''}${cambio.toFixed(1)}%`}
                color={isPositive ? "success" : "error"}
                variant="outlined"
                sx={{ height: 22, mr: 1 }}
              />
              <Typography variant="caption" color="text.secondary">
                {cambioLabel}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  // Renderizar tabla de ranking mejorada
  const RankingTable = ({ data, title, valueLabel }) => {
    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <EmojiEventsIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6">{title}</Typography>
        </Box>
        
        {data && data.length > 0 ? (
          data.map((empleado, index) => {
            const value = title.includes('Lavados') ? empleado.total_lavados : empleado.total_recibidos;
            const maxValue = Math.max(...data.map(e => 
              title.includes('Lavados') ? e.total_lavados : e.total_recibidos
            ));
            const percentage = (value / maxValue) * 100;
            
            return (
              <Box key={empleado.id_empleado || index} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: COLORS[index % COLORS.length],
                      width: 32,
                      height: 32,
                      fontSize: '0.9rem',
                      mr: 1.5
                    }}
                  >
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : (index + 1)}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle2">
                      {`${empleado.nombre || ''} ${empleado.apellido || ''}`}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={percentage} 
                        sx={{ 
                          flexGrow: 1, 
                          height: 6, 
                          borderRadius: 1,
                          mr: 1,
                          backgroundColor: alpha(COLORS[index % COLORS.length], 0.1),
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: COLORS[index % COLORS.length]
                          }
                        }} 
                      />
                      <Typography variant="caption" color="text.secondary">
                        {value} {valueLabel}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            );
          })
        ) : (
          <Box sx={{ py: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No hay datos disponibles
            </Typography>
          </Box>
        )}
      </Box>
    );
  };

  if (loading && !refreshing) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '70vh' }}>
        <LocalCarWashIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2, opacity: 0.7 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Cargando panel de control
        </Typography>
        <Box sx={{ width: '200px', mt: 2 }}>
          <LinearProgress color="primary" />
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '70vh',
        textAlign: 'center'
      }}>
        <Box sx={{ 
          p: 3, 
          borderRadius: 2, 
          backgroundColor: alpha(theme.palette.error.main, 0.05),
          border: `1px solid ${alpha(theme.palette.error.main, 0.1)}`,
          maxWidth: '400px'
        }}>
          <Typography variant="h6" color="error" gutterBottom>
            Error al cargar los datos del dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            No se pudieron cargar los datos. Por favor intente nuevamente.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<RefreshIcon />}
            onClick={handleRetry}
            sx={{ mt: 1 }}
          >
            Reintentar
          </Button>
        </Box>
      </Box>
    );
  }

  // Calcular porcentajes para tarjetas
  const porcentajeServiciosMes = calcularPorcentajeCambio(
    estadisticas.servicios_ultimo_mes,
    estadisticas.total_servicios - estadisticas.servicios_ultimo_mes
  );
  
  const porcentajeIngresosMes = calcularPorcentajeCambio(
    estadisticas.ingresos_ultimo_mes,
    estadisticas.ingresos_totales - estadisticas.ingresos_ultimo_mes
  );

  // Datos para gráfico de insumos
  const insumosData = prepararDatosInsumos();

  return (
    <Box sx={{ flexGrow: 1, position: 'relative' }}>
      {refreshing && (
        <LinearProgress 
          sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            height: 3,
            borderRadius: 3
          }} 
        />
      )}
      
      {/* Cabecera del Dashboard */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Panel de Control
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Bienvenido al panel de gestión de Auto Lavado
          </Typography>
        </Box>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<RefreshIcon />}
          onClick={handleRetry}
          disabled={refreshing}
        >
          Actualizar datos
        </Button>
      </Box>

      {/* Tarjetas de estadísticas */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <EstadisticaCard
            title="Servicios Totales"
            value={estadisticas?.total_servicios || 0}
            subtitle={`${estadisticas?.servicios_ultimo_mes || 0} en el último mes`}
            icon={<LocalCarWashIcon />}
            color={theme.palette.primary.main}
            cambio={porcentajeServiciosMes}
            cambioLabel="vs. mes anterior"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <EstadisticaCard
            title="Ingresos Totales"
            value={`$${(estadisticas?.ingresos_totales || 0).toFixed(2)}`}
            subtitle={`$${(estadisticas?.ingresos_ultimo_mes || 0).toFixed(2)} en el último mes`}
            icon={<AttachMoneyIcon />}
            color={theme.palette.success.main}
            cambio={porcentajeIngresosMes}
            cambioLabel="vs. mes anterior"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <EstadisticaCard
            title="Empleados Activos"
            value={estadisticas?.empleados_activos || 0}
            subtitle="Total de personal disponible"
            icon={<PeopleIcon />}
            color={theme.palette.info.main}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <EstadisticaCard
            title="Insumo Top"
            value={estadisticas?.insumos_mas_usados?.length > 0
              ? estadisticas.insumos_mas_usados[0].id_insumo__nombre
              : 'N/A'}
            subtitle={estadisticas?.insumos_mas_usados?.length > 0
              ? `${estadisticas.insumos_mas_usados[0].total} unidades usadas`
              : 'Sin datos disponibles'}
            icon={<InventoryIcon />}
            color={theme.palette.warning.main}
          />
        </Grid>
      </Grid>

      {/* Gráficos */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: theme.shadows[1], height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ShowChartIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Tendencia de {tabValue === 0 ? 'Servicios' : 'Ingresos'}</Typography>
              </Box>
              <Box>
                <Tabs value={tabValue} onChange={handleTabChange} indicatorColor="primary" textColor="primary">
                  <Tab label="Servicios" disableRipple />
                  <Tab label="Ingresos" disableRipple />
                </Tabs>
              </Box>
            </Box>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ height: 360 }}>
              <ResponsiveContainer width="100%" height="100%">
                {tabValue === 0 ? (
                  <BarChart
                    data={serviciosPorTiempo}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.primary, 0.1)} />
                    <XAxis 
                      dataKey="fecha" 
                      tick={{ fill: theme.palette.text.secondary }}
                      axisLine={{ stroke: alpha(theme.palette.text.primary, 0.2) }}
                    />
                    <YAxis 
                      tick={{ fill: theme.palette.text.secondary }}
                      axisLine={{ stroke: alpha(theme.palette.text.primary, 0.2) }}
                    />
                    <RechartsTooltip 
                      formatter={(value) => [`${value} servicios`, 'Cantidad']}
                      contentStyle={{ 
                        backgroundColor: theme.palette.background.paper,
                        borderColor: theme.palette.divider,
                        borderRadius: 8,
                        boxShadow: theme.shadows[3]
                      }}
                    />
                    <Legend />
                    <Bar 
                      dataKey="servicios" 
                      name="Servicios" 
                      fill={theme.palette.primary.main}
                      radius={[4, 4, 0, 0]}
                      animationDuration={1000}
                    />
                  </BarChart>
                ) : (
                  <AreaChart
                    data={serviciosPorTiempo}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={theme.palette.success.main} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={theme.palette.success.main} stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.text.primary, 0.1)} />
                    <XAxis 
                      dataKey="fecha" 
                      tick={{ fill: theme.palette.text.secondary }}
                      axisLine={{ stroke: alpha(theme.palette.text.primary, 0.2) }}
                    />
                    <YAxis 
                      tick={{ fill: theme.palette.text.secondary }}
                      axisLine={{ stroke: alpha(theme.palette.text.primary, 0.2) }}
                    />
                    <RechartsTooltip 
                      formatter={(value) => [`$${(value || 0).toFixed(2)}`, 'Ingresos']}
                      contentStyle={{ 
                        backgroundColor: theme.palette.background.paper,
                        borderColor: theme.palette.divider,
                        borderRadius: 8,
                        boxShadow: theme.shadows[3]
                      }}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="ingresos" 
                      name="Ingresos" 
                      stroke={theme.palette.success.main} 
                      fillOpacity={1} 
                      fill="url(#colorIngresos)"
                      strokeWidth={2}
                      animationDuration={1000}
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, borderRadius: 2, boxShadow: theme.shadows[1], height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <InventoryIcon color="warning" sx={{ mr: 1 }} />
              <Typography variant="h6">Uso de Insumos</Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />

            {insumosData.length > 0 ? (
              <Box sx={{ height: 360, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <ResponsiveContainer width="100%" height="80%">
                  <PieChart>
                    <Pie
                      data={insumosData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      animationDuration={1000}
                    >
                      {insumosData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value, name) => [`${value} unidades`, name]}
                      contentStyle={{ 
                        backgroundColor: theme.palette.background.paper,
                        borderColor: theme.palette.divider,
                        borderRadius: 8,
                        boxShadow: theme.shadows[3]
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" align="center" gutterBottom>
                    Insumos Más Utilizados
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 1 }}>
                    {insumosData.slice(0, 3).map((insumo, index) => (
                      <Chip 
                        key={index}
                        label={`${insumo.name}: ${insumo.value}`}
                        style={{ backgroundColor: alpha(COLORS[index % COLORS.length], 0.1), color: COLORS[index % COLORS.length] }}
                        size="small"
                      />
                    ))}
                  </Box>
                </Box>
              </Box>
            ) : (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  No hay datos de insumos disponibles
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Rankings */}
      <Paper sx={{ p: 3, borderRadius: 2, boxShadow: theme.shadows[1], mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <RankingTable 
              data={rankingEmpleados?.ranking_lavados || []}
              title="Top Empleados - Lavados"
              valueLabel="lavados"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <RankingTable 
              data={rankingEmpleados?.ranking_recibidos || []}
              title="Top Empleados - Recepción"
              valueLabel="recepciones"
            />
          </Grid>
        </Grid>
      </Paper>
      
      {/* Nota informativa */}
      <Box sx={{ 
        p: 2, 
        borderRadius: 2, 
        backgroundColor: alpha(theme.palette.info.main, 0.05),
        border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`,
        display: 'flex',
        alignItems: 'center'
      }}>
        <InfoOutlinedIcon color="info" sx={{ mr: 1.5 }} />
        <Typography variant="body2" color="text.secondary">
          Los datos mostrados se actualizan automáticamente al iniciar sesión. Última actualización: {format(new Date(), 'dd/MM/yyyy HH:mm:ss')}
        </Typography>
      </Box>
    </Box>
  );
};

export default Dashboard;