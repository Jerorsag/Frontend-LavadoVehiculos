/**
 * Formatea un valor monetario
 * @param {number} value - El valor a formatear
 * @param {string} currency - El símbolo de la moneda (por defecto: $)
 * @param {number} decimals - El número de decimales (por defecto: 2)
 * @returns {string} El valor formateado como moneda
 */
export const formatCurrency = (value, currency = '$', decimals = 2) => {
    if (value === undefined || value === null) return '';
    
    return `${currency}${parseFloat(value).toFixed(decimals)}`;
  };
  
  /**
   * Formatea un número con separadores de miles
   * @param {number} value - El valor a formatear
   * @param {number} decimals - El número de decimales (por defecto: 0)
   * @returns {string} El número formateado
   */
  export const formatNumber = (value, decimals = 0) => {
    if (value === undefined || value === null) return '';
    
    return parseFloat(value).toLocaleString('es-MX', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };
  
  /**
   * Trunca un texto largo y añade puntos suspensivos
   * @param {string} text - El texto a truncar
   * @param {number} length - La longitud máxima (por defecto: 50)
   * @returns {string} El texto truncado
   */
  export const truncateText = (text, length = 50) => {
    if (!text) return '';
    
    if (text.length <= length) return text;
    
    return `${text.substring(0, length)}...`;
  };
  
  /**
   * Capitaliza un texto (primera letra en mayúscula)
   * @param {string} text - El texto a capitalizar
   * @returns {string} El texto capitalizado
   */
  export const capitalize = (text) => {
    if (!text) return '';
    
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };