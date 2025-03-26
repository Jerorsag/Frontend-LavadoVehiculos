import React from 'react';
import { Typography, Box, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

const PageHeader = ({ title, subtitle, onAddClick, buttonText = 'Añadir nuevo' }) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h4" component="h1">
          {title}
        </Typography>
        {onAddClick && (
          <Button 
            variant="contained" 
            color="primary" 
            startIcon={<AddIcon />}
            onClick={onAddClick}
          >
            {buttonText}
          </Button>
        )}
      </Box>
      {subtitle && (
        <Typography variant="subtitle1" color="textSecondary">
          {subtitle}
        </Typography>
      )}
    </Box>
  );
};

export default PageHeader;