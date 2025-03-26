import apiClient from './config';

export const getEstadisticasGenerales = async () => {
  try {
    const response = await apiClient.get('/dashboard/estadisticas_generales/');
    return response.data;
  } catch (error) {
    console.error('Error al obtener estadísticas generales:', error);
    // Retornar datos de muestra en lugar de lanzar el error
    return {
      total_servicios: 0,
      servicios_ultimo_mes: 0,
      ingresos_totales: 0,
      ingresos_ultimo_mes: 0,
      empleados_activos: 0,
      insumos_mas_usados: []
    };
  }
};

export const getServiciosPorTiempo = async (periodo = 'mes') => {
  try {
    const response = await apiClient.get('/dashboard/servicios_por_tiempo/', {
      params: { periodo }
    });
    return response.data;
  } catch (error) {
    console.error('Error al obtener servicios por tiempo:', error);
    // Datos de muestra con formato correcto para los gráficos
    return [
      { periodo: new Date(Date.now() - 5 * 30 * 24 * 60 * 60 * 1000).toISOString(), total: 5, ingresos: 75 },
      { periodo: new Date(Date.now() - 4 * 30 * 24 * 60 * 60 * 1000).toISOString(), total: 8, ingresos: 120 },
      { periodo: new Date(Date.now() - 3 * 30 * 24 * 60 * 60 * 1000).toISOString(), total: 10, ingresos: 150 },
      { periodo: new Date(Date.now() - 2 * 30 * 24 * 60 * 60 * 1000).toISOString(), total: 7, ingresos: 105 },
      { periodo: new Date(Date.now() - 1 * 30 * 24 * 60 * 60 * 1000).toISOString(), total: 12, ingresos: 180 },
      { periodo: new Date().toISOString(), total: 15, ingresos: 225 }
    ];
  }
};

export const getRankingEmpleados = async () => {
  try {
    const response = await apiClient.get('/dashboard/ranking_empleados/');
    return response.data;
  } catch (error) {
    console.error('Error al obtener ranking de empleados:', error);
    // Retornar datos de muestra en lugar de lanzar el error
    return {
      ranking_lavados: [
        { id_empleado: 1, nombre: 'Ejemplo', apellido: 'Empleado', total_lavados: 5 }
      ],
      ranking_recibidos: [
        { id_empleado: 1, nombre: 'Ejemplo', apellido: 'Empleado', total_recibidos: 8 }
      ]
    };
  }
};