import apiClient from './config';

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