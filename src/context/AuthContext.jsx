import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Esta es una implementación básica que puedes expandir según necesites
  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    // Aquí podrías almacenar información en localStorage o hacer otras tareas
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    // Aquí podrías limpiar localStorage o realizar otras tareas de cierre de sesión
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;