import React from 'react';
import { Box, CssBaseline, Toolbar } from '@mui/material';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useNavigationStore } from '../../services/navigationStore';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isNavVisible } = useNavigationStore();
  const drawerWidth = 240;

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Header />
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${isNavVisible ? drawerWidth : 0}px)` },
          marginLeft: { sm: isNavVisible ? `${drawerWidth}px` : 0 },
          transition: 'margin 225ms cubic-bezier(0.4, 0, 0.6, 1) 0ms',
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};
