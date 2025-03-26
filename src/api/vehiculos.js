import apiClient from './config';

export const getVehiculos = async (params = {}) => {
  try {
    const response = await apiClient.get('/vehiculos/', { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener vehículos:', error);
    throw error;
  }
};

export const getVehiculo = async (placa) => {
  try {
    const response = await apiClient.get(`/vehiculos/${placa}/`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener vehículo ${placa}:`, error);
    throw error;
  }
};

export const createVehiculo = async (vehiculoData) => {
  try {
    const response = await apiClient.post('/vehiculos/', vehiculoData);
    return response.data;
  } catch (error) {
    console.error('Error al crear vehículo:', error);
    throw error;
  }
};

export const updateVehiculo = async (placa, vehiculoData) => {
  try {
    const response = await apiClient.put(`/vehiculos/${placa}/`, vehiculoData);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar vehículo ${placa}:`, error);
    throw error;
  }
};

export const deleteVehiculo = async (placa) => {
  try {
    await apiClient.delete(`/vehiculos/${placa}/`);
    return true;
  } catch (error) {
    console.error(`Error al eliminar vehículo ${placa}:`, error);
    throw error;
  }
};

export const getHistorialVehiculo = async (placa) => {
  try {
    const response = await apiClient.get(`/vehiculos/${placa}/historial/`);
    // Asegurarse de que los precios sean números
    if (Array.isArray(response.data)) {
      return response.data.map(item => ({
        ...item,
        precio: typeof item.precio === 'string' ? parseFloat(item.precio) : item.precio
      }));
    }
    return response.data;
  } catch (error) {
    console.error(`Error al obtener historial del vehículo ${placa}:`, error);
    // Devolver array vacío en lugar de lanzar el error
    return [];
  }
};

export const getTiposVehiculos = async () => {
  try {
    const response = await apiClient.get('/tipos-vehiculos/');
    return response.data;
  } catch (error) {
    console.error('Error al obtener tipos de vehículos:', error);
    throw error;
  }
};