import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';

// Páginas
import Dashboard from './pages/Dashboard';
import Empleados from './pages/Empleados';
import EmpleadoDetail from './pages/EmpleadoDetail';
import Vehiculos from './pages/Vehiculos';
import VehiculoDetail from './pages/VehiculoDetail';
import Servicios from './pages/Servicios';
import ServicioDetail from './pages/ServicioDetail';
import NuevoServicio from './pages/NuevoServicio';
import Inventario from './pages/Inventario';
import Turnos from './pages/Turnos';
import Configuracion from './pages/Configuracion';
import NotFound from './pages/NotFound';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout title="Dashboard"><Dashboard /></Layout>} />
      <Route path="/empleados" element={<Layout title="Empleados"><Empleados /></Layout>} />
      <Route path="/empleados/:id" element={<Layout title="Detalle del Empleado"><EmpleadoDetail /></Layout>} />
      <Route path="/vehiculos" element={<Layout title="Vehículos"><Vehiculos /></Layout>} />
      <Route path="/vehiculos/:placa" element={<Layout title="Detalle del Vehículo"><VehiculoDetail /></Layout>} />
      <Route path="/servicios" element={<Layout title="Servicios"><Servicios /></Layout>} />
      <Route path="/servicios/nuevo" element={<Layout title="Nuevo Servicio"><NuevoServicio /></Layout>} />
      <Route path="/servicios/:id" element={<Layout title="Detalle del Servicio"><ServicioDetail /></Layout>} />
      <Route path="/inventario" element={<Layout title="Inventario"><Inventario /></Layout>} />
      <Route path="/turnos" element={<Layout title="Turnos"><Turnos /></Layout>} />
      <Route path="/configuracion" element={<Layout title="Configuración"><Configuracion /></Layout>} />
      <Route path="*" element={<Layout title="Página no encontrada"><NotFound /></Layout>} />
    </Routes>
  );
};

export default AppRoutes;