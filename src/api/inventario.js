import apiClient from './config';

export const getInsumos = async (params = {}) => {
  try {
    const response = await apiClient.get('/insumos/', { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener insumos:', error);
    throw error;
  }
};

export const getInsumo = async (id) => {
  try {
    const response = await apiClient.get(`/insumos/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener insumo ${id}:`, error);
    throw error;
  }
};

export const createInsumo = async (insumoData) => {
  try {
    const response = await apiClient.post('/insumos/', insumoData);
    return response.data;
  } catch (error) {
    console.error('Error al crear insumo:', error);
    throw error;
  }
};

export const updateInsumo = async (id, insumoData) => {
  try {
    const response = await apiClient.put(`/insumos/${id}/`, insumoData);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar insumo ${id}:`, error);
    throw error;
  }
};

export const deleteInsumo = async (id) => {
  try {
    await apiClient.delete(`/insumos/${id}/`);
    return true;
  } catch (error) {
    console.error(`Error al eliminar insumo ${id}:`, error);
    throw error;
  }
};

export const getInventario = async (params = {}) => {
  try {
    const response = await apiClient.get('/inventario/', { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener inventario:', error);
    throw error;
  }
};

export const updateInventario = async (id, inventarioData) => {
  try {
    const response = await apiClient.put(`/inventario/${id}/`, inventarioData);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar inventario ${id}:`, error);
    throw error;
  }
};