import apiClient from './config';

export const getServicios = async (params = {}) => {
  try {
    const response = await apiClient.get('/servicios/', { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener servicios:', error);
    throw error;
  }
};

export const getServicio = async (id) => {
  try {
    // Extraer el ID correcto si se pasa un objeto
    let servicioId = id;
    
    if (id === null || id === undefined) {
      console.error("ID es nulo o indefinido");
      throw new Error("ID de servicio no válido");
    }
    
    if (typeof id === 'object') {
      // Intentar extraer el ID del objeto
      if (id.id_servicio !== undefined) {
        servicioId = id.id_servicio;
      } else if (id.id !== undefined) {
        servicioId = id.id;
      } else {
        console.error("ID es un objeto sin propiedad id_servicio o id:", id);
        throw new Error("Formato de ID de servicio no válido");
      }
    }
    
    // Verificar que ahora tenemos un ID válido
    if (servicioId === null || servicioId === undefined) {
      throw new Error("No se pudo extraer un ID válido");
    }
    
    console.log(`Obteniendo servicio con ID: ${servicioId}`);
    const response = await apiClient.get(`/servicios/${servicioId}/`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener servicio ${id}:`, error);
    throw error; // Propagar el error para manejo superior
  }
};

export const createServicio = async (servicioData) => {
  try {
    const response = await apiClient.post('/servicios/', servicioData);
    return response.data;
  } catch (error) {
    console.error('Error al crear servicio:', error);
    throw error;
  }
};

export const updateServicio = async (id, servicioData) => {
  try {
    const response = await apiClient.put(`/servicios/${id}/`, servicioData);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar servicio ${id}:`, error);
    throw error;
  }
};

export const deleteServicio = async (id) => {
  try {
    await apiClient.delete(`/servicios/${id}/`);
    return true;
  } catch (error) {
    console.error(`Error al eliminar servicio ${id}:`, error);
    throw error;
  }
};

export const getServiciosPorFecha = async (fecha) => {
  try {
    const response = await apiClient.get(`/servicios/por_fecha/`, { params: { fecha } });
    return response.data;
  } catch (error) {
    console.error(`Error al obtener servicios por fecha ${fecha}:`, error);
    throw error;
  }
};

export const getServiciosPorPeriodo = async (inicio, fin) => {
  try {
    const response = await apiClient.get(`/servicios/por_periodo/`, { 
      params: { inicio, fin } 
    });
    return response.data;
  } catch (error) {
    console.error(`Error al obtener servicios por periodo:`, error);
    throw error;
  }
};

export const getTiposLavado = async () => {
  try {
    const response = await apiClient.get('/tipos-lavado/');
    return response.data;
  } catch (error) {
    console.error('Error al obtener tipos de lavado:', error);
    throw error;
  }
};