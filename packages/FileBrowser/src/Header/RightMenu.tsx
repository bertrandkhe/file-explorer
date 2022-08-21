import React from 'react';
import { css, IconButton, styled  } from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import { secondaryPanelContentAtom } from '../FileBrowser.atoms';
import { viewModeAtom } from '../FileList';
import { useAtom } from 'jotai';
import clsx from 'clsx';
import HandymanIcon from '@mui/icons-material/Handyman';
import GridViewIcon from '@mui/icons-material/GridView';
import TableRowsIcon from '@mui/icons-material/TableRows';
import { usePermissions } from '../permissions';

const PREFIX = 'FileBrowserMainMenu';

const classes = {
  menu: `${PREFIX}-menu`,
  rightMenu: `${PREFIX}-rightMenu`,
  btn: `${PREFIX}-btn`,
  btnActive: `${PREFIX}-btnActive`,
};

const Root = styled('nav')(() => css`
  display: flex;
  .${classes.menu} {
    margin: 0;
    display: flex;
    list-style: none;
    padding-left: 0;
  }

  .${classes.rightMenu} {
    margin-left: auto;
  }

  .${classes.btn} {
    border-radius: 4px;
  }

  .${classes.btnActive} {
    background-color: rgba(200, 200, 200, 0.4);
  }

`);

const FileBrowserMainMenu: React.FC = () => {
  const [secondaryPanelContent, setSecondaryPanelContent] = useAtom(secondaryPanelContentAtom);
  const [viewMode, setViewMode] = useAtom(viewModeAtom);
  const permissions = usePermissions();
  return (
    <Root>
      <ul className={clsx(classes.menu, classes.rightMenu)}>
        <li>
          <IconButton
            disableRipple
            size="small"
            onClick={() => {
              switch(viewMode) {
                case 'list':
                  setViewMode('grid');
                  break;
                case 'grid':
                  setViewMode('list');
                  break;
              }
            }}
          >
            {viewMode === 'list' && <GridViewIcon />}
            {viewMode === 'grid' && <TableRowsIcon />}

          </IconButton>
        </li>
        {permissions.canCopy || permissions.canMove && (
          <li>
            <IconButton 
              disableRipple
              size="small"
              className={clsx(classes.btn, {
                [classes.btnActive]: secondaryPanelContent === 'operations',
              })}
              onClick={() => {
                setSecondaryPanelContent(
                  secondaryPanelContent === 'operations' ? '' : 'operations', 
                );
              }}
            >
              <HandymanIcon />
            </IconButton>
          </li>
        )}
        {permissions.canUpload && (
          <li>
            <IconButton
              size="small"
              disableRipple
              className={clsx(classes.btn, {
                [classes.btnActive]: secondaryPanelContent === 'uploads',
              })}
              onClick={() => {
                setSecondaryPanelContent(
                  secondaryPanelContent === 'uploads' ? '' : 'uploads', 
                );
              }}
            >
              <UploadIcon />
            </IconButton>
          </li>
        )}
      </ul>
    </Root>
  );
};

export default FileBrowserMainMenu;
