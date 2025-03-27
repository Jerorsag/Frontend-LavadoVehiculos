import React, { useState } from 'react';
import { Box, Toolbar, CssBaseline, useTheme, Paper, Fade } from '@mui/material';
import AppBar from './AppBar';
import Sidebar from './Sidebar';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Asegúrate de que este valor coincida con el mismo en Sidebar.jsx
const drawerWidth = 260;

const Layout = ({ children, title }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box 
      sx={{ 
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: theme.palette.mode === 'dark' 
          ? theme.palette.background.default 
          : theme.palette.grey[50]
      }}
    >
      <CssBaseline />
      <AppBar title={title} handleDrawerToggle={handleDrawerToggle} />
      <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />
      
      <Box
        component="main"
        sx={{ 
          flexGrow: 1, 
          p: { xs: 2, sm: 3 }, 
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
          }),
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Toolbar />
        
        {/* Contenedor principal con animación de entrada */}
        <Fade in={true} timeout={500}>
          <Box 
            sx={{ 
              flexGrow: 1, 
              mt: 2,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Renderizar los hijos (contenido de la página) */}
            {children}
          </Box>
        </Fade>
        
        {/* Footer */}
        <Box
          component="footer"
          sx={{
            py: 2,
            px: 2,
            mt: 'auto',
            textAlign: 'center',
            fontSize: '0.875rem',
            color: theme.palette.text.secondary,
          }}
        >
          © {new Date().getFullYear()} Auto Lavado - Todos los derechos reservados
        </Box>
      </Box>
      
      {/* Configuración del ToastContainer */}
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={theme.palette.mode}
      />
    </Box>
  );
};

export default Layout;