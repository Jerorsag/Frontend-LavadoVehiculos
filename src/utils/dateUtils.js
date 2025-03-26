import { format, parse, isValid } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Formatea una fecha en un formato legible para humanos
 * @param {string|Date} date - La fecha a formatear
 * @param {string} formatStr - El formato de salida (por defecto: dd/MM/yyyy)
 * @returns {string} La fecha formateada
 */
export const formatDate = (date, formatStr = 'dd/MM/yyyy') => {
  if (!date) return '';
  
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (!isValid(dateObj)) return 'Fecha inválida';
  
  return format(dateObj, formatStr, { locale: es });
};

/**
 * Formatea una hora en un formato legible para humanos
 * @param {string} time - La hora a formatear (formato: HH:MM:SS)
 * @param {string} formatStr - El formato de salida (por defecto: HH:mm)
 * @returns {string} La hora formateada
 */
export const formatTime = (time, formatStr = 'HH:mm') => {
  if (!time) return '';
  
  try {
    // Parsear la hora (asumiendo que viene en formato HH:MM:SS)
    const timeParts = time.split(':');
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    const seconds = timeParts.length > 2 ? parseInt(timeParts[2], 10) : 0;
    
    const timeDate = new Date();
    timeDate.setHours(hours);
    timeDate.setMinutes(minutes);
    timeDate.setSeconds(seconds);
    
    return format(timeDate, formatStr);
  } catch (error) {
    console.error('Error al formatear la hora:', error);
    return time; // Devolver la hora original si hay un error
  }
};

/**
 * Calcula la edad a partir de una fecha de nacimiento
 * @param {string|Date} birthDate - La fecha de nacimiento
 * @returns {number} La edad en años
 */
export const calculateAge = (birthDate) => {
  if (!birthDate) return 0;
  
  const birthDateObj = birthDate instanceof Date ? birthDate : new Date(birthDate);
  
  if (!isValid(birthDateObj)) return 0;
  
  const today = new Date();
  let age = today.getFullYear() - birthDateObj.getFullYear();
  const monthDiff = today.getMonth() - birthDateObj.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
    age--;
  }
  
  return age;
};