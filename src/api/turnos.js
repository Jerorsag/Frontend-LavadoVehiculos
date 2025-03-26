import apiClient from './config';

export const getTurnos = async (params = {}) => {
  try {
    const response = await apiClient.get('/turnos/', { params });
    return response.data;
  } catch (error) {
    console.error('Error al obtener turnos:', error);
    throw error;
  }
};

export const getTurno = async (id) => {
  try {
    const response = await apiClient.get(`/turnos/${id}/`);
    return response.data;
  } catch (error) {
    console.error(`Error al obtener turno ${id}:`, error);
    throw error;
  }
};

export const createTurno = async (turnoData) => {
  try {
    const response = await apiClient.post('/turnos/', turnoData);
    return response.data;
  } catch (error) {
    console.error('Error al crear turno:', error);
    throw error;
  }
};

export const updateTurno = async (id, turnoData) => {
  try {
    const response = await apiClient.put(`/turnos/${id}/`, turnoData);
    return response.data;
  } catch (error) {
    console.error(`Error al actualizar turno ${id}:`, error);
    throw error;
  }
};

export const deleteTurno = async (id) => {
  try {
    await apiClient.delete(`/turnos/${id}/`);
    return true;
  } catch (error) {
    console.error(`Error al eliminar turno ${id}:`, error);
    throw error;
  }
};