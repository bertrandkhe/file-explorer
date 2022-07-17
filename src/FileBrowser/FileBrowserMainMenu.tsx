import React from 'react';
import { css, IconButton, styled  } from '@mui/material';
import UploadIcon from '@mui/icons-material/Upload';
import { toggleUploadsManagerVisibilityAtom } from './UploadsManager';
import { secondaryPanelContentAtom } from './FileBrowser.atoms';
import { useAtom } from 'jotai';
import clsx from 'clsx';
import HandymanIcon from '@mui/icons-material/Handyman';

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
  const [, toggleUploadsManagerVisibility] = useAtom(toggleUploadsManagerVisibilityAtom);
  const [secondaryPanelContent, setSecondaryPanelContent] = useAtom(secondaryPanelContentAtom);
  console.log(secondaryPanelContent);
  return (
    <Root>
      <ul className={clsx(classes.menu, classes.rightMenu)}>
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
        <li>
          <IconButton
            size="small"
            onClick={() => {
              toggleUploadsManagerVisibility();
            }}
          >
            <UploadIcon />
          </IconButton>
        </li>
      </ul>
    </Root>
  );
};

export default FileBrowserMainMenu;
