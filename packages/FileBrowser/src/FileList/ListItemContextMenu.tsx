import React from 'react';
import { MenuItem, MenuProps } from '@mui/material';
import { useAtom } from 'jotai';
import ContextMenu from '../utils/ContextMenu';
import { selectedItemListAtom, copySelectionToClipboardAtom } from './atoms';
import { usePermissions } from '../permissions';

type ListItemContextMenuProps = MenuProps;

const ListItemContextMenu: React.FC<ListItemContextMenuProps> = (props) => {
  const [selectedItemList] = useAtom(selectedItemListAtom);
  const [, copySelectionToClipboard] = useAtom(copySelectionToClipboardAtom);
  const { onClose } = props;
  const permissions = usePermissions();

  if (
    !permissions.canDownload
    && !permissions.canCopy
    && !permissions.canDelete
  ) {
    return null;
  }

  return (
    <ContextMenu 
      onClose={onClose}
      {...props}
    >
      {permissions.canDownload && (
        <MenuItem disabled={selectedItemList.length > 1}>
          Download
        </MenuItem>
      )}
      {permissions.canCopy && (
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
      )}
      {permissions.canDelete && (
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
      )}
    </ContextMenu>
  );
};

export default ListItemContextMenu;