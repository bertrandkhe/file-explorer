import React from 'react';
import Breadcrumbs from './Breadcrumbs';
import GlobalContextMenu from './GlobalContextMenu';
import NewFolderDialog from './NewFolderDialog';
import UploadsManager from './UploadsManager';
import FileBrowserMainMenu from './FileBrowserMainMenu';
import FileList from './FileList';
import { css, styled, Drawer } from '@mui/material';
import { secondaryPanelContentAtom } from './FileBrowser.atoms';
import { useAtom } from 'jotai';
import { FileBrowserContext, ObjectStorageAdapter } from './fileBrowser';
import clsx from 'clsx';
import OperationsPanel from './OperationsPanel';

const PREFIX = 'FileBrowser';

const classes = {
  root: `${PREFIX}-root`,
  main: `${PREFIX}-main`,
  secondaryPanel: `${PREFIX}-secondaryPanel`,
  secondaryPanelPaper: `${PREFIX}-secondaryPanelPaper`,
  secondaryPanelVisible: `${PREFIX}-secondaryPanelVisible`,
};

const Root = styled('div')(() => css`
  position: relative;
  height: 100%;
  width: 100%;
  .${classes.main} {
    position: absolute;
    height: 100%;
    width: 100%;
    overflow: auto;
    transition: width 0.2s;
    padding: 1rem 2rem;
  }

  .${classes.secondaryPanel} {
    right: 0;
    width: 0;
    transition: width 0.2s;
    background: white;
    z-index: 1;
  }


  &.${classes.secondaryPanelVisible} {
    .${classes.main} {
      width: calc(100% - 350px);
    }
    .${classes.secondaryPanelPaper} {
      width: 350px;
    }
  }
`);


type FileBrowserProps = {
  adapter: ObjectStorageAdapter,
};

export const FileBrowser: React.FC<FileBrowserProps> = (props) => {
  const { adapter } = props;
  const [secondaryPanelContent] = useAtom(secondaryPanelContentAtom);
  const secondaryPanelIsVisible = secondaryPanelContent.length > 0;
  return (
    <FileBrowserContext.Provider value={{ adapter }}>
      <Root 
        className={clsx(
          classes.root,
          {
            [classes.secondaryPanelVisible]: secondaryPanelIsVisible,
          },
        )}
      >
        <div className={classes.main}>
          <GlobalContextMenu />
          <NewFolderDialog />
          <FileBrowserMainMenu />
          <Breadcrumbs />
          <FileList />
          <UploadsManager />
        </div>
        <Drawer 
          className={classes.secondaryPanel}
          open={secondaryPanelIsVisible}
          anchor="right"
          variant="persistent"
          PaperProps={{
            className: classes.secondaryPanelPaper
          }}
        >
          {secondaryPanelContent === 'operations' && (
            <OperationsPanel />
          )}
        </Drawer>
      </Root>
    </FileBrowserContext.Provider>
  );
};

export default FileBrowser;