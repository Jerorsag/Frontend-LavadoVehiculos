import apiClient from './config';

// Función para obtener todos los empleados, manejando paginación automáticamente
export const getAllEmpleados = async (params = {}) => {
  try {
    // Primer solicitud para obtener la primera página y el total
    const response = await apiClient.get('/empleados/', { 
      params: {
        ...params,
        page: 1,
        page_size: 100 // Intentamos usar un tamaño de página grande para minimizar peticiones
      } 
    });
    
    let allEmpleados = response.data.results || [];
    const totalCount = response.data.count || 0;
    const pageSize = response.data.results ? response.data.results.length : 0;
    
    // Si hay más páginas, las obtenemos
    if (totalCount > pageSize) {
      const totalPages = Math.ceil(totalCount / pageSize);
      const additionalRequests = [];
      
      // Crear solicitudes para las páginas restantes
      for (let page = 2; page <= totalPages; page++) {
        additionalRequests.push(
          apiClient.get('/empleados/', { 
            params: {
              ...params,
              page: page,
              page_size: pageSize
            } 
          })
        );
      }
      
      // Hacer todas las solicitudes en paralelo
      const additionalResponses = await Promise.all(additionalRequests);
      
      // Agregar los resultados de cada página
      for (const response of additionalResponses) {
        if (response.data.results) {
          allEmpleados = [...allEmpleados, ...response.data.results];
        }
      }
    }
    
    // Devolver en un formato similar al original, pero con todos los empleados
    return {
      count: totalCount,
      results: allEmpleados
    };
  } catch (error) {
    console.error('Error al obtener todos los empleados:', error);
    throw error;
  }
};

// Función original para mantener compatibilidad
export const getEmpleados = async (params = {}) => {
  try {
    const response = await apiClient.get('/empleados/', { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener empleados:', error);
    throw error;
  }
};

export const getEmpleado = async (id) => {
  try {
    const response = await apiClient.get(`/empleados/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener empleado ${id}:`, error);
    throw error;
  }
};

export const createEmpleado = async (empleadoData) => {
  try {
    const response = await apiClient.post('/empleados/', empleadoData);
    return response.data;
  } catch (error) {
    console.error('Error al crear empleado:', error);
    throw error;
  }
};

export const updateEmpleado = async (id, empleadoData) => {
  try {
    const response = await apiClient.put(`/empleados/${id}/`, empleadoData);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar empleado ${id}:`, error);
    throw error;
  }
};

export const deleteEmpleado = async (id) => {
  try {
    await apiClient.delete(`/empleados/${id}/`);
    return true;
  } catch (error) {
    console.error(`Error al eliminar empleado ${id}:`, error);
    throw error;
  }
};

export const getEmpleadoTurnos = async (id) => {
  try {
    const response = await apiClient.get(`/empleados/${id}/turnos/`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener turnos del empleado ${id}:`, error);
    throw error;
  }
};

export const getEmpleadoServicios = async (id, tipo = null) => {
  try {
    const params = tipo ? { tipo } : {};
    const response = await apiClient.get(`/empleados/${id}/servicios/`, { params });
    return response.data;
  } catch (error) {
    console.error(`Error al obtener servicios del empleado ${id}:`, error);
    throw error;
  }
};