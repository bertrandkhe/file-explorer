import { css, Divider, ListItemIcon, MenuItem, MenuProps, styled } from '@mui/material';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import React, { useCallback } from 'react';
import { useAtom } from 'jotai';
import { atomWithReducer } from 'jotai/utils';
import { newFolderDialogVisibleAtom } from './NewFolderDialog';
import { useUploadControls } from './UploadsService';
import { allowedExtensionsAtom, cwdAtom } from './FileBrowser.atoms';
import ContextMenu from './utils/ContextMenu';
import { usePermissions } from './permissions';

const PREFIX = 'GlobalContextMenu';

const classes = {
  inputFile: `${PREFIX}-inputFile`,
};

const Root = styled(ContextMenu)(() => css`
  .${classes.inputFile} {
    display: none;
  }
`);

type OpenContextMenuUsingAnchorElAction = {
  type: 'open',
  anchorReference?: 'anchorEl',
  anchorEl: MenuProps['anchorEl'],
};

type OpenContextMenuUsingAnchorPositionAction = {
  type: 'open',
  anchorReference: 'anchorPosition',
  anchorPosition: MenuProps['anchorPosition'],
};

type ContextMenuStateAction = {
  type: 'close',
} | OpenContextMenuUsingAnchorElAction | OpenContextMenuUsingAnchorPositionAction

export const contextMenuStateAtom = atomWithReducer<{
  open: boolean,
  anchorReference?: MenuProps['anchorReference'],
  anchorEl?: MenuProps['anchorEl'],
  anchorPosition?: MenuProps['anchorPosition'],
}, ContextMenuStateAction>({
  open: false,
}, (prev, action) => {
  if (!action) {
    return prev;
  }
  const { type, ...state } = action;
  switch (type) {
    case 'close':
      return {
        open: false,
      };
      
    case 'open':
      return {
        open: true,
        ...state,
      };

    default:
      throw new Error('Unknown action type');
  }
});

export const useOpenContextMenu = () => {
  const [, dispatchContextMenuState] = useAtom(contextMenuStateAtom);
  return useCallback((args: Omit<OpenContextMenuUsingAnchorElAction, 'type'> | Omit<OpenContextMenuUsingAnchorPositionAction, 'type'>) => {
    dispatchContextMenuState({
      ...args,
      type: 'open',
    });
  }, []);
}

export const useCanOpenGlobalContextMenu = (): boolean => {
  const permissions = usePermissions();
  return permissions.canMkdir || permissions.canUpload;
}


const GlobalContextMenu: React.FC = () => {
  const [contextMenuState, dispatchContextMenuState] = useAtom(contextMenuStateAtom);
  const { uploadFiles } = useUploadControls();
  const [, setNewFolderDialogVisible] = useAtom(newFolderDialogVisibleAtom);
  const [allowedExtensions] = useAtom(allowedExtensionsAtom);
  const [cwd] = useAtom(cwdAtom);
  const permissions = usePermissions();
  const canOpenGlobalContextMenu = useCanOpenGlobalContextMenu();
  const closeContextMenu = useCallback(() => {
    dispatchContextMenuState({ type: 'close' });
  }, []);

  const handleImportFile: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const { currentTarget: { files } } = e;
    if (!files) {
      closeContextMenu();
      return;
    }
    uploadFiles({
      fileList: files,
      directory: cwd,
    });
    closeContextMenu();
  }

  if (!canOpenGlobalContextMenu) {
    return null;
  }

  return (
    <Root
      {...contextMenuState}
      onClose={closeContextMenu}
    >
      {permissions.canMkdir && (
        <MenuItem
          onClick={() => {
            setNewFolderDialogVisible(true);
            closeContextMenu();
          }}
        >
          <ListItemIcon>
            <CreateNewFolderIcon />
          </ListItemIcon>
          New folder
        </MenuItem>
      )}
      {permissions.canMkdir && <Divider />}
      {permissions.canUpload && (
        <MenuItem 
          onClick={(e) => {
            const menuItem = e.currentTarget;
            const inputFile = menuItem.querySelector('input[type="file"]') as HTMLInputElement;
            inputFile.click();
          }}
        >
          <ListItemIcon>
            <UploadFileIcon />
          </ListItemIcon>
          Import file
          <input
            className={classes.inputFile}
            type="file"
            onChange={handleImportFile}
            accept={allowedExtensions.length > 0 ? allowedExtensions.join(',') : undefined}
            multiple
          />
        </MenuItem>
      )}
      {permissions.canUploadFolder && (
        <MenuItem>
          <ListItemIcon>
            <DriveFolderUploadIcon />
          </ListItemIcon>
          Import folder
        </MenuItem>
      )}
    </Root>
  );
};

export default GlobalContextMenu;