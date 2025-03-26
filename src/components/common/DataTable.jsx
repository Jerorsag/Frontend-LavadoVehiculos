import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  IconButton,
  Tooltip,
  Box,
  TextField,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';

const DataTable = ({
  columns,
  data,
  totalItems,
  page,
  perPage,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onDelete,
  onView,
  searchTerm,
  onSearchChange,
  loading,
  idField = 'id_servicio'  // Campo predeterminado para identificar filas
}) => {

  // Función para obtener el ID de una fila de manera segura
  const getRowId = (row) => {
    // Si el row es nulo o indefinido, retornamos un identificador aleatorio
    if (!row) {
      console.error('Fila indefinida o nula encontrada');
      return Math.random().toString(36).substr(2, 9);
    }
    
    // Primero intentamos con el campo idField que tiene prioridad
    if (row[idField] !== undefined) {
      // Si el idField es un objeto, tratamos de obtener el id_servicio
      if (typeof row[idField] === 'object' && row[idField] !== null) {
        if (row[idField].id_servicio) {
          return row[idField].id_servicio;
        }
        console.warn('Campo idField es un objeto sin id_servicio', row[idField]);
      }
      return row[idField];
    }
    
    // Si no está disponible, buscamos en este orden específico para servicios
    if (row.id_servicio !== undefined) return row.id_servicio;
    if (row.id !== undefined) return row.id;
    if (row.placa !== undefined) {
      // Si placa es un objeto, intentamos obtener el valor real de la placa
      if (typeof row.placa === 'object' && row.placa !== null) {
        return row.placa.placa || row.placa;
      }
      return row.placa;
    }
    if (row.id_empleado !== undefined) return row.id_empleado;
    
    // Si no hay ID, usamos el índice como último recurso
    console.warn('No se pudo determinar un ID para la fila:', row);
    return Math.random().toString(36).substr(2, 9);
  };

  // Demorar la búsqueda para no sobrecarga de peticiones
  const handleSearchChange = (value) => {
    if (onSearchChange) {
      // Utilizamos un temporizador para evitar demasiadas solicitudes
      const timeoutId = setTimeout(() => {
        onSearchChange(value);
      }, 500);
      
      // Limpiar el temporizador si el usuario sigue escribiendo
      return () => clearTimeout(timeoutId);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {onSearchChange && (
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Buscar..."
            value={searchTerm || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      )}
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell 
                  key={column.id}
                  align={column.align || 'left'}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
              {(onEdit || onDelete || onView) && (
                <TableCell align="center">Acciones</TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length + (onEdit || onDelete || onView ? 1 : 0)} align="center">
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (onEdit || onDelete || onView ? 1 : 0)} align="center">
                  No hay datos disponibles
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => {
                const rowId = getRowId(row);
                return (
                  <TableRow hover key={`row-${rowId}-${index}`}>
                    {columns.map((column) => {
                      let value;
                      try {
                        value = column.accessor(row);
                      } catch (error) {
                        console.error(`Error accessing ${column.id}:`, error);
                        value = 'Error';
                      }
                      
                      return (
                        <TableCell key={`${rowId}-${column.id}`} align={column.align || 'left'}>
                          {column.format && value !== null && value !== undefined 
                            ? column.format(value, row) 
                            : value !== null && value !== undefined 
                              ? value 
                              : 'N/A'}
                        </TableCell>
                      );
                    })}
                    {(onEdit || onDelete || onView) && (
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                          {onView && (
                            <Tooltip title="Ver detalles">
                              <IconButton 
                                color="info" 
                                onClick={() => {
                                  // Verificar que rowId sea un valor válido antes de pasar
                                  if (rowId !== undefined && rowId !== null) {
                                    // Si es un objeto y tiene id_servicio, pasamos ese valor
                                    if (typeof rowId === 'object' && rowId.id_servicio) {
                                      onView(rowId.id_servicio);
                                    } else {
                                      onView(rowId);
                                    }
                                  } else {
                                    console.error('ID inválido para la fila:', row);
                                  }
                                }}
                              >
                                <VisibilityIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          {onEdit && (
                            <Tooltip title="Editar">
                              <IconButton 
                                color="primary" 
                                onClick={() => {
                                  // Verificar que rowId sea un valor válido antes de pasar
                                  if (rowId !== undefined && rowId !== null) {
                                    // Si es un objeto y tiene id_servicio, pasamos ese valor
                                    if (typeof rowId === 'object' && rowId.id_servicio) {
                                      onEdit(rowId.id_servicio);
                                    } else {
                                      onEdit(rowId);
                                    }
                                  } else {
                                    console.error('ID inválido para la fila:', row);
                                  }
                                }}
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                          {onDelete && (
                            <Tooltip title="Eliminar">
                              <IconButton 
                                color="error" 
                                onClick={() => {
                                  // Verificar que rowId sea un valor válido antes de pasar
                                  if (rowId !== undefined && rowId !== null) {
                                    // Si es un objeto y tiene id_servicio, pasamos ese valor
                                    if (typeof rowId === 'object' && rowId.id_servicio) {
                                      onDelete(rowId.id_servicio);
                                    } else {
                                      onDelete(rowId);
                                    }
                                  } else {
                                    console.error('ID inválido para la fila:', row);
                                  }
                                }}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {totalItems > 0 && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalItems}
          rowsPerPage={perPage}
          page={page}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
          labelRowsPerPage="Filas por página:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
        />
      )}
    </Box>
  );
};

export default DataTable;