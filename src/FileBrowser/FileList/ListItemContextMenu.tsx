import React from 'react';
import { MenuItem, MenuProps } from '@mui/material';
import ContextMenu from '../utils/ContextMenu';

type ListItemContextMenuProps = MenuProps;

const ListItemContextMenu: React.FC<ListItemContextMenuProps> = (props) => {
  return (
    <ContextMenu 
      {...props}
    >
      <MenuItem>Copy</MenuItem>
      <MenuItem>Delete</MenuItem>
    </ContextMenu>
  );
};

export default ListItemContextMenu;