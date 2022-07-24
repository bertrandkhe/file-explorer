import React from 'react';
import Breadcrumbs from './Breadcrumbs';
import GlobalContextMenu from './GlobalContextMenu';
import NewFolderDialog from './NewFolderDialog';
import FileBrowserMainMenu from './FileBrowserMainMenu';
import FileList from './FileList';
import { css, styled } from '@mui/material';
import { secondaryPanelContentAtom } from './FileBrowser.atoms';
import { useAtom } from 'jotai';
import { FileBrowserContext, ObjectStorageAdapter } from './fileBrowser';
import clsx from 'clsx';
import OperationsPanel from './OperationsPanel';
import OperationsService from './OperationsService';
import UploadsPanel from './UploadsPanel';
import UploadsService from './UploadsService';

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
  display: flex;
  .${classes.main} {
    height: 100%;
    width: 100%;
    overflow: auto;
    transition: width 0.2s;
    position: relative;
    padding: 2rem;
  }

  .${classes.secondaryPanel} {
    height: 100%;
    width: 0;
    transition: width 0.2s;
    background: white;
    position: relative;
  }


  &.${classes.secondaryPanelVisible} {
    .${classes.main} {
      width: calc(100% - 350px);
    }
    .${classes.secondaryPanel} {
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
      <OperationsService />
      <UploadsService />
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
        </div>
        <div className={classes.secondaryPanel}>
          {secondaryPanelContent === 'operations' && (
            <OperationsPanel />
          )}
          {secondaryPanelContent === 'uploads' && (
            <UploadsPanel />
          )}
        </div>
      </Root>
    </FileBrowserContext.Provider>
  );
};

export default FileBrowser;