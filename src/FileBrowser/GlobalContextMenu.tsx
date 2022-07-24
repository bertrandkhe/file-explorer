import { css, Divider, ListItemIcon, Menu, MenuItem, MenuProps, styled } from '@mui/material';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import React, { useCallback } from 'react';
import { useAtom } from 'jotai';
import { atomWithReducer } from 'jotai/utils';
import { newFolderDialogVisibleAtom } from './NewFolderDialog';
import { useUploadControls } from './UploadsService';
import { cwdAtom } from './FileBrowser.atoms';

const PREFIX = 'GlobalContextMenu';

const classes = {
  inputFile: `${PREFIX}-inputFile`,
};

const Root = styled(Menu)(() => css`
  .${classes.inputFile} {
    display: none;
  }
`);

export const contextMenuStateAtom = atomWithReducer<{
  open: boolean,
  anchorEl: MenuProps['anchorEl'],
}, {
  type: 'close',
} | {
  type: 'open',
  anchorEl: NonNullable<MenuProps['anchorEl']>,
}>({
  open: false,
  anchorEl: null,
}, (prev, action) => {
  if (!action) {
    return prev;
  }
  switch (action.type) {
    case 'close':
      return {
        open: false,
        anchorEl: null,
      };
      
    case 'open':
      return {
        open: true,
        anchorEl: action.anchorEl,
      };

    default:
      throw new Error('Unknown action type');
  }
});


const GlobalContextMenu: React.FC = () => {
  const [contextMenuState, dispatchContextMenuState] = useAtom(contextMenuStateAtom);
  const { uploadFiles } = useUploadControls();
  const [, setNewFolderDialogVisible] = useAtom(newFolderDialogVisibleAtom);
  const [cwd] = useAtom(cwdAtom);
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

  return (
    <Root
      open={contextMenuState.open}
      anchorEl={contextMenuState.anchorEl}
      onClose={closeContextMenu}
    >
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
      <Divider />
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
          multiple
        />
      </MenuItem>
      <MenuItem>
        <ListItemIcon>
          <DriveFolderUploadIcon />
        </ListItemIcon>
        Import folder
      </MenuItem>
    </Root>
  );
};

export default GlobalContextMenu;