import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
} from '@mui/material';
import {
  Home as HomeIcon,
  AccountBalance as AccountIcon,
  Category as CategoryIcon,
  Person as PersonIcon,
  Receipt as TransactionIcon,
  Assessment as ReportIcon,
} from '@mui/icons-material';
import { useNavigationStore, useNavigation } from '../../services/navigationStore';

const menuItems = [
  { text: 'Home', icon: <HomeIcon />, path: '/home' },
  { text: 'Categories', icon: <CategoryIcon />, path: '/category' },
  { text: 'Accounts', icon: <AccountIcon />, path: '/account' },
  { text: 'People', icon: <PersonIcon />, path: '/person' },
  { text: 'Transactions', icon: <TransactionIcon />, path: '/transaction' },
  { text: 'Reports', icon: <ReportIcon />, path: '/reports' },
];

const drawerWidth = 240;

export const Sidebar: React.FC = () => {
  const { isNavVisible } = useNavigationStore();
  const { navigateTo } = useNavigation();

  return (
    <Drawer
      variant="persistent"
      open={isNavVisible}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      <Toolbar />
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => navigateTo(item.path)}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};
