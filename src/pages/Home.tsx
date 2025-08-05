import React from 'react';
import { Box, Grid, Paper, Typography, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  AccountBalance as AccountIcon,
  Category as CategoryIcon,
  Person as PersonIcon,
  Receipt as TransactionIcon,
  Dashboard as DashboardIcon,
  Assessment as ReportIcon
} from '@mui/icons-material';

interface MenuTileProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  path: string;
}

const MenuTile: React.FC<MenuTileProps> = ({ icon, title, description, path }) => {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Paper
      sx={{
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
          bgcolor: 'primary.light',
          '& .icon': {
            color: 'common.white',
          },
          '& .title': {
            color: 'common.white',
          },
          '& .description': {
            color: 'common.white',
          }
        }
      }}
      onClick={() => navigate(path)}
    >
      <Box
        className="icon"
        sx={{
          color: 'primary.main',
          mb: 2,
          '& > svg': {
            fontSize: 48
          }
        }}
      >
        {icon}
      </Box>
      <Typography
        variant="h6"
        className="title"
        sx={{
          mb: 1,
          fontWeight: 'medium',
          textAlign: 'center'
        }}
      >
        {title}
      </Typography>
      <Typography
        variant="body2"
        className="description"
        color="text.secondary"
        sx={{
          textAlign: 'center'
        }}
      >
        {description}
      </Typography>
    </Paper>
  );
};

const menuItems = [
  {
    icon: <DashboardIcon />,
    title: 'Dashboard',
    description: 'View your financial overview and summaries',
    path: '/dashboard'
  },
  {
    icon: <TransactionIcon />,
    title: 'Transactions',
    description: 'Manage your income and expenses',
    path: '/transaction'
  },
  {
    icon: <AccountIcon />,
    title: 'Accounts',
    description: 'Manage your bank accounts and wallets',
    path: '/account'
  },
  {
    icon: <CategoryIcon />,
    title: 'Categories',
    description: 'Organize your transactions by categories',
    path: '/category'
  },
  {
    icon: <PersonIcon />,
    title: 'People',
    description: 'Manage contacts and shared expenses',
    path: '/person'
  },
  {
    icon: <ReportIcon />,
    title: 'Reports',
    description: 'View detailed financial reports and analysis',
    path: '/reports'
  }
];

export const Home: React.FC = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{
          mb: 4,
          textAlign: 'center',
          fontWeight: 'medium'
        }}
      >
        Welcome to MyWallet
      </Typography>
      
      <Grid container spacing={3}>
        {menuItems.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <MenuTile {...item} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
