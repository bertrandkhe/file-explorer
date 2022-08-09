import React from 'react';
import { MenuItem, MenuProps } from '@mui/material';
import { useAtom } from 'jotai';
import ContextMenu from '../utils/ContextMenu';
import { selectedItemListAtom, copySelectionToClipboardAtom } from './atoms';

type ListItemContextMenuProps = MenuProps;

const ListItemContextMenu: React.FC<ListItemContextMenuProps> = (props) => {
  const [selectedItemList] = useAtom(selectedItemListAtom);
  const [, copySelectionToClipboard] = useAtom(copySelectionToClipboardAtom);
  const { onClose } = props;
  return (
    <ContextMenu 
      onClose={onClose}
      {...props}
    >
      <MenuItem disabled={selectedItemList.length > 1}>
        Download
      </MenuItem>
      <MenuItem
        onClick={(e) => {
          e.preventDefault();
          copySelectionToClipboard();
          if (onClose) {
            onClose(e, 'backdropClick');
          }
        }}
      >
        Copy
      </MenuItem>
      <MenuItem
        onClick={(e) => {
          e.preventDefault();
          if (onClose) {
            onClose(e, 'backdropClick');
          }
        }}
      >
        Delete
      </MenuItem>
    </ContextMenu>
  );
};

export default ListItemContextMenu;